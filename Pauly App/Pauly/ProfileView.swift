//
//  ProfileView.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-03-11.
//

import Foundation
import SwiftUI
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
    case GovernmentView
}

struct ProfileViewMain: View{
    @Binding var AccessToken: String?
    @EnvironmentObject var WindowMode: SelectedWindowMode
    
    @State var selectedProfileView: profileViewEnum = .Home
    var body: some View{
        switch selectedProfileView {
        case .Home:
            ProfileViewHome(selectedProfileView: $selectedProfileView)
                .environmentObject(WindowMode)
        case .Pauly:
            ProfileViewPauly(selectedProfileView: $selectedProfileView)
                .environmentObject(WindowMode)
        case .Leaderboard:
            ProfileViewLeaderboard(selectedProfileView: $selectedProfileView)
        case .Commissions:
            ProfileViewCommissions(accessToken: $AccessToken, selectedProfileView: $selectedProfileView)
                .environmentObject(WindowMode)
        case .Microsoft:
            ProfileViewMicosoft(selectedProfileView: $selectedProfileView)
        case .UpdatePassword:
            ProfileViewUpdatePassword(selectedProfileView: $selectedProfileView)
        case .Resourses:
            Resources(selectedProfileView: $selectedProfileView, AccessToken: $AccessToken)
        case .GovernmentView:
            GovernmentView(selectedProfileView: $selectedProfileView, accessToken: $AccessToken)
                .environmentObject(WindowMode)
        }
    }
}

