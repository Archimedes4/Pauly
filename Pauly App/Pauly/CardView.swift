//
//  CardView.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-03-31.
//

import SwiftUI
import FirebaseFirestore
import FirebaseStorage

struct CardBackground: View{
    let TextColor: Color
    @State var SelectedCard: CardType
    @State var SelectedImage: UIImage?
    var body: some View{
        if SelectedCard.BackgroundStyle == 0{
            ZStack{
                Rectangle()
                    .foregroundColor(Color(hexString: SelectedCard.ColorType!))
                    .cornerRadius(20)
                VStack{
                    Text(SelectedCard.Title!)
                        .font(.title)
                        .foregroundColor(TextColor)
                    Text(SelectedCard.Caption!)
                        .font(.caption2)
                        .foregroundColor(TextColor)
                }
            }
        } else {
            if SelectedCard.BackgroundStyle == 1{
                ZStack{
                    if SelectedImage != nil{
                        Image(uiImage: SelectedImage!)
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                    } else {
                        Rectangle()
                            .foregroundColor(.white)
                            .onAppear(){
                                GetImage(Ref: SelectedCard.ImageRef!)
                            }
                    }
                }
            } else {
                if SelectedCard.BackgroundStyle == 2{
                    ZStack{
                        if SelectedImage != nil{
                            Image(uiImage: SelectedImage!)
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                        } else {
                            Rectangle()
                                .foregroundColor(.white)
                                .onAppear(){
                                    GetImage(Ref: SelectedCard.ImageRef!)
                                }
                        }
                        VStack{
                            Text(SelectedCard.Title!)
                                .font(.title)
                                .foregroundColor(TextColor)
                            Text(SelectedCard.Caption!)
                                .font(.caption2)
                                .foregroundColor(TextColor)
                        }
                    }
                } else {
                    if SelectedCard.BackgroundStyle == 3{
                        ZStack{
                            Rectangle()
                                .foregroundColor(Color(hexString: SelectedCard.ColorType!))
                            VStack{
                                Text(SelectedCard.LongText!)
                                    .font(.title)
                                    .foregroundColor(TextColor)
                            }
                        }
                    }
                }
            }
        }
    }
    func GetImage(Ref: String){
        let Ref = Storage.storage().reference(forURL: "gs://pauly-9dcfc.appspot.com/\(Ref)")
        Ref.getData(maxSize: 1 * 1024 * 1024) { data, error in
            if error != nil {

            } else {
                SelectedImage = UIImage(data: data!)
                print("Done")
            }
        }
    }
}

enum CardMode{
    case Quizes
    case Sports
    case Commissions
}
//The default card
struct Card: View{
    @Binding var SelectedMode: SelectedModeCalculusEnum?
    let SelectedCardMode: CardMode
    
    @Binding var Vidoes: [DataIdType]?
    
    let TextColor: Color
    
    @State var SelectedCard: CardType
    
    var body: some View{
        Button{
            if SelectedCard.Destination == 0{
                if SelectedCardMode == .Quizes{
                    Vidoes = SelectedCard.CardData
                    SelectedMode = .PDFView
                }
            } else {
                if SelectedCard.Destination == 1{
                    if SelectedCardMode == .Quizes{
                        Vidoes = SelectedCard.CardData
                        SelectedMode = .YouTube
                    }
                } else {
                    if SelectedCard.Destination == 2{
                        if SelectedCardMode == .Quizes{
                            SelectedMode = .FactoringBinomials
                        }
                    }
                }
            }
        } label: {
            CardBackground(TextColor: TextColor, SelectedCard: SelectedCard)
        }.padding()
            .cornerRadius(25)
    }
}
