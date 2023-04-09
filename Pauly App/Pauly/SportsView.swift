//
//  SportsView.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-03-16.
//

import Foundation
import SwiftUI
import FirebaseFirestore

struct ScoresView: View{
    @Binding var SelectedSport: String
    var body: some View{
        Text("Scores")
    }
}

struct Crusaders: View{
    @Binding var SelectedSport: String
    var body: some View{
        Text("Crusaders")
    }
}

struct SportsCardsType{
    var id: UUID = UUID()
    var CrusadersScore: Int
    var OpponentScore: Int
    var Location: String
    var Opponent: String
}


struct TeamMemberType{
    let id: UUID = UUID()
    let Name:String
    let Position:String
}

struct AvaliableTeamType: Hashable{
    let id: UUID = UUID()
    let Name: String
    let PageInfo: [Int]
}

struct InSportView: View{
    @Binding var SelectedSport: String
    
    let Modes: [String] = ["Crusaders", "Scores", "Roster"]
    @State var SelectedMode: String = "Crusaders"
    @State var SportsCards: [SportsCardsType] = []
    
    @State var SelectedSeason: Int = 2023
    @State var AvaliableSeasons: [Int] = []
    @State var SelectedTeam: AvaliableTeamType = AvaliableTeamType(Name: "", PageInfo: [])
    @State var AvaliableTeams: [AvaliableTeamType] = []
    
    @State var Roster: [TeamMemberType] = []
    
    @State var AvaliableCards: [CardType] = []
    
    @Binding var accessToken: String?
    
