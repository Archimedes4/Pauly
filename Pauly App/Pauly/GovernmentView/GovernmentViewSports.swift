//
//  GovernmentViewSports.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-04-09.
//

import SwiftUI
import FirebaseFirestore
import FirebaseAuth
import FirebaseStorage
import PhotosUI

enum SportsUserPermmission{
    case Select
    case BySport
    case Aboulute
}

struct BySportType{
    let id: UUID = UUID()
    let Name: String
    let Season: Int
    let Team: String
}

struct GovernmentSportsView: View{
    @Binding var SelectedGovernmentViewMode: GovernmentViewModes
    @State var UserPerm: SportsUserPermmission = .Select
    @State var UserBySportPerm: [BySportType] = []
    @State var AvaliableSports: [String] = []
    @State var SelectedSport: String = ""
    @State var PageLoading: Bool = false
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
                Text("Sports")
                    .font(.title)
                switch UserPerm {
                case .Select:
                    Spacer()
                    ProgressView()
                        .onAppear(){
                            GetUserSetting()
                        }
                    Spacer()
                case .BySport:
                    List(){
                        ForEach(UserBySportPerm, id: \.id) { perm in
                            if perm.Name == "Highlights"{
                                NavigationLink(destination: GovernmentSportPageHighlightsView()){
                                    Text("Highlights")
                                }
                            } else {
                                NavigationLink(destination: GovernmentSportsEditView(Season: perm.Season, Team: perm.Team, Name: perm.Name)){
                                    Text("Sport: \(perm.Name) Season: \(perm.Season) Team: \(perm.Team)")
                                }
                            }
                        }
                    }.scrollContentBackground(.hidden)
                case .Aboulute:
                    List(){
                        ForEach(AvaliableSports, id: \.self){ sport in
                            if sport == "Highlights"{
                                NavigationLink(destination: GovernmentSportPageHighlightsView()){
                                    Text("Highlights")
                                }
                            } else {
                                NavigationLink(destination: GovernmentSportViewAbsoluteSeasons(SelectedSport: sport)){
                                    Text(sport)
                                }
                            }
                        }
                    }.scrollContentBackground(.hidden)
                }
            }.background(Color.marron)
        }
    }
    func GetUserSetting(){
        let User = Auth.auth().currentUser!.uid
        
        let db = Firestore.firestore()
        
        let docRef = db.collection("Users").document(User)
        
        docRef.getDocument() { (document, err) in
            guard err == nil else{
                return
            }
            
            if let document = document, document.exists {
                let data = document.data()
                if let data = data{
                    guard let UserPerference = data["SportsMode"] as? Int else {
                        return
                    }
                    if UserPerference == 0{
                        guard let UserSports = data["SportPerms"] as? NSArray as? [String] else {
                            return
                        }
                        for x in UserSports{
                            let Sports = x.split(separator: "-")
                            if Sports[0] != "Highlights"{
                                UserBySportPerm.append(BySportType(Name: "\(Sports[0])", Season: Int("\(Sports[1])")!, Team: "\(Sports[2])"))
                            } else {
                                UserBySportPerm.append(BySportType(Name: "\(Sports[0])", Season: 0, Team: "NA"))
                            }
                        }
                        UserPerm = .BySport
                    } else {
                        GetAllAvalibeSports()
                        UserPerm = .Aboulute
                    }
                }
            }
        }
    }
    func GetAllAvalibeSports(){
        AvaliableSports = []
        
        let db = FirebaseFirestore.Firestore.firestore()
        
        let docRef = db.collection("Sports")
        
        docRef.getDocuments { (snapshot, error) in
             guard let snapshot = snapshot, error == nil else {
              //handle error
              return
            }
            snapshot.documents.forEach({ (documentSnapshot) in
              let documentData = documentSnapshot.data()
              let name = documentData["Name"] as? String
                AvaliableSports.append(name ?? "Error")
            })
          }
    }

}


