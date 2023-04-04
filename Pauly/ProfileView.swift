//
//  ProfileView.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-03-11.
//

import Foundation
import SwiftUI
import FirebaseCore
import FirebaseAuth
import FirebaseFirestore
import CoreLocation

enum profileViewEnum {
    case Home
    case Pauly
    case Leaderboard
    case Commissions
    case Microsoft
    case UpdatePassword
    case Resourses
}

struct ProfileViewMain: View{
    @Binding var AccessToken: String?
    @EnvironmentObject var WindowMode: SelectedWindowMode
    
    @State var selectedProfileView: profileViewEnum = .Home
    var body: some View{
        if selectedProfileView == .Home{
            ProfileViewHome(selectedProfileView: $selectedProfileView)
                .environmentObject(WindowMode)
        } else {
            if selectedProfileView == .Commissions{
                ProfileViewCommissions(selectedProfileView: $selectedProfileView)
                    .environmentObject(WindowMode)
            } else {
                if selectedProfileView == .Leaderboard{
                    ProfileViewLeaderboard(selectedProfileView: $selectedProfileView)
                } else {
                    if selectedProfileView == .Pauly{
                        ProfileViewPauly(selectedProfileView: $selectedProfileView)
                            .environmentObject(WindowMode)
                    } else {
                        if selectedProfileView == .Microsoft{
                            ProfileViewMicosoft(selectedProfileView: $selectedProfileView)
                        } else {
                            if selectedProfileView == .UpdatePassword{
                                ProfileViewUpdatePassword(selectedProfileView: $selectedProfileView)
                            } else {
                                if selectedProfileView == .Resourses{
                                    Resources(selectedProfileView: $selectedProfileView, AccessToken: $AccessToken)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

struct ProfileViewHome: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    
    @Binding var selectedProfileView: profileViewEnum
    
    
    @State var TextSize: CGSize = CGSize(width: 0, height: 0)
    var body: some View{
        VStack{
            ScrollView{
                HStack{
                    Button(){
                        WindowMode.SelectedWindowMode = .HomePage
                    } label: {
                        HStack{
                            Image(systemName: "chevron.backward")
                            Text("Back")
                        }
                    }.padding(.leading)
                    Spacer()
                }
                Image("Profile")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                Button(){
                    selectedProfileView = .Leaderboard
                } label: {
                    Text("Leaderboard")
                        .font(.system(size: 17))
                        .fontWeight(.bold)
                        .foregroundColor(.black)
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
                    selectedProfileView = .Commissions
                } label: {
                    Text("Commissions")
                        .font(.system(size: 17))
                        .fontWeight(.bold)
                        .foregroundColor(.black)
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
                    selectedProfileView = .Resourses
                } label: {
                    Text("Resourses")
                        .font(.system(size: 17))
                        .fontWeight(.bold)
                        .foregroundColor(.black)
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
                    selectedProfileView = .Pauly
                } label: {
                    HStack{
                        Image(systemName: "gear")
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .foregroundColor(.black)
                            .frame(height: TextSize.height)
                        Text("Settings")
                            .font(.system(size: 17))
                            .fontWeight(.bold)
                            .foregroundColor(.black)
                            .saveSize(in: $TextSize)
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
                Spacer()
            }
        }.background(Color.marron)
    }
}

struct ProfileViewMicosoft: View{
    @Binding var selectedProfileView: profileViewEnum
    var body: some View{
        HStack{
            Button(){
                selectedProfileView = .Pauly
            } label: {
                HStack{
                    Image(systemName: "chevron.backward")
                    Text("Back")
                }
            }.padding()
            Spacer()
        }
        Text("Microsoft")
    }
}

struct ProfileViewPauly: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @Binding var selectedProfileView: profileViewEnum
    var body: some View{
        HStack{
            Button(){
                selectedProfileView = .Home
            } label: {
                HStack{
                    Image(systemName: "chevron.backward")
                    Text("Back")
                }
            }.padding()
            Spacer()
        }
        Text("Pauly")
        Button(){
            selectedProfileView = .Microsoft
        } label: {
            Text("Microsoft")
        }
        Button(){
            
        } label: {
            Text("Update Password")
        }
        Button(){
            let firebaseAuth = Auth.auth()
            do {
                try firebaseAuth.signOut()
                WindowMode.SelectedWindowMode = .PasswordWindow
            } catch let signOutError as NSError {
              print("Error signing out: %@", signOutError)
            }
        } label: {
            Text("Sign Out")
        }
    }
}

struct CommitionType{
    let Title: String
    let Caption: String
    let StartDate: Date
    let EndDate: Date
    let Cards: [Int]
    let Hidden: Bool
    let FirebaseID: Int
    let Value: Int
    let Score: Int
    let Location: CLLocation?
    let Proximity: Double?
}

struct ProfileViewCommissionInfo: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @Binding var SelectedCommissionsViewMode: CommisssionsViewModes
    @State var SelectedCommission: CommitionType
    @State var AvaliableCards: [CardType] = []
    @State var SheetPresented: Bool = false
    @State var isCommissionComplete: Bool?
    var body: some View{
        if isCommissionComplete == nil{
            VStack{
                Spacer()
                ProgressView("Checking If Commission id Complete")
                    .scaleEffect(2)
                    .font(.footnote)
                    .onAppear(){
                        CheckIfCompletedCommition(CommissionID: SelectedCommission.FirebaseID)
                    }
                Spacer()
            }
        } else {
            GeometryReader{ value in
                VStack{
                    ScrollView{
                        VStack{
                            ForEach(AvaliableCards, id: \.id) { card in
                                Card(SelectedMode: .constant(.Home), SelectedCardMode: .Commissions, Vidoes: .constant([]), TextColor: Color.black, SelectedCard: card)
                                    .frame(width: value.size.width * 0.9, height: value.size.height * 0.3)
                                    .cornerRadius(25)
                            }
                        }
                    }
         
                    Spacer()
                    HStack{
                        Spacer()
                        Button(){
                            if isCommissionComplete == false{
                                if SelectedCommission.Value == 2{
                                    SheetPresented = true
                                }
                            }
                        } label: {
                            Text(isCommissionComplete! ? "COMMISSION ALREAY CLAIMED":"CLAIM COMMISSION")
                                .font(.system(size: 17))
                                .fontWeight(.bold)
                                .foregroundColor(.black)
                                .frame(minWidth: 0, maxWidth: .infinity)
                                .padding([.top, .bottom])
                                .background(
                                    RoundedRectangle(cornerRadius: 25)
                                        .fill(isCommissionComplete! ? Color.gray:Color.white)
                                        .shadow(color: .gray, radius: 2, x: 0, y: 2)
                                )
                                .padding([.leading, .trailing])
                        }.sheet(isPresented: $SheetPresented){
                            LocationServices(SelectedCommision: $SelectedCommission, SheetPresented: $SheetPresented, isCommissionComplete: $isCommissionComplete)
                                .environmentObject(WindowMode)
                        }
                        Spacer()
                    }
                    HStack{
                        Spacer()
                        Button(){
                            SelectedCommissionsViewMode = .Home
                        } label: {
                            Text("BACK")
                                .font(.system(size: 17))
                                .fontWeight(.bold)
                                .foregroundColor(.black)
                                .frame(minWidth: 0, maxWidth: .infinity)
                                .padding([.top, .bottom])
                                .background(
                                    RoundedRectangle(cornerRadius: 25)
                                        .fill(Color.white)
                                        .shadow(color: .gray, radius: 2, x: 0, y: 2)
                                )
                                .padding()
                        }
                        Spacer()
                    }
                }.onAppear(){
                    FetchCards()
                }
                .background(Color.marron)
            }
        }
    }
    func CheckIfCompletedCommition(CommissionID: Int){
        let db = Firestore.firestore()
        let docRef = db.collection("Users").document("\(WindowMode.UsernameIn)")
        docRef.getDocument { (document, error) in
            guard error == nil else {
                print("error", error ?? "")
                return
            }
            
            if let document = document, document.exists {
                let data = document.data()
                if let data = data{
                    let CommissionsComplete = data["CompletedCommissions"] as! NSArray as? [Int] ?? []
                    if CommissionsComplete.contains(CommissionID) {
                        isCommissionComplete = true
                    } else {
                        isCommissionComplete = false
                    }
                }
            }
        }
    }
    func FetchCards() {
        Task{
            do{
                let db = Firestore.firestore()
                
                for x in SelectedCommission.Cards{
                    let docRef = db.collection("Cards").document("\(x)")
                    docRef.getDocument { (document, error) in
                        guard error == nil else {
                            print("error", error ?? "")
                            return
                        }
                        
                        if let document = document, document.exists {
                            let data = document.data()
                            if let data = data {
                                let destinationFire = data["Destination"] as! Int
                                let cardDataValueFire = data["CardData"] as! [String]
                                let cardDataNameFire = data["CardDataName"] as! [String]
                                let BackgroundStyle = data["BackgroundStyle"] as! Int
                                let Opacity = data["Opacity"] as! String
                                let cardDataTypeFire: [String] = data["CardDataType"] as? NSArray as? [String] ?? []
                                if BackgroundStyle == 0{
                                    let captionFire = data["Caption"] as! String
                                    let titleFire = data["Title"] as! String
                                    let ColorFire = data["Color"] as! String
                                    var CardDataIn: [DataIdType] = []
                                    for y in 0..<cardDataNameFire.count{
                                        if cardDataTypeFire.count != 0{
                                            CardDataIn.append(DataIdType(Name: cardDataNameFire[y], Id: cardDataValueFire[y], FileType: cardDataTypeFire[y]))
                                        } else {
                                            CardDataIn.append(DataIdType(Name: cardDataNameFire[y], Id: cardDataValueFire[y], FileType: nil))
                                        }
                                    }
                                    AvaliableCards.append(CardType(Title: titleFire, Caption: captionFire, ColorType: ColorFire, ImageRef: nil, LongText: nil, BackgroundStyle: BackgroundStyle, Opacity: Double(Opacity)!, Destination: destinationFire, CardData: CardDataIn))
                                } else {
                                    if BackgroundStyle == 1{
                                        let ImageRefFire = data["ImageRef"] as! String
                                        var CardDataIn: [DataIdType] = []
                                        for y in 0..<cardDataNameFire.count{
                                            if cardDataTypeFire.count != 0{
                                                CardDataIn.append(DataIdType(Name: cardDataNameFire[y], Id: cardDataValueFire[y], FileType: cardDataTypeFire[y]))
                                            } else {
                                                CardDataIn.append(DataIdType(Name: cardDataNameFire[y], Id: cardDataValueFire[y], FileType: nil))
                                            }
                                        }
                                        AvaliableCards.append(CardType(Title: nil, Caption: nil, ColorType: nil, ImageRef: ImageRefFire, LongText: nil, BackgroundStyle: BackgroundStyle, Opacity: Double(Opacity)!, Destination: destinationFire, CardData: CardDataIn))
                                    } else {
                                        if BackgroundStyle == 2{
                                            let captionFire = data["Caption"] as! String
                                            let titleFire = data["Title"] as! String
                                            let ImageRefFire = data["ImageRef"] as! String
                                            var CardDataIn: [DataIdType] = []
                                            for y in 0..<cardDataNameFire.count{
                                                if cardDataTypeFire.count != 0{
                                                    CardDataIn.append(DataIdType(Name: cardDataNameFire[y], Id: cardDataValueFire[y], FileType: cardDataTypeFire[y]))
                                                } else {
                                                    CardDataIn.append(DataIdType(Name: cardDataNameFire[y], Id: cardDataValueFire[y], FileType: nil))
                                                }
                                            }
                                            AvaliableCards.append(CardType(Title: titleFire, Caption: captionFire, ColorType: nil, ImageRef: ImageRefFire, LongText: nil, BackgroundStyle: BackgroundStyle, Opacity: Double(Opacity)!, Destination: destinationFire, CardData: CardDataIn))
                                        } else {
                                            if BackgroundStyle == 3{
                                                let ColorFire = data["Color"] as! String
                                                let LongTextFire = data["Text"] as! String
                                                var CardDataIn: [DataIdType] = []
                                                for y in 0..<cardDataNameFire.count{
                                                    if cardDataTypeFire.count != 0{
                                                        CardDataIn.append(DataIdType(Name: cardDataNameFire[y], Id: cardDataValueFire[y], FileType: cardDataTypeFire[y]))
                                                    } else {
                                                        CardDataIn.append(DataIdType(Name: cardDataNameFire[y], Id: cardDataValueFire[y], FileType: nil))
                                                    }
                                                }
                                                AvaliableCards.append(CardType(Title: nil, Caption: nil, ColorType: ColorFire, ImageRef: nil, LongText: LongTextFire, BackgroundStyle: BackgroundStyle, Opacity: Double(Opacity)!, Destination: destinationFire, CardData: CardDataIn))
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                } //mark
            } catch {
                print("Error")
            }
        }
    }
}

#if DEBUG
struct CommissionsInfoPreview: PreviewProvider {
    static var previews: some View {
        ProfileViewCommissionInfo(SelectedCommissionsViewMode: .constant(.Info), SelectedCommission: CommitionType(Title: "THis is a test", Caption: "Some caption", StartDate: Date(timeIntervalSinceNow: 100), EndDate: Date(timeIntervalSinceNow: 1000), Cards: [4], Hidden: false, FirebaseID: 2, Value: 1, Score: 100, Location: nil, Proximity: nil))
    }
}
#endif

struct ProfileViewCommissionsHome: View{
    @Binding var selectedProfileView: profileViewEnum
    @Binding var SelectedCommissionsViewMode: CommisssionsViewModes
    @Binding var SelectedCommision: CommitionType?
    @State var  AvaliableCommitions: [CommitionType] = []
    @State var ProgressViewText: String = "Loading..."
    @Environment(\.colorScheme) var colorScheme
    var body: some View{
        GeometryReader{ geo in
                VStack(spacing: 0){
                    HStack{
                        Image("Commissions")
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .ignoresSafeArea()
                        Spacer()
                    }
                    if AvaliableCommitions.count != 0{
                        ScrollView{
                            VStack{
                                ForEach(AvaliableCommitions, id: \.FirebaseID) { Commission in
                                    if Commission.Hidden == false{
                                        Button(){
                                            SelectedCommision = Commission
                                            SelectedCommissionsViewMode = .Info
                                        } label: {
                                            VStack{
                                                HStack{
                                                    Text(Commission.Title)
                                                        .font(.headline)
                                                        .foregroundColor(colorScheme == .light ? Color.black:Color.white)
                                                    Spacer()
                                                }
                                                HStack{
                                                    Text(Commission.Caption)
                                                        .font(.caption)
                                                        .foregroundColor(colorScheme == .light ? Color.black:Color.white)
                                                    Spacer()
                                                }
                                            }.padding()
                                            .padding()
                                            .background(
                                                RoundedRectangle(cornerRadius: 25)
                                                    .foregroundColor(colorScheme == .light ? Color.white:Color.black)
                                            )
                                            .padding()
                                        
                                        }.buttonStyle(.plain)
                                    }
                                }
                            }.background(Color.marron)
                            .frame(maxHeight: .infinity)
                        }.frame(height: geo.size.height * 0.6)
                    } else {
                        Spacer()
                        ProgressView(ProgressViewText)
                            .scaleEffect(5)
                            .foregroundColor(.white)
                            .font(.system(size: 2.5))
                            .tint(.white)
                        Spacer()
                    }
                    HStack{
                        Spacer()
                        Button(){
                            selectedProfileView = .Home
                        } label: {
                            Text("BACK")
                                .font(.system(size: 17))
                                .fontWeight(.bold)
                                .foregroundColor(.black)
                                .frame(minWidth: 0, maxWidth: .infinity)
                                .padding([.top, .bottom])
                                .background(
                                    RoundedRectangle(cornerRadius: 25)
                                        .fill(Color.white)
                                        .shadow(color: .gray, radius: 2, x: 0, y: 2)
                                )
                                .padding()
                        }
                        Spacer()
                    }
                    Spacer()
                }.onAppear(){
                    FetchCommitions()
                    if AvaliableCommitions.count == 0{
                        ProgressViewText = "There is either no commissions or an error occured"
                    }
                }
                .background(Color.marron)
                .ignoresSafeArea()
        }
    }
    func FetchCommitions() {
        Task{
            do{
                let db = Firestore.firestore()

                let docRef = db.collection("Commissions")
                docRef.getDocuments { (snapshot, error) in
                    guard let snapshot = snapshot, error == nil else {
                     //handle error
                     return
                   }
                   snapshot.documents.forEach({ (documentSnapshot) in
                       let documentData = documentSnapshot.data()

                       let CardID = documentData["FirebaseID"] as? Int ?? 0
                       
                       if CardID != 0 {
                           let CardStartStamp = documentData["StartDate"] as! Timestamp
                           let CardStart = CardStartStamp.dateValue()
                           let CardTitle = documentData["Title"] as? String ?? "Error"
                           let CardCaption = documentData["Caption"] as? String ?? "Error"
                           let CardEndStamp = documentData["EndDate"] as? Timestamp
                           let CardEnd = CardEndStamp!.dateValue()
                           let CardHidden = documentData["Hidden"] as? Bool
                           let CardValue = documentData["Value"] as? Int
                           let CardSelectedCards = documentData["SelectedCards"] as! NSArray as? [Int]
                           let CardProximity = documentData["Proximity"] as? Double
                           let CardCoordinate = documentData["Coordinate"] as? GeoPoint
                           var CardLocation: CLLocation?
                           if CardCoordinate != nil{
                               CardLocation = CLLocation(latitude: CardCoordinate!.latitude, longitude: CardCoordinate!.longitude)
                           }
                           let CardScore = documentData["Points"] as? Int ?? 0

                           AvaliableCommitions.append(CommitionType(Title: CardTitle, Caption: CardCaption, StartDate: CardStart, EndDate: CardEnd, Cards: CardSelectedCards!, Hidden: CardHidden!, FirebaseID: CardID, Value: CardValue!, Score: CardScore, Location: CardLocation, Proximity: CardProximity))
                       }
                       
                   })
                 }
            } catch {
                print("Error")
            }
        }
    }
}

enum CommisssionsViewModes{
    case Home
    case Info
}

struct ProfileViewCommissions: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @Binding var selectedProfileView: profileViewEnum
    @State var SelectedCommision: CommitionType?
    @State var SelectedCommissionsViewMode: CommisssionsViewModes = .Home
    var body: some View{
        if SelectedCommissionsViewMode == .Home{
            ProfileViewCommissionsHome(selectedProfileView: $selectedProfileView, SelectedCommissionsViewMode: $SelectedCommissionsViewMode, SelectedCommision: $SelectedCommision)
        } else {
            if SelectedCommissionsViewMode == .Info{
                ProfileViewCommissionInfo(SelectedCommissionsViewMode: $SelectedCommissionsViewMode, SelectedCommission: SelectedCommision!)
                    .environmentObject(WindowMode)
            }
        }
    }
}

//#if DEBUG
//struct CommissionsPreview: PreviewProvider {
//    static var previews: some View {
//        ProfileViewCommissions(selectedProfileView: .constant(.Commissions))
//    }
//}
//#endif

struct ProfileViewUpdatePassword: View{
    @Binding var selectedProfileView: profileViewEnum
    var body: some View{
        HStack{
            Button(){
                selectedProfileView = .Pauly
            } label: {
                HStack{
                    Image(systemName: "chevron.backward")
                    Text("Back")
                }
            }.padding()
            Spacer()
        }
        Text("Update Password")
    }
}