    var body: some View{
        GeometryReader{ geo in
            VStack{
                Picker("", selection: $SelectedMode){
                    ForEach(Modes, id: \.self){
                        Text($0)
                    }
                }.pickerStyle(.segmented)
                if SelectedMode == "Crusaders"{
                    ScrollView{
                        VStack{
                            ForEach(AvaliableCards, id: \.id) { card in
                                Card(TextColor: Color.black, accessToken: $accessToken, SelectedCard: card)
                                    .frame(width: geo.size.width * 0.9, height: geo.size.height * 0.3)
                                    .cornerRadius(25)
                            }
                        }
                    }
                } else {
                    if SelectedMode == "Scores"{
                        if SportsCards.count != 0 {
                            List(SportsCards, id: \.id) { card in
                                HStack{
                                    Text("Crusaders: \(card.CrusadersScore)")
                                    Text("\(card.Opponent): \(card.OpponentScore)")
                                    Text(card.Location)
                                }
                            }.scrollContentBackground(.hidden)
                            .background(Color.marron)
                        } else {
                            Spacer()
                            ProgressView()
                            Spacer()
                        }
                    } else {
                        if Roster.count != 0 {
                            List(Roster, id: \.id) { player in
                                HStack{
                                    Text(player.Name)
                                    Text(player.Position)
                                }
                            }.scrollContentBackground(.hidden)
                            .background(Color.marron)
                        } else {
                            Spacer()
                            ProgressView()
                            Spacer()
                        }
                    }
                }
                HStack{
                    Picker("", selection: $SelectedSeason){
                        ForEach(AvaliableSeasons, id: \.self) { card in
                            Text(verbatim: "\(card)")
                        }
                    }.onAppear(){
                        SelectedSeason = AvaliableSeasons.max() ?? 2023
                    }
                    Picker("", selection: $SelectedTeam){
                        ForEach(AvaliableTeams, id: \.id){
                            Text($0.Name)
                        }
                    }
                }
            }.onAppear(){
                FindSeasons()
            }
            .onChange(of: SelectedSport){ value in
                AvaliableSeasons = []
                AvaliableTeams = []
                Roster = []
                SportsCards = []
                FindSeasons()
        
            }
            .onChange(of: SelectedTeam){ value in
                FindGames()
                FindRoster()
                Functions().GetCardData(CardIds: SelectedTeam.PageInfo) { (cards) in
                    AvaliableCards = cards
                }
            }
        }
    }
    func FindRoster() {
        Task{
            do{
                Roster = []
                let db = Firestore.firestore()
                
                let docRef = db.collection("Sports").document(SelectedSport).collection("Seasons").document("\(SelectedSeason)").collection("Teams").document(SelectedTeam.Name).collection("Roster")
                docRef.getDocuments { (snapshot, error) in
                    guard let snapshot = snapshot, error == nil else {
                     //handle error
                     return
                   }
                   snapshot.documents.forEach({ (documentSnapshot) in
                       let documentData = documentSnapshot.data()
                       let Name = documentData["Name"] as? String ?? "Error"
                       let Position = documentData["Position"] as? String ?? "Error"
                       
                       Roster.append(TeamMemberType(Name: Name, Position: Position))
                   })
                 }
            } catch {
                print("Error")
            }
        }
    }
    func FindGames() {
        Task{
            do{
                SportsCards = []
                let db = Firestore.firestore()
                
                let docRef = db.collection("Sports").document(SelectedSport).collection("Seasons").document("\(SelectedSeason)").collection("Teams").document(SelectedTeam.Name).collection("Scores")
                docRef.getDocuments { (snapshot, error) in
                    guard let snapshot = snapshot, error == nil else {
                     //handle error
                     return
                   }
                   snapshot.documents.forEach({ (documentSnapshot) in
                       let documentData = documentSnapshot.data()
                       let CrusaderScore = documentData["CrusadersScore"] as? Int ?? 0
                       let OpponentScore = documentData["OpponentScore"] as? Int ?? 0
                       let Location = documentData["Location"] as? String ?? "Error"
                       let Opponent = documentData["Opponent"] as? String ?? "Error"
                       
                       SportsCards.append(SportsCardsType(CrusadersScore: CrusaderScore, OpponentScore: OpponentScore, Location: Location, Opponent: Opponent))
                   })
                 }
            } catch {
                print("Error")
            }
        }
    }
    func FindSeasons(){
        Task{
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
                       let SeasonSeason = documentData["Season"] as? Int ?? 0
                       
                       AvaliableSeasons.append(SeasonSeason)
                    })
                    FindTeams()
                    
                 }
            } catch {
                print("Error")
            }
        }
    }
    func FindTeams(){
        Task{
            do{
                AvaliableTeams = []
                let db = Firestore.firestore()

                let docRef = db.collection("Sports").document(SelectedSport).collection("Seasons").document("\(SelectedSeason)").collection("Teams")
                docRef.getDocuments { (snapshot, error) in
                    guard let snapshot = snapshot, error == nil else {
                     //handle error
                     return
                    }
                    snapshot.documents.forEach({ (documentSnapshot) in
                       let documentData = documentSnapshot.data()
                       let TeamTeamName = documentData["TeamName"] as? String ?? "Error"
                        guard let PageDataArray = documentData["PageInfo"] as? NSArray else {
                            return
                        }
                        let PageData = PageDataArray as? [Int] ?? []
                        AvaliableTeams.append(AvaliableTeamType(Name:  TeamTeamName, PageInfo: PageData))
                    })
                    if AvaliableTeams.count != 0{
                        SelectedTeam = AvaliableTeams[0]
                    }
                }
            } catch {
                print("Error")
            }
        }
    }
}

struct HighlightView: View{

    @Binding var accessToken: String?
    
    @State var Cards: [Int] = []
    @State var AvaliableCards: [CardType] = []
    
    var body: some View{
        GeometryReader{ geo in
            ScrollView{
                VStack(alignment: .center){
                    ForEach(AvaliableCards, id: \.id) { card in
                        HStack{
                            Spacer()
                            Card(TextColor: Color.black, accessToken: $accessToken, SelectedCard: card)
                                .frame(width: geo.size.width * 0.9, height: geo.size.height * 0.3, alignment: .center)
                                .cornerRadius(25)
                            Spacer()
                        }
                    }
                }
            }.onAppear(){
                FetchCardIDs()
            }
        }
    }
    func FetchCardIDs(){
        Task{
            do{
                Cards = []
                let db = Firestore.firestore()
                
                let docRef = db.collection("Sports").document("Highlights")
                docRef.getDocument { (document, error) in
                    guard error == nil else {
                        return
                    }

                    if let document = document, document.exists {
                        let data = document.data()
                        if let data = data {
                            guard let CardIds = data["PageInfo"] as? NSArray else {
                                return
                            }
                            Cards = CardIds as? [Int] ?? []
                            Functions().GetCardData(CardIds: Cards) { (cards) in
                                AvaliableCards = cards
                            }
                        }
                    }
                }
            } catch {
                print("Error")
            }
        }
    }
}

