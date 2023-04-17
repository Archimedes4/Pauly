//
//  GovernmentCardAddView.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-04-16.
//

import SwiftUI


struct GovernmentCardAddView: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @Binding var AccessToken: String?
    @State var Use: String = ""
    @State var Title: String = ""
    @State var Caption: String = ""
    @State var SelectedType: String = ""
    @State var DataFiles: [FileType] = []
    @State var NewCardDataName: String = ""
    @State var NewCardDataValue: String = ""
    @State var FirebaseID: Int = 0
    @State var SelectedBackgroundStyle: Int = 0
    @State var ImageRef: String = ""
    @State var LongText: String = ""
    @State var Opacity: Double = 1.0
    @State var AvaliableFiles: [MSALCardFileType] = []
    @State var ShownFiles: [MSALCardFileType] = []
    @State var AddMSALFileSheetPresented: Bool = false
    @State var isHidden: Bool = false
    @State var SelectedColorColor: Color = Color.gray
    let AvaliableTypes: [String] = ["pdf", "YT", "Paul"]
    @State var ShowingImportMenu: Bool = false
    var body: some View{
        ZStack{
            Rectangle()
                .fill(Color.marron)
                .ignoresSafeArea()
            ScrollView{
                VStack{
                    HStack{
                        Spacer()
                        Text("Create Card")
                        Spacer()
                        Button(){
                            ShowingImportMenu = true
                        } label: {
                            Image(systemName: "square.and.arrow.down")
                        }.sheet(isPresented: $ShowingImportMenu){
                            
                        }
                    }
                    TextField("", text: $Use)
                        .background(Color.white)
                        .placeholder(when: Use.isEmpty){
                            Text("Use")
                                .foregroundColor(.black)
                        }
                        .padding([.leading, .trailing])
                    Picker("Choose Card Background Style", selection: $SelectedBackgroundStyle){
                        Text("Color with text and caption").tag(0)
                        Text("Image Without text and caption").tag(1)
                        Text("Image With text and caption").tag(2)
                        Text("Color with text(as big as text)").tag(3)
                    }
                    Toggle("Hidden", isOn: $isHidden)
                    Text("Opacity \(Opacity * 100)%")
                    Slider(value: $Opacity, in: 0...1)
                        .padding([.leading, .trailing])
                    if SelectedBackgroundStyle == 0{
                        TextField("Title", text: $Title)
                            .placeholder(when: Title.isEmpty) {
                                Text("Title").foregroundColor(.black)
                            }
                        TextField("Caption", text: $Caption)
                            .placeholder(when: Caption.isEmpty) {
                                Text("Caption").foregroundColor(.black)
                            }
                        ColorPicker("Set the background color", selection: $SelectedColorColor)
                    } else {
                        if SelectedBackgroundStyle == 1{
                            TextField("Image Ref", text: $ImageRef)
                                .placeholder(when: ImageRef.isEmpty) {
                                    Text("Image Ref").foregroundColor(.black)
                                }
                        } else {
                            if SelectedBackgroundStyle == 2 {
                                TextField("Title", text: $Title)
                                    .placeholder(when: Title.isEmpty) {
                                        Text("Title").foregroundColor(.black)
                                    }
                                TextField("Caption", text: $Caption)
                                    .placeholder(when: Caption.isEmpty) {
                                        Text("Caption").foregroundColor(.black)
                                    }
                                TextField("ImagePath", text: $ImageRef)
                                    .placeholder(when: ImageRef.isEmpty) {
                                        Text("Image Ref").foregroundColor(.black)
                                    }
                            } else {
                                if SelectedBackgroundStyle == 3{
                                    TextField("Text", text: $LongText)
                                        .placeholder(when: LongText.isEmpty) {
                                            Text("Long Text").foregroundColor(.black)
                                        }
                                    ColorPicker("Set the background color", selection: $SelectedColorColor)
                                }
                            }
                        }
                    }
                    
                    ScrollView(.horizontal){
                        VStack{
                            HStack{
                                Text("Card Name")
                                Divider()
                                Text("Card Value")
                                Divider()
                                Text("Card Type")
                                Divider()
                                Text("Avaliable Card Files")
                            }
                            HStack{
                                if DataFiles.count == 0{
                                    Spacer()
                                }
                                VStack{
                                    ForEach($DataFiles, id: \.id) { file in
                                        HStack{
                                            TextField("File Name", text: file.Name)
                                            TextField("File Value", text: file.Value)
                                            Picker("", selection: file.FileTypeValue){
                                                ForEach(AvaliableTypes, id: \.self){ type in
                                                    Text(type)
                                                }
                                            }
                                        }
                                    }
                                }
                                VStack{
                                    ForEach(DataFiles, id: \.id) { file in
                                        Button("Remove"){
                                            if let Index = DataFiles.firstIndex(where: { $0.id == file.id}){
                                                DataFiles.remove(at: Index)
                                            }
                                        }
                                    }
                                }
                                VStack{
                                    ForEach(AvaliableFiles, id: \.id){ file in
                                        Button(){
                                            DataFiles.append(FileType(Name: "\(file.Name)", Value: file.etag, FileTypeValue: file.Filetype))
                                        } label: {
                                            Text(file.Filename)
                                        }
                                    }
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
                    Button(){
                        DataFiles.append(FileType(Name: "", Value: "1", FileTypeValue: "Paul"))
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
                    Button(){
                        CreateCard()
                    } label: {
                        HStack{
                            Text("Create Card")
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
                        DataFiles = []
                    } label: {
                        HStack{
                            Text("Clear Card Data")
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
                }//mark
            }
        }
    }
    func CreateCard(){
        //g0amdIcZt5I
        //QACGoKb48_0
        let db = FirebaseFirestore.Firestore.firestore()
        
        let docRef = db.collection("Cards").document("CardCount")
        
        docRef.getDocument { (document, error) in
            guard error == nil else {
                print("error", error ?? "")
                return
            }

            if let document = document, document.exists {
                let data = document.data()
                if let data = data {
                    FirebaseID = data["CardCount"] as? Int ?? 0
                    FirebaseID += 1
                    print(FirebaseID)
                    docRef.updateData(["CardCount": FirebaseID]) { error in
                        if let error = error {
                            print("Error updating document: \(error)")
                        } else {
                            var CardInputData: [String:Any] = [
                                "FirebaseID":FirebaseID,
                                "BackgroundStyle":SelectedBackgroundStyle,
                                "Use":Use,
                                "Opacity":String(Opacity),
                                "Hidden":isHidden,
                                "Permissions":[WindowMode.UsernameIn],
                                "Owners":[WindowMode.UsernameIn]
                            ]
                            var NewCardDataNameArray: [String] = []
                            var NewCardDataValueArray: [String] = []
                            var NewCardDataTypeArray: [String] = []
                            for j in DataFiles{
                                NewCardDataNameArray.append(j.Name)
                                NewCardDataValueArray.append(j.Value)
                                NewCardDataTypeArray.append(j.FileTypeValue)
                            }
                            CardInputData["CardDataName"] = NewCardDataNameArray
                            CardInputData["CardData"] = NewCardDataValueArray
                            CardInputData["CardDataType"] = NewCardDataTypeArray
                            
                            
                            if SelectedBackgroundStyle == 0{
                                CardInputData["Title"] = Title
                                CardInputData["Caption"] = Caption
                                CardInputData["Color"] = "#\(SelectedColorColor.toHex()!)"
                            } else {
                                if SelectedBackgroundStyle == 1{
                                    CardInputData["ImageRef"] = ImageRef
                                } else {
                                    if SelectedBackgroundStyle == 2{
                                        CardInputData["Title"] = Title
                                        CardInputData["Caption"] = Caption
                                        CardInputData["ImageRef"] = ImageRef
                                    } else {
                                        if SelectedBackgroundStyle == 3{
                                            CardInputData["Text"] = LongText
                                            CardInputData["Color"] = "#\(SelectedColorColor.toHex()!)"
                                        }
                                    }
                                }
                            }
                            
                            let ref = db.collection("Cards").document("\(FirebaseID)")
                            ref.setData(CardInputData)
                        }
                    }
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
                    print(json)
                    let Results = json["value"] as! NSArray as! [[String: Any]]
                    print(Results)
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
