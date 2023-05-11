//
//  CommissionsView.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-04-22.
//

import SwiftUI
import CoreLocation
import FirebaseFirestore
import FirebaseStorage
import FirebaseAuth

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

struct ProfileClaimView: View {
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @Binding var SelectedCommission: CommitionType
    @Binding var SheetPresented: Bool
    @Binding var isCommissionComplete: Bool //Telling for rendering
    
    //Loading Bools
    @State var Success: Bool = false
    @State var PaulyRecieved: Bool = false
    @State var CommissionLoading: Bool = true
    
    //Image
    @State var selectedImage: UIImage?
    @State var ImageSelected: Bool = false
    
    //Location
    @State var LocationResult: Bool?
    
    var body: some View{
        if CommissionLoading{
            if SelectedCommission.Value == 1{
                ProgressView()
                    .onAppear(){
                        CommissionLoading = false
                    }
            } else {
                if SelectedCommission.Value == 2{
                    LocationServices(SelectedCommision: $SelectedCommission, Success: $LocationResult)
                        .environmentObject(WindowMode)
                        .onChange(of: LocationResult){ value in
                            CommissionLoading = false
                        }
                } else {
                    if SelectedCommission.Value == 3{
                        ImageView(selectedImage: $selectedImage, ImageConfirmed: $ImageSelected, SheetPresented: $SheetPresented)
                            .environmentObject(WindowMode)
                            .onChange(of: ImageSelected){ value in
                                CommissionLoading = false
                            }
                    } else {
                        if SelectedCommission.Value == 4{
                            if ImageSelected == false{
                                ImageView(selectedImage: $selectedImage, ImageConfirmed: $ImageSelected, SheetPresented: $SheetPresented)
                                    .environmentObject(WindowMode)
                            } else {
                                LocationServices(SelectedCommision: $SelectedCommission, Success: $LocationResult)
                                    .environmentObject(WindowMode)
                                    .onChange(of: LocationResult){ value in
                                        CommissionLoading = false
                                    }
                            }
                        } else {
                            if SelectedCommission.Value == 5{
                                
                            }
                        }
                    }
                }
            }
        } else {
            if PaulyRecieved{
                if Success{
                    VStack{
                        AnimatedCheckmarkView()
                        Text("Congradulations You Have Made A Submission.")
                            .padding(.top)
                        Button(){
                            SheetPresented = false
                        } label: {
                            Text("OK")
                        }
                    }
                } else {
                    //Failure
                    Text("You can not claim this")
                    Button(){
                        SheetPresented = false
                    } label: {
                        Text("OK")
                    }
                }
            } else {
                ProgressView("Telling Pauly You have complete the commission")
                    .onAppear(){
                        if SelectedCommission.Value == 1{
                            ClaimCommissionForOne()
                        } else {
                            if SelectedCommission.Value == 2{
                                ClaimCommissionForTwo()
                            } else {
                                if SelectedCommission.Value == 3{
                                    ClaimCommissionForThree()
                                } else {
                                    if SelectedCommission.Value == 4{
                                        ClaimCommissionForFour()
                                    } else {
                                        if SelectedCommission.Value == 5{
                                            
                                        }
                                    }
                                }
                            }
                        }
                    }
            }
        }
    }
    func SetDataForImage(){
        let Uid = Auth.auth().currentUser!.uid
        let storage = Storage.storage()
        let storageRef = storage.reference().child("\(SelectedCommission.FirebaseID)-\(Uid)")
        let resizedImage = selectedImage?.scalePreservingAspectRatio(width: 200, height: 200)
        let data = resizedImage!.jpegData(compressionQuality: 0.2)
        let metadata = StorageMetadata()
        metadata.contentType = "image/jpg"
        if let data = data {
            storageRef.putData(data, metadata: metadata) { (metadata, error) in
                if let error = error {
                    print("Error while uploading file: ", error)
                }

                if let metadata = metadata {
                    print("Metadata: ", metadata)
                }
            }
        }
    }
    func ClaimCommissionForOne(){
        let Uid = Auth.auth().currentUser!.uid
        
        let db = Firestore.firestore()
        
        let docRef = db.collection("Users").document(WindowMode.UsernameIn)
        
        docRef.updateData(["SubmittedCommissions":FieldValue.arrayUnion([SelectedCommission.FirebaseID])]) { error in
            if let error = error {
                print("Error updating document: \(error)")
                //TO DO HANDLE ERROR
            } else {
                let CommissionRef = db.collection("Commissions").document("\(SelectedCommission.FirebaseID)").collection("Submissions").document(Uid)
                CommissionRef.setData(["User":Uid, "SubmissionType":1,"Date":FieldValue.serverTimestamp()])
            }
        }
    }
    func ClaimCommissionForTwo(){
        let Uid = Auth.auth().currentUser!.uid
        
        let db = Firestore.firestore()
        
        let docRef = db.collection("Users").document(WindowMode.UsernameIn)
        
        docRef.updateData(["SubmittedCommissions":FieldValue.arrayUnion([SelectedCommission.FirebaseID]), "CompletedCommissions":FieldValue.arrayUnion([SelectedCommission.FirebaseID]), "Score": FieldValue.increment(Int64(SelectedCommission.Score))]) { error in
            if let error = error {
                print("Error updating document: \(error)")
                //TO DO HANDLE ERROR
            } else {
                let CommissionRef = db.collection("Commissions").document("\(SelectedCommission.FirebaseID)").collection("Submissions").document(Uid)
                CommissionRef.setData(["User":Uid, "SubmissionType":2,"Date":FieldValue.serverTimestamp()])
            }
        }
    }
    func ClaimCommissionForThree(){
        let Uid = Auth.auth().currentUser!.uid
        let db = Firestore.firestore()
        
        let docRef = db.collection("Users").document(WindowMode.UsernameIn)
        
        docRef.updateData(["SubmittedCommissions":FieldValue.arrayUnion([SelectedCommission.FirebaseID])]) { error in
            if let error = error {
                print("Error updating document: \(error)")
                //TO DO HANDLE ERROR
            } else {
                SetDataForImage()
                let CommissionRef = db.collection("Commissions").document("\(SelectedCommission.FirebaseID)").collection("Submissions").document(Uid)
                CommissionRef.setData(["User":Uid, "SubmissionType":3,"Image":"\(SelectedCommission.FirebaseID)-\(Uid)","Date":FieldValue.serverTimestamp()])
                PaulyRecieved = true
                Success = true
            }
        }
    }
    func ClaimCommissionForFour(){
        let Uid = Auth.auth().currentUser!.uid
        
        let db = Firestore.firestore()
        
        let docRef = db.collection("Users").document(WindowMode.UsernameIn)
        
        docRef.updateData(["SubmittedCommissions":FieldValue.arrayUnion([SelectedCommission.FirebaseID])]) { error in
            if let error = error {
                print("Error updating document: \(error)")
                //TO DO HANDLE ERROR
            } else {
                SetDataForImage()
                let CommissionRef = db.collection("Commissions").document("\(SelectedCommission.FirebaseID)").collection("Submissions").document(Uid)
                CommissionRef.setData(["User":Uid, "SubmissionType":4,"Image":"\(SelectedCommission.FirebaseID)-\(Uid)","Date":FieldValue.serverTimestamp()])
            }
        }
    }
}

