//
//  Resources.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-04-01.
//

import SwiftUI
import FirebaseFirestore

struct Resources: View {
    @Binding var selectedProfileView: profileViewEnum
    @Binding var AccessToken: String?
    @State var AvaliableCards: [CardType] = []
    var body: some View {
        GeometryReader{ value in
            NavigationView(){
                ZStack(alignment: .leading){
                    ContainerRelativeShape()
                        .fill(Color.marron)
                        .edgesIgnoringSafeArea(.all)
                    ScrollView{
                        VStack(){
                            HStack{
                                Button(){
                                    selectedProfileView = .Home
                                } label: {
                                    HStack {
                                        Image(systemName: "chevron.backward")
                                            .padding(.leading)
                                        Text("Back")
                                    }
                                }
                                Spacer()
                            }
                            Image("Resources")
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .frame(height: value.size.height * 0.2)
                            ForEach($AvaliableCards, id: \.id) { card in
                                
                                Card(TextColor: Color.black, accessToken: $AccessToken, SelectedCard: card)
                                    .frame(width: value.size.width * 0.9, height: value.size.height * 0.3)
                                    .cornerRadius(25)
                            }
                            Spacer()
                        }
                    }
                }.onAppear(){
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
                                                    guard let Hidden = data["Hidden"] as? Bool else {
                                                        return
                                                    }
                                                    guard let Permissions = data["Permissions"] as? NSArray as? [String] else {
                                                        return
                                                    }
                                                    guard let Owners = data["Owners"] as? NSArray as? [String] else {
                                                        return
                                                    }
                                                    if BackgroundStyle == 0{
                                                        guard let captionFire = data["Caption"] as? String else {
                                                            return
                                                        }
                                                        guard let titleFire = data["Title"] as? String else {
                                                            return
                                                        }
                                                        guard let ColorFire = data["Color"] as? String else {
                                                            return
                                                        }
                                                        AvaliableCards.append(CardType(Use: Use, Title: titleFire, Caption: captionFire, ColorType: ColorFire, ImageRef: nil, LongText: nil, BackgroundStyle: BackgroundStyle, FirebaseID: x, Opacity: Double(Opacity)!, CardData: CardDataIn, Hidden: Hidden, Contributers: Permissions, Owners: Owners))
                                                    } else {
                                                        if BackgroundStyle == 1{
                                                            let ImageRefFire = data["ImageRef"] as! String
                                                            AvaliableCards.append(CardType(Use: Use, Title: nil, Caption: nil, ColorType: nil, ImageRef: ImageRefFire, LongText: nil, BackgroundStyle: BackgroundStyle, FirebaseID: x, Opacity: Double(Opacity)!, CardData: CardDataIn, Hidden: Hidden, Contributers: Permissions, Owners: Owners))
                                                        } else {
                                                            if BackgroundStyle == 2{
                                                                let captionFire = data["Caption"] as! String
                                                                let titleFire = data["Title"] as! String
                                                                let ImageRefFire = data["ImageRef"] as! String
                                                                AvaliableCards.append(CardType(Use: Use, Title: titleFire, Caption: captionFire, ColorType: nil, ImageRef: ImageRefFire, LongText: nil, BackgroundStyle: BackgroundStyle, FirebaseID: x, Opacity: Double(Opacity)!, CardData: CardDataIn, Hidden: Hidden, Contributers: Permissions, Owners: Owners))
                                                            } else {
                                                                if BackgroundStyle == 3{
                                                                    let ColorFire = data["Color"] as! String
                                                                    let LongTextFire = data["Text"] as! String
                                                                    AvaliableCards.append(CardType(Use: Use, Title: nil, Caption: nil, ColorType: ColorFire, ImageRef: nil, LongText: LongTextFire, BackgroundStyle: BackgroundStyle, FirebaseID: x, Opacity: Double(Opacity)!, CardData: CardDataIn, Hidden: Hidden, Contributers: Permissions, Owners: Owners))
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
                }//Mark
            }
        }

    }
}

struct Resources_Previews: PreviewProvider {
    static var previews: some View {
        Resources(selectedProfileView: .constant(.Resourses), AccessToken: .constant("Nop"))
    }
}
