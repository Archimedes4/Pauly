//
//  CardView.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-03-31.
//

import SwiftUI
import FirebaseFirestore
import FirebaseStorage
import SDWebImageSwiftUI

struct CardBackground: View{
    let TextColor: Color
    @Binding var SelectedCard: CardType
    @State var SelectedImage: UIImage?
    @State var GifMode: Bool = false
    @State var GifData: Data?
    @State var TextSize: CGSize = CGSize(width: 0, height: 0)
    @State var ErrorOcurred: Bool = false
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
                    if SelectedImage != nil || GifData != nil{
                        if GifMode{
                            ZStack{
                                Rectangle()
                                    .foregroundColor(.white)
                                    .cornerRadius(20)
                                    .saveSize(in: $TextSize)
                                Group{
                                    AnimatedImage(data: GifData!)
                                        .resizable()
                                        .cornerRadius(20)
                                        .frame(height: TextSize.height)
                                        
                                }
                            }
                        } else {
                            Image(uiImage: SelectedImage!)
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                        }
                    } else {
                        if ErrorOcurred {
                            ZStack{
                                Rectangle()
                                    .foregroundColor(.white)
                                    .cornerRadius(20)
                                    .onAppear(){
                                        GetImage(Ref: SelectedCard.ImageRef!)
                                    }
                                VStack{
                                    Spacer()
                                    HStack{
                                        Spacer()
                                        Image(systemName: "wifi.exclamationmark")
                                        Spacer()
                                    }
                                    Spacer()
                                }
                            }
                        } else {
                            ZStack{
                                Rectangle()
                                    .foregroundColor(.white)
                                    .cornerRadius(20)
                                    .onAppear(){
                                        GetImage(Ref: SelectedCard.ImageRef!)
                                    }
                                VStack{
                                    Spacer()
                                    HStack{
                                        Spacer()
                                        ProgressView()
                                        Spacer()
                                    }
                                    Spacer()
                                }
                            }
                        }
                    }
                }
            } else {
                if SelectedCard.BackgroundStyle == 2{
                    ZStack{
                        if SelectedImage != nil || GifData != nil{
                            if GifMode{
                                ZStack{
                                    Rectangle()
                                        .foregroundColor(.white)
                                        .cornerRadius(20)
                                        .saveSize(in: $TextSize)
                                    AnimatedImage(data: GifData!)
                                        .resizable()
                                        .cornerRadius(20)
                                        .frame(height: TextSize.height)
                                }
                            } else {
                                Image(uiImage: SelectedImage!)
                                    .resizable()
                                    .aspectRatio(contentMode: .fit)
                            }
                        } else {
                            if ErrorOcurred {
                                ZStack{
                                    Rectangle()
                                        .foregroundColor(.white)
                                        .cornerRadius(20)
                                        .onAppear(){
                                            GetImage(Ref: SelectedCard.ImageRef!)
                                        }
                                    VStack{
                                        Spacer()
                                        HStack{
                                            Spacer()
                                            Image(systemName: "wifi.exclamationmark")
                                            Spacer()
                                        }
                                        Spacer()
                                    }
                                }
                            } else {
                                ZStack{
                                    Rectangle()
                                        .foregroundColor(.white)
                                        .cornerRadius(20)
                                        .onAppear(){
                                            GetImage(Ref: SelectedCard.ImageRef!)
                                        }
                                    VStack{
                                        Spacer()
                                        HStack{
                                            Spacer()
                                            ProgressView()
                                            Spacer()
                                        }
                                        Spacer()
                                    }
                                }
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
//        let Ref = Storage.storage().reference(forURL: "gs://pauly-9dcfc.appspot.com/\(Ref)")
        let Ref = Storage.storage().reference(forURL: "gs://pauly-9dcfc.appspot.com/\(Ref)")
        Ref.getMetadata { metadata, error in
          if let error = error {
            // Uh-oh, an error occurred!
              print(error)
              ErrorOcurred = true
          } else {
              if metadata?.contentType == "image/jpeg"{
                  Ref.getData(maxSize: 1 * 1024 * 1024) { data, error in
                      if error != nil {
                          ErrorOcurred = true
                      } else {
                          GifMode = false
                          SelectedImage = UIImage(data: data!)
                          print("Done")
                      }
                  }
              } else {
                  if metadata?.contentType == "image/gif"{
                      Ref.getData(maxSize: 30 * 1024 * 1024) { data, error in
                          if error != nil {
                              print(error)
                              ErrorOcurred = true
                          } else {
                              GifData = data
                              GifMode = true
                              print("Done")
                          }
                      }
                  }
              }
            // Metadata now contains the metadata for 'images/forest.jpg'
          }
        }
    }
}

//The default card
struct Card: View{
    let TextColor: Color
    @Binding var accessToken: String?
    @Binding var SelectedCard: CardType
    
    var body: some View{
        if SelectedCard.CardData.count == 1{
            if SelectedCard.CardData[0].FileType == "pdf"{
                NavigationLink(destination: PDFSelectionView(PDFs: SelectedCard.CardData[0], AccessToken: $accessToken)){
                        CardBackground(TextColor: TextColor, SelectedCard: $SelectedCard)
                            .padding()
                            .cornerRadius(25)
                            .shadow(color: .gray, radius: 2, x: 0, y: 2)
                    }
            } else {
                if SelectedCard.CardData[0].FileType == "YT"{
                    NavigationLink(destination: LetureHomePage(Vidoe: SelectedCard.CardData[0])){
                            CardBackground(TextColor: TextColor, SelectedCard: $SelectedCard)
                                .padding()
                                .cornerRadius(25)
                                .shadow(color: .gray, radius: 2, x: 0, y: 2)
                        }
                } else {
                    if SelectedCard.CardData[0].FileType == "Paul"{
                        NavigationLink(destination: FactoringBinomials()){
                                CardBackground(TextColor: TextColor, SelectedCard: $SelectedCard)
                                    .padding()
                                    .cornerRadius(25)
                                    .shadow(color: .gray, radius: 2, x: 0, y: 2)
                            }
                    }
                }
            }
        } else {
            if SelectedCard.CardData.count == 0{
                CardBackground(TextColor: TextColor, SelectedCard: $SelectedCard)
                    .padding()
                    .shadow(color: .gray, radius: 2, x: 0, y: 2)
            } else {
                NavigationLink(destination: CardPageTwo(SelectedCard: SelectedCard, accessToken: $accessToken)){
                        CardBackground(TextColor: TextColor, SelectedCard: $SelectedCard)
                            .padding()
                            .shadow(color: .gray, radius: 2, x: 0, y: 2)
                    }
            }
        }
    }
}

struct CardPageTwoNavigationView: View {
    @State var CardDataFor: DataIdType
    @Binding var accessToken: String?
    var body: some View{
        if CardDataFor.FileType == "pdf"{
            NavigationLink(destination: PDFSelectionView(PDFs: CardDataFor, AccessToken: $accessToken)) {
                Text(CardDataFor.Name)
            }
        } else {
            if CardDataFor.FileType == "YT"{
                NavigationLink(destination: LetureHomePage(Vidoe: CardDataFor)) {
                    Text(CardDataFor.Name)
                }
            } else {
                if CardDataFor.FileType == "Paul"{
                    NavigationLink(destination:  FactoringBinomials()) {
                        Text(CardDataFor.Name)
                    }
                }
            }
        }
    }
}

struct CardPageTwo: View{
    @State private var action: Int? = 0
    @State var SelectedCard: CardType
    @State var isPresented: Bool = false
    @Binding var accessToken: String?
    var body: some View{
        List{
            ForEach(SelectedCard.CardData, id: \.id){ CardDataFor in
                CardPageTwoNavigationView(CardDataFor: CardDataFor, accessToken: $accessToken)
            }
        }
    }
}

//Factoring
struct FactoringBinomials: View{
    @State var FactorDisplay: AttributedString = AttributedString("")
    @State var ShowAns: Bool = false
    @State var Soloution: String = ""
    
    @State var DarkMode: Bool = false
    
    @Environment(\.colorScheme) var colorScheme
    
    var body: some View{
        ZStack{
            Rectangle()
                .foregroundColor(Color.marron)
                .ignoresSafeArea()
            VStack{
                HStack{
                    Spacer()
                    Text("Factor Binomials")
                    Spacer()
                }
                if ShowAns{
                    Text("\(FactorDisplay) = \(Soloution)")
                        .foregroundColor(Color.black)
                        .frame(minWidth: 0, maxWidth: .infinity)
                        .padding([.top, .bottom])
                        .padding()
                        .background(
                            RoundedRectangle(cornerRadius: 25)
                                .fill(Color.white)
                                .shadow(color: .gray, radius: 2, x: 0, y: 2)
                        )
                        .padding()
                } else {
                    Text(FactorDisplay)
                        .foregroundColor(Color.black)
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
                Button(){
                    let NewResult = BinomialFactoring()
                    FactorDisplay = AttributedString(NewResult.0)
                    Soloution = NewResult.1
                    ShowAns = false
                } label: {
                    HStack{
                        Text("Make New Equation")
                            .foregroundColor(Color.black)
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
                    .onAppear(){
                        let NewResult = BinomialFactoring()
                        FactorDisplay = AttributedString(NewResult.0)
                        Soloution = NewResult.1
                    }
                }
                Button(){
                    ShowAns.toggle()
                } label: {
                    if ShowAns {
                        HStack{
                            Text("Hide Solution")
                                .foregroundColor(Color.black)
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
                    } else {
                        HStack{
                            Text("Show Solution")
                                .foregroundColor(Color.black)
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
                Spacer()
            }
        }
    }
    func BinomialFactoring() -> (NSAttributedString, String){
        let A1: Int = Int.random(in: 1..<5)
        let A2: Int = Int.random(in: 1..<5)
        let rnd1: Bool = Bool.random()
        let B1: Int = Int.random(in: 1..<5)
        let B2: Int = Int.random(in: 1..<5)
        let rnd2: Bool = Bool.random()
        
        var S1: Int = 0
        var S2: Int = 0
        if rnd1{
            S1 = 1
        } else {
            S1 = -1
        }
        if rnd2{
            S2 = 1
        } else {
            S2 = -1
        }
        if ((A1 + (S2 * B2)) + (B1 + (S1 * A2))) >= 0{
            if ((S1*A2)*(S2*B2)) >= 0{
                var result = NSMutableAttributedString()
                result.append(NSAttributedString(string: "\(A1 * B1)x"))
                result.append(NSAttributedString(string: "2", attributes: [NSAttributedString.Key.baselineOffset: 5]))
                result.append(NSAttributedString(string: "+\((A1 * (S2 * B2)) + (B1 * (S1 * A2)))x+\((S1*A2)*(S2*B2))"))
                if (S1 * A2) >= 0{
                    return (result, "(\(A1)x+\(S1 * A2))(\(B1)x+\(S2 * B2))")
                } else {
                    return (result, "(\(A1)x\(S1 * A2))(\(B1)x+\(S2 * B2))")
                }
            } else{
                var result = NSMutableAttributedString()
                result.append(NSAttributedString(string: "\(A1 * B1)x"))
                result.append(NSAttributedString(string: "2", attributes: [NSAttributedString.Key.baselineOffset: 5]))
                result.append(NSAttributedString(string: "+\((A1 * (S2 * B2)) + (B1 * (S1 * A2)))x\((S1*A2)*(S2*B2))"))
                if (S1 * A2) >= 0{
                    return (result, "(\(A1)x+\(S1 * A2))(\(B1)x+\(S2 * B2))")
                } else {
                    return (result, "(\(A1)x\(S1 * A2))(\(B1)x+\(S2 * B2))")
                }
            }
        } else {
            if ((S1*A2)*(S2*B2)) >= 0{
                var result = NSMutableAttributedString()
                result.append(NSAttributedString(string: "\(A1 * B1)x"))
                result.append(NSAttributedString(string: "2", attributes: [NSAttributedString.Key.baselineOffset: 5]))
                result.append(NSAttributedString(string: "\((A1 * (S2 * B2)) + (B1 * (S1 * A2)))x+\((S1*A2)*(S2*B2))"))
                if (S1 * A2) >= 0{
                    return (result, "(\(A1)x+\(S1 * A2))(\(B1)x+\(S2 * B2))")
                } else {
                    return (result, "(\(A1)x\(S1 * A2))(\(B1)x+\(S2 * B2))")
                }
            } else{
                var result = NSMutableAttributedString()
                result.append(NSAttributedString(string: "\(A1 * B1)x"))
                result.append(NSAttributedString(string: "2", attributes: [NSAttributedString.Key.baselineOffset: 5]))
                result.append(NSAttributedString(string: "\((A1 * (S2 * B2)) + (B1 * (S1 * A2)))x\((S1*A2)*(S2*B2))"))
                if (S1 * A2) >= 0{
                    return (result, "(\(A1)x+\(S1 * A2))(\(B1)x+\(S2 * B2))")
                } else {
                    return (result, "(\(A1)x\(S1 * A2))(\(B1)x+\(S2 * B2))")
                }
            }
        }
    }
}

struct PDFSelectionView: View{
    @State var PDFs: DataIdType
    @State var LetSelectedPDF: String = "https://www.africau.edu/images/default/sample.pdf"
    @State var DataInput: Data?
    @Binding var AccessToken: String?
    
    var body: some View{
        if DataInput != nil {
            PDFKitRepresentedView(DataInput!)
        } else {
            ProgressView()
                .onAppear(){
                    Task{
                        do{
                            DataInput = try await PDFKitFunction().CallData(ItemId: PDFs.Id, accessToken: AccessToken!)
                        } catch {
                            print(error)
                        }
                    }
                }
        }
    }
}
