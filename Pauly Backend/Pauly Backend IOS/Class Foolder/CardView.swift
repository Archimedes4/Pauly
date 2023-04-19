//
//  CardView.swift
//  Pauly Backend
//
//  Created by Andrew Mainella on 2023-03-22.
//

import Foundation
import SwiftUI
import FirebaseCore
import FirebaseAuth
import FirebaseFirestore

enum CardMode{
    case CardOverview
    case AddCard
    case EditCard
}

struct CardViewOverview: View{
    @Binding var EditClassPageSelected: EditClassViewPages
    @Binding var LastPageSelected: EditClassViewPages
    
    @Binding var SelectedCardMode: CardMode
    @Binding var SelectedCard: CardType?
    
    @State var AvaliableCards: [CardType] = []
    var body: some View{
        VStack{
            Text("Card View")
            ForEach(AvaliableCards, id: \.FirebaseID){ value in
                HStack{
                    Button(){
                        SelectedCard = value
                        SelectedCardMode = .EditCard
                    } label: {
                        Text(value.Use)
                    }
                    Button(){
                        if let index = AvaliableCards.firstIndex(where: {$0.FirebaseID == value.FirebaseID}){
                            AvaliableCards.remove(at: index)
                            let db = Firestore.firestore()
                            
                            print("\(value.FirebaseID)")
                            db.collection("Cards").document("\(value.FirebaseID)").delete() { err in
                                if let err = err {
                                  print("Error removing document: \(err)")
                                }
                                else {
                                  print("Document successfully removed!")
                                }
                              }
                        }
                    } label: {
                        Image(systemName: "minus.square")
                            .resizable()
                            .foregroundColor(.red)
                            .aspectRatio(contentMode: .fit)
                    }
                }
            }
            Button(){
                SelectedCardMode = .AddCard
            } label: {
                HStack{
                    Image(systemName: "plus.app")
                        .resizable()
                        .foregroundColor(.green)
                        .aspectRatio(contentMode: .fit)
                    Text("Create New Card")
                }
            }.onAppear(){
                GetCards()
            }
            Button(){
                if LastPageSelected == .PageOne{
                    EditClassPageSelected = .PageOne
                } else {
                    if LastPageSelected == .PageTwo{
                        EditClassPageSelected = .PageTwo
                    } else {
                        EditClassPageSelected = .PageThree
                    }
                }
            } label: {
                Text("Back")
            }
        }.background(Color.marron)
    }
    func GetCards() {
        Task{
            do{
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
                       let documentData = documentSnapshot.data()
                       if documentData["CardCount"] != nil{
                           
                       } else {
                           let CardFirebaseID = documentData["FirebaseID"] as? Int ?? 0
                           let CardUse = documentData["Use"] as? String ?? "Error"
                           let CardTitle = documentData["Title"] as? String ?? "Error"
                           let CardCaption = documentData["Caption"] as? String ?? "Error"
                           let CardDestination = documentData["Destination"] as? Int ?? -1
                           if CardDestination == 0{
                               let CardCardData = documentData["CardData"] as! NSArray as? [String] ?? []
                               let CardCardDataName = documentData["CardDataName"] as! NSArray as? [String] ?? []
                               let CardCardDataType = documentData["CardDataType"] as! NSArray as? [String] ?? []
                               AvaliableCards.append(CardType(FirebaseID: CardFirebaseID, Use: CardUse, Title: CardTitle, Caption: CardCaption, Destination: CardDestination, CardData: CardCardData, CardDataName: CardCardDataName, CardDataType: CardCardDataType))
                           } else {
                               if CardDestination == 1{
                                   let CardCardData = documentData["CardData"] as! NSArray as? [String] ?? []
                                   let CardCardDataName = documentData["CardDataName"] as! NSArray as? [String] ?? []
                                   AvaliableCards.append(CardType(FirebaseID: CardFirebaseID, Use: CardUse, Title: CardTitle, Caption: CardCaption, Destination: CardDestination, CardData: CardCardData, CardDataName: CardCardDataName, CardDataType: nil))
                               }
                           }
                       }
                   })
                 }
            } catch {
                print("Error")
            }
        }
    }
}

struct CardView: View{
    @Binding var EditClassPageSelected: EditClassViewPages
    @Binding var LastPageSelected: EditClassViewPages
    @Binding var AccessToken: String?
    
    @State var SelectedCardMode: CardMode = .CardOverview
    @State var SelectedCard: CardType?
    
    var body: some View{
        if SelectedCardMode == .CardOverview{
            CardViewOverview(EditClassPageSelected: $EditClassPageSelected, LastPageSelected: $LastPageSelected, SelectedCardMode: $SelectedCardMode, SelectedCard: $SelectedCard)
        } else {
            if SelectedCardMode == .EditCard{
                CardViewEditCard(SelectedCardMode: $SelectedCardMode, SelectedCard: $SelectedCard)
            } else {
                if SelectedCardMode == .AddCard{
                    CardViewAddCard(SelectedCardMode: $SelectedCardMode, AccessToken: $AccessToken)
                }
            }
        }
    }
}

