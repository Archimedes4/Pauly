//
//  GovernmentViewElections.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-04-21.
//

import SwiftUI
import FirebaseFirestore

struct GovernmentElectionsView: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @Binding var SelectedGovernmentViewMode: GovernmentViewModes
    @State var AvaliableElections: [ElectionType] = []
    @State var ElectionsLoading: Bool = true
    var body: some View{
        NavigationView(){
            if ElectionsLoading{
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
                    ProgressView()
                        .onAppear(){
                            GetElections()
                        }
                    Spacer()
                }
            } else {
                ZStack{
                    Rectangle()
                        .foregroundColor(.marron)
                        .ignoresSafeArea()
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
                        Text("Election")
                        ScrollView{
                            ForEach(AvaliableElections, id: \.ElectionID){ election in
                                
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
                        NavigationLink(destination: GovernmentCreateElectionView()){
                            HStack{
                                Text("Create Election")
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
                db.collection("Elections").getDocuments(){ (snapshot, error) in
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

struct ElectionType{
    let ElectionID:String
    var ElectionName:String
    var participantsMode:Int
    var StartDate: Date
    var EndDate: Date
    var Hidden: Bool
    var Canadates: [CanadateType]
    var SelectedGrade: Int?
    var SelectedUsers: [String]?
    var SelectedClass: String?
}

struct CanadateType {
    let ID: UUID = UUID()
    var Name: String
    var Votes: [String]
    let CanidateID:String
}

struct ParticipantsModeType{
    let Name: String
    let FireID: Int
}

struct ElectionsUserType{
    let FirebaseID: String
    let Name: String
    var Selected: Bool
}

struct GovernmentEditElectionsView: View{
    var body: some View{
        Text("Edit Election")
    }
}

struct GovernmentCreateElectionView: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @State var nameOfElection: String = ""
    @State var ShowingStartDate: Bool = false
    @State var ShowingEndDate: Bool = false
    @State var StartDate: Date = Date.now
    @State var EndDate: Date = Date.now
    @State var Hidden: Bool = false
    @State var SelectedMode: ParticipantsModeType = ParticipantsModeType(Name: "By Grade", FireID: 1)
    let AvaliableModes: [ParticipantsModeType] = [ParticipantsModeType(Name: "By Grade", FireID: 1), ParticipantsModeType(Name: "By Group", FireID: 2), ParticipantsModeType(Name: "By Class", FireID: 3), ParticipantsModeType(Name: "By Section", FireID: 4)]
    @State var selectedGrade: Int = 9
    @State var selectedClassName: String = ""
    @State var selectedClass: ClassType = ClassType(Name: "", BackgroundStyle: 1, NumberOfPages: 0, PageInfo: [], Section: 0, Teacher: "", Grade: 1)
    @State var AvaliableClassesName: [String] = []
    @State var AvaliableClasses: [ClassType] = []
    let Grades: [Int] = [9,10,11,12]
    @State var UsersLoading: Bool = true
    @State var AvaliableUsers: [ElectionsUserType] = []
    @State var CreateElectionLoading: Bool = false
    @State var SelectedCanadates: [CanadateType] = []
    var body: some View{
        Group{
            Text("Create Election")
            TextField("", text: $nameOfElection)
                .placeholder(when: nameOfElection.isEmpty){
                    Text("Election Name")
                        .foregroundColor(.black)
                }
                .padding([.leading, .trailing])
            Button(){
                ShowingStartDate = true
            } label: {
                HStack{
                    Text("Pick Start Date")
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
            }.sheet(isPresented: $ShowingStartDate){
                HStack{
                    Button(){
                        ShowingStartDate = false
                    } label: {
                        HStack {
                            Image(systemName: "chevron.backward")
                                .padding(.leading)
                            Text("Back")
                        }
                    }
                    Spacer()
                }
                DatePicker("Enter Start Date", selection: $StartDate)
                    .datePickerStyle(GraphicalDatePickerStyle())
                    .frame(maxHeight: 400)
            }
        }
        Button(){
            ShowingEndDate = true
        } label: {
            HStack{
                Text("Pick End Date")
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
        }.sheet(isPresented: $ShowingEndDate){
            HStack{
                Button(){
                    ShowingEndDate = false
                } label: {
                    HStack {
                        Image(systemName: "chevron.backward")
                            .padding(.leading)
                        Text("Back")
                    }
                }
                Spacer()
            }
            DatePicker("Enter End Date", selection: $EndDate)
                .datePickerStyle(GraphicalDatePickerStyle())
                .frame(maxHeight: 400)
        }
        Toggle(isOn: $Hidden){
            Text("Hidden")
        }
        HStack{
            ForEach(AvaliableModes, id: \.FireID){ value in
                Button{
                    SelectedMode = value
                } label: {
                    if value.FireID == SelectedMode.FireID{
                        Text(value.Name)
                            .foregroundColor(.red)
                    } else {
                        Text(value.Name)
                    }
                }
            }
        }
        Text("Voters")
        if SelectedMode.FireID == 1{
            Picker("Select Grade", selection: $selectedGrade){
                ForEach(Grades, id: \.self){ grade in
                    Text("\(grade)")
                }
            }
        } else {
            if SelectedMode.FireID == 2{
                Text("This is currently Unavailable")
            } else {
                if SelectedMode.FireID == 3{
                    VStack{
                        HStack{
                            Picker("Select Grade", selection: $selectedGrade){
                                ForEach(Grades, id: \.self){ grade in
                                    Text("\(grade)")
                                }
                            }
                            Picker("Select Class", selection: $selectedClassName){
                                ForEach(AvaliableClassesName, id: \.self){ Class in
                                    Text(Class)
                                }
                            }
                        }
                        ScrollView{
                            ForEach(AvaliableClasses, id: \.Id) { Section in
                                Button{
                                    selectedClass = Section
                                } label: {
                                    Text("\(Section.Name) \(Section.Grade) \(Section.Section) \(Section.SchoolYear ?? 0)")
                                }
                            }
                        }
                    }
                } else {
                    if SelectedMode.FireID == 4{
                        if UsersLoading{
                            Spacer()
                            ProgressView()
                                .onAppear(){
                                    GetUsers()
                                }
                            Spacer()
                        } else {
                            Text("Select Users")
                            ScrollView{
                                ForEach($AvaliableUsers, id: \.FirebaseID){ user in
                                    HStack{
                                        Text(user.wrappedValue.Name)
                                        Spacer()
                                        Toggle(isOn: user.Selected){
                                            Text("Selected")
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        Group{
            Text("Canadates")
            VStack{
                ScrollView{
                    ForEach($SelectedCanadates, id: \.ID){ canadate in
                        TextField("Name", text: canadate.Name)
                    }
                    Button(){
                        SelectedCanadates.append(CanadateType(Name: "", Votes: [], CanidateID: ""))
                    } label: {
                        Text("Add Canadate")
                    }
                }
            }
        }
        Button(){
            CreateElection()
        } label: {
            if CreateElectionLoading{
                ProgressView()
            } else {
                Text("Create")
            }
        }
    }
    func CreateElection() {
        if SelectedMode.FireID != 2 && CreateElectionLoading == false && nameOfElection != ""{
            CreateElectionLoading = true
            let db = Firestore.firestore()
            
            var inputData: [String:Any] = [
                "Election Name":nameOfElection,
                "participantsMode":SelectedMode.FireID,
                "StartDate":StartDate,
                "EndDate":EndDate,
                "Hidden":Hidden
            ]
            
            if SelectedMode.FireID == 1{
                inputData["SelectedGrade"] = selectedGrade
            } else {
                if SelectedMode.FireID == 3{
                    guard selectedClass.Name != "" else {
                        CreateElectionLoading = false
                        return
                    }
                    if selectedClass.Section == 0{
                        inputData["SelectedClass"] = "\(selectedClass.Grade)-\(selectedClass.Name)-\(selectedClass.Section)"
                    } else {
                        inputData["SelectedClass"] = "\(selectedClass.Grade)-\(selectedClass.Name)-\(selectedClass.Section)-\(selectedClass.SchoolYear!)"
                    }
                } else {
                    if SelectedMode.FireID ==  4{
                        var SelectedUsers: [String] = []
                        for x in AvaliableUsers{
                            if x.Selected == true{
                                SelectedUsers.append(x.FirebaseID)
                            }
                        }
                        inputData["SelectedUsers"] = SelectedUsers
                    }
                }
            }
            
            var docRef: DocumentReference? = nil
            
            docRef = db.collection("Elections").addDocument(data: inputData) { err in
                if let err = err {
                    print("Error adding document: \(err)")
                } else {
                    print("Document added with ID: \(docRef!.documentID)")
                    docRef!.setData(["FirebaseID":docRef!.documentID], merge: true)
                    let OriginDocRefID = docRef!.documentID
                    for x in SelectedCanadates{
                        docRef = db.collection("Elections").document(OriginDocRefID).collection("Canadates").addDocument(data: ["Name":x.Name ,"Votes":[] as [String]]) { err in
                            if let err = err {
                                print("Error adding document: \(err)")
                            } else {
                                docRef!.setData(["FirebaseID":docRef!.documentID], merge: true)
                            }
                        }
                    }
                    CreateElectionLoading = false
                }
            }
        }
    }
    
    func GetSections() {
        let db = Firestore.firestore()
        
        let docRef = db.collection("Grade\(selectedGrade)Courses").document(selectedClassName).collection("Sections")
        
        docRef.getDocuments { (snapshot, error) in
            guard let snapshot = snapshot, error == nil else {
             //handle error
             return
           }
           snapshot.documents.forEach({ (documentSnapshot) in
               
               let data = documentSnapshot.data()

               guard let CourseBackgroundStyle = data["BackgroundStyle"] as? Int else {
                   return
               }
               guard let CourseCourseName = data["CourseName"] as? String else {
                   return
               }
               guard let CourseNumberOfPages = data["NumberOfPages"] as? Int else {
                   return
               }
               guard let CoursePageInfo = data["Page Info"] as? NSArray as? [Int] else {
                   return
               }
               guard let CourseSection = data["Section"] as? Int else {
                   return
               }
               guard let CourseTeacher = data["Teacher"] as? String else {
                   return
               }
               if CourseSection == 0{
                   AvaliableClasses.append(ClassType(Name: CourseCourseName, BackgroundStyle: CourseBackgroundStyle, NumberOfPages: CourseNumberOfPages, PageInfo: CoursePageInfo, Section: CourseSection, Teacher: CourseTeacher, Grade: selectedGrade, DayA: nil, DayB: nil, DayC: nil, DayD: nil, NoClass: nil, Semester: nil, SchoolYear: nil))
               } else {
                   guard let CourseDayA = data["DayA"] as? Int else {
                       return
                   }
                   guard let CourseDayB = data["DayB"] as? Int else {
                       return
                   }
                   guard let CourseDayC = data["DayD"] as? Int else {
                       return
                   }
                   guard let CourseDayD = data["DayD"] as? Int else {
                       return
                   }
                   guard let CourseNoClass = data["NoClass"] as? NSArray as? [String] else {
                       return
                   }
                   guard let CourseSemester = data["Semester"] as? Int else {
                       return
                   }
                   guard let CourseSchoolYear = data["School Year"] as? Int else {
                       return
                   }
                   AvaliableClasses.append(ClassType(Name: CourseCourseName, BackgroundStyle: CourseBackgroundStyle, NumberOfPages: CourseNumberOfPages, PageInfo: CoursePageInfo, Section: CourseSection, Teacher: CourseTeacher, Grade: selectedGrade, DayA: CourseDayA, DayB: CourseDayB, DayC: CourseDayC, DayD: CourseDayD, NoClass: CourseNoClass, Semester: CourseSemester, SchoolYear: CourseSchoolYear))
               }
               
           })
         }
    }
    
    func GetClassesNames() {
        
        AvaliableClassesName = []
        
        let db = Firestore.firestore()
        
        let docRef = db.collection("Grade\(selectedGrade)Courses")
        
        
        docRef.getDocuments { (snapshot, error) in
            guard let snapshot = snapshot, error == nil else {
             //handle error
             return
           }
           snapshot.documents.forEach({ (documentSnapshot) in
               
               let documentData = documentSnapshot.data()

               let CourseName = documentData["CourseName"] as? String ?? "Error"
               AvaliableClassesName.append(CourseName)
               
           })
         }
    }
    
    func GetUsers(){
        let db = Firestore.firestore()
        
        let docRef = db.collection("Users")
        
        docRef.getDocuments { (snapshot, error) in
            guard let snapshot = snapshot, error == nil else {
             //handle error
             return
           }
           snapshot.documents.forEach({ (documentSnapshot) in
               let data = documentSnapshot.data()
               let CardCount = data["CardCount"] as? Int
               if CardCount == nil{
                   guard let FirstName = data["First Name"] as? String else {
                       return
                   }
                   guard let LastName = data["Last Name"] as? String else {
                       return
                   }
                   guard let UserUid = data["uid"] as? String else {
                       return
                   }
                   AvaliableUsers.append(ElectionsUserType(FirebaseID: UserUid, Name: "\(FirstName) \(LastName)", Selected: false))
               }
           })
            UsersLoading = false
         }
    }
}
