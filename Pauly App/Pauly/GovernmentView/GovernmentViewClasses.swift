//
//  GovernmentViewClasses.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-04-07.
//

import SwiftUI
import FirebaseFirestore

struct ClassType{
    let Id: UUID = UUID()
    
    var Name: String
    var BackgroundStyle: Int
    var NumberOfPages: Int
    var PageInfo: [Int]
    var Section: Int
    var Teacher: String
    let Grade: Int
    
    var DayA: Int?
    var DayB: Int?
    var DayC: Int?
    var DayD: Int?
    var NoClass: [String]?
    var Semester: Int?
    var SchoolYear: Int?
    
}

struct GovernmentClassView: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @Binding var SelectedGovernmentViewMode: GovernmentViewModes
    @State var AvailableClasses: [ClassType] = []
    @State var FetechedClasses:Bool = false
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
                Text("Class")
                if FetechedClasses{
                    List(){
                        ForEach(AvailableClasses, id: \.Id) { AvaliableClass in
                            NavigationLink(destination: GovernmentClassEditView(SelectedClass: AvaliableClass)){
                                Text(AvaliableClass.Name)
                            }
                        }
                    }
                } else {
                    Spacer()
                    ProgressView()
                        .onAppear(){
                            GetClasses()
                        }
                    Spacer()
                }
            }
        }
    }
    func GetClasses() {
        let db = Firestore.firestore()
        
        let docRef = db.collection("Users").document(WindowMode.UsernameIn)
        
        docRef.getDocument(){  (document, error) in
            guard error == nil else {
                print("error", error ?? "")
                return
            }
            if let document = document, document.exists {
                let data = document.data()
                if let data = data {
                    let ClassMode = data["ClassMode"] as! Int
                    if ClassMode == 0{
                        guard let Classes = data["ClassPerms"] as? NSArray as? [String] else {
                            return
                        }
                        
                        for x in Classes{
                            let ClassSplit = x.split(separator: "-")
                            print("ClassSplit\(ClassSplit)")
                            var classDocRef = db.collection("Grade\(ClassSplit[0])Courses").document("\(ClassSplit[1])").collection("Sections").document("\(ClassSplit[2])")
                            if "\(ClassSplit[2])" != "0"{
                                classDocRef = db.collection("Grade\(ClassSplit[0])Courses").document("\(ClassSplit[1])").collection("Sections").document("\(ClassSplit[2])-\(ClassSplit[3])")
                                print("Here1")
                                print(classDocRef)
                            }
                            classDocRef.getDocument { (document, error) in
                                guard error == nil else {
                                    print("error", error ?? "")
                                    return
                                }
                                
                                if let document = document, document.exists {
                                    print("Here2")
                                    let data = document.data()
                                    if let data = data {
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
                                            AvailableClasses.append(ClassType(Name: CourseCourseName, BackgroundStyle: CourseBackgroundStyle, NumberOfPages: CourseNumberOfPages, PageInfo: CoursePageInfo, Section: CourseSection, Teacher: CourseTeacher, Grade: Int(ClassSplit[0])!, DayA: nil, DayB: nil, DayC: nil, DayD: nil, NoClass: nil, Semester: nil, SchoolYear: nil))
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
                                            AvailableClasses.append(ClassType(Name: CourseCourseName, BackgroundStyle: CourseBackgroundStyle, NumberOfPages: CourseNumberOfPages, PageInfo: CoursePageInfo, Section: CourseSection, Teacher: CourseTeacher, Grade: Int(ClassSplit[0])!, DayA: CourseDayA, DayB: CourseDayB, DayC: CourseDayC, DayD: CourseDayD, NoClass: CourseNoClass, Semester: CourseSemester, SchoolYear: CourseSchoolYear))
                                        }
                                        FetechedClasses = true
                                    }
                                }
                            }
                        }
                    } else {
                        
                    }
                }
            }
        }
    }
}

struct GovernmentClassEditView: View{
    @State var SelectedClass: ClassType
    var body: some View{
        VStack{
            Text("Edit Class \(SelectedClass.Name)")
            if SelectedClass.Section != 0{
                NavigationLink(destination: GovernmentClassExcludedDateView(NoClass: $SelectedClass.NoClass)){
                    Text("Add Dates without class")
                }
            }
            NavigationLink(destination: GovernmentAddCardsView(Cards: $SelectedClass.PageInfo)){
                Text("Add Card")
            }
            NavigationLink(destination: GovernmentSelectedCardsView(Cards: $SelectedClass.PageInfo)){
                Text("Change Selection")
            }
            NavigationLink(destination: GovernmentClassAssignmentView(SelectedClass: SelectedClass)){
                Text("Assignment")
            }
            Spacer()
        }
    }
}

struct AssignmentType{
    let id: UUID = UUID()
    
    var Title: String
    var Description: String
    var DueDate: Date
    var AssignmentEnum: Int
}

