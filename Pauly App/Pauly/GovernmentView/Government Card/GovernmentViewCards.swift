//
//  GovernmentViewCards.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-04-07.
//

import SwiftUI
import FirebaseFirestore
import FirebaseStorage
import UIKit

struct MSALCardFileType{
    let id: UUID = UUID()
    var Name: String
    let etag: String
    let Filetype: String
    let Filename: String
}


struct FileType{
    let id: String = UUID().uuidString
    var Name: String
    var Value: String
    var FileTypeValue: String
}

struct GovernmentCardEditingViewDataOneDrive: View{
    @State var AvaliableFiles: [MSALCardFileType] = []
    @State var NewCardDataName: String = ""
    @State var AddMSALFileSheetPresented: Bool = false
    @Binding var AccessToken: String?
    @Binding var SelectedCard: CardType
    var body: some View{
        VStack{
            List{
                ForEach(AvaliableFiles, id: \.id){ file in
                    Button(){
                        SelectedCard.CardData.append(DataIdType(Name: "\(file.Name)", Id: file.etag, FileType: file.Filetype))
                    } label: {
                        Text(file.Filename)
                    }
                }
            }
        }.sheet(isPresented: $AddMSALFileSheetPresented){
            TextField("New Data Name", text: $NewCardDataName)
            Button(){
                
            } label: {
                Text("Confirm")
            }
            Button(){
                AddMSALFileSheetPresented = false
            } label: {
                Text("Dismiss")
            }
        }
        .onAppear(){
            Task{
                do{
                    try await getFilesMicrosoftGraph(accessToken: AccessToken ?? "")
                } catch {
                    print(error)
                }
            }
        }
    }
    func getFilesMicrosoftGraph(accessToken: String) async throws {
        let url = URL(string: "https://graph.microsoft.com/v1.0/sites/gocrusadersca.sharepoint.com/drive/items/4EFA00B7-260C-4CFC-A09C-EF5F64F40F9F/children")
        var request = URLRequest(url: url!)
        // Set the Authorization header for the request. We use Bearer tokens, so we specify Bearer + the token we got from the result
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        do{
            let (data, _) = try await URLSession.shared.data(for: request)
            do {
                // make sure this JSON is in the format we expect
                if let json = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
                    // try to read out a string array
                    let Results = json["value"] as! NSArray as! [[String: Any]]
                    for x in Results{
                        let Name = x["name"] as! String
                        let eTag = x["id"] as! String
                        guard let urlString = URL(string: Name) else { throw GraphCallingErrors.ConnotFindAPIInfo }
                        AvaliableFiles.append(MSALCardFileType(Name: "", etag: eTag, Filetype: urlString.pathExtension, Filename: Name))
                    }
                }
            } catch let error as NSError {
                print("Failed to load: \(error.localizedDescription)")
            }
        } catch{
            throw GraphCallingErrors.APICallFailed
        }
    }
}

struct GovernmentCardEditingViewData: View{
    @Binding var SelectedCard: CardType
    @Binding var AccessToken: String?
    let AvaliableTypes: [String] = ["pdf", "YT", "Paul"]
    
    var body: some View{
        ZStack{
            Rectangle()
                .foregroundColor(Color.marron)
                .ignoresSafeArea()
            VStack{
                Text("Edit Card Data")
                VStack{
                    HStack{
                        Text("Card Name")
                        Divider()
                        Text("Card Value")
                        Divider()
                        Text("Card Type")
                    }
                }
                List{
                    ForEach($SelectedCard.CardData, id: \.id) { file in
                        HStack{
                            TextField("File Name", text: file.Name)
                            TextField("File Value", text: file.Id)
                            Picker("", selection: file.FileType){
                                ForEach(AvaliableTypes, id: \.self){ type in
                                    Text(type)
                                }
                            }
                        }
                    }
                    .onDelete(){ index in
                        SelectedCard.CardData.remove(atOffsets: index)
                    }
                }.scrollContentBackground(.hidden)
                Button(){
                    SelectedCard.CardData.append(DataIdType(Name: "", Id: "1", FileType: "Paul"))
                } label: {
                    HStack{
                        Text("Add Value")
                            .font(.system(size: 17))
                            .fontWeight(.bold)
                            .foregroundColor(.black)
                        Spacer()
                    }
                    .frame(minWidth: 0, maxWidth: .infinity)
                    .padding()
                    .background(
                        RoundedRectangle(cornerRadius: 25)
                            .fill(Color.white)
                            .shadow(color: .gray, radius: 2, x: 0, y: 2)
                    )
                    .padding()
                }
                NavigationLink(destination: GovernmentCardEditingViewDataOneDrive(AccessToken: $AccessToken, SelectedCard: $SelectedCard)){
                    HStack{
                        Text("One Drive")
                            .font(.system(size: 17))
                            .fontWeight(.bold)
                            .foregroundColor(.black)
                        Spacer()
                    }
                    .frame(minWidth: 0, maxWidth: .infinity)
                    .padding()
                    .background(
                        RoundedRectangle(cornerRadius: 25)
                            .fill(Color.white)
                            .shadow(color: .gray, radius: 2, x: 0, y: 2)
                    )
                    .padding()
                }
            }
        }
    }
}

