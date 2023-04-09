//
//  GovernmentView.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-04-06.
//

import SwiftUI
import FirebaseAuth
import FirebaseFirestore

enum GovernmentViewModes{
    case Home
    case President
    case Calendar
    case Election
    case Sports
    case Cards
    case Resources
    case Commissions
    case ClassView
}

struct GovernmentView: View {
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @Binding var selectedProfileView: profileViewEnum
    @Binding var accessToken: String?
    @State var SelectedGovernmentViewMode: GovernmentViewModes = .Home
    var body: some View {
        switch SelectedGovernmentViewMode {
        case .Home:
            GovernmentHomeView(selectedProfileView:  $selectedProfileView, SelectedGovernmentViewMode: $SelectedGovernmentViewMode)
        case .President:
            GovernmentPresedentView(SelectedGovernmentViewMode:  $SelectedGovernmentViewMode)
        case .Calendar:
            GovernmentCalendarView(SelectedGovernmentViewMode:  $SelectedGovernmentViewMode)
        case .Election:
            GovernmentElectionsView(SelectedGovernmentViewMode:  $SelectedGovernmentViewMode)
        case .Sports:
            GovernmentSportsView(SelectedGovernmentViewMode:  $SelectedGovernmentViewMode)
        case .Cards:
            GovernmentCardView(SelectedGovernmentViewMode:  $SelectedGovernmentViewMode, accessToken: $accessToken)
        case .Resources:
            GovernmentResourcesView(SelectedGovernmentViewMode:  $SelectedGovernmentViewMode)
        case .Commissions:
            GovernmentCommissionsView(SelectedGovernmentViewMode:  $SelectedGovernmentViewMode)
                .environmentObject(WindowMode)
        case .ClassView:
            GovernmentClassView(SelectedGovernmentViewMode: $SelectedGovernmentViewMode)
                .environmentObject(WindowMode)
        }
    }
}

struct GovernmentButtonType{
    let id: UUID = UUID()
    let Name: String
    let Image: String
    let Permission: Int
    let Destination: GovernmentViewModes
}