struct ButtonViewSports: View{
    @Binding var SelectedSport: String
    
    @State var GeoSize: CGSize
    @State var TextSize: CGSize = CGSize(width: 0.0, height: 0.0)

    let SportName: String
    var body: some View{
        ZStack{
            Rectangle()
                .foregroundColor(SportName == SelectedSport ? .red : .white)
                .frame(width: (GeoSize.width * 0.3 + TextSize.width), height:  GeoSize.height * 0.06)
                .cornerRadius(25)
            Text("\(SportName)")
                .foregroundColor(.black)
                .saveSize(in: $TextSize)
        }
    }
}

struct SportsView: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    let Sports: [String] = ["Highlights", "Badminton", "Basketball", "Beach Volleyball", "Cross Country", "Curling", "Football", "Golf", "Hockey", "Rugby", "Soccer", "Track & Field", "Ultimate Frisbee", "Volleyball", "Wrestling"]
    @State var SelectedSport: String = "Highlights"
    @State var ShowingTitle: Bool = true
    @Binding var accessToken: String?
    var body: some View{
        GeometryReader{ geo in
            ZStack{
                Rectangle()
                    .fill(Color.marron)
                    .edgesIgnoringSafeArea(.all)
                VStack{
                    if ShowingTitle{
                        ZStack{
                            Image("SportsSPHS")
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                            VStack{
                                HStack{
                                    Button{
                                        WindowMode.SelectedWindowMode = .HomePage
                                    } label: {
                                        HStack{
                                            Image(systemName: "chevron.backward")
                                            Text("Back")
                                        }
                                    }.padding(.leading)
                                    Spacer()
                                }
                                Spacer()
                            }
                        }.frame(height: geo.size.height * 0.2)
                    } else {
                        HStack{
                            Button{
                                WindowMode.SelectedWindowMode = .HomePage
                            } label: {
                                HStack{
                                    Image(systemName: "chevron.backward")
                                    Text("Back")
                                }
                            }.padding(.leading)
                            Spacer()
                        }
                    }
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack {
                            Spacer(minLength: geo.size.width * 0.1)
                            ForEach(Sports, id: \.self) { sport in
                                Button(){
                                    if sport == "Highlights"{
                                        ShowingTitle = true
                                    } else {
                                        ShowingTitle = false
                                    }
                                    SelectedSport = sport
                                } label: {
                                    ButtonViewSports(SelectedSport: $SelectedSport, GeoSize: geo.size, SportName: sport)
                                }
                            }
                            Spacer(minLength: geo.size.width * 0.1)
                        }
                    }.padding()
                    .offset(y: -(geo.size.height * 0.015))
                    .mask(
                        GeometryReader{ maskgeo in
                            HStack(spacing: 0) {

                                // Left gradient
                                LinearGradient(gradient:
                                   Gradient(
                                    colors: [Color.black.opacity(1.0), Color.clear]),
                                               startPoint: .trailing, endPoint: .leading
                                   )

//                                 Middle
                                Rectangle().fill(Color.black)
                                    .frame(width: maskgeo.size.width * 0.7, height: maskgeo.size.height * 0.93)
                            

                                // Right gradient
                                LinearGradient(gradient:
                                   Gradient(
                                    colors: [Color.black.opacity(1.0), Color.clear]),
                                       startPoint: .leading, endPoint: .trailing
                                   )
                            }
                        }
                        )
                    if SelectedSport == "Highlights"{
                        HighlightView(accessToken: $accessToken)
                    } else {
                        InSportView(SelectedSport: $SelectedSport, accessToken: $accessToken)
                    }
                    Spacer()
                }
            }
        }
    }
}

#if DEBUG
struct ReminderRowPreview: PreviewProvider {
    static var previews: some View {
        SportsView(accessToken: .constant("Stop"))
    }
}
#endif