struct GovernmentCardEditingUser{
    let id: UUID = UUID()
    let Name: String
    let uid: String
    var Owner: Bool
    var Contributer: Bool
}

struct GovernmentCardEditingView: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @Binding var accessToken: String?
    @State var SelectedCard: CardType
    @State var ConfirmLoading: Bool = false
    @State var SelectedColor: Color = Color.white
    @State var width: CGSize = CGSize(width: 0.0, height: 0.0)
    @State var ShowingShareSheet: Bool = false
    @State var UsersLoading: Bool = true
    @State var AvaliableUsers: [GovernmentCardEditingUser] = []
    @State var SearchResults: [GovernmentCardEditingUser] = []
    @State var searchText: String = ""
    @State var SearchByOwners: Bool = false
    @State var SearchByContributers: Bool = false
    var body: some View{
        GeometryReader{ geo in
            VStack{
                HStack{
                    Spacer()
                    Text("Edit Card")
                        .saveSize(in: $width)
                        .onAppear(){
                            if SelectedCard.ColorType != nil{
                                SelectedColor = Color(hexString: SelectedCard.ColorType!) ?? Color.white
                            }
                        }
                        .onChange(of: SelectedColor){ CardColor in
                            SelectedCard.ColorType = "#\(SelectedColor.toHex()!)"
                        }
                        .padding(.leading, SelectedCard.Owners.contains(WindowMode.UsernameIn) ? width.height * 1.5:0)
                    Spacer()
                    if SelectedCard.Owners.contains(WindowMode.UsernameIn){
                        Button{
                            ShowingShareSheet = true
                        } label: {
                            Image(systemName: "square.and.arrow.up")
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .frame(height: width.height)
                                .padding()
                                .sheet(isPresented: $ShowingShareSheet){
                                    if UsersLoading{
                                        Spacer()
                                        ProgressView()
                                            .onAppear(){
                                                GetUsers()
                                            }
                                        Spacer()
                                    } else {
                                        VStack{
                                            HStack{
                                                Button(){
                                                    ShowingShareSheet = false
                                                } label: {
                                                    Text("Back")
                                                }.padding(.leading)
                                                Spacer()
                                                Text("Users")
                                                Spacer()
                                                Toggle(isOn: $SearchByOwners){
                                                    Text("Owners")
                                                }
                                                Toggle(isOn: $SearchByContributers){
                                                    Text("Contributers")
                                                }
                                            }.padding()
                                            TextField("", text: $searchText)
                                                .onAppear(){
                                                    SearchResults = AvaliableUsers
                                                }
                                                .onChange(of: SearchByOwners){ value in
                                                    if searchText.isEmpty {
                                                        if SearchByOwners{
                                                            SearchResults = AvaliableUsers.filter { $0.Owner == true }
                                                        } else {
                                                            if SearchByContributers{
                                                                SearchResults = AvaliableUsers.filter { $0.Contributer == true }
                                                            } else {
                                                                SearchResults = AvaliableUsers
                                                            }
                                                        }
                                                    } else {
                                                        if SearchByOwners{
                                                            SearchResults = AvaliableUsers.filter { $0.Name.contains(searchText) && $0.Owner == true }
                                                        } else {
                                                            if SearchByContributers{
                                                                SearchResults = AvaliableUsers.filter { $0.Name.contains(searchText) && $0.Contributer == true }
                                                            } else {
                                                                SearchResults = AvaliableUsers.filter { $0.Name.contains(searchText) }
                                                            }
                                                        }
                                                    }
                                                }
                                                .onChange(of: SearchByContributers){ value in
                                                    if searchText.isEmpty {
                                                        if SearchByOwners{
                                                            SearchResults = AvaliableUsers.filter { $0.Owner == true }
                                                        } else {
                                                            if SearchByContributers{
                                                                SearchResults = AvaliableUsers.filter { $0.Contributer == true }
                                                            } else {
                                                                SearchResults = AvaliableUsers
                                                            }
                                                        }
                                                    } else {
                                                        if SearchByOwners{
                                                            SearchResults = AvaliableUsers.filter { $0.Name.contains(searchText) && $0.Owner == true }
                                                        } else {
                                                            if SearchByContributers{
                                                                SearchResults = AvaliableUsers.filter { $0.Name.contains(searchText) && $0.Contributer == true }
                                                            } else {
                                                                SearchResults = AvaliableUsers.filter { $0.Name.contains(searchText) }
                                                            }
                                                        }
                                                    }
                                                }
                                                .onChange(of: searchText) { text in
                                                    if searchText.isEmpty {
                                                        if SearchByOwners{
                                                            SearchResults = AvaliableUsers.filter { $0.Owner == true }
                                                        } else {
                                                            if SearchByContributers{
                                                                SearchResults = AvaliableUsers.filter { $0.Contributer == true }
                                                            } else {
                                                                SearchResults = AvaliableUsers
                                                            }
                                                        }
                                                    } else {
                                                        if SearchByOwners{
                                                            SearchResults = AvaliableUsers.filter { $0.Name.contains(searchText) && $0.Owner == true }
                                                        } else {
                                                            if SearchByContributers{
                                                                SearchResults = AvaliableUsers.filter { $0.Name.contains(searchText) && $0.Contributer == true }
                                                            } else {
                                                                SearchResults = AvaliableUsers.filter { $0.Name.contains(searchText) }
                                                            }
                                                        }
                                                    }
                                                }
                                            ScrollView(){
                                                ForEach($SearchResults, id: \.id){ User in
                                                    VStack{
                                                        HStack{
                                                            Text(User.wrappedValue.Name)
                                                            Spacer()
                                                        }
                                                        HStack{
                                                            Toggle(isOn: User.Owner) {
                                                                Text("Owner")
                                                            }
                                                            .toggleStyle(iOSCheckboxToggleStyle())
                                                            Toggle(isOn:User.Contributer) {
                                                                Text("Contributer")
                                                            }
                                                            .toggleStyle(iOSCheckboxToggleStyle())
                                                            Spacer()
                                                        }.onChange(of: User.wrappedValue.Owner){ value in
                                                            if User.wrappedValue.Owner && User.wrappedValue.Contributer == false{
                                                                User.wrappedValue.Contributer = true
                                                            }
                                                            if let Index = AvaliableUsers.firstIndex(where: {$0.id == User.wrappedValue.id}){
                                                                AvaliableUsers[Index].Contributer = User.wrappedValue.Contributer
                                                                AvaliableUsers[Index].Owner = User.wrappedValue.Owner
                                                            }
                                                            if User.wrappedValue.Owner == false{
                                                                if let Index = SelectedCard.Owners.firstIndex(where: { $0 == User.wrappedValue.uid }){
                                                                    SelectedCard.Owners.remove(at: Index)
                                                                }
                                                                if let Index = SelectedCard.Contributers.firstIndex(where: { $0 == User.wrappedValue.uid }){
                                                                    SelectedCard.Contributers.remove(at: Index)
                                                                }
                                                            } else {
                                                                print("Owner")
                                                                SelectedCard.Owners.append(User.wrappedValue.uid)
                                                            }
                                                        }
                                                        .onChange(of: User.wrappedValue.Contributer){ value in
                                                            if User.wrappedValue.Owner && User.wrappedValue.Contributer == false{
                                                                User.wrappedValue.Owner = false
                                                            }
                                                            if let Index = AvaliableUsers.firstIndex(where: {$0.id == User.wrappedValue.id}){
                                                                AvaliableUsers[Index].Contributer = User.wrappedValue.Contributer
                                                                AvaliableUsers[Index].Owner = User.wrappedValue.Owner
                                                            }
                                                            if User.wrappedValue.Contributer == false{
                                                                if let Index = SelectedCard.Contributers.firstIndex(where: { $0 == User.wrappedValue.uid }){
                                                                    SelectedCard.Contributers.remove(at: Index)
                                                                }
                                                            } else {
                                                                print("Contributer")
                                                                SelectedCard.Contributers.append(User.wrappedValue.uid)
                                                            }
                                                        }
                                                    }
                                                    .frame(minWidth: 0, maxWidth: .infinity)
                                                    .padding()
                                                    .background(
                                                        RoundedRectangle(cornerRadius: 25)
                                                            .fill(Color.white)
                                                            .shadow(color: .gray, radius: 2, x: 0, y: 2)
                                                    )
                                                    .padding()
                                                }
                                            }
                                        }
                                    }
                                }
                        }//Mark
                    }
                }
                Card(TextColor: .black, accessToken: $accessToken, SelectedCard: $SelectedCard)
                    .frame(height: geo.size.height * 0.3)
                TextField("Use", text: $SelectedCard.Use)
                    .padding([.leading, .trailing])
                if SelectedCard.BackgroundStyle == 0{
                    TextField("Title", text: $SelectedCard.Title.toUnwrapped(defaultValue: ""))
                        .padding([.leading, .trailing])
                    TextField("Caption", text: $SelectedCard.Caption.toUnwrapped(defaultValue: ""))
                        .padding([.leading, .trailing])
                    ColorPicker("Set the background color", selection: $SelectedColor)
                        .padding([.leading, .trailing])
                } else {
                    if SelectedCard.BackgroundStyle == 1{
                        TextField("Image Reference", text: $SelectedCard.ImageRef.toUnwrapped(defaultValue: ""))
                            .padding([.leading, .trailing])
                    } else {
                        if SelectedCard.BackgroundStyle == 2{
                            TextField("Title", text: $SelectedCard.Title.toUnwrapped(defaultValue: ""))
                                .padding([.leading, .trailing])
                            TextField("Caption", text: $SelectedCard.Caption.toUnwrapped(defaultValue: ""))
                                .padding([.leading, .trailing])
                            TextField("Image Reference", text: $SelectedCard.ImageRef.toUnwrapped(defaultValue: ""))
                                .padding([.leading, .trailing])
                        } else {
                            if SelectedCard.BackgroundStyle == 3{
                                ColorPicker("Set the background color", selection: $SelectedColor)
                                    .padding([.leading, .trailing])
                                TextField("Text Long", text: $SelectedCard.LongText.toUnwrapped(defaultValue: ""))
                                    .padding([.leading, .trailing])
                            }
                        }
                    }
                }
                NavigationLink(destination: GovernmentCardEditingViewData(SelectedCard: $SelectedCard, AccessToken: $accessToken)){
                    HStack{
                        Text("Edit Destination")
                            .font(.system(size: 17))
                            .fontWeight(.bold)
                            .foregroundColor(.black)
                        Spacer()
                    }
                    .frame(minWidth: 0, maxWidth: .infinity)
                    .padding()
                    .background(
                        RoundedRectangle(cornerRadius: 25)
                            .fill(Color.white)
                            .shadow(color: .gray, radius: 2, x: 0, y: 2)
                    )
                    .padding()
                }
                Button(){
                    if ConfirmLoading == false{
                        ConfirmLoading = true
                        var CardInputData: [String:Any] = [
                            "BackgroundStyle":SelectedCard.BackgroundStyle,
                            "Use":SelectedCard.Use,
                            "Opacity":String(SelectedCard.Opacity),
                            "Hidden":SelectedCard.Hidden,
                            "Permissions":SelectedCard.Contributers,
                            "Owners":SelectedCard.Owners
                        ]
                        var NewCardDataNameArray: [String] = []
                        var NewCardDataValueArray: [String] = []
                        var NewCardDataTypeArray: [String] = []
                        
                        for x in SelectedCard.CardData{
                            NewCardDataNameArray.append(x.Name)
                            NewCardDataValueArray.append(x.Id)
                            NewCardDataTypeArray.append(x.FileType)
                        }
                        
                        CardInputData["CardDataName"] = NewCardDataNameArray
                        CardInputData["CardData"] = NewCardDataValueArray
                        CardInputData["CardDataType"] = NewCardDataTypeArray
                        
                        
                        if SelectedCard.BackgroundStyle == 0{
                            CardInputData["Title"] = SelectedCard.Title
                            CardInputData["Caption"] = SelectedCard.Caption
                            CardInputData["Color"] =  SelectedCard.ColorType!
                        } else {
                            if SelectedCard.BackgroundStyle == 1{
                                CardInputData["ImageRef"] = SelectedCard.ImageRef
                            } else {
                                if SelectedCard.BackgroundStyle == 2{
                                    CardInputData["Title"] = SelectedCard.Title
                                    CardInputData["Caption"] = SelectedCard.Caption
                                    CardInputData["ImageRef"] = SelectedCard.ImageRef
                                } else {
                                    if SelectedCard.BackgroundStyle == 3{
                                        CardInputData["Text"] = SelectedCard.LongText
                                        CardInputData["Color"] = SelectedCard.ColorType!
                                    }
                                }
                            }
                        }
                        
                        let db = Firestore.firestore()
                        
                        let ref = db.collection("Cards").document("\(SelectedCard.FirebaseID)")
                        
                        ref.updateData(CardInputData) { error in
                            if let error = error {
                                print("Error updating document: \(error)")
                            } else {
                                ConfirmLoading = false
                            }
                        }
                    }
                } label: {
                    if ConfirmLoading{
                        ProgressView()
                            .frame(minWidth: 0, maxWidth: .infinity)
                            .padding()
                            .background(
                                RoundedRectangle(cornerRadius: 25)
                                    .fill(Color.white)
                                    .shadow(color: .gray, radius: 2, x: 0, y: 2)
                            )
                            .padding()
                    } else {
                        HStack{
                            Text("Confirm")
                                .font(.system(size: 17))
                                .fontWeight(.bold)
                                .foregroundColor(.black)
                            Spacer()
                        }
                        .frame(minWidth: 0, maxWidth: .infinity)
                        .padding()
                        .background(
                            RoundedRectangle(cornerRadius: 25)
                                .fill(Color.white)
                                .shadow(color: .gray, radius: 2, x: 0, y: 2)
                        )
                        .padding()
                    }
                }
                Spacer()
            }.background(Color.marron, ignoresSafeAreaEdges: .all)
        }
    }
    func GetUsers(){
        let db = Firestore.firestore()
        
        let docRef = db.collection("Users")
        
        docRef.getDocuments { (snapshot, error) in
            guard let snapshot = snapshot, error == nil else {
             //handle error
             return
           }
           snapshot.documents.forEach({ (documentSnapshot) in
               let data = documentSnapshot.data()
               let CardCount = data["CardCount"] as? Int
               if CardCount == nil{
                   guard let FirstName = data["First Name"] as? String else {
                       return
                   }
                   guard let LastName = data["Last Name"] as? String else {
                       return
                   }
                   guard let UserUid = data["uid"] as? String else {
                       return
                   }
                   if UserUid != WindowMode.UsernameIn{
                       if SelectedCard.Owners.contains(UserUid){
                           AvaliableUsers.append(GovernmentCardEditingUser(Name: "\(FirstName) \(LastName)", uid: UserUid, Owner: true, Contributer: true))
                       } else {
                           if SelectedCard.Contributers.contains(UserUid){
                               AvaliableUsers.append(GovernmentCardEditingUser(Name: "\(FirstName) \(LastName)", uid: UserUid, Owner: false, Contributer: true))
                           } else {
                               AvaliableUsers.append(GovernmentCardEditingUser(Name: "\(FirstName) \(LastName)", uid: UserUid, Owner: false, Contributer: false))
                           }
                       }
                   }
               }
           })
            UsersLoading = false
         }
    }
}

