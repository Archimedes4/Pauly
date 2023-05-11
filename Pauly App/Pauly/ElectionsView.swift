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
    @EnvironmentObject var WindowMode: SelectedWindowMode
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
                        VStack(spacing: 0){
                            HStack{
                                Image("Elections")
                                    .resizable()
                                    .aspectRatio(contentMode: .fit)
                                    .ignoresSafeArea()
                                Spacer()   
                            } .frame(height: geo.size.height * 0.2)
                            ScrollView{
                                VStack{
                                    if AvaliableElections.count >= 1{
                                        ForEach(AvaliableElections, id: \.ElectionID) { election in
                                            switch ElectionsMode{
                                            case .Ongoing:
                                                if election.EndDate >= Date.now{
                                                    NavigationLink(destination: ElectionsInfoView(SelectedElection: election)   .environmentObject(WindowMode)){
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
                                                    NavigationLink(destination: ElectionsInfoView(SelectedElection: election).environmentObject(WindowMode)){
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
                                    } else {
                                        Text("There are currently no elections")
                                            .padding([.leading, .trailing])
                                    }
                                }.frame(maxHeight: .infinity)
                            }.frame(height: geo.size.height * 0.5)
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
                                        .padding([.bottom], 20)
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
                        if selectedGrade == WindowMode.GradeIn{
                            AvaliableElections.append(ElectionType(ElectionID: ElectionID, ElectionName: ElectionName, participantsMode: ParticipantMode, StartDate: StartDate.dateValue(), EndDate: EndDate.dateValue(), Hidden: Hidden, Canadates: SelectedCanadates, SelectedGrade: selectedGrade, SelectedUsers: nil, SelectedClass: nil))
                        }
                    } else {
                        if ParticipantMode == 3{
                            guard let SelectedClass = documentData["SelectedClass"] as? String else {
                                return
                            }
                            let outputarray = SelectedClass.split(separator: "-")
                            let OutputCorses = CourseSelectedType(Name: String(outputarray[1]), Section: Int(outputarray[2])!, Year: Int(outputarray[3])!, Grade: Int(outputarray[0])!)
                            
                            if WindowMode.SelectedCourses.contains(where: { $0.Grade == OutputCorses.Grade && $0.Name == OutputCorses.Name && $0.Section == OutputCorses.Section && $0.Year == OutputCorses.Year }){
                                AvaliableElections.append(ElectionType(ElectionID: ElectionID, ElectionName: ElectionName, participantsMode: ParticipantMode, StartDate: StartDate.dateValue(), EndDate: EndDate.dateValue(), Hidden: Hidden, Canadates: SelectedCanadates, SelectedGrade: nil, SelectedUsers: nil, SelectedClass: SelectedClass))
                            }
                        } else {
                            guard let SelectedUsers = documentData["SelectedUsers"] as? NSArray as? [String] else {
                                return
                            }
                            if SelectedUsers.contains(WindowMode.UsernameIn){
                                AvaliableElections.append(ElectionType(ElectionID: ElectionID, ElectionName: ElectionName, participantsMode: ParticipantMode, StartDate: StartDate.dateValue(), EndDate: EndDate.dateValue(), Hidden: Hidden, Canadates: SelectedCanadates, SelectedGrade: nil, SelectedUsers: SelectedUsers, SelectedClass: nil))
                            }
                        }
                    }
                }
            })
            ElectionsLoading = false
        }
    }
}

struct PieCanadatesType {
    let Name: String
    let CanadateColor: Color
    let Votes: Int
}

