//
//  Sports.swift
//  Pauly Backend
//
//  Created by Andrew Mainella on 2023-03-25.
//

import Foundation
import SwiftUI
import FirebaseFirestore

struct SportsCreateScore: View{
    @Binding var SelectedSportsViewMode: SportViewModes
    @Binding var SelectedSport: String
    @Binding var SeasonName: Int
    @Binding var SelectedTeamName: String
    
    @State var CursadersScore: String = ""
    @State var OpponentScore: String = ""
    @State var Opponent: String = ""
    
    @State var SelectedLocation: String = "Home"
    
    let Loactions: [String] = ["Home", "Away"]
    
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
                        SelectedSportsViewMode = .TeamPage
                    }
                }
            } label: {
                Text("Confirm")
            }
            Button(){
                SelectedSportsViewMode = .TeamPage
            } label: {
                Text("Back")
            }
        }
    }
}

struct SportsAddTeamRosterView: View{
    @Binding var SelectedSportsViewMode: SportViewModes
    @Binding var SelectedSport: String
    @Binding var SeasonName: Int
    @Binding var SelectedTeamName: String
    
    @State var MemberName: String = ""
    @State var Role: String = "Player"
    let Roles: [String] = ["Coach", "Assistant Coach", "Assistant", "Player", "Point Guard", "Center", "Shooting Guard", "Power Forward", "Small Forward", "Golie", "Striker"]
    var body: some View{
        VStack{
            Text("Add Member")
            Picker("Position", selection: $Role){
                ForEach(Roles, id: \.self){
                    Text($0)
                }
            }
            TextField("Name", text: $MemberName)
            Button(){
                let inputData: [String:Any] = [
                    "Name":MemberName,
                    "Position":Role
                ]
                
                let db = FirebaseFirestore.Firestore.firestore()

                var docRef = db.collection("Sports").document("\(SelectedSport)").collection("Seasons").document("\(SeasonName)").collection("Teams").document(SelectedTeamName).collection("Roster").document(MemberName)

                docRef.setData(inputData) { error in
                    if let error = error {
                        print("Error writing document: \(error)")
                    } else {
                        SelectedSportsViewMode = .Roster
                    }
                }
            } label: {
                Text("Confirm")
            }
            Button(){
                SelectedSportsViewMode = .Roster
            } label: {
                Text("Back")
            }
        }
    }
}

struct RosterType{
    var Name: String
    var Position: String
}

struct SportsTeamRosterView: View{
    @Binding var SelectedSportsViewMode: SportViewModes
    @Binding var SelectedSport: String
    @Binding var SeasonName: Int
    @Binding var SelectedTeamName: String
    
    
    @State var Players: [RosterType] = []
    var body: some View{
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
                Button(){
                    SelectedSportsViewMode = .AddRoster
                } label: {
                    Text("Add Member")
                }
            }.padding()
            Button(){
                SelectedSportsViewMode = .TeamPage
            } label: {
                Text("Back")
            }
        }.onAppear(){
            GetRoster()
        }
    }
    func GetRoster() {
        Task{
            do{
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
                       let PlayerName = documentData["Name"] as? String ?? "Error"
                       let PlayerPosition = documentData["Position"] as? String ?? "Error"

                       Players.append(RosterType(Name: PlayerName, Position: PlayerPosition))
                   })
                 }
            } catch {
                print("Error")
            }
        }
    }
}

struct ScoreType{
    var id: UUID = UUID()
    let CursaderScore: Int
    let OpponentScore: Int
    let Opponent: String
    let Location: String
}

struct SportsTeamPageView: View {
    @Binding var SelectedSportsViewMode: SportViewModes
    var body: some View{
        VStack{
            Text("Team Page")
            Button(){
                SelectedSportsViewMode = .Scores
            } label: {
                Text("Change Score")
            }
            Button(){
                SelectedSportsViewMode = .Roster
            } label: {
                Text("Roster")
            }
            Button(){
                SelectedSportsViewMode = .Team
            } label: {
                Text("Back")
            }
        }
    }
}

struct SportsScoreView: View {
    @Binding var SelectedSportsViewMode: SportViewModes
    @Binding var SelectedSport: String
    @Binding var SeasonName: Int
    @Binding var SelectedTeamName: String
    
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
                    }
                }
                Button(){
                    SelectedSportsViewMode = .AddScore
                } label: {
                    Text("Add a new score")
                }
            }.padding()
            .onAppear(){
                GetScores()
            }
            Button(){
                SelectedSportsViewMode = .TeamPage
            } label: {
                Text("Back")
            }
        }
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

struct SportsAddTeamView: View{
    @State var SportsTeamName: String = ""
    
    @Binding var SeasonName: Int
    @Binding var SelectedSportsViewMode: SportViewModes
    @Binding var SelectedSport: String
    