struct GovernmentHomeView: View{
    @Binding var selectedProfileView: profileViewEnum
    @Binding var SelectedGovernmentViewMode: GovernmentViewModes
    @State var TextSize: CGSize = CGSize(width: 0, height: 0)
    let GovernmentButtons: [GovernmentButtonType] = [GovernmentButtonType(Name: "Presedent", Image: "crown", Permission: 12, Destination: .President), GovernmentButtonType(Name: "Calendar", Image: "calendar", Permission: 13, Destination: .Calendar), GovernmentButtonType(Name: "Elections", Image: "checkmark", Permission: 14, Destination: .Election), GovernmentButtonType(Name: "Sports", Image: "football.fill", Permission: 15, Destination: .Sports), GovernmentButtonType(Name: "Cards", Image: "menucard", Permission: 16, Destination: .Cards), GovernmentButtonType(Name: "Resources", Image: "filemenu.and.selection", Permission: 17, Destination: .Resources), GovernmentButtonType(Name: "Commissions", Image: "star", Permission: 18, Destination: .Commissions), GovernmentButtonType(Name: "Class", Image: "graduationcap", Permission: 19, Destination: .ClassView)]
    @State var UserPermissions: [Int] = []
    var body: some View{
        ZStack{
            ContainerRelativeShape()
                .ignoresSafeArea()
                .foregroundColor(Color.marron)
            ScrollView{
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
                    Text("Government")
                    ForEach(GovernmentButtons, id: \.id){ GovernmentButton in
                        if UserPermissions.contains(GovernmentButton.Permission){
                            Button(){
                                    SelectedGovernmentViewMode = GovernmentButton.Destination
                            } label: {
                                HStack{
                                    Image(systemName: GovernmentButton.Image)
                                        .resizable()
                                        .aspectRatio(contentMode: .fit)
                                        .foregroundColor(.black)
                                        .frame(height: TextSize.height)
                                    Text(GovernmentButton.Name)
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
                    }
                }.background(Color.marron)
            }.onAppear(){
                getUserPerms()
            }
        }
    }
    func getUserPerms() {
        UserPermissions = []
        
        guard let userUID = Auth.auth().currentUser?.uid else {
            return
        }
        let db = Firestore.firestore()
        
        let docRef = db.collection("Users").document(userUID)
        
        docRef.getDocument { (document, error) in
            guard error == nil else {
                print("error", error ?? "")
                return
            }
            
            if let document = document, document.exists {
                let data = document.data()
                if let data = data{
                    guard let CommissionsComplete = data["Permissions"] as? NSArray as? [Int] else {
                        return
                    }
                    UserPermissions = CommissionsComplete
                }
            }
        }
    }
}

struct GovernmentPresedentView: View{
    @Binding var SelectedGovernmentViewMode: GovernmentViewModes
    @State var AnimationSpeed: Double = 0
    @State var Headermessage: String = ""
    var body: some View{
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
            }.padding(.top)
            .padding(.top)
            Text("Presedent")
                .font(.largeTitle)
            Text("Animation Speed: \(AnimationSpeed)")
            Slider(value: $AnimationSpeed, in: 0...100)
                .padding()
            TextField("Header Message", text: $Headermessage)
                .padding()
                .onAppear(){
                    let db = Firestore.firestore()
                    
                    let docRef = db.collection("PaulyInfo").document("Info")
                    
                    docRef.getDocument(){ (document, error) in
                        guard error == nil else {
                            print("error", error ?? "")
                            return
                        }

                        if let document = document, document.exists {
                            let data = document.data()
                            if let data = data {
                                Headermessage = data["Message"] as! String
                                AnimationSpeed = data["AnimationSpeed"] as! Double
                            }
                        }
                    }
                }
            Button(){
                let db = Firestore.firestore()
                
                let docRef = db.collection("PaulyInfo").document("Info")
                
                docRef.updateData(["AnimationSpeed":AnimationSpeed, "Message":Headermessage])
            } label: {
                Text("Confirm")
            }
            Spacer()
        }.background(Color.marron)
        .ignoresSafeArea()
    }
}