struct iOSCheckboxToggleStyle: ToggleStyle {
    func makeBody(configuration: Configuration) -> some View {
        // 1
        Button(action: {

            // 2
            configuration.isOn.toggle()

        }, label: {
            HStack {
                // 3
                Image(systemName: configuration.isOn ? "checkmark.circle" : "circle")
                    .foregroundColor(Color.blue)

                configuration.label
            }
        })
    }
}

extension Binding {
     func toUnwrapped<T>(defaultValue: T) -> Binding<T> where Value == Optional<T>  {
        Binding<T>(get: { self.wrappedValue ?? defaultValue }, set: { self.wrappedValue = $0 })
    }
}

struct GovernmentCardView: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @Binding var SelectedGovernmentViewMode: GovernmentViewModes
    @Binding var accessToken: String?
    @State var AvaliableCards: [CardType] = []
    @State var SearchResults: [CardType] = []
    @State var searchText: String = ""
    @State var OnlyCardsICanEdit: Bool = false
    @State var PageLoading: Bool = true
    @FocusState private var focusedField: Bool
    
    var body: some View{
        NavigationView(){
            if PageLoading{
                VStack{
                    HStack{
                        Button(){
                            SelectedGovernmentViewMode = .Home
                        } label: {
                            HStack {
                                Image(systemName: "chevron.backward")
                                    .padding(.leading)
                                Text("Back")
                            }
                        }
                        Spacer()
                    }
                    Spacer()
                    ProgressView()
                        .onAppear(){
                            FetchCards()
                        }
                    Spacer()
                }
            } else {
                VStack{
                    HStack(){
                        Button(){
                            SelectedGovernmentViewMode = .Home
                        } label: {
                            HStack {
                                Image(systemName: "chevron.backward")
                                    .padding(.leading)
                                Text("Back")
                            }
                        }
                        Spacer()
                    }
                    HStack{
                        Text("Card")
                            .font(.title)
                            .padding()
                        Spacer()
                        Toggle(isOn: $OnlyCardsICanEdit){
                            Text("Only Cards I Can Edit")
                                .padding(.trailing)
                        }
                    }
                    Button{
                        focusedField.toggle()
                    } label: {
                        HStack {
                            Image(systemName: "magnifyingglass")
                                .padding([.top, .bottom, .leading])
                            TextField("", text: $searchText)
                                .foregroundColor(Color.black)
                                .font(Font.system(size: 16))
                                .multilineTextAlignment(.leading)
                                .padding([.top, .bottom])
                                .focused($focusedField)
                                .placeholder(when: searchText.isEmpty) {
                                    Text("Search").foregroundColor(.black)
                                }
                                .onSubmit {
                                    focusedField = false
                                }
                        }
                        .background(
                            RoundedRectangle(cornerRadius: 10)
                                .foregroundColor(Color.white)
                                .overlay(RoundedRectangle(cornerRadius: 10).stroke(lineWidth: 2).foregroundColor(Color.black))
                        )
                        .cornerRadius(10)
                        .padding()
                    }
                    .onAppear(){
                        SearchResults = AvaliableCards
                    }
                    .onChange(of: searchText){ value in
                        GetResults()
                    }
                    .onChange(of: OnlyCardsICanEdit){ value in
                        GetResults()
                    }
                    ScrollView{
                        ForEach(SearchResults, id: \.id){ card in
                            if card.Contributers.contains(WindowMode.UsernameIn){
                                NavigationLink(destination: GovernmentCardEditingView(accessToken: $accessToken, SelectedCard: card)){
                                    HStack{
                                        Text(card.Use)
                                            .font(.system(size: 17))
                                            .fontWeight(.bold)
                                            .foregroundColor(.black)
                                        Spacer()
                                    }
                                    .frame(minWidth: 0, maxWidth: .infinity)
                                    .padding([.top, .bottom])
                                    .padding()
                                    .background(
                                        RoundedRectangle(cornerRadius: 25)
                                            .fill(Color.white)
                                            .shadow(color: .gray, radius: 2, x: 0, y: 2)
                                    )
                                    .padding()
                                }
                            } else {
                                if card.Hidden == false{
                                    HStack{
                                        Text(card.Use)
                                            .font(.system(size: 17))
                                            .fontWeight(.bold)
                                            .foregroundColor(.black)
                                        Spacer()
                                    }
                                    .frame(minWidth: 0, maxWidth: .infinity)
                                    .padding([.top, .bottom])
                                    .padding()
                                    .background(
                                        RoundedRectangle(cornerRadius: 25)
                                            .fill(Color.gray)
                                            .shadow(color: .gray, radius: 2, x: 0, y: 2)
                                    )
                                    .padding()
                                }
                            }
                        }
                    }
                    NavigationLink(destination: GovernmentCardAddView(AccessToken: $accessToken)){
                        HStack{
                            Text("Create New Card")
                                .font(.system(size: 17))
                                .fontWeight(.bold)
                                .foregroundColor(.black)
                            Spacer()
                        }
                        .frame(minWidth: 0, maxWidth: .infinity)
                        .padding()
                        .background(
                            RoundedRectangle(cornerRadius: 25)
                                .fill(Color.white)
                                .shadow(color: .gray, radius: 2, x: 0, y: 2)
                        )
                        .padding()
                    }
                    Spacer()
                }.background(Color.marron)
            }
        }
    }
    func GetResults(){
        if searchText.isEmpty {
            if OnlyCardsICanEdit{
                SearchResults = AvaliableCards.filter { $0.Contributers.contains(WindowMode.UsernameIn) }
            } else {
                SearchResults = AvaliableCards
            }
        } else {
            if OnlyCardsICanEdit{
                SearchResults = AvaliableCards.filter { $0.Contributers.contains(WindowMode.UsernameIn) && $0.Use.contains(searchText) }
            } else {
                SearchResults = AvaliableCards.filter { $0.Use.contains(searchText) }
            }
        }
    }
    func FetchCards() {
        AvaliableCards = []
        
        let db = Firestore.firestore()
        
        let docRef = db.collection("Cards")
        docRef.getDocuments { (snapshot, error) in
            guard let snapshot = snapshot, error == nil else {
             //handle error
             return
           }
           print("Number of documents: \(snapshot.documents.count ?? -1)")
           snapshot.documents.forEach({ (documentSnapshot) in
               let data = documentSnapshot.data()
               let CardCount = data["CardCount"] as? Int
               if CardCount == nil{
                   let cardDataValueFire = data["CardData"] as! [String]
                   let cardDataNameFire = data["CardDataName"] as! [String]
                   let BackgroundStyle = data["BackgroundStyle"] as! Int
                   let Opacity = data["Opacity"] as! String
                   let cardDataTypeFire: [String] = data["CardDataType"] as? NSArray as? [String] ?? []
                   var CardDataIn: [DataIdType] = []
                   let Use = data["Use"] as! String
                   guard let Hidden = data["Hidden"] as? Bool else {
                       return
                   }
                   guard let Permissions = data["Permissions"] as? NSArray as? [String] else {
                       return
                   }
                   guard let FirebaseId = data["FirebaseID"] as? Int else {
                       return
                   }
                   guard let Owners = data["Owners"] as? NSArray as? [String] else {
                       return
                   }
                   for y in 0..<cardDataNameFire.count{
                       CardDataIn.append(DataIdType(Name: cardDataNameFire[y], Id: cardDataValueFire[y], FileType: cardDataTypeFire[y]))
                   }
                   if BackgroundStyle == 0{
                       let captionFire = data["Caption"] as! String
                       let titleFire = data["Title"] as! String
                       let ColorFire = data["Color"] as! String
                       AvaliableCards.append(CardType(Use: Use, Title: titleFire, Caption: captionFire, ColorType: ColorFire, ImageRef: nil, LongText: nil, BackgroundStyle: BackgroundStyle, FirebaseID: FirebaseId, Opacity: Double(Opacity)!, CardData: CardDataIn, Hidden: Hidden, Contributers: Permissions, Owners: Owners))
                   } else {
                       if BackgroundStyle == 1{
                           let ImageRefFire = data["ImageRef"] as! String
                           AvaliableCards.append(CardType(Use: Use, Title: nil, Caption: nil, ColorType: nil, ImageRef: ImageRefFire, LongText: nil, BackgroundStyle: BackgroundStyle, FirebaseID: FirebaseId, Opacity: Double(Opacity)!, CardData: CardDataIn, Hidden: Hidden, Contributers: Permissions, Owners: Owners))
                       } else {
                           if BackgroundStyle == 2{
                               let captionFire = data["Caption"] as! String
                               let titleFire = data["Title"] as! String
                               let ImageRefFire = data["ImageRef"] as! String
                               AvaliableCards.append(CardType(Use: Use, Title: titleFire, Caption: captionFire, ColorType: nil, ImageRef: ImageRefFire, LongText: nil, BackgroundStyle: BackgroundStyle, FirebaseID: FirebaseId, Opacity: Double(Opacity)!, CardData: CardDataIn, Hidden: Hidden, Contributers: Permissions, Owners: Owners))
                           } else {
                               if BackgroundStyle == 3{
                                   let ColorFire = data["Color"] as! String
                                   let LongTextFire = data["Text"] as! String
                                   AvaliableCards.append(CardType(Use: Use, Title: nil, Caption: nil, ColorType: ColorFire, ImageRef: nil, LongText: LongTextFire, BackgroundStyle: BackgroundStyle, FirebaseID: FirebaseId, Opacity: Double(Opacity)!, CardData: CardDataIn, Hidden: Hidden, Contributers: Permissions, Owners: Owners))
                               }
                           }
                       }
                   }
               }
           })
            PageLoading = false
         }
    }
}

