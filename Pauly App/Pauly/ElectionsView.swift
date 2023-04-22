//
//  ElectionsView.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-04-20.
//

import SwiftUI
import FirebaseFirestore

enum ElectionsModeEnum{
    case Past
    case Ongoing
    case Upcoming
}

struct ElectionsView: View {
    @Binding var selectedProfileView: profileViewEnum
    @State var AvaliableElections: [ElectionType] = []
    @State var ElectionsLoading: Bool = true
    @State var ElectionsMode: ElectionsModeEnum = .Ongoing
    var body: some View {
        GeometryReader{ geo in
            NavigationView(){
                if ElectionsLoading{
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
                    Spacer()
                    ProgressView()
                        .onAppear(){
                            GetElections()
                        }
                    Spacer()
                } else {
                    ZStack{
                        Rectangle()
                            .fill(Color.marron)
                            .ignoresSafeArea()
                        VStack{
                            Image("Elections")
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                            ScrollView{
                                VStack{
                                    ForEach(AvaliableElections, id: \.ElectionID) { election in
                                        switch ElectionsMode{
                                        case .Ongoing:
                                            if election.EndDate >= Date.now{
                                                NavigationLink(destination: ElectionsInfoView(SelectedElection: election)){
                                                    HStack{
                                                        Text(election.ElectionName)
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
                                        case .Past:
                                            if election.EndDate <= Date.now{
                                                NavigationLink(destination: ElectionsInfoView(SelectedElection: election)){
                                                    HStack{
                                                        Text(election.ElectionName)
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
                                        case .Upcoming:
                                            if election.StartDate >= Date.now {
                                                NavigationLink(destination: ElectionsInfoView(SelectedElection: election)){
                                                    HStack{
                                                        Text(election.ElectionName)
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
                                    }
                                }.frame(maxHeight: .infinity)
                            }.frame(height: geo.size.height * 0.7)
                            HStack{
                                Spacer()
                                GeometryReader{ TabGeo in
                                    HStack{
                                        Spacer()
                                        Button(){
                                            withAnimation(.spring(response: 0.3, dampingFraction: 0.7)){
                                                ElectionsMode = .Past
                                            }
                                        } label: {
                                            VStack{
                                                if ElectionsMode == .Past{
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
                                                ElectionsMode = .Ongoing
                                            }
                                        } label: {
                                            VStack{
                                                if ElectionsMode == .Ongoing{
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
                                                ElectionsMode = .Upcoming
                                            }
                                        } label: {
                                            VStack{
                                                if ElectionsMode == .Upcoming{
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
                                        .background(
                                            RoundedRectangle(cornerRadius: 30)
                                                .fill(Color.white)
                                                .shadow(color: .gray, radius: 2, x: 0, y: 2)
                                        )
                                        .padding()
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    func GetElections() {
        let db = Firestore.firestore()
        
        db.collection("Elections").getDocuments(){ (snapshot, error) in
            guard let snapshot = snapshot, error == nil else {
                      //handle error
                      return
                    }
              
            snapshot.documents.forEach({ (documentSnapshot) in
                let documentData = documentSnapshot.data()
                
                guard let ElectionID = documentData["FirebaseID"] as? String else {
                    return
                }
                
                guard let ElectionName = documentData["Election Name"] as? String else {
                    return
                }
                guard let ParticipantMode = documentData["participantsMode"] as? Int else {
                    return
                }
                guard let StartDate = documentData["StartDate"] as? Timestamp else {
                    return
                }
                guard let EndDate = documentData["EndDate"] as? Timestamp else {
                    return
                }
                guard let Hidden = documentData["Hidden"] as? Bool else {
                    return
                }
                db.collection("Elections").document(documentSnapshot.documentID).collection("Canadates").getDocuments(){ (snapshot, error) in
                    var SelectedCanadates: [CanadateType] = []
                    guard let snapshot = snapshot, error == nil else {
                        //handle error
                        return
                    }
                    
                    
                    snapshot.documents.forEach({ (documentSnapshot) in
                        let documentDataCanadates = documentSnapshot.data()
                        guard let CanadateName = documentDataCanadates["Name"] as? String else {
                            return
                        }
                        guard let CanadateVotes = documentDataCanadates["Votes"] as? [String] else {
                            return
                        }
                        guard let CanadteFirebaseID = documentDataCanadates["FirebaseID"] as? String else {
                            return
                        }
                        SelectedCanadates.append(CanadateType(Name: CanadateName, Votes: CanadateVotes, CanidateID: CanadteFirebaseID))
                    })
                    print(SelectedCanadates)
                    if ParticipantMode == 1{
                        guard let selectedGrade = documentData["SelectedGrade"] as? Int else {
                            return
                        }
                        AvaliableElections.append(ElectionType(ElectionID: ElectionID, ElectionName: ElectionName, participantsMode: ParticipantMode, StartDate: StartDate.dateValue(), EndDate: EndDate.dateValue(), Hidden: Hidden, Canadates: SelectedCanadates, SelectedGrade: selectedGrade, SelectedUsers: nil, SelectedClass: nil))
                    } else {
                        if ParticipantMode == 3{
                            guard let SelectedClass = documentData["SelectedClass"] as? String else {
                                return
                            }
                            AvaliableElections.append(ElectionType(ElectionID: ElectionID, ElectionName: ElectionName, participantsMode: ParticipantMode, StartDate: StartDate.dateValue(), EndDate: EndDate.dateValue(), Hidden: Hidden, Canadates: SelectedCanadates, SelectedGrade: nil, SelectedUsers: nil, SelectedClass: SelectedClass))
                        } else {
                            guard let SelectedUsers = documentData["SelectedUsers"] as? NSArray as? [String] else {
                                return
                            }
                            AvaliableElections.append(ElectionType(ElectionID: ElectionID, ElectionName: ElectionName, participantsMode: ParticipantMode, StartDate: StartDate.dateValue(), EndDate: EndDate.dateValue(), Hidden: Hidden, Canadates: SelectedCanadates, SelectedGrade: nil, SelectedUsers: SelectedUsers, SelectedClass: nil))
                        }
                    }
                }
            })
            ElectionsLoading = false
        }
    }
}


struct ElectionsInfoView: View{
    @State var SelectedElection: ElectionType
    var body: some View{
        ZStack{
            Rectangle()
                .foregroundColor(Color.marron)
                .ignoresSafeArea()
            VStack{
                Text("Election")
                ScrollView{
                    ForEach(SelectedElection.Canadates, id: \.ID){ canadte in
                        HStack{
                            Text(canadte.Name)
                            Button(){
                                
                            } label: {
                                Text("Vote")
                            }
                        }
                    }
                }
            }
        }.onAppear(){
            print(SelectedElection.Canadates.description)
        }
    }
}