    var body: some View{
        VStack{
            Text("Add Team")
            TextField("Team Name", text: $SportsTeamName)
            Button(){
                let inputData: [String:Any] = [
                    "TeamName":SportsTeamName
                ]
                
                let db = FirebaseFirestore.Firestore.firestore()

                let docRef = db.collection("Sports").document("\(SelectedSport)").collection("Seasons").document("\(SeasonName)").collection("Teams").document(SportsTeamName)

                docRef.setData(inputData) { error in
                    if let error = error {
                        print("Error writing document: \(error)")
                    } else {
                        SelectedSportsViewMode = .Edit
                    }
                }
            } label: {
                Text("Add Season")
            }
            Button(){
                SelectedSportsViewMode = .Team
            } label: {
                Text("Back")
            }
        }
    }
}

struct SportsTeamsView: View{
    @Binding var SelectedSportsViewMode: SportViewModes
    @Binding var SeasonName: Int
    @Binding var SelectedSport: String
    @Binding var SelectedTeamName: String
    
    @State var AvaliableTeams: [String] = []
    
    var body: some View{
        VStack{
            Text("Teams")
            List(){
                ForEach(AvaliableTeams, id: \.self){ team in
                    Button(){
                        SelectedTeamName = team
                        SelectedSportsViewMode = .TeamPage
                    } label: {
                        Text(team)
                    }
                }
                Button(){
                    SelectedSportsViewMode = .AddTeam
                } label: {
                    Text("Add Team")
                }
            }.padding()
            Button(){
                SelectedSportsViewMode = .Edit
            } label: {
                Text("Back")
            }
        }.onAppear(){
            GetTeams()
        }
    }
    func GetTeams() {
        Task{
            do{
                AvaliableTeams = []
                let db = Firestore.firestore()

                let docRef = db.collection("Sports").document(SelectedSport).collection("Seasons").document("\(SeasonName)").collection("Teams")
                
                docRef.getDocuments { (snapshot, error) in
                    guard let snapshot = snapshot, error == nil else {
                     //handle error
                     return
                   }
                   snapshot.documents.forEach({ (documentSnapshot) in
                       let documentData = documentSnapshot.data()
                       let Team = documentData["TeamName"] as? String ?? "Error"
                       
                       AvaliableTeams.append(Team)
                   })
                 }
            } catch {
                print("Error")
            }
        }
    }
}

struct SportsAddSeasonView: View{
    @State var SeasonName: String = ""
    
    @Binding var SelectedSportsViewMode: SportViewModes
    @Binding var SelectedSport: String
    
    var body: some View{
        VStack{
            Text("Add Season")
            TextField("Season Name", text: $SeasonName)
            Button(){
                let inputData: [String:Any] = [
                    "Season":Int(SeasonName)
                ]
                
                let db = FirebaseFirestore.Firestore.firestore()

                let docRef = db.collection("Sports").document("\(SelectedSport)").collection("Seasons").document(SeasonName)

                docRef.setData(inputData) { error in
                    if let error = error {
                        print("Error writing document: \(error)")
                    } else {
                        SelectedSportsViewMode = .Edit
                    }
                }
            } label: {
                Text("Add Season")
            }
            Button(){
                SelectedSportsViewMode = .Edit
            } label: {
                Text("Back")
            }
        }
    }
}

struct SportsEditView: View{
    @Binding var SelectedSportsViewMode: SportViewModes
    @Binding var SelectedSport: String
    @Binding var SeasonName: Int
    
    @State var AvaliableSeasons: [Int] = []
    
    var body: some View{
        VStack{
            Text("\(SelectedSport) Seasons")
            List(){
                ForEach(AvaliableSeasons, id: \.self){ season in
                    Button(){
                        SeasonName = season
                        SelectedSportsViewMode = .Team
                    } label: {
                        Text(verbatim: "\(season)")
                    }
                }
                Button(){
                    SelectedSportsViewMode = .AddSeason
                } label: {
                    Text("Add Season")
                }
            }.padding()
            Button(){
                SelectedSportsViewMode = .Select
            } label: {
                Text("Back")
            }
        }.onAppear(){
            GetSeasons()
        }
    }
    func GetSeasons() {
        do{
            AvaliableSeasons = []
            let db = Firestore.firestore()
            
            let docRef = db.collection("Sports").document(SelectedSport).collection("Seasons")
            docRef.getDocuments { (snapshot, error) in
                guard let snapshot = snapshot, error == nil else {
                 //handle error
                 return
               }
               snapshot.documents.forEach({ (documentSnapshot) in
                   let documentData = documentSnapshot.data()
                   let Season = documentData["Season"] as? Int ?? -1
                   AvaliableSeasons.append(Season)
                   print("This is avaliable Seasons \(AvaliableSeasons)")
               })
             }
        } catch {
            print("Error")
        }
    }
}