struct CardIndexType{
    let id: UUID = UUID()
    let CardIndex: Int
    let CardValue: CardType
}

struct GovernmentSelectedAddCardsOverview: View{
    @Binding var PageInfo: [Int]
    var body: some View{
        ZStack{
            Rectangle()
                .foregroundColor(Color.marron)
            VStack{
                NavigationLink(destination: GovernmentSelectedCardsView(Cards: $PageInfo)){
                    HStack{
                        Text("Change Page")
                            .font(.system(size: 17))
                            .fontWeight(.bold)
                            .foregroundColor(.black)
                        Spacer()
                    }
                    .frame(minWidth: 0, maxWidth: .infinity)
                    .padding()
                    .background(
                        RoundedRectangle(cornerRadius: 25)
                            .fill(Color.white)
                            .shadow(color: .gray, radius: 2, x: 0, y: 2)
                    )
                    .padding()
                }
                NavigationLink(destination: GovernmentAddCardsView(Cards: $PageInfo)){
                    HStack{
                        Text("Add to Page")
                            .font(.system(size: 17))
                            .fontWeight(.bold)
                            .foregroundColor(.black)
                        Spacer()
                    }
                    .frame(minWidth: 0, maxWidth: .infinity)
                    .padding()
                    .background(
                        RoundedRectangle(cornerRadius: 25)
                            .fill(Color.white)
                            .shadow(color: .gray, radius: 2, x: 0, y: 2)
                    )
                    .padding()
                }
                Spacer()
            }.background(Color.marron, ignoresSafeAreaEdges: .all)
        }
    }
}