struct ProfileViewHome: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    
    @Binding var selectedProfileView: profileViewEnum
    
    @State var HasAccessToGovernment: Bool = false
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
                    HStack{
                        Image(systemName: "medal")
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .foregroundColor(.black)
                            .frame(height: TextSize.height)
                        Text("Leaderboard")
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
                Button(){
                    selectedProfileView = .Commissions
                } label: {
                    HStack{
                        Image(systemName: "star")
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .foregroundColor(.black)
                            .frame(height: TextSize.height)
                        Text("Commissions")
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
                Button(){
                    selectedProfileView = .Resourses
                } label: {
                    HStack{
                        Image(systemName: "filemenu.and.selection")
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .foregroundColor(.black)
                            .frame(height: TextSize.height)
                        Text("Resources")
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
                }.onAppear(){
                    CheckIfUserHasPerms(){ Result in
                        HasAccessToGovernment = Result
                    }
                }
                if HasAccessToGovernment{
                    Button(){
                        selectedProfileView = .GovernmentView
                    } label: {
                        HStack{
                            Image(systemName: "building.columns")
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .foregroundColor(.black)
                                .frame(height: TextSize.height)
                            Text("Government")
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
                }
                Spacer()
            }
        }.background(Color.marron)
    }
    func CheckIfUserHasPerms(completion: @escaping (Bool) -> ()) {
        guard let userUID = Auth.auth().currentUser?.uid else {
            completion(false)
            return
        }
        let db = Firestore.firestore()
        
        let docRef = db.collection("Users").document(userUID)
        
        docRef.getDocument { (document, error) in
            guard error == nil else {
                print("error", error ?? "")
                completion(false)
                return
            }
            
            if let document = document, document.exists {
                let data = document.data()
                if let data = data{
                    guard let CommissionsComplete = data["Permissions"] as? NSArray as? [Int] else {
                        completion(false)
                        return
                    }
                    if CommissionsComplete.contains(3){
                        completion(true)
                    }
                } else {
                    completion(false)
                }
            }
        }
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
    @State var presentAlert: Bool = false
    @State var TextSize: CGSize = CGSize(width: 0.0, height: 0.0)
    var body: some View{
        VStack{
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
            Image("Settings")
                .resizable()
                .aspectRatio(contentMode: .fit)
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
                    .padding()
                    .background(
                        RoundedRectangle(cornerRadius: 15)
                            .fill(Color.red)
                           )
            }
            Button(){
                presentAlert = true
            } label: {
                HStack{
                    Image(systemName: "trash")
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .foregroundColor(.white)
                        .frame(height: TextSize.height)
                    Text("DELETE ACCOUNT")
                        .foregroundColor(.white)
                        .saveSize(in: $TextSize)
                }
                .padding()
                .background(
                    RoundedRectangle(cornerRadius: 15)
                        .fill(Color.red)
                       )
            }.alert("Are you sure?", isPresented: $presentAlert, actions: {
                // 1
                  Button("Cancel", role: .cancel, action: {})

                  Button("PERMANATLY DELETE ACCOUNT", role: .destructive, action: {
                      let user = Auth.auth().currentUser
                      let userUid = Auth.auth().currentUser?.uid
                      
                      let db = Firestore.firestore()
                      
                      db.collection("Users").document(userUid!).delete() { err in
                          if let err = err {
                              print("Error removing document: \(err)")
                          } else {
                              user?.delete { error in
                                if let error = error {
                                  // An error happened.
                                } else {
                                  // Account deleted.
                                    WindowMode.SelectedWindowMode = .PasswordWindow
                                }
                              }
                          }
                      }
                  })
                }, message: {
                  Text("THIS WILL PERMANATLY DELETE YOUR ACCOUNT")
                })
        }.background(Color.marron)
    }
}

struct CommitionType{
    var Title: String
    var Caption: String
    var StartDate: Date
    var EndDate: Date
    var Cards: [Int]
    var Hidden: Bool
    let FirebaseID: Int
    var Value: Int
    var Score: Int
    var Location: CLLocation?
    var Proximity: Double?
}

struct ProfileViewCommissionInfo: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @Binding var SelectedCommissionsViewMode: CommisssionsViewModes
    @State var SelectedCommission: CommitionType
    @State var AvaliableCards: [CardType] = []
    @State var SheetPresented: Bool = false
    @State var isCommissionComplete: Bool?
    @Binding var accessToken: String?
    @State var ImageSubmission: Bool = false
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
                                Card(TextColor: Color.black, accessToken: $accessToken, SelectedCard: card)
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
                                if SelectedCommission.Value == 1{
                                    
                                } else {
                                    if SelectedCommission.Value == 2{
                                        SheetPresented = true
                                    } else {
                                        if SelectedCommission.Value == 3{
                                            ImageSubmission = true
                                        } else {
                                            if SelectedCommission.Value == 4{
                                                
                                            } else {
                                                if SelectedCommission.Value == 5{
                                                    
                                                }
                                            }
                                        }
                                    }
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
                        .sheet(isPresented: self.$ImageSubmission) {
                            ImageView(ImageSubmission: $ImageSubmission, CommissionID: SelectedCommission.FirebaseID)
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
                    Functions().GetCardData(CardIds: SelectedCommission.Cards) { (cards) in
                        AvaliableCards = cards
                    }
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
}

#if DEBUG
struct CommissionsInfoPreview: PreviewProvider {
    static var previews: some View {
        ProfileViewCommissionInfo(SelectedCommissionsViewMode: .constant(.Info), SelectedCommission: CommitionType(Title: "THis is a test", Caption: "Some caption", StartDate: Date(timeIntervalSinceNow: 100), EndDate: Date(timeIntervalSinceNow: 1000), Cards: [4], Hidden: false, FirebaseID: 2, Value: 1, Score: 100, Location: nil, Proximity: nil), accessToken: .constant("Stop"))
    }
}
#endif

struct ProfileViewCommissionsHome: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @Binding var selectedProfileView: profileViewEnum
    @Binding var SelectedCommissionsViewMode: CommisssionsViewModes
    @Binding var SelectedCommision: CommitionType?
    @State var  AvaliableCommitions: [CommitionType] = []
    @State var ProgressViewText: String = "Loading..."
    @State var CommissionsComplete: [Int] = []
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
                                    let CommissionResult: Bool = CheckifCompletedCommissionBackground(ID: Commission.FirebaseID)
                                    if Commission.Hidden == false{
                                        if CommissionResult{
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
                                                            .foregroundColor(Color.gray)
                                                )
                                                .padding()
                                            
                                            }.buttonStyle(.plain)
                                        } else {
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
    func CheckifCompletedCommissionBackground(ID: Int) -> Bool{
        if CommissionsComplete.contains(ID) {
            return true
        } else {
            return false
        }
    }
    func CheckIfCompletedCommition() {
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
                    CommissionsComplete = data["CompletedCommissions"] as! NSArray as? [Int] ?? []
                }
            }
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
                           CheckIfCompletedCommition()
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
    @Binding var accessToken: String?
    @Binding var selectedProfileView: profileViewEnum
    @State var SelectedCommision: CommitionType?
    @State var SelectedCommissionsViewMode: CommisssionsViewModes = .Home
    var body: some View{
        if SelectedCommissionsViewMode == .Home{
            ProfileViewCommissionsHome(selectedProfileView: $selectedProfileView, SelectedCommissionsViewMode: $SelectedCommissionsViewMode, SelectedCommision: $SelectedCommision)
                .environmentObject(WindowMode)
        } else {
            if SelectedCommissionsViewMode == .Info{
                ProfileViewCommissionInfo(SelectedCommissionsViewMode: $SelectedCommissionsViewMode, SelectedCommission: SelectedCommision!, accessToken: $accessToken)
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