struct MSALCardFileType{
    let id: UUID = UUID()
    var Name: String
    let etag: String
    let Filetype: String
    let Filename: String
}

struct CardViewAddCard: View{
    @Binding var SelectedCardMode: CardMode
    @Binding var AccessToken: String?
    
    @State var Use: String = ""
    @State var Title: String = ""
    @State var Caption: String = ""
    @State var Destination: Int = 1
    @State var NewCardDataNameArray: [String] = []
    @State var NewCardDataValueArray: [String] = []
    @State var NewCardDataTypeArray: [String] = []
    @State var NewCardDataName: String = ""
    @State var NewCardDataValue: String = ""
    @State var FirebaseID: Int = 0
    @State var SelectedBackgroundStyle: Int = 0
    @State var ImageRef: String = ""
    @State var LongText: String = ""
    @State var SelectedColor: String = ""
    @State var Opacity: String = "1.0"
    @State var AvaliableFiles: [MSALCardFileType] = []
    @State var SelectedFiles: [MSALCardFileType] = []
    @State var AddMSALFileSheetPresented: Bool = false
    
    var body: some View{
        VStack{
            TextField("Use", text: $Use)
            Picker("Choose Card Background Style", selection: $SelectedBackgroundStyle){
                Text("Color with text and caption").tag(0)
                Text("Image Without text and caption").tag(1)
                Text("Image With text and caption").tag(2)
                Text("Color with text(as big as text)").tag(3)
            }
            if SelectedBackgroundStyle == 0{
                TextField("Title", text: $Title)
                TextField("Caption", text: $Caption)
                TextField("HEX Color Code", text: $SelectedColor)
                TextField("Opacity", text: $Opacity)
            } else {
                if SelectedBackgroundStyle == 1{
                    TextField("Image Ref", text: $ImageRef)
                    TextField("Opacity", text: $Opacity)
                } else {
                    if SelectedBackgroundStyle == 2 {
                        TextField("Title", text: $Title)
                        TextField("Caption", text: $Caption)
                        TextField("ImagePath", text: $ImageRef)
                        TextField("Opacity", text: $Opacity)
                    } else {
                        if SelectedBackgroundStyle == 3{
                            TextField("Text", text: $LongText)
                            TextField("HEX Color Code", text: $SelectedColor)
                            TextField("Opacity", text: $Opacity)
                        }
                    }
                }
            }
            Picker("Choose Destination", selection: $Destination){
                Text("PDF/MSAL 0").tag(0)
                Text("Youtube Videos 1").tag(1)
                Text("Built In").tag(2)
            }
            if Destination == 1{
                Group{
                    Text("\(NewCardDataNameArray.description)")
                    Text("\(NewCardDataValueArray.description)")
                    TextField("New Data Name", text: $NewCardDataName)
                    TextField("New Data Value", text: $NewCardDataValue)
                }
                Button(){
                    NewCardDataNameArray.append(NewCardDataName)
                    NewCardDataValueArray.append(NewCardDataValue)
                } label: {
                    Text("Add card data")
                }
                Button(){
                    NewCardDataNameArray = []
                    NewCardDataValueArray = []
                } label: {
                    Text("Clear Card Data")
                }
            } else {
                if Destination == 0{
                    ScrollView{
                        HStack{
                            VStack{
                                Text("Card Name")
                                ForEach($SelectedFiles, id: \.id){ $file in
                                    TextField("", text: $file.Name)
                                }
                            }
                            VStack{
                                Text("Card File")
                                ForEach(SelectedFiles, id: \.id){ file in
                                    Button(){
                                        if let Index = SelectedFiles.firstIndex(where: { $0.id == file.id }){
                                            AvaliableFiles.append(AvaliableFiles[Index])
                                            SelectedFiles.remove(at: Index)
                                        }
                                    } label: {
                                        Text(file.Filename)
                                    }
                                }
                            }
                            VStack{
                                Text("Avaliable Card Files")
                                ForEach(AvaliableFiles, id: \.id){ file in
                                    Button(){
                                        if let Index = AvaliableFiles.firstIndex(where: { $0.id == file.id }){
                                            SelectedFiles.append(AvaliableFiles[Index])
                                            AvaliableFiles.remove(at: Index)
                                        }
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
                }
            }
            Button(){
                CreateCard()
            } label: {
                Text("Create Card")
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
                                "Destination":Destination,
                                "Opacity":Opacity
                            ]
                            
                            if Destination == 0{
                                NewCardDataValueArray = []
                                NewCardDataNameArray = []
                                NewCardDataTypeArray = []
                                for k in SelectedFiles{
                                    NewCardDataValueArray.append(k.etag)
                                    NewCardDataNameArray.append(k.Name)
                                    NewCardDataTypeArray.append(k.Filetype)
                                }
                                CardInputData["CardDataName"] = NewCardDataNameArray
                                CardInputData["CardData"] = NewCardDataValueArray
                                CardInputData["CardDataType"] = NewCardDataTypeArray
                            } else {
                                if Destination == 1{
                                    CardInputData["CardDataName"] = NewCardDataNameArray
                                    CardInputData["CardData"] = NewCardDataValueArray
                                } else {
                                    if Destination == 2{
                                        
                                    }
                                }
                            }
                            
                            if SelectedBackgroundStyle == 0{
                                CardInputData["Title"] = Title
                                CardInputData["Caption"] = Caption
                                CardInputData["Color"] = SelectedColor
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
                                            CardInputData["Color"] = SelectedColor
                                        }
                                    }
                                }
                            }
                            
                            var ref = db.collection("Cards").document("\(FirebaseID)")
                            ref.setData(CardInputData) { err in
                                if let err = err {
                                    print("Error adding document: \(err)")
                                } else {
                                    SelectedCardMode = .CardOverview
                                }
                            }
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
                        let eTag = x["eTag"] as! String
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

struct CardViewEditCard: View{
    @Binding var SelectedCardMode: CardMode
    @Binding var SelectedCard: CardType?
    
    @State var SelectedCardTitle: String = ""
    @State var SelectedCardCaption: String  = ""
    @State var SelectedCardDestination: Int = 0
    @State var SelectedCardCardData: [String] = []
    @State var SelectedCardCardDataName: [String] = []
    
    @State var SelectedCardTitleOrigin: String?
    @State var SelectedCardCaptionOrigin: String?
    @State var SelectedCardDestinationOrigin: Int?
    
    @State var isCardDataChanged: Bool = false
    @State var isCardDataNameChanged: Bool = false
    
    @State var isShowingSelectionMenu: Bool = false
    @State var SelectionMenuText: String = ""
    @State var SelectedIndex: Int = 0
    @State var SelectedEditCardMode: EditCardMode = .Data
    @State var SelectedName: String = ""
    @State var SelectedData: String = ""
    
    var body: some View{
        ZStack{
            VStack{
                Text("Edit A Card")
                TextField("", text: $SelectedCardTitle)
                TextField("", text: $SelectedCardCaption)
                HStack{
                    Spacer()
                    Text("Names")
                        .font(.largeTitle)
                    Spacer()
                    Text("Data")
                        .font(.largeTitle)
                    Spacer()
                }.padding([.top, .bottom])
                HStack{
                    List{
                        ForEach(SelectedCardCardDataName, id: \.self){Name in
                            HStack{
                                Button(){
                                    if let Index = SelectedCardCardDataName.firstIndex(of: Name){
                                        isShowingSelectionMenu = true
                                        SelectionMenuText = Name
                                        SelectedIndex = Index
                                        SelectedEditCardMode = .Name
                                    }
                                } label: {
                                    Text(Name)
                                }
                                Button(){
                                    if let Index = SelectedCardCardDataName.firstIndex(of: Name){
                                        SelectedIndex = Index
                                        isShowingSelectionMenu = true
                                        SelectedEditCardMode = .Confirm
                                    }
                                } label: {
                                    Image(systemName: "minus.square")
                                        .resizable()
                                        .foregroundColor(.red)
                                        .aspectRatio(contentMode: .fit)
                                }
                            }
                        }
                        Button(){
                            SelectionMenuText = ""
                            isShowingSelectionMenu = true
                            SelectedEditCardMode = .NewValue
                        } label: {
                            HStack{
                                Image(systemName: "plus.app")
                                    .resizable()
                                    .foregroundColor(.green)
                                    .aspectRatio(contentMode: .fit)
                                Text("Create New Card")
                            }
                        }
                    }.cornerRadius(25)
                    .padding()
                    List{
                        ForEach(SelectedCardCardData, id: \.self){Data in
                            HStack{
                                Button(){
                                    if let Index = SelectedCardCardData.firstIndex(of: Data){
                                        isShowingSelectionMenu = true
                                        SelectionMenuText = Data
                                        SelectedIndex = Index
                                        SelectedEditCardMode = .Data
                                    }
                                } label:{
                                    Text(Data)
                                }
                                Button(){
                                    if let Index = SelectedCardCardData.firstIndex(of: Data){
                                        SelectedIndex = Index
                                        isShowingSelectionMenu = true
                                        SelectedEditCardMode = .Confirm
                                    }
                                } label: {
                                    Image(systemName: "minus.square")
                                        .resizable()
                                        .foregroundColor(.red)
                                        .aspectRatio(contentMode: .fit)
                                }
                            }
                        }
                        Button(){
                            SelectionMenuText = ""
                            isShowingSelectionMenu = true
                            SelectedEditCardMode = .NewValue
                        } label: {
                            HStack{
                                Image(systemName: "plus.app")
                                    .resizable()
                                    .foregroundColor(.green)
                                    .aspectRatio(contentMode: .fit)
                                Text("Create New Card")
                            }
                        }
                    }.cornerRadius(25)
                    .padding()
                }
                Button(){
                    var AnythingChange: Bool = false
                    var InputData: [String:Any] = [:]
                    if SelectedCardTitle != SelectedCardTitleOrigin {
                        InputData["Title"] = SelectedCardTitle
                        AnythingChange = true
                    }
                    if SelectedCardCaption != SelectedCardCaptionOrigin{
                        InputData["Caption"] = SelectedCardCaption
                        AnythingChange = true
                    }
                    if SelectedCardDestination != SelectedCardDestinationOrigin{
                        InputData["Destination"] = SelectedCardDestination
                        AnythingChange = true
                    }
                    if isCardDataChanged{
                        InputData["CardData"] = SelectedCardCardData
                        AnythingChange = true
                    }
                    if isCardDataNameChanged{
                        InputData["CardDataName"] = SelectedCardCardDataName
                        AnythingChange = true
                    }
                    if AnythingChange{
                        let db = Firestore.firestore()
                        
                        let docRef = db.collection("Cards").document("\(SelectedCard!.FirebaseID)")
                        
                        docRef.updateData(InputData) { error in
                            if let error = error {
                                print("Error updating document: \(error)")
                            } else {
                                print("Document successfully updated!")
                                SelectedCardMode = .CardOverview
                            }
                        }
                    } else {
                        SelectedCardMode = .CardOverview
                    }
                } label: {
                    Text("Confirm Changes")
                }
                Button(){
                    SelectedCardMode = .CardOverview
                } label: {
                    Text("Back")
                }
            }.onAppear(){
                SelectedCardTitle = SelectedCard!.Title
                SelectedCardCaption = SelectedCard!.Caption
                SelectedCardDestination = SelectedCard!.Destination
                SelectedCardCardData = SelectedCard!.CardData
                SelectedCardCardDataName = SelectedCard!.CardDataName
                self.SelectedCardTitleOrigin = self.SelectedCard!.Title
                self.SelectedCardCaptionOrigin = self.SelectedCard!.Caption
                self.SelectedCardDestinationOrigin = self.SelectedCard!.Destination
            }
            .background(Color.marron)
            if isShowingSelectionMenu{
                ZStack{
                    Rectangle()
                        .fill(Color.gray)
                    VStack{
                        if SelectedEditCardMode == .NewValue{
                            TextField("Name", text: $SelectedName)
                            TextField("Date", text: $SelectedData)
                            Button(){
                                if SelectedName != "" && SelectedData != ""{
                                    SelectedCardCardData.append(SelectedName)
                                    SelectedCardCardDataName.append(SelectedData)
                                    isCardDataNameChanged = true
                                    isCardDataChanged = true
                                    isShowingSelectionMenu = false
                                }
                            } label: {
                                Text("Confrim")
                            }
                            Button(){
                                isShowingSelectionMenu = false
                            } label: {
                                Text("Back")
                            }.onAppear(){
                                SelectedName = ""
                                SelectedData = ""
                            }
                        } else {
                            if SelectedEditCardMode == .Confirm{
                                VStack{
                                    Text("Are you sure? Pressing confirm will delete this item from both the name and data lists. Their is no undo!")
                                    Button(){
                                        isShowingSelectionMenu = false
                                        SelectedCardCardData.remove(at: SelectedIndex)
                                        SelectedCardCardDataName.remove(at: SelectedIndex)
                                        isCardDataNameChanged = true
                                        isCardDataChanged = true
                                    } label: {
                                        Text("Confirm")
                                    }
                                    Button(){
                                        isShowingSelectionMenu = false
                                    } label: {
                                        Text("Back")
                                    }
                                }
                            } else {
                                TextField("Name/Data", text: $SelectionMenuText)
                                Button(){
                                    if SelectedEditCardMode == .Name{
                                        SelectedCardCardDataName[SelectedIndex] = SelectionMenuText
                                        isCardDataNameChanged = true
                                    } else {
                                        if SelectedEditCardMode == .Data{
                                            SelectedCardCardData[SelectedIndex] = SelectionMenuText
                                            isCardDataChanged = true
                                        }
                                    }
                                    isShowingSelectionMenu = false
                                } label: {
                                    Text("Confrim")
                                }
                                Button(){
                                    isShowingSelectionMenu = false
                                } label: {
                                    Text("Back")
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