struct GovernmentCalendarView: View{
    @Binding var SelectedGovernmentViewMode: GovernmentViewModes
    @State var DaysInMonth: [Int] = []
    let Years: [Int] = [23,24,25,26,27,28,29,30,31,32,33]
    @State var SelectedMonth: Int = 1
    @State var SelectedDay: Int = 1
    @State var SelectedYear: Int = 23
    @State var SelectedValue: Int = 0
    @State var SchoolDay: String = "A"
    let SchoolDays: [String] = ["A", "B", "C", "D"]
    var body: some View{
        ZStack{
            Rectangle()
                .foregroundColor(.marron)
                .ignoresSafeArea()
            ScrollView{
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
                    Spacer()
                    Text("Calendar")
                        .font(.title)
                        .padding()
                    VStack(){
                        
                        Group{
                            Picker("Please choose a Month", selection: $SelectedMonth) {
                                Text("January").tag(1)
                                Text("Febuary").tag(2)
                                Text("March").tag(3)
                                Text("April").tag(4)
                                Text("May").tag(5)
                                Text("June").tag(6)
                                Text("July").tag(7)
                                Group{
                                    Text("Auguest").tag(8)
                                    Text("September").tag(9)
                                    Text("October").tag(10)
                                    Text("November").tag(11)
                                    Text("December").tag(12)
                                }
                            }
                        }
                        Picker("Please choose a Date", selection: $SelectedDay) {
                            ForEach(DaysInMonth, id: \.self) {
                                Text("\($0)")
                            }
                        }.onAppear(){
                            if SelectedMonth == 2{
                                DaysInMonth = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28]
                            } else {
                                if (SelectedMonth % 2) == 1{
                                    DaysInMonth = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31]
                                } else {
                                    DaysInMonth = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30]
                                }
                            }
                        }
                        Picker("Please choose a Year", selection: $SelectedYear) {
                            ForEach(Years, id: \.self) { year in
                                Text("\(year)")
                            }
                        }
                        Picker("Please choose a Value", selection: $SelectedValue) {
                            Text("Scehdual One").tag(0)
                            Text("Holiday -> Red").tag(1)
                            Text("Admin / PD Day -> Orange").tag(2)
                            Text("Schedual II early dismissal -> Purple").tag(3)
                            Text("Schedule III PM Assembly -> Green").tag(4)
                            Text("Scheldial IV: Staff Learning -> Yellow").tag(5)
                            Text("Schedule V: All School Learning -> Blue").tag(6)
                            Text("Exams -> Pink").tag(7)
                        }
                        if SelectedValue != 1 && SelectedValue != 2 && SelectedValue != 7{
                            Picker("Please choose a School Day", selection: $SchoolDay) {
                                ForEach(SchoolDays, id: \.self) { day in
                                    Text(day)
                                }
                            }
                        }
                        Button(){
                            let db = FirebaseFirestore.Firestore.firestore()
                            
                            let docRef = db.collection("Calendar").document("20\(SelectedYear)").collection("\(SelectedMonth)").document("\(SelectedDay)")
                            
                            var inputData: [String: Any] = [
                                "Year":SelectedYear,
                                "Month":SelectedMonth,
                                "Day":SelectedDay
                            ]
                            if SelectedValue != 0 {
                                inputData["value"] = SelectedValue
                            }
                            
                            if SelectedValue != 1 && SelectedValue != 2 && SelectedValue != 7{
                                inputData["SchoolDay"] = SchoolDay
                                if SchoolDay == "A"{
                                    SchoolDay = "B"
                                } else {
                                    if SchoolDay == "B"{
                                        SchoolDay = "C"
                                    } else {
                                        if SchoolDay == "C"{
                                            SchoolDay = "D"
                                        } else {
                                            if SchoolDay == "D"{
                                                SchoolDay = "A"
                                            }
                                        }
                                    }
                                }
                                SelectedDay += 1
                                if DaysInMonth.contains(SelectedDay){
                                    
                                } else {
                                    SelectedDay = 1
                                    SelectedMonth += 1
                                    if SelectedMonth == 13{
                                        SelectedMonth = 1
                                    }
                                }
                            }
                            
                            
                            docRef.setData(inputData) { error in
                                if let error = error {
                                    print("Error writing document: \(error)")
                                } else {
                                    print("Document successfully written!")
                                }
                            }
                            
                        } label: {
                            Text("Add Date")
                        }
                    }.padding()
                        .padding()
                        .padding([.leading, .trailing])
                        .padding([.leading, .trailing])
                        .background(
                            RoundedRectangle(cornerRadius: 25)
                                .fill(Color.white)
                                .shadow(color: .gray, radius: 2, x: 0, y: 2)
                        )
                        .padding()
                        .padding(.top)
                        .padding(.top)
                        .padding(.top)
                        .padding(.top)
                }
            }
        }
    }
}

struct GovernmentElectionsView: View{
    @Binding var SelectedGovernmentViewMode: GovernmentViewModes
    var body: some View{
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
        Text("Election")
    }
}

struct GovernmentSportsView: View{
    @Binding var SelectedGovernmentViewMode: GovernmentViewModes
    var body: some View{
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
            Spacer()
        }
    }
}

struct GovernmentResourcesView: View{
    @Binding var SelectedGovernmentViewMode: GovernmentViewModes
    @State var Cards: [Int] = []
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
                Text("Resources")
                    .font(.title)
                NavigationLink(destination: GovernmentSelectedCardsView(Cards: $Cards)){
                    HStack{
                        Text("Change Selected Cards")
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
                NavigationLink(destination: GovernmentAddCardsView(Cards: $Cards)){
                    HStack{
                        Text("Add Cards")
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
                Button(){
                    let db = Firestore.firestore()
                    
                    let docRef = db.collection("PaulyInfo").document("Info")
                    
                    docRef.updateData(["ResourcesCards":Cards])
                } label: {
                    HStack{
                        Text("Confirm")
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
                Spacer()
            }.background(Color.marron)
        }
    }
}