struct GovernmentSelectedCardsView: View {
    @Binding var Cards: [Int]
    @State var SelectedCards: [CardIndexType] = []
    
    @State var TextSize: CGSize = CGSize(width: 0, height: 0)
    @State var SelectedCardsLoaded = false
    var body: some View{
        VStack{
            Text("Selected Cards")
            if SelectedCardsLoaded{
                List(){
                    ForEach(SelectedCards, id: \.id){ cardID in
                        HStack{
                            Text(cardID.CardValue.Use)
                                .saveSize(in: $TextSize)
                            let CardIndexFor: Int = cardID.CardIndex
                            if CardIndexFor <= (Cards.count - 2) && Cards.count >= 2{
                                Divider()
                                Button(){
                                    Cards.rearrange(from: CardIndexFor, to: (CardIndexFor - 1))
                                } label: {
                                    Image(systemName: "arrow.down.circle")
                                        .resizable()
                                        .aspectRatio(contentMode: .fit)
                                        .frame(height: TextSize.height)
                                }
                            }
                            if cardID.CardIndex != 0{
                                Divider()
                                Button(){
                                    Cards.rearrange(from: CardIndexFor, to: (CardIndexFor + 1))
                                    SelectedCards.rearrange(from: CardIndexFor, to: (CardIndexFor + 1))
                                } label: {
                                    Image(systemName: "arrow.up.circle")
                                        .resizable()
                                        .aspectRatio(contentMode: .fit)
                                        .frame(height: TextSize.height)
                                }
                            }
                            Divider()
                            Button(){
                                Cards.remove(at: CardIndexFor)
                                SelectedCards.remove(at: CardIndexFor)
                                SelectedCardsLoaded = false
                            } label: {
                                Text("Remove")
                            }
                        }
                    }
                }
            } else {
                Spacer()
                ProgressView()
                    .onAppear(){
                        GetCards()
                    }
                Spacer()
            }
        }.background(Color.marron, ignoresSafeAreaEdges: .all)
    }
    func GetCards() {
        let db = Firestore.firestore()
        
        print("Cards: \(Cards.description)")
        var Index = 0
        for x in Cards{
            let docRef = db.collection("Cards").document("\(x)")
            
            docRef.getDocument { (document, error) in
                guard error == nil else {
                    print("error", error ?? "")
                    return
                }

                if let document = document, document.exists {
                    let data = document.data()
                    if let data = data {
                        let CardCount = data["CardCount"] as? Int
                        if CardCount != nil{
                            
                        } else {
                            guard let CardBackgroundStyle = data["BackgroundStyle"] as? Int else {
                                return
                            }
                            let CardTitle = data["Title"] as? String
                            let CardCaption = data["Caption"] as? String
                            let CardLongText = data["Text"] as? String
                            let CardImageRefFire = data["ImageRef"] as? String
                            let CardColor = data["Color"] as? String
                            guard let CardCardData = data["CardData"] as? NSArray as? [String] else {
                                return
                            }
                            guard let CardCardDataName = data["CardDataName"] as? NSArray as? [String] else {
                                return
                            }
                            guard let CardCardDateType = data["CardDataType"] as? NSArray as? [String] else {
                                return
                            }
                            guard let CardFirebaseID = data["FirebaseID"] as? Int else {
                                return
                            }
                            guard let CardOpacity = data["Opacity"] as? String else {
                                return
                            }
                            guard let CardUse = data["Use"] as? String else {
                                return
                            }
                            guard let Hidden = data["Hidden"] as? Bool else {
                                return
                            }
                            guard let Permissions = data["Permissions"] as? NSArray as? [String] else {
                                return
                            }
                            guard let Owners = data["Owners"] as? NSArray as? [String] else {
                                return
                            }
                            var CardDataIdType: [DataIdType] = []
                            for x in 0..<CardCardData.count{
                                CardDataIdType.append(DataIdType(Name: CardCardDataName[x], Id: CardCardData[x], FileType: CardCardDateType[x]))
                            }
                            SelectedCards.append(CardIndexType(CardIndex: Index, CardValue: CardType(Use: CardUse, Title: CardTitle, Caption: CardCaption, ColorType: CardColor, ImageRef: CardImageRefFire, LongText: CardLongText, BackgroundStyle: CardBackgroundStyle, FirebaseID: x, Opacity: Double(CardOpacity)!, CardData: CardDataIdType, Hidden: Hidden, Contributers: Permissions, Owners: Owners)))
                            Index += 1
                        }
                    }
                }
                SelectedCardsLoaded = true
            }
        }
    }
}