struct GovernmentSportViewAbsoluteSeasons: View{
    @State var AvaliableSeason: [Int] = []
    @State var SelectedSport: String
    @State var PageLoaded: Bool = false
    var body: some View{
        VStack{
            if PageLoaded{
                VStack{
                    Text("Seasons")
                    List(){
                        ForEach(AvaliableSeason, id: \.self){ season in
                            NavigationLink(destination: GovernmentSportViewAbsoulteTeams(SelectedSeason: season, SelectedSportName: SelectedSport)){
                                Text(String(season))
                            }
                        }
                    }.scrollContentBackground(.hidden)
                }.background(Color.marron)
            } else {
                VStack{
                    Spacer()
                    ProgressView()
                        .onAppear() {
                            GetAllAvaliableSportsSeasons()
                        }
                    Spacer()
                }
            }
        }
    }
    func GetAllAvaliableSportsSeasons(){
        let db = FirebaseFirestore.Firestore.firestore()
        
        let docRef = db.collection("Sports").document(SelectedSport).collection("Seasons")
        
        docRef.getDocuments { (snapshot, error) in
             guard let snapshot = snapshot, error == nil else {
              //handle error
              return
            }
            snapshot.documents.forEach({ (documentSnapshot) in
              let documentData = documentSnapshot.data()
              let name = documentData["Season"] as? Int
                AvaliableSeason.append(name!)
            })
            PageLoaded = true
          }
    }
}

struct GovernmentSportViewAbsoulteTeams: View{
    @State var AvaliableTeams: [String] = []
    @State var SelectedSeason: Int
    @State var SelectedSportName: String
    @State var PageLoaded: Bool = false
    var body: some View{
        VStack{
            if PageLoaded{
                ZStack{
                    Rectangle()
                        .fill(Color.marron)
                        .ignoresSafeArea()
                    VStack{
                        Text("Teams")
                        List(){
                            ForEach(AvaliableTeams, id: \.self){ season in
                                NavigationLink(destination: GovernmentSportsEditView(Season: SelectedSeason, Team: season, Name: SelectedSportName)){
                                    Text("\(season)")
                                }
                            }
                        }.scrollContentBackground(.hidden)
                    }
                }
            } else {
                VStack(){
                    Spacer()
                    ProgressView()
                        .onAppear() {
                            GetAllAvalibaleSportsTeams()
                        }
                    Spacer()
                }
            }
        }
    }
    func GetAllAvalibaleSportsTeams(){
        let db = FirebaseFirestore.Firestore.firestore()
        
        let docRef = db.collection("Sports").document(SelectedSportName).collection("Seasons").document("\(SelectedSeason)").collection("Teams")
        
        print("\(SelectedSportName)-\(SelectedSeason)")
        
        docRef.getDocuments { (snapshot, error) in
             guard let snapshot = snapshot, error == nil else {
              //handle error
              return
            }
            snapshot.documents.forEach({ (documentSnapshot) in
              let documentData = documentSnapshot.data()
              let name = documentData["TeamName"] as? String
                AvaliableTeams.append(name!)
            })
            PageLoaded = true
          }
    }
}

