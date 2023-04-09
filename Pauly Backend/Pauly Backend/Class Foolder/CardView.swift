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
                    Spacer()
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
                    Spacer()
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
                           let CardCardData = documentData["CardData"] as! NSArray as? [String] ?? []
                           let CardCardDataName = documentData["CardDataName"] as! NSArray as? [String] ?? []
                           let CardCardDataType = documentData["CardDataType"] as! NSArray as? [String] ?? []
                           let CardBackgroundStyle = documentData["BackgroundStyle"] as? Int ?? 0
                           let CardOpacity = documentData["Opacity"] as? String ?? "Error"
                           
                           if CardBackgroundStyle  == 0{
                               let CardTitle = documentData["Title"] as? String ?? "Error"
                               let CardCaption = documentData["Caption"] as? String ?? "Error"
                               let CardColor = documentData["Color"] as? String ?? "Error"
                               AvaliableCards.append(CardType(FirebaseID: CardFirebaseID, Use: CardUse, BackgroundStyle: CardBackgroundStyle, Opacity: CardOpacity, Title: CardTitle, Caption: CardCaption, ImageRef: nil, SelectedColor: CardColor, LongText: nil, CardData: CardCardData, CardDataName: CardCardDataName, CardDataType: CardCardDataType))
                           } else {
                               if CardBackgroundStyle == 1{
                                   let CardImageRef = documentData["ImageRef"] as? String ?? "Error"
                                   AvaliableCards.append(CardType(FirebaseID: CardFirebaseID, Use: CardUse, BackgroundStyle: CardBackgroundStyle, Opacity: CardOpacity, Title: nil, Caption: nil, ImageRef: CardImageRef, SelectedColor: nil, LongText: nil, CardData: CardCardData, CardDataName: CardCardDataName, CardDataType: CardCardDataType))
                               } else {
                                   if  CardBackgroundStyle == 2{
                                       let CardTitle = documentData["Title"] as? String ?? "Error"
                                       let CardCaption = documentData["Caption"] as? String ?? "Error"
                                       let CardImageRef = documentData["ImageRef"] as? String ?? "Error"
                                       AvaliableCards.append(CardType(FirebaseID: CardFirebaseID, Use: CardUse, BackgroundStyle: CardBackgroundStyle, Opacity: CardOpacity, Title: CardTitle, Caption: CardCaption, ImageRef: CardImageRef, SelectedColor: nil, LongText: nil, CardData: CardCardData, CardDataName: CardCardDataName, CardDataType: CardCardDataType))
                                   } else {
                                       if CardBackgroundStyle == 3{
                                           let CardLongText = documentData["Text"] as? String ?? "Error"
                                           let CardColor = documentData["Color"] as? String ?? "Error"
                                           AvaliableCards.append(CardType(FirebaseID: CardFirebaseID, Use: CardUse, BackgroundStyle: CardBackgroundStyle, Opacity: CardOpacity, Title: nil, Caption: nil, ImageRef: nil, SelectedColor: CardColor, LongText: CardLongText, CardData: CardCardData, CardDataName: CardCardDataName, CardDataType: CardCardDataType))
                                       }
                                   }
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
                CardViewEditCard(SelectedCardMode: $SelectedCardMode, AccessToken: $AccessToken, SelectedCard: $SelectedCard)
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

struct FileType{
    let id: String = UUID().uuidString
    var Name: String
    var Value: String
    var FileTypeValue: String
}

struct CardViewAddCard: View{
    @Binding var SelectedCardMode: CardMode
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
    @State var SelectedColor: String = ""
    @State var Opacity: String = "1.0"
    @State var AvaliableFiles: [MSALCardFileType] = []
    @State var ShownFiles: [MSALCardFileType] = []
    @State var AddMSALFileSheetPresented: Bool = false
    @State var isHidden: Bool = false
    
    let AvaliableTypes: [String] = ["pdf", "YT", "Paul"]
    
    var body: some View{
        VStack{
            TextField("Use", text: $Use)
            Picker("Choose Card Background Style", selection: $SelectedBackgroundStyle){
                Text("Color with text and caption").tag(0)
                Text("Image Without text and caption").tag(1)
                Text("Image With text and caption").tag(2)
                Text("Color with text(as big as text)").tag(3)
            }
            Toggle("Hidden", isOn: $isHidden)
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
            
            ScrollView{
                HStack{
                    Text("Card Name")
                    Divider()
                    Text("Card Value")
                    Divider()
                    Text("Card Type")
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
                        Text("Avaliable Card Files")
                        ForEach(AvaliableFiles, id: \.id){ file in
                            Button(){
                                DataFiles.append(FileType(Name: "\(file.Name)", Value: file.etag, FileTypeValue: file.Filetype))
                            } label: {
                                Text(file.Filename)
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
                Text("Add Value")
            }
            Button(){
                CreateCard()
            } label: {
                Text("Create Card")
            }
            Button(){
                DataFiles = []
            } label: {
                Text("Clear Card Data")
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
                                "Opacity":Opacity,
                                "Hidden":isHidden,
                                "Permissions":[]
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

struct CardViewEditCard: View{
    @Binding var SelectedCardMode: CardMode
    @Binding var AccessToken: String?

    @Binding var SelectedCard: CardType?
    @State var Use: String = ""
    @State var Title: String = ""
    @State var Caption: String = ""
    @State var DataFiles: [FileType] = []
    @State var FirebaseID: Int = 0
    @State var SelectedBackgroundStyle: Int = 0
    @State var ImageRef: String = ""
    @State var LongText: String = ""
    @State var SelectedColor: String = ""
    @State var Opacity: String = "1.0"
    @State var AvaliableFiles: [MSALCardFileType] = []
    @State var ShownFiles: [MSALCardFileType] = []
    @State var AddMSALFileSheetPresented: Bool = false
    @State var NewCardDataName: String = ""
    @State var isHidden: Bool = false
    
    let AvaliableTypes: [String] = ["pdf", "YT", "Paul"]
    
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
            Toggle("Hidden", isOn: $isHidden)
            ScrollView{
                HStack{
                    Text("Card Name")
                    Divider()
                    Text("Card Value")
                    Divider()
                    Text("Card Type")
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
                        Text("Avaliable Card Files")
                        ForEach(AvaliableFiles, id: \.id){ file in
                            Button(){
                                DataFiles.append(FileType(Name: "\(file.Name)", Value: file.etag, FileTypeValue: file.Filetype))
                            } label: {
                                Text(file.Filename)
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
                Text("Add Value")
            }
            Button(){
                ConfirmCard()
            } label: {
                Text("Confirm")
            }
            Button(){
                DataFiles = []
            } label: {
                Text("Clear Card Data")
            }
            Button(){
                
            } label: {
                Text("Back")
            }
        }.background(Color.marron)
        .onAppear(){
            if let SelectedCard{
                Use = SelectedCard.Use
                FirebaseID = SelectedCard.FirebaseID
                SelectedBackgroundStyle = SelectedCard.BackgroundStyle
                Opacity = SelectedCard.Opacity
                if SelectedBackgroundStyle == 0{
                    Title = SelectedCard.Title!
                    Caption = SelectedCard.Caption!
                    SelectedColor = SelectedCard.SelectedColor!
                } else {
                    if SelectedBackgroundStyle == 1{
                        ImageRef = SelectedCard.ImageRef!
                    } else {
                        if SelectedBackgroundStyle == 2{
                            Title = SelectedCard.Title!
                            Caption = SelectedCard.Caption!
                            ImageRef = SelectedCard.ImageRef!
                        } else {
                            if SelectedBackgroundStyle == 3{
                                LongText = SelectedCard.LongText!
                                SelectedColor = SelectedCard.SelectedColor!
                            }
                        }
                    }
                }
                let NewCardDataNameArray = SelectedCard.CardDataName
                let NewCardDataValueArray = SelectedCard.CardData
                let NewCardDataTypeArray = SelectedCard.CardDataType
                for x in 0..<NewCardDataNameArray.count{
                    DataFiles.append(FileType(Name: NewCardDataNameArray[x], Value: NewCardDataValueArray[x], FileTypeValue: NewCardDataTypeArray[x]))
                }
            }
        }
    }
    func ConfirmCard(){
        //g0amdIcZt5I
        //QACGoKb48_0
        let db = FirebaseFirestore.Firestore.firestore()
        var CardInputData: [String:Any] = [
            "FirebaseID":FirebaseID,
            "BackgroundStyle":SelectedBackgroundStyle,
            "Use":Use,
            "Opacity":Opacity,
            "Hidden":isHidden,
            "Permissions":[]
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
        
        let ref = db.collection("Cards").document("\(FirebaseID)")
        ref.updateData(CardInputData) { err in
            if let err = err {
                print("Error adding document: \(err)")
            } else {
                SelectedCardMode = .CardOverview
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
