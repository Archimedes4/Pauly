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

struct GovernmentCardAddView: View{
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
    
    var body: some View{
        ZStack{
            Rectangle()
                .fill(Color.marron)
                .ignoresSafeArea()
            ScrollView{
                VStack{
                    TextField("Use", text: $Use)
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

struct GovernmentCardEditingView: View{
    @Binding var accessToken: String?
    @State var SelectedCard: CardType
    var body: some View{
        GeometryReader{ geo in
            VStack{
                Text("Edit Card")
                Card(TextColor: .black, accessToken: $accessToken, SelectedCard: SelectedCard)
                    .frame(height: geo.size.height * 0.3)
                TextField("Use", text: $SelectedCard.Use)
                if SelectedCard.BackgroundStyle == 0{
                    TextField("Title", text: $SelectedCard.Title.toUnwrapped(defaultValue: ""))
                    TextField("Caption", text: $SelectedCard.Caption.toUnwrapped(defaultValue: ""))
                    TextField("Color", text: $SelectedCard.ColorType.toUnwrapped(defaultValue: ""))
                } else {
                    if SelectedCard.BackgroundStyle == 1{
                        TextField("Image Reference", text: $SelectedCard.ImageRef.toUnwrapped(defaultValue: ""))
                    } else {
                        if SelectedCard.BackgroundStyle == 2{
                            TextField("Title", text: $SelectedCard.Title.toUnwrapped(defaultValue: ""))
                            TextField("Caption", text: $SelectedCard.Caption.toUnwrapped(defaultValue: ""))
                            TextField("Image Reference", text: $SelectedCard.ImageRef.toUnwrapped(defaultValue: ""))
                        } else {
                            if SelectedCard.BackgroundStyle == 3{
                                TextField("Color", text: $SelectedCard.ColorType.toUnwrapped(defaultValue: ""))
                                TextField("Text Long", text: $SelectedCard.LongText.toUnwrapped(defaultValue: ""))
                            }
                        }
                    }
                }
            }.background(Color.marron)
        }
    }
}

extension Binding {
     func toUnwrapped<T>(defaultValue: T) -> Binding<T> where Value == Optional<T>  {
        Binding<T>(get: { self.wrappedValue ?? defaultValue }, set: { self.wrappedValue = $0 })
    }
}

struct GovernmentCardView: View{
    @Binding var SelectedGovernmentViewMode: GovernmentViewModes
    @Binding var accessToken: String?
    @State var AvaliableCards: [CardType] = []
    var body: some View{
        NavigationView(){
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
                Text("Card")
                    .font(.title)
                ScrollView{
                    ForEach(AvaliableCards, id: \.id){ card in
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
            .onAppear(){
                FetchCards()
            }
        }
    }
    func FetchCards() {
        Task{
            do{
                AvaliableCards = []
                
                let db = Firestore.firestore()
                
                var docRef = db.collection("PaulyInfo").document("Info")
                docRef.getDocument { (document, error) in
                    guard error == nil else {
                        print("error", error ?? "")
                        return
                    }
                    
                    if let document = document, document.exists {
                        let data = document.data()
                        if let data = data {
                            let CardIds = data["ResourcesCards"] as! NSArray as! [Int]
                            for x in CardIds{
                                let docRef = db.collection("Cards").document("\(x)")
                                docRef.getDocument { (document, error) in
                                    guard error == nil else {
                                        print("error", error ?? "")
                                        return
                                    }
                                    
                                    if let document = document, document.exists {
                                        let data = document.data()
                                        if let data = data {
                                            let cardDataValueFire = data["CardData"] as! [String]
                                            let cardDataNameFire = data["CardDataName"] as! [String]
                                            let BackgroundStyle = data["BackgroundStyle"] as! Int
                                            let Opacity = data["Opacity"] as! String
                                            let cardDataTypeFire: [String] = data["CardDataType"] as? NSArray as? [String] ?? []
                                            var CardDataIn: [DataIdType] = []
                                            let Use = data["Use"] as! String
                                            for y in 0..<cardDataNameFire.count{
                                                CardDataIn.append(DataIdType(Name: cardDataNameFire[y], Id: cardDataValueFire[y], FileType: cardDataTypeFire[y]))
                                            }
                                            if BackgroundStyle == 0{
                                                let captionFire = data["Caption"] as! String
                                                let titleFire = data["Title"] as! String
                                                let ColorFire = data["Color"] as! String
                                                AvaliableCards.append(CardType(Use: Use, Title: titleFire, Caption: captionFire, ColorType: ColorFire, ImageRef: nil, LongText: nil, BackgroundStyle: BackgroundStyle, FirebaseID: x, Opacity: Double(Opacity)!, CardData: CardDataIn))
                                            } else {
                                                if BackgroundStyle == 1{
                                                    let ImageRefFire = data["ImageRef"] as! String
                                                    AvaliableCards.append(CardType(Use: Use, Title: nil, Caption: nil, ColorType: nil, ImageRef: ImageRefFire, LongText: nil, BackgroundStyle: BackgroundStyle, FirebaseID: x, Opacity: Double(Opacity)!, CardData: CardDataIn))
                                                } else {
                                                    if BackgroundStyle == 2{
                                                        let captionFire = data["Caption"] as! String
                                                        let titleFire = data["Title"] as! String
                                                        let ImageRefFire = data["ImageRef"] as! String
                                                        AvaliableCards.append(CardType(Use: Use, Title: titleFire, Caption: captionFire, ColorType: nil, ImageRef: ImageRefFire, LongText: nil, BackgroundStyle: BackgroundStyle, FirebaseID: x, Opacity: Double(Opacity)!, CardData: CardDataIn))
                                                    } else {
                                                        if BackgroundStyle == 3{
                                                            let ColorFire = data["Color"] as! String
                                                            let LongTextFire = data["Text"] as! String
                                                            AvaliableCards.append(CardType(Use: Use, Title: nil, Caption: nil, ColorType: ColorFire, ImageRef: nil, LongText: LongTextFire, BackgroundStyle: BackgroundStyle, FirebaseID: x, Opacity: Double(Opacity)!, CardData: CardDataIn))
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }//mark
                        }
                    }
                }
            } catch {
                print("Error")
            }
        }
    }
}

struct GovernmentSelectedCardsView: View {
    @Binding var Cards: [Int]
    @State var SelectedCards: [CardType] = []
    @State var TextSize: CGSize = CGSize(width: 0, height: 0)
    @State var SelectedCardsLoaded = false
    var body: some View{
        Text("Selected Cards")
        if SelectedCardsLoaded{
            List(){
                ForEach(Cards, id: \.self){ cardID in
                    let card = SelectedCards.first(where: { $0.FirebaseID == cardID })
                    if let Index = Cards.firstIndex(where: { $0 == cardID }){
                        HStack{
                            Text("\(card!.Use)")
                                .saveSize(in: $TextSize)
                            if Index <= (Cards.count - 1) && Cards.count >= 2{
                                Divider()
                                Button(){
                                    if let Index = Cards.firstIndex(where: { $0 == card!.FirebaseID }){
                                        Cards.rearrange(from: cardID, to: (cardID - 1))
                                    }
                                } label: {
                                    Image(systemName: "arrow.down.circle")
                                        .resizable()
                                        .aspectRatio(contentMode: .fit)
                                        .frame(height: TextSize.height)
                                }
                            }
                            if Index != 0{
                                Divider()
                                Button(){
                                    if let Index = Cards.firstIndex(where: { $0 == card!.FirebaseID }){
                                        Cards.rearrange(from: cardID, to: (cardID + 1))
                                    }
                                } label: {
                                    Image(systemName: "arrow.up.circle")
                                        .resizable()
                                        .aspectRatio(contentMode: .fit)
                                        .frame(height: TextSize.height)
                                }
                            }
                            Divider()
                            Button(){
                                if let Index = Cards.firstIndex(where: { $0 == card!.FirebaseID }){
                                    Cards.remove(at: Index)
                                }
                            } label: {
                                Text("Remove")
                            }
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
    }
    func GetCards() {
        let db = Firestore.firestore()
        
        print("Cards: \(Cards.description)")
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
                            var CardDataIdType: [DataIdType] = []
                            for x in 0..<CardCardData.count{
                                CardDataIdType.append(DataIdType(Name: CardCardDataName[x], Id: CardCardData[x], FileType: CardCardDateType[x]))
                            }
                            SelectedCards.append(CardType(Use: CardUse, Title: CardTitle, Caption: CardCaption, ColorType: CardColor, ImageRef: CardImageRefFire, LongText: CardLongText, BackgroundStyle: CardBackgroundStyle, FirebaseID: x, Opacity: Double(CardOpacity)!, CardData: CardDataIdType))
                        }
                    }
                }
                print(SelectedCards)
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
                        print("Here4")
                        guard let CardOpacity = data["Opacity"] as? String else {
                            return
                        }
                        print("Here5")
                        guard let CardUse = data["Use"] as? String else {
                            return
                        }
                        print("Here6")
                        guard let CardFirebaseID = data["FirebaseID"] as? Int else {
                            return
                        }
                        print("Here7")
                        var CardDataIdType: [DataIdType] = []
                        for x in 0..<CardCardData.count{
                            CardDataIdType.append(DataIdType(Name: CardCardDataName[x], Id: CardCardData[x], FileType: CardCardDateType[x]))
                        }
                        AvaliableCards.append(CardType(Use: CardUse, Title: CardTitle, Caption: CardCaption, ColorType: CardColor, ImageRef: CardImageRefFire, LongText: CardLongText, BackgroundStyle: CardBackgroundStyle, FirebaseID: CardFirebaseID, Opacity: Double(CardOpacity)!, CardData: CardDataIdType))
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
}