extension RangeReplaceableCollection where Indices: Equatable {
    mutating func rearrange(from: Index, to: Index) {
        precondition(from != to && indices.contains(from) && indices.contains(to), "invalid indices")
        insert(remove(at: from), at: to)
    }
}

struct GovernmentAddCardsView: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    
    @Binding var Cards: [Int]
    @State var IsCardsFetched: Bool = false
    @State var AvaliableCards: [CardType] = []
    var body: some View{
        VStack{
            Text("Add Card")
            if IsCardsFetched{
                List(){
                    ForEach(AvaliableCards, id: \.id){ avaCard in
                        Button(){
                            Cards.append(avaCard.FirebaseID)
                        } label: {
                            Text("Use: \(avaCard.Use)")
                        }
                    }
                }
            } else {
                Spacer()
                ProgressView()
                    .onAppear(){
                        FetchCards()
                    }
                Spacer()
            }
        }.background(Color.marron, ignoresSafeAreaEdges: .all)
    }
    func FetchCards() {
        let db = Firestore.firestore()
        
        let classRef = db.collection("Cards")
        classRef.getDocuments() { (querySnapshot, error) in
            if let error = error {
                    print("Error getting documents: \(error)")
            } else {
                for document in querySnapshot!.documents {
                    let data = document.data()
                    let CardCount = data["CardCount"] as? Int
                    print("This is card count \(CardCount)")
                    if CardCount != nil{
                        
                    } else {
                        print("Here1")
                        guard let CardBackgroundStyle = data["BackgroundStyle"] as? Int else {
                            return
                        }
                        print("Here2")
                        let CardTitle = data["Title"] as? String
                        let CardCaption = data["Caption"] as? String
                        let CardLongText = data["Text"] as? String
                        let CardImageRefFire = data["ImageRef"] as? String
                        let CardColor = data["Color"] as? String
                        print("Here3")
                        guard let CardCardData = data["CardData"] as? NSArray as? [String] else {
                            return
                        }
                        guard let CardCardDataName = data["CardDataName"] as? NSArray as? [String] else {
                            return
                        }
                        guard let CardCardDateType = data["CardDataType"] as? NSArray as? [String] else {
                            return
                        }
                        guard let CardFirebaseID = data["FirebaseID"] as? Int else {
                            return
                        }
                        guard let CardOpacity = data["Opacity"] as? String else {
                            return
                        }
                        guard let CardUse = data["Use"] as? String else {
                            return
                        }
                        guard let CardFirebaseID = data["FirebaseID"] as? Int else {
                            return
                        }
                        guard let Hidden = data["Hidden"] as? Bool else {
                            return
                        }
                        guard let Permissions = data["Permissions"] as? NSArray as? [String] else {
                            return
                        }
                        guard let Owners = data["Owners"] as? NSArray as? [String] else {
                            return
                        }
                        var CardDataIdType: [DataIdType] = []
                        for x in 0..<CardCardData.count{
                            CardDataIdType.append(DataIdType(Name: CardCardDataName[x], Id: CardCardData[x], FileType: CardCardDateType[x]))
                        }
                        AvaliableCards.append(CardType(Use: CardUse, Title: CardTitle, Caption: CardCaption, ColorType: CardColor, ImageRef: CardImageRefFire, LongText: CardLongText, BackgroundStyle: CardBackgroundStyle, FirebaseID: CardFirebaseID, Opacity: Double(CardOpacity)!, CardData: CardDataIdType, Hidden: Hidden, Contributers: Permissions, Owners: Owners))
                        print(AvaliableCards)
                    }
                }
            }
        } //mark
        print(AvaliableCards)
        IsCardsFetched = true
    }
}


extension Color {
    func toHex() -> String? {
        let uic = UIColor(self)
        guard let components = uic.cgColor.components, components.count >= 3 else {
            return nil
        }
        let r = Float(components[0])
        let g = Float(components[1])
        let b = Float(components[2])
        var a = Float(1.0)

        if components.count >= 4 {
            a = Float(components[3])
        }

        if a != Float(1.0) {
            return String(format: "%02lX%02lX%02lX%02lX", lroundf(r * 255), lroundf(g * 255), lroundf(b * 255), lroundf(a * 255))
        } else {
            return String(format: "%02lX%02lX%02lX", lroundf(r * 255), lroundf(g * 255), lroundf(b * 255))
        }
    }
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