struct GovernmentSportPageHighlightsView: View{
    @State var PageInfo: [Int] = []
    @State var PageLoading: Bool = true
    var body: some View{
        if PageLoading{
            Spacer()
            ProgressView()
                .onAppear(){
                    LoadPageInfo()
                }
            Spacer()
        } else {
            VStack{
                NavigationLink(destination: GovernmentSelectedCardsView(Cards: $PageInfo)){
                    HStack{
                        Text("Change Page")
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
                NavigationLink(destination: GovernmentAddCardsView(Cards: $PageInfo)){
                    HStack{
                        Text("Add to Page")
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
                    let db = Firestore.firestore()
                    
                    let docRef = db.collection("Sports").document("Highlights")
                    
                    docRef.updateData(["PageInfo":PageInfo])
                } label: {
                    HStack{
                        Text("Confirm Changes to Pages")
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
            }.background(Color.marron, ignoresSafeAreaEdges: .all)
        }
    }
    func LoadPageInfo(){
        let db = Firestore.firestore()
        
        let docRef = db.collection("Sports").document("Highlights")
        
        docRef.getDocument() { (doccument, err) in
                guard let doccument = doccument, err == nil, doccument.exists else {
                  //handle error
                    print("Yoah")
                  return
                }
                
                let data = doccument.data()
                guard let PageInfoTemp = data!["PageInfo"] as? NSArray as? [Int] else {
                    print("Dog")
                    return
                }
                PageInfo = PageInfoTemp
                PageLoading = false
          }
    }
}

struct GovernmentSportPageView: View{
    @State var Season: Int
    @State var Team: String
    @State var Name: String
    @State var PageInfo: [Int] = []
    var body: some View{
        VStack{
            NavigationLink(destination: GovernmentSelectedCardsView(Cards: $PageInfo)){
                HStack{
                    Text("Change Page")
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
            NavigationLink(destination: GovernmentAddCardsView(Cards: $PageInfo)){
                HStack{
                    Text("Add to Page")
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
                let db = Firestore.firestore()
                
                let docRef = db.collection("Sports").document(Name).collection("Seasons").document("\(Season)").collection("Teams").document(Team)
                
                docRef.updateData(["PageInfo":PageInfo])
            } label: {
                HStack{
                    Text("Confirm Changes to Pages")
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
        }.background(Color.marron, ignoresSafeAreaEdges: .all)
    }
}

struct GovernmentSportsEditView: View{
    @State var Season: Int
    @State var Team: String
    @State var Name: String
    @State var PageInfo: [Int] = []
    @State var PageLoading: Bool = true
    var body: some View{
        if PageLoading{
            Spacer()
            ProgressView()
                .onAppear(){
                    LoadPageInfo()
                }
            Spacer()
        } else {
            ZStack{
                Rectangle()
                    .ignoresSafeArea()
                    .foregroundColor(Color.marron)
                VStack{
                    Text("Edit \(Name)")
                        .font(.title)
                    NavigationLink(destination: GovernmentSportViewRoster(SelectedSport: Name, SeasonName: Season, SelectedTeamName: Team)){
                        HStack{
                            Text("Roster")
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
                    NavigationLink(destination: GovernmentSportsViewGame(SelectedSport: Name, SeasonName: Season, SelectedTeamName: Team)){
                        HStack{
                            Text("Game")
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
                        Spacer()
                    }
                    NavigationLink(destination: GovernmentSportPageView(Season: Season, Team: Team, Name: Name, PageInfo: PageInfo)){
                        HStack{
                            Text("Page")
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
                        Spacer()
                    }
                    Spacer()
                }.background(Color.marron, ignoresSafeAreaEdges: .all)
            }
        }
    }
    func LoadPageInfo(){
        let db = Firestore.firestore()
        
        let docRef = db.collection("Sports").document(Name).collection("Seasons").document("\(Season)").collection("Teams").document(Team)
        
        docRef.getDocument() { (doccument, err) in
                guard let doccument = doccument, err == nil, doccument.exists else {
                  //handle error
                    print("Yoah")
                  return
                }
                
                let data = doccument.data()
                guard let PageInfoTemp = data!["PageInfo"] as? NSArray as? [Int] else {
                    print("Dog")
                    return
                }
                PageInfo = PageInfoTemp
                PageLoading = false
          }
    }
}

struct RosterType{
    var Name: String
    var Position: String
    var ImageRef: String
}

struct GovernmentSportViewRoster: View{
    @State var SelectedSport: String
    @State var SeasonName: Int
    @State var SelectedTeamName: String
    
    @State var Players: [RosterType] = []
    
    @State var PageLoading = true
    var body: some View{
        if PageLoading{
            Spacer()
            ProgressView()
                .onAppear(){
                    GetRoster()
                }
            Spacer()
        } else {
            VStack{
                Text("Team Roster View")
                List(){
                    ForEach(Players, id: \.Name) { player in
                        HStack{
                            Text(player.Name)
                            Divider()
                            Text(player.Position)
                        }
                    }
                }.padding()
                    .scrollContentBackground(.hidden)
                NavigationLink(destination: GovernmentSportsViewAddRoster(SelectedSport: SelectedSport, SeasonName: SeasonName, SelectedTeamName: SelectedTeamName)){
                    HStack{
                        Text("Add Member")
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
            }
            .background(Color.marron, ignoresSafeAreaEdges: .all)
        }
    }
    func GetRoster() {
        Players = []
        let db = Firestore.firestore()
        
        let docRef = db.collection("Sports").document("\(SelectedSport)").collection("Seasons").document("\(SeasonName)").collection("Teams").document(SelectedTeamName).collection("Roster")
        
        docRef.getDocuments { (snapshot, error) in
            guard let snapshot = snapshot, error == nil else {
             //handle error
             return
           }
           snapshot.documents.forEach({ (documentSnapshot) in
               let documentData = documentSnapshot.data()
               guard let PlayerName = documentData["Name"] as? String else {
                   return
               }
               guard let PlayerPosition = documentData["Position"] as? String else {
                   return
               }
               guard let PlayerImage = documentData["ImageRef"] as? String else {
                   return
               }

               Players.append(RosterType(Name: PlayerName, Position: PlayerPosition, ImageRef: PlayerImage))
           })
            PageLoading = false
         }
    }
}

struct GovernmentSportsViewAddRoster: View{
    @State var SelectedSport: String
    @State var SeasonName: Int
    @State var SelectedTeamName: String
    
    @State var MemberName: String = ""
    @State var Role: String = "Player"
    let Roles: [String] = ["Coach", "Assistant Coach", "Assistant", "Player", "Point Guard", "Center", "Shooting Guard", "Power Forward", "Small Forward", "Golie", "Striker"]
    
    
    @State private var avatarItem: PhotosPickerItem?
    @State private var avatarImage: Image?
    @State private var SelectedImage: UIImage?
    
    @State private var presentImporter = false
    @State var ConfirmLoading: Bool = false
    
    @State var ShowingAlert: Bool = false
    @State var AlertMessage: String = ""
    var body: some View{
        ZStack{
            Rectangle()
                .foregroundColor(Color.marron)
                .ignoresSafeArea()
            ScrollView{
                VStack{
                    Text("Add Member")
                    Picker("Position", selection: $Role){
                        ForEach(Roles, id: \.self){
                            Text($0)
                        }
                    }
                    TextField("Name", text: $MemberName)
                    
                    Button() {
                        presentImporter = true
                    } label: {
                        HStack{
                            Text("Open")
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
                    }.fileImporter(isPresented: $presentImporter, allowedContentTypes: [.image]) { result in
                        switch result {
                        case .success(let url):
                            print(url)
                            do {
                              // Obtain the bookmark data of the URL of the document that is currently presented, if there is any.
                              let didStartAccessing = url.startAccessingSecurityScopedResource()
                              defer {
                                if didStartAccessing {
                                  url.stopAccessingSecurityScopedResource()
                                }
                              }
                                do{
                                    let ImageData: Data = try Data(contentsOf: url)
                                    SelectedImage = UIImage(data: ImageData)
                                    guard let SelectedImageOut: UIImage = SelectedImage else{
                                        return
                                    }
                                    avatarImage = Image(uiImage: SelectedImageOut)
                                } catch {
                                    print("Something Happend \(error)")
                                }

                            } catch {
                              // Make sure to handle the failure appropriately, e.g., by showing an alert to the user
                              print("Failed to get bookmark data from URL %@: %@")
                                AlertMessage = "Failed to get data"
                                ShowingAlert = true
                            }
                            //use `url.startAccessingSecurityScopedResource()` if you are going to read the data
                        case .failure(let error):
                            print(error)
                        }
                    }
                    VStack {
                        PhotosPicker(selection: $avatarItem, matching: .images){
                            HStack{
                                Text("Select From Photo Library")
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

                        if let avatarImage {
                            avatarImage
                                .resizable()
                                .scaledToFit()
                                .frame(width: 300, height: 300)

                        }
                    }
                    .onChange(of: avatarItem) { _ in
                        Task {
                            if let data = try? await avatarItem?.loadTransferable(type: Data.self) {
                                if let uiImage = UIImage(data: data) {
                                    avatarImage = Image(uiImage: uiImage)
                                    SelectedImage = uiImage
                                    return
                                }
                            }
                            AlertMessage = "Failed to get Image. Please Submit Bug Report"
                            ShowingAlert = true
                        }
                    }
                    Button(){
                        if ConfirmLoading == false && MemberName != ""{
                            ConfirmLoading = true
                            let storage = Storage.storage()
                            let DOCTime = Date.now
                            let storageRef = storage.reference().child("\(SelectedSport)-\(SeasonName)-\(SelectedTeamName)-\(MemberName)-\(DOCTime)")
                            let resizedImage = SelectedImage?.scalePreservingAspectRatio(width: 200, height: 200)
                            let data = resizedImage!.jpegData(compressionQuality: 0.2)
                            let metadata = StorageMetadata()
                            metadata.contentType = "image/jpg"
                            if let data = data {
                                storageRef.putData(data, metadata: metadata) { (metadata, error) in
                                    if let error = error {
                                        AlertMessage = "Error while uploading file: \(error)"
                                        ShowingAlert = true
                                    }

                                    if let metadata = metadata {
                                        let inputData: [String:Any] = [
                                            "Name":MemberName,
                                            "Position":Role,
                                            "ImageRef":"\(SelectedSport)-\(SeasonName)-\(SelectedTeamName)-\(MemberName)-\(DOCTime)"
                                        ]
                                        
                                        let db = FirebaseFirestore.Firestore.firestore()

                                        let docRef = db.collection("Sports").document("\(SelectedSport)").collection("Seasons").document("\(SeasonName)").collection("Teams").document(SelectedTeamName).collection("Roster").document(MemberName)

                                        docRef.setData(inputData) { error in
                                            if let error = error {

                                                AlertMessage = "Error writing document: \(error)"
                                                ShowingAlert = true
                                            } else {
                                                ConfirmLoading = false
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    } label: {
                        if ConfirmLoading == false{
                            HStack{
                                Text("Confirm")
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
                        } else {
                            HStack{
                                Spacer()
                                ProgressView()
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
                    }
                    Spacer()
                }.background(Color.marron, ignoresSafeAreaEdges: .all)
                    .alert(AlertMessage, isPresented: $ShowingAlert) {
                         Button("OK", role: .cancel) { }
                     }
            }
        }
    }
}

struct GovernmentSportsViewAddGame: View{
    @State var SelectedSport: String
    @State var SeasonName: Int
    @State var SelectedTeamName: String
    
    @State var CursadersScore: String = ""
    @State var OpponentScore: String = ""
    @State var Opponent: String = ""
    
    @State var SelectedLocation: String = "Home"
    
    let Loactions: [String] = ["Home", "Away"]
    
    @State var ConfirmLoading = false
    
    var body: some View{
        VStack{
            Text("Add Score")
            TextField("Crusaders Score", text: $CursadersScore)
            TextField("Oponent Score", text: $OpponentScore)
            TextField("Opponent", text: $Opponent)
            Picker("Locaition", selection: $SelectedLocation){
                ForEach(Loactions, id: \.self){
                    Text($0)
                }
            }
            Button(){
                if ConfirmLoading == false{
                    ConfirmLoading = true
                    var GameResult: String = "L"
                    if (Int(CursadersScore)! - 1) >= Int(OpponentScore)!{
                        GameResult = "W"
                    } else {
                        if (Int(OpponentScore)! - 1) >= Int(CursadersScore)! {
                            GameResult = "L"
                        } else {
                            GameResult = "T"
                        }
                    }
                    let inputData: [String:Any] = [
                        "CrusadersScore":Int(CursadersScore),
                        "OpponentScore":Int(OpponentScore),
                        "Opponent":Opponent,
                        "Location":SelectedLocation,
                        "Result":GameResult
                    ]
                    
                    let db = FirebaseFirestore.Firestore.firestore()

                    var docRef = db.collection("Sports").document("\(SelectedSport)").collection("Seasons").document("\(SeasonName)").collection("Teams").document(SelectedTeamName).collection("Scores").document("\(Date.now)")

                    docRef.setData(inputData) { error in
                        if let error = error {
                            print("Error writing document: \(error)")
                        } else {
                            ConfirmLoading = false
                        }
                    }
                }
            } label: {
                if ConfirmLoading{
                    ProgressView()
                    .frame(minWidth: 0, maxWidth: .infinity)
                    .padding()
                    .background(
                        RoundedRectangle(cornerRadius: 25)
                            .fill(Color.white)
                            .shadow(color: .gray, radius: 2, x: 0, y: 2)
                    )
                    .padding()
                } else {
                    HStack{
                        Text("Confirm")
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
            }
        }.background(Color.marron, ignoresSafeAreaEdges: .all)
    }
}

struct ScoreType{
    var id: UUID = UUID()
    let CursaderScore: Int
    let OpponentScore: Int
    let Opponent: String
    let Location: String
}

struct GovernmentSportsViewGame: View{
    @State var SelectedSport: String
    @State var SeasonName: Int
    @State var SelectedTeamName: String
    
    @State var AvaliableScores: [ScoreType] = []
    var body: some View{
        VStack{
            Text("Edit Scores")
            List{
                ForEach(AvaliableScores, id: \.id){ score in
                    HStack{
                        Text("\(score.Opponent) \(score.OpponentScore)")
                        Divider()
                        Text("Crusaders \(score.CursaderScore)")
                        Divider()
                        Text(score.Location)
                    }.swipeActions(edge: .trailing) {
                        Button(role: .destructive, action: { if let Index = AvaliableScores.firstIndex(where: { $0.id == score.id }) { AvaliableScores.remove(at: Index) } } ) {
                          Label("Delete", systemImage: "trash")
                        }
                      }
                }
            }.padding()
            .onAppear(){
                GetScores()
            }
            .scrollContentBackground(.hidden)
            NavigationLink(destination: GovernmentSportsViewAddGame(SelectedSport: SelectedSport, SeasonName: SeasonName, SelectedTeamName: SelectedTeamName)){
                HStack{
                    Text("Add Game")
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
        }.background(Color.marron, ignoresSafeAreaEdges: .all)
    }
    func GetScores() {
        Task{
            do{
                AvaliableScores = []
                let db = Firestore.firestore()
                
                let docRef = db.collection("Sports").document("\(SelectedSport)").collection("Seasons").document("\(SeasonName)").collection("Teams").document(SelectedTeamName).collection("Scores")
                
                docRef.getDocuments { (snapshot, error) in
                    guard let snapshot = snapshot, error == nil else {
                     //handle error
                     return
                   }
                   snapshot.documents.forEach({ (documentSnapshot) in
                       let documentData = documentSnapshot.data()
                       let CrusadersScore = documentData["CrusadersScore"] as? Int ?? -1
                       let OpponentScore = documentData["OpponentScore"] as? Int ?? -1
                       let Opponent = documentData["Opponent"] as? String ?? "Error"
                       let Location = documentData["Location"] as? String ?? "Error"
                       
                       AvaliableScores.append(ScoreType(CursaderScore: CrusadersScore, OpponentScore: OpponentScore, Opponent: Opponent, Location: Location))
                   })
                 }
            } catch {
                print("Error")
            }
        }
    }
}