struct ElectionsInfoView: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @State var SelectedElection: ElectionType
    @State var Canadates: [PlottableValue] = []
    @State private var pie = PieChart()
    @State var UserCompletedVoting: [String] = []
    var body: some View{
        GeometryReader{ geo in
            ZStack{
                Rectangle()
                    .foregroundColor(Color.marron)
                    .ignoresSafeArea()
                VStack{
                    Image("Elections")
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .onAppear(){
                            let SortedCanadates = SelectedElection.Canadates.sorted(by: { $0.Votes.count > $1.Votes.count })
                            var TempCanadtes: [PlottableValue] = []
                            for x in SortedCanadates{
                                TempCanadtes.append(PlottableValue(name: x.Name, value: Double(x.Votes.count), color: Color.random()))
                            }
                            Canadates = TempCanadtes
                        }
                    pie.chart(Canadates, legend: .trailing)
                        .frame(width: geo.size.width * 0.8, height: geo.size.height * 0.4, alignment: .center)
                    ScrollView{
                        ForEach(SelectedElection.Canadates, id: \.ID) { canadate in
                            VStack{
                                HStack{
                                    Text(canadate.Name)
                                        .font(.system(size: 17))
                                        .fontWeight(.bold)
                                        .foregroundColor(.black)
                                        .padding(.leading)
                                    Spacer()
                                }
                                HStack{
                                    Text("Votes: \(canadate.Votes.count)")
                                        .padding(.leading)
                                    Spacer()
                                }
                            }
                            .frame(minWidth: 0, maxWidth: .infinity)
                            .background(
                                RoundedRectangle(cornerRadius: 25)
                                    .fill(Color.white)
                                    .shadow(color: .gray, radius: 2, x: 0, y: 2)
                            )
                            .padding()
                        }
                    }
                    if UserCompletedVoting.contains(SelectedElection.ElectionID){
                        HStack{
                            Text("You have already voted")
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
                                .fill(Color.gray)
                                .shadow(color: .white, radius: 2, x: 0, y: 2)
                        )
                        .padding()
                    } else {
                        NavigationLink(destination: ElectionsVoteView(SelectedElection: $SelectedElection, UserCompletedVoting: $UserCompletedVoting).environmentObject(WindowMode)){
                            HStack{
                                Text("VOTE")
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
            }.onAppear(){
                GetUserVoted()
            }
        }
    }
    func GetUserVoted() {
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
                    guard let CommissionsCompleted = data["ElectionsVoted"] as? NSArray as? [String] else {
                        print("Retuened efhskjbdfmnjlvshbfkndiouegrhwikljoihfjvoiuhbjafjdoushbjvskdoiuhvjkoiuhbjkjlbjhiuo")
                        return
                    }
                    UserCompletedVoting = CommissionsCompleted
                }
            }
        }
    }
}

public extension Color {

    static func random(randomOpacity: Bool = false) -> Color {
        Color(
            red: .random(in: 0...1),
            green: .random(in: 0...1),
            blue: .random(in: 0...1),
            opacity: randomOpacity ? .random(in: 0...1) : 1
        )
    }
}

struct ElectionsVoteView: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @Binding var SelectedElection: ElectionType
    @Environment(\.presentationMode) var presentationMode
    @State var VoteLoading: Bool = false
    @State var showingAlert: Bool = false
    @Binding var UserCompletedVoting: [String]
    var body: some View{
        ZStack{
            Rectangle()
                .foregroundColor(.marron)
                .ignoresSafeArea()
            VStack{
                Text("Vote")
                ScrollView{
                    ForEach(SelectedElection.Canadates, id: \.ID){ canadte in
                        HStack{
                            Text(canadte.Name)
                                .font(.system(size: 17))
                                .fontWeight(.bold)
                                .foregroundColor(.black)
                            Spacer()
                            Button(){
                                if VoteLoading == false{
                                    VoteLoading = true
                                    let db = Firestore.firestore()
                                    let docRef = db.collection("Elections").document(SelectedElection.ElectionID).collection("Canadates").document(canadte.CanidateID)
                                    docRef.updateData(["Votes":FieldValue.arrayUnion([WindowMode.UsernameIn])]){ error in
                                        if error == nil{
                                            db.collection("Users").document(WindowMode.UsernameIn).updateData(["ElectionsVoted":FieldValue.arrayUnion([SelectedElection.ElectionID])]){ err in
                                                if err == nil{
                                                    self.presentationMode.wrappedValue.dismiss()
                                                } else {
                                                    print(error)
                                                    UserCompletedVoting.append(SelectedElection.ElectionID)
                                                    if let Index = SelectedElection.Canadates.firstIndex(where: { $0.CanidateID == canadte.CanidateID }){
                                                        SelectedElection.Canadates[Index].Votes.append(WindowMode.UsernameIn)
                                                    }
                                                    showingAlert = true
                                                }
                                            }
                                        } else {
                                            print(error)
                                            showingAlert = true
                                        }
                                    }
                                }
                            } label: {
                                if VoteLoading{
                                    ProgressView()
                                } else {
                                    Text("Vote")
                                }
                            }
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
                    .alert(isPresented: $showingAlert) {
                         Alert(title: Text("Error"), message: Text("An Error Has Occured"), dismissButton: .default(Text("OK")))
                     }
                }
                .navigationBarBackButtonHidden(true)
                .navigationBarItems(leading:
                           Button(action: {
                               self.presentationMode.wrappedValue.dismiss()
                           }) {
                               HStack {
                                   Image(systemName: "arrow.left.circle")
                                   Text("Go Back")
                               }
                       })
            }
        }
    }
}