struct ProfileViewCommissionInfo: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @Binding var SelectedCommissionsViewMode: CommisssionsViewModes
    @State var SelectedCommission: CommitionType
    @State var AvaliableCards: [CardType] = []
    @State var SheetPresented: Bool = false
    @State var isCommissionComplete: Bool = true
    @State var isCommissionSubmitted: Bool = true
    @Binding var accessToken: String?
    @State var CheckedIfCommissionComplete: Bool = false
    @State var ButtonText: String = "Error"
    @State var ButtonColor: Color = Color.gray
    var body: some View{
        if CheckedIfCommissionComplete == false{
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
                            ForEach($AvaliableCards, id: \.id) { card in
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
                            if isCommissionComplete == false && SelectedCommission.StartDate <= Date.now && SelectedCommission.EndDate >= Date.now && isCommissionSubmitted == false{
                                SheetPresented = true
                            }
                        } label: {
                            Text(ButtonText)
                                .font(.system(size: 17))
                                .fontWeight(.bold)
                                .foregroundColor(.black)
                                .frame(minWidth: 0, maxWidth: .infinity)
                                .padding([.top, .bottom])
                                .background(
                                    RoundedRectangle(cornerRadius: 25)
                                        .fill(ButtonColor)
                                        .shadow(color: .gray, radius: 2, x: 0, y: 2)
                                )
                                .padding([.leading, .trailing])
                                .onAppear(){
                                    if isCommissionComplete{
                                        ButtonText = "COMMISSION COMPLETE"
                                        ButtonColor = Color.gray
                                    } else {
                                        if isCommissionSubmitted{
                                            ButtonText = "COMMISSION SUBMITTED"
                                            ButtonColor = Color.yellow
                                        } else {
                                            if SelectedCommission.StartDate >= Date.now{
                                                ButtonText = "COMMISSION UPCOMING"
                                                ButtonColor = Color.gray
                                            } else {
                                                if SelectedCommission.EndDate <= Date.now{
                                                    ButtonText = "COMMISSION PAST"
                                                    ButtonColor = Color.gray
                                                } else {
                                                    ButtonText = "CLAIM COMMISSION"
                                                    ButtonColor = Color.white
                                                }
                                            }
                                        }
                                    }
                                }
                        }
                        .sheet(isPresented: $SheetPresented){
                            ProfileClaimView(SelectedCommission: $SelectedCommission, SheetPresented: $SheetPresented, isCommissionComplete: $isCommissionComplete)
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
                    guard let SubmittedComissions = data["SubmittedCommissions"] as? NSArray as? [Int] else {
                        return
                    }
                    if CommissionsComplete.contains(CommissionID) {
                        isCommissionComplete = true
                        isCommissionSubmitted = true
                        CheckedIfCommissionComplete = true
                    } else {
                        if SubmittedComissions.contains(CommissionID){
                            isCommissionComplete = false
                            isCommissionSubmitted = true
                            CheckedIfCommissionComplete = true
                        } else {
                            isCommissionComplete = false
                            isCommissionSubmitted = false
                            CheckedIfCommissionComplete = true
                        }
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

enum CommissionsModeTypes{
    case Past
    case Ongoing
    case Upcoming
}

struct CommissionResultView: View{
    @State var Commission: CommitionType
    @Binding var CommissionsComplete: [Int]
    @Binding var SubmittedCommissions: [Int]
    @Binding var SelectedCommision: CommitionType?
    @Binding var SelectedCommissionsViewMode: CommisssionsViewModes
    @Environment(\.colorScheme) var colorScheme
    var body: some View{
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
                if SubmittedCommissions.contains(Commission.FirebaseID){
                    Button(){
                        SelectedCommision = Commission
                        SelectedCommissionsViewMode = .Info
                    } label: {
                        VStack{
                            HStack{
                                Text(Commission.Title)
                                    .font(.headline)
                                    .foregroundColor(.black)
                                Spacer()
                            }
                            HStack{
                                Text(Commission.Caption)
                                    .font(.caption)
                                    .foregroundColor(.black)
                                Spacer()
                            }
                        }.padding()
                        .padding()
                        .background(
                                RoundedRectangle(cornerRadius: 25)
                                    .foregroundColor(.yellow)
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
    }
    func CheckifCompletedCommissionBackground(ID: Int) -> Bool{
        if CommissionsComplete.contains(ID) {
            return true
        } else {
            return false
        }
    }
}

struct ProfileViewCommissionsHome: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @Binding var selectedProfileView: profileViewEnum
    @Binding var SelectedCommissionsViewMode: CommisssionsViewModes
    @Binding var SelectedCommision: CommitionType?
    @State var  AvaliableCommitions: [CommitionType] = []
    @State var ProgressViewText: String = "Loading..."
    @State var CommissionsComplete: [Int] = []
    @State var CommissionsSubmitted: [Int] = []
    @Environment(\.colorScheme) var colorScheme
    @Binding var CommissionsMode: CommissionsModeTypes
    var body: some View{
        GeometryReader{ geo in
                VStack(spacing: 0){
                    HStack{
                        Image("Commissions")
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .ignoresSafeArea()
                        Spacer()
                    }.frame(height: geo.size.height * 0.3)
                    if AvaliableCommitions.count != 0{
                        ScrollView{
                            VStack{
                                ForEach(AvaliableCommitions, id: \.FirebaseID) { Commission in
                                    if CommissionsMode == .Ongoing{
                                        if Commission.EndDate >= Date.now{
                                            CommissionResultView(Commission: Commission, CommissionsComplete: $CommissionsComplete, SubmittedCommissions: $CommissionsSubmitted, SelectedCommision: $SelectedCommision, SelectedCommissionsViewMode: $SelectedCommissionsViewMode)
                                        }
                                    } else {
                                        if CommissionsMode == .Upcoming{
                                            if Commission.StartDate >= Date.now {
                                                CommissionResultView(Commission: Commission, CommissionsComplete: $CommissionsComplete, SubmittedCommissions: $CommissionsSubmitted, SelectedCommision: $SelectedCommision, SelectedCommissionsViewMode: $SelectedCommissionsViewMode)
                                            }
                                        } else {
                                            if CommissionsMode == .Past{
                                                if Commission.EndDate <= Date.now{
                                                    CommissionResultView(Commission: Commission, CommissionsComplete: $CommissionsComplete, SubmittedCommissions: $CommissionsSubmitted, SelectedCommision: $SelectedCommision, SelectedCommissionsViewMode: $SelectedCommissionsViewMode)
                                                }
                                            }
                                        }
                                    }
                                }
                            }.background(Color.marron)
                            .frame(maxHeight: .infinity)
                        }.frame(height: geo.size.height * 0.6)
                        HStack{
                            Spacer()
                            GeometryReader{ TabGeo in
                                HStack{
                                    Spacer()
                                    Button(){
                                        withAnimation(.spring(response: 0.3, dampingFraction: 0.7)){
                                            CommissionsMode = .Past
                                        }
                                    } label: {
                                        VStack{
                                            if CommissionsMode == .Past{
                                                Rectangle()
                                                    .cornerRadius(25)
                                                    .foregroundColor(Color.blue)
                                                    .frame(height: 2)
                                                    .padding(.top, 2)
                                            } else {
                                                Rectangle()
                                                    .cornerRadius(25)
                                                    .foregroundColor(Color.clear)
                                                    .frame(height: 2)
                                                    .padding(.top, 2)
                                            }
                                            Image(systemName: "arrowshape.turn.up.backward.badge.clock")
                                                .resizable()
                                                .aspectRatio(contentMode: .fit)
                                                .foregroundColor(.black)
                                            Text("PAST")
                                                .foregroundColor(.black)
                                                .font(.system(size: 10))
                                        }.frame(width: TabGeo.size.width * 0.15, height: geo.size.height * 0.08)
                                    }
                                    Spacer()
                                    Button(){
                                        withAnimation(.spring(response: 0.3, dampingFraction: 0.7)){
                                            CommissionsMode = .Ongoing
                                        }
                                    } label: {
                                        VStack{
                                            if CommissionsMode == .Ongoing{
                                                Rectangle()
                                                    .cornerRadius(25)
                                                    .foregroundColor(Color.blue)
                                                    .frame(height: 2)
                                                    .padding(.top, 2)
                                                    .animation(.spring())
                                            } else {
                                                Rectangle()
                                                    .cornerRadius(25)
                                                    .foregroundColor(Color.clear)
                                                    .frame(height: 2)
                                                    .padding(.top, 2)
                                            }
                                            Image(systemName: "clock")
                                                .resizable()
                                                .aspectRatio(contentMode: .fit)
                                                .foregroundColor(.black)
                                            Text("ONGOING")
                                                .foregroundColor(.black)
                                                .font(.system(size: 10))
                                        }
                                        .frame(width: TabGeo.size.width * 0.15, height: geo.size.height * 0.08)
                                    }
                                    Spacer()
                                    Button(){
                                        withAnimation(.spring(response: 0.3, dampingFraction: 0.7)){
                                            CommissionsMode = .Upcoming
                                        }
                                    } label: {
                                        VStack{
                                            if CommissionsMode == .Upcoming{
                                                Rectangle()
                                                    .cornerRadius(25)
                                                    .foregroundColor(Color.blue)
                                                    .frame(height: 2)
                                                    .padding(.top, 2)
                                            } else {
                                                Rectangle()
                                                    .cornerRadius(25)
                                                    .foregroundColor(Color.clear)
                                                    .frame(height: 2)
                                                    .padding(.top, 2)
                                            }
                                            Image(systemName: "arrowshape.turn.up.backward.badge.clock.rtl")
                                                .resizable()
                                                .aspectRatio(contentMode: .fit)
                                                .frame(width: TabGeo.size.width * 0.15)
                                                .foregroundColor(.black)
                                            Text("UPCOMING")
                                                .foregroundColor(.black)
                                                .font(.system(size: 10))
                                        }
                                        .frame(width: TabGeo.size.width * 0.15, height: geo.size.height * 0.08)
                                    }
                                    Spacer()
                                    Button(){
                                        withAnimation(){
                                            selectedProfileView = .Home
                                        }
                                    } label: {
                                        VStack{
                                            Rectangle()
                                                .cornerRadius(25)
                                                .foregroundColor(Color.clear)
                                                .frame(height: 2)
                                                .padding(.top, 2)
                                            Image(systemName: "arrowshape.backward")
                                                .resizable()
                                                .aspectRatio(contentMode: .fit)
                                                .frame(width: TabGeo.size.width * 0.1)
                                                .foregroundColor(.black)
                                            Text("BACK")
                                                .foregroundColor(.black)
                                                .font(.system(size: 10))
                                        }
                                        .frame(width: TabGeo.size.width * 0.15, height: geo.size.height * 0.08)
                                    }
                                    Spacer()
                                }.frame(minWidth: 0, maxWidth: .infinity, alignment: .bottom)
                                .padding([.bottom], 4)
                                .background(
                                    RoundedRectangle(cornerRadius: 30)
                                        .fill(Color.white)
                                        .shadow(color: .gray, radius: 2, x: 0, y: 2)
                                )
                                .padding()
                            }
                        }
                    } else {
                        Spacer()
                        ProgressView(ProgressViewText)
                            .scaleEffect(5)
                            .foregroundColor(.white)
                            .font(.system(size: 2.5))
                            .tint(.white)
                        Spacer()
                        Button(){
                            selectedProfileView = .Home
                        } label: {
                            VStack{
                                Text("BACK")
                                    .foregroundColor(.black)
                                    .font(.system(size: 14))
                                    .frame(minWidth: 0, maxWidth: .infinity)
                                    .padding([.top, .bottom])
                                    .background(
                                        RoundedRectangle(cornerRadius: 25)
                                            .fill(Color.white)
                                            .shadow(color: .gray, radius: 2, x: 0, y: 2)
                                    )
                                    .padding()
                            }
                        }
                    }
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
                    guard let CommissionsCompleted = data["CompletedCommissions"] as? NSArray as? [Int] else {
                        return
                    }
                    CommissionsComplete = CommissionsCompleted
                    guard let commissionsSelect = data["SubmittedCommissions"] as? NSArray as? [Int] else {
                        return
                    }
                    CommissionsSubmitted = commissionsSelect
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
    @State var CommissionsMode: CommissionsModeTypes = .Ongoing
    @State var SelectedCommissionsViewMode: CommisssionsViewModes = .Home
    var body: some View{
        if SelectedCommissionsViewMode == .Home{
            ProfileViewCommissionsHome(selectedProfileView: $selectedProfileView, SelectedCommissionsViewMode: $SelectedCommissionsViewMode, SelectedCommision: $SelectedCommision, CommissionsMode: $CommissionsMode)
                .environmentObject(WindowMode)
        } else {
            if SelectedCommissionsViewMode == .Info{
                ProfileViewCommissionInfo(SelectedCommissionsViewMode: $SelectedCommissionsViewMode, SelectedCommission: SelectedCommision!, accessToken: $accessToken)
                    .environmentObject(WindowMode)
            }
        }
    }
}