struct SportsViewSelect: View{
    @Binding var SelectedSportsViewMode: SportViewModes
    @Binding var SelectedSport: String
    
    @State var AvaliableSports: [String] = []
    var body: some View{
        VStack{
            Text("Sports View")
            List{
                ForEach(AvaliableSports, id: \.self){sport in
                    Button(){
                        SelectedSport = sport
                        SelectedSportsViewMode = .Edit
                    } label: {
                        Text(sport)
                    }
                }
                Button(){
                    SelectedSportsViewMode = .AddSport
                } label: {
                    Text("Add Sport")
                }
            }.onAppear(){
                GetSports()
            }.padding()
        }
    }
    func GetSports() {
        Task{
            do{
                AvaliableSports = []
                let db = Firestore.firestore()
                
                let docRef = db.collection("Sports")
                docRef.getDocuments { (snapshot, error) in
                    guard let snapshot = snapshot, error == nil else {
                     //handle error
                     return
                   }
                   snapshot.documents.forEach({ (documentSnapshot) in
                       let documentData = documentSnapshot.data()
                       let CourseNameNewUser = documentData["Name"] as? String
                       AvaliableSports.append(CourseNameNewUser ?? "Error")
                   })
                 }
            } catch {
                print("Error")
            }
        }
    }
}

struct SportsAddSportView: View{
    @Binding var SelectedSportsViewMode: SportViewModes
    @State var SportsName: String = ""
    var body: some View{
        Text("Add Sport")
        TextField("", text: $SportsName)
        Button(){
            let inputData: [String:Any] = [
                "Name":SportsName
            ]
            
            let db = FirebaseFirestore.Firestore.firestore()

            let docRef = db.collection("Sports").document("\(SportsName)")

            docRef.setData(inputData) { error in
                if let error = error {
                    print("Error writing document: \(error)")
                } else {
                    SelectedSportsViewMode = .Select
                }
            }
        } label: {
            Text("Add Sport")
        }
        Button(){
            SelectedSportsViewMode = .Select
        } label: {
            Text("Back")
        }
    }
}

enum SportViewModes{
    case Select
    case Edit
    case AddScore
    case AddSport
    case Scores
    case AddSeason
    case Team
    case AddTeam
    case TeamPage
    case Roster
    case AddRoster
}

struct SportsView: View{
    @State var SelectedSportsViewMode: SportViewModes = .Select
    @State var SelectedSport: String = ""
    @State var SeasonName: Int = 0
    @State var SelectedTeamName: String = ""
    
    var body: some View{
        switch SelectedSportsViewMode {
        case .Select:
            SportsViewSelect(SelectedSportsViewMode: $SelectedSportsViewMode, SelectedSport: $SelectedSport)
        case .Edit:
            SportsEditView(SelectedSportsViewMode: $SelectedSportsViewMode, SelectedSport: $SelectedSport, SeasonName: $SeasonName)
        case .AddScore:
            SportsCreateScore(SelectedSportsViewMode: $SelectedSportsViewMode, SelectedSport: $SelectedSport, SeasonName: $SeasonName, SelectedTeamName: $SelectedTeamName)
        case .AddSport:
            SportsAddSportView(SelectedSportsViewMode: $SelectedSportsViewMode)
        case .Scores:
            SportsScoreView(SelectedSportsViewMode: $SelectedSportsViewMode, SelectedSport: $SelectedSport, SeasonName: $SeasonName, SelectedTeamName: $SelectedTeamName)
        case .AddSeason:
            SportsAddSeasonView(SelectedSportsViewMode: $SelectedSportsViewMode, SelectedSport: $SelectedSport)
        case .Team:
            SportsTeamsView(SelectedSportsViewMode: $SelectedSportsViewMode, SeasonName: $SeasonName, SelectedSport: $SelectedSport, SelectedTeamName: $SelectedTeamName)
        case .AddTeam:
            SportsAddTeamView(SeasonName: $SeasonName, SelectedSportsViewMode: $SelectedSportsViewMode, SelectedSport: $SelectedSport)
        case .TeamPage:
            SportsTeamPageView(SelectedSportsViewMode: $SelectedSportsViewMode)
        case .Roster:
            SportsTeamRosterView(SelectedSportsViewMode: $SelectedSportsViewMode, SelectedSport: $SelectedSport, SeasonName: $SeasonName, SelectedTeamName: $SelectedTeamName)
        case .AddRoster:
            SportsAddTeamRosterView(SelectedSportsViewMode: $SelectedSportsViewMode, SelectedSport: $SelectedSport, SeasonName: $SeasonName, SelectedTeamName: $SelectedTeamName)
        }
    }
}