struct GovernmentClassAddAssignmentView: View{
    @State var SelectedClass: ClassType
    @State var Title: String = ""
    @State var Description: String = ""
    @State var DueDate: Date = Date.now
    @State var AssignmentEnum: Int = 0
    var body: some View{
        ScrollView{
            VStack{
                Text("Add Assignment")
                TextField("Title", text: $Title)
                TextField("Decription", text: $Description)
                DatePicker("Enter Due Date", selection: $DueDate)
                    .datePickerStyle(GraphicalDatePickerStyle())
                    .frame(maxHeight: 400)
                Picker("What Type of Assignment", selection: $AssignmentEnum){
                    Text("Project").tag(0)
                    Text("Test").tag(1)
                    Text("Quiz").tag(2)
                    Text("Assignment").tag(3)
                    Text("Homework").tag(4)
                    Text("Optional").tag(5)
                }
                if Title != ""{
                    Button(){
                        let db = Firestore.firestore()
                        var docRef = db.collection("Info").document("Hallo")
                        if SelectedClass.Section == 0{
                            docRef = db.collection("Grade\(SelectedClass.Grade)Courses").document("\(SelectedClass.Name)").collection("Sections").document("\(SelectedClass.Section)").collection("Assignment").document("\(Date.now)")
                        } else {
                            docRef = db.collection("Grade\(SelectedClass.Grade)Courses").document("\(SelectedClass.Name)").collection("Sections").document("\(SelectedClass.Section)-\(SelectedClass.SchoolYear!)").collection("Assignment").document("\(Date.now)")
                        }
                        docRef.setData(["Title":Title, "Description":Description, "DueDate":DueDate, "AssignmentType":AssignmentEnum])
                    } label: {
                        Text("Confirm")
                    }
                }
            }
        }
    }
}

struct GovernmentClassEditAssignmentView: View{
    var body: some View{
        Text("Testing")
    }
}

struct GovernmentClassAssignmentView: View{
    @State var ClassAssignments: [AssignmentType] = []
    @State var SelectedClass: ClassType
    var body: some View{
        NavigationView(){
            VStack{
                HStack{
                    Spacer()
                    Text("Assignments")
                        .onAppear() {
                            GetAssignments()
                        }
                    Spacer()
                }
                ScrollView{
                    ForEach(ClassAssignments, id: \.id) { SelectAssignment in
                        NavigationLink(destination: GovernmentClassEditAssignmentView()){
                            Text(SelectAssignment.Title)
                                .foregroundColor(.black)
                        }
                    }
                }
                NavigationLink(destination: GovernmentClassAddAssignmentView(SelectedClass: SelectedClass)){
                    Text("Add Assignment")
                }
            }.background(Color.marron)
        }
    }
    func GetAssignments() {

        ClassAssignments = []
        
        let db = Firestore.firestore()
        
        var docRef = db.collection("Info")
        if SelectedClass.Section == 0{
            docRef = db.collection("Grade\(SelectedClass.Grade)Courses").document("\(SelectedClass.Name)").collection("Sections").document("\(SelectedClass.Section)").collection("Assignment")
            print("Woah!")
        } else {
            docRef = db.collection("Grade\(SelectedClass.Grade)Courses").document("\(SelectedClass.Name)").collection("Sections").document("\(SelectedClass.Section)-\(SelectedClass.SchoolYear!)").collection("Assignment")
            print("Grade\(SelectedClass.Grade)Courses \(SelectedClass.Name) Sections \(SelectedClass.Section)-\(SelectedClass.SchoolYear!) Assignment")
            print("Yeah!")
        }
        print("Doc")
        docRef.getDocuments() { (querySnapshot, error) in
            if let error = error {
                print("Error getting documents: \(error)")
            } else {
                for document in querySnapshot!.documents {
                    let data = document.data()
                    print(data)
                     guard let AssignmentTitle = data["Title"] as? String else {
                         return
                     }
                     guard let AssignmnetDescription = data["Description"] as? String else {
                         return
                     }
                     guard let AssignmentDueDate = data["DueDate"] as? Timestamp else {
                         return
                     }
                     guard let AssignmentEnum = data["AssignmentType"] as? Int else {
                         return
                     }
                    ClassAssignments.append(AssignmentType(Title: AssignmentTitle, Description: AssignmnetDescription, DueDate: AssignmentDueDate.dateValue(), AssignmentEnum: AssignmentEnum))
                }
            }
        }
    }
}

struct GovernmentClassExcludedDateView: View{
    @Binding var NoClass: [String]?
    
    @State var DaysInMonth: [Int] = []
    let Years: [Int] = [23,24,25,26,27,28,29,30,31,32,33]
    @State var SelectedMonth: Int = 1
    @State var SelectedDay: Int = 1
    @State var SelectedYear: Int = 23
    var body: some View{
        Text("Add Excluded Dates")
        Group{
            List(){
                ForEach(NoClass!, id: \.self){ day in
                    Button(){
                        if let Index = NoClass!.firstIndex(where: { $0 == day } ){
                            NoClass!.remove(at: Index)
                        }
                    } label: {
                        Text(day)
                    }
                }
            }
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
            Button(){
                NoClass!.append("\(SelectedDay)-\(SelectedMonth)-20\(SelectedYear)")
            } label: {
                Text("Add")
            }
        }
    }
}
