//
//  GovernmentViewClasses.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-04-07.
//

import SwiftUI
import FirebaseFirestore
import FirebaseAuth

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
    @State var UserPermissions: [Int] = []
    @State var AbsoluteMode: Bool = false
    @State var AvaliableClassesAbsolute: [String] = []
    let AvaliableGrades: [Int] = [9,10,11,12]
    @State var SelectedGrade: Int = 9
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
                    if AbsoluteMode{
                        Picker("", selection: $SelectedGrade){
                            ForEach(AvaliableGrades, id: \.self) { grade in
                                Text("\(grade)")
                            }
                        }.pickerStyle(.segmented)
                            .onChange(of: SelectedGrade){ grade in
                                GetClassesAbsolute()
                            }
                        List() {
                            Section{
                                ForEach(AvaliableClassesAbsolute, id: \.self) { AvaliableClass in
                                    NavigationLink(destination: GovernmentClassSectionAbsoluteView(SelectedClass: AvaliableClass, SelectedGrade: SelectedGrade)){
                                        Text(AvaliableClass)
                                    }
                                }
                            }
                            if UserPermissions.contains(20){
                                Section{
                                    NavigationLink(destination: EditClassViewPageOne(Grade: SelectedGrade)){
                                        Text("Add class")
                                    }
                                }
                            }
                        }.scrollContentBackground(.hidden)
                    } else {
                        List(){
                            Section{
                                ForEach(AvailableClasses, id: \.Id) { AvaliableClass in
                                    NavigationLink(destination: GovernmentClassEditView(SelectedClass: AvaliableClass)){
                                        Text(AvaliableClass.Name)
                                    }
                                }
                            }
                            if UserPermissions.contains(20){
                                Section{
                                    NavigationLink(destination: EditClassViewPageOne(Grade: SelectedGrade)){
                                        Text("Add class")
                                    }
                                }
                            }
                        }.scrollContentBackground(.hidden)
                    }
                } else {
                    Spacer()
                    ProgressView()
                        .onAppear(){
                            GetClasses()
                            GetUserPermissions()
                        }
                    Spacer()
                }
            }.background(Color.marron, ignoresSafeAreaEdges: .all)
        }
    }
    func GetUserPermissions(){
        let db = Firestore.firestore()
        
        let User = Auth.auth().currentUser!.uid
        
        let docRef = db.collection("Users").document(User)
        
        docRef.getDocument() { (document, error) in
            guard let document = document, document.exists, error == nil else {
                return
            }
            let data = document.data()
            
            guard let Permissions = data?["Permissions"] as? NSArray as? [Int] else {
                return
            }
            UserPermissions = Permissions
        }
    }
    func GetClassesAbsolute() {
        
        AvaliableClassesAbsolute = []
        
        let db = Firestore.firestore()
        
        let docRef = db.collection("Grade\(SelectedGrade)Courses")
        
        
        docRef.getDocuments { (snapshot, error) in
            guard let snapshot = snapshot, error == nil else {
             //handle error
             return
           }
           snapshot.documents.forEach({ (documentSnapshot) in
               
               let documentData = documentSnapshot.data()

               let CourseName = documentData["CourseName"] as? String ?? "Error"
               AvaliableClassesAbsolute.append(CourseName)
               
           })
            print("This is avaliable Courses \(AvaliableClassesAbsolute)")
            FetechedClasses = true
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
                        if ClassMode == 1{
                            AbsoluteMode = true
                            GetClassesAbsolute()
                        }
                    }
                }
            }
        }
    }
}

struct GovernmentClassSectionAbsoluteView: View{
    @State var SelectedClass: String
    @State var SelectedGrade: Int
    @State var AvailableClasses: [ClassType] = []
    @State var SectionsLoading: Bool = true
    var body: some View{
        VStack{
            if SectionsLoading{
                Spacer()
                ProgressView()
                    .onAppear(){
                        GetSections()
                    }
                Spacer()
            } else {
                Text("Avaliable Sections \(SelectedClass)")
                List(){
                    ForEach(AvailableClasses, id: \.Id) { AvaliableClass in
                        NavigationLink(destination: GovernmentClassEditView(SelectedClass: AvaliableClass)){
                            Text("\(AvaliableClass.Section)")
                        }
                    }
                }.scrollContentBackground(.hidden)
                Spacer()
            }
        }.background(Color.marron, ignoresSafeAreaEdges: .all)
    }
    func GetSections() {
        let db = Firestore.firestore()
        
        let docRef = db.collection("Grade\(SelectedGrade)Courses").document(SelectedClass).collection("Sections")
        
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
                   AvailableClasses.append(ClassType(Name: CourseCourseName, BackgroundStyle: CourseBackgroundStyle, NumberOfPages: CourseNumberOfPages, PageInfo: CoursePageInfo, Section: CourseSection, Teacher: CourseTeacher, Grade: SelectedGrade, DayA: nil, DayB: nil, DayC: nil, DayD: nil, NoClass: nil, Semester: nil, SchoolYear: nil))
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
                   AvailableClasses.append(ClassType(Name: CourseCourseName, BackgroundStyle: CourseBackgroundStyle, NumberOfPages: CourseNumberOfPages, PageInfo: CoursePageInfo, Section: CourseSection, Teacher: CourseTeacher, Grade: SelectedGrade, DayA: CourseDayA, DayB: CourseDayB, DayC: CourseDayC, DayD: CourseDayD, NoClass: CourseNoClass, Semester: CourseSemester, SchoolYear: CourseSchoolYear))
               }
               
           })
            SectionsLoading = false
         }
    }
}

struct GovernmentClassEditView: View{
    @State var SelectedClass: ClassType
    @State var ConfirmLoading: Bool = false
    var body: some View{
        VStack{
            Text("Edit Class \(SelectedClass.Name)")
            if SelectedClass.Section != 0{
                NavigationLink(destination: GovernmentClassExcludedDateView(SelectedClass: $SelectedClass)){
                    HStack{
                        Text("Add Dates without class")
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
            NavigationLink(destination: GovernmentAddCardsView(Cards: $SelectedClass.PageInfo)){
                HStack{
                    Text("Add Card")
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
            NavigationLink(destination: GovernmentSelectedCardsView(Cards: $SelectedClass.PageInfo)){
                HStack{
                    Text("Change Selection")
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
            NavigationLink(destination: GovernmentClassAssignmentView(SelectedClass: SelectedClass)){
                HStack{
                    Text("Assignment")
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
            Button{
                
                let db = Firestore.firestore()
                
                let docRef = db.collection("Grade\(SelectedClass.Grade)Courses").document(SelectedClass.Name).collection("Sections").document("\(SelectedClass.Section)-\(SelectedClass.SchoolYear!)")
                
                
                var inputData: [String:Any] = [
                    "NoClass":SelectedClass.NoClass!,
                    "Page Info":SelectedClass.PageInfo
                ]
                
                if SelectedClass.Section != 0 {
                    inputData["noClass"] = SelectedClass.NoClass!
                }
                
                docRef.updateData(inputData)
                
            } label: {
                HStack{
                    Text("CONFIRM")
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
        }.background(Color.marron, ignoresSafeAreaEdges: .all)
    }
}

struct AssignmentType{
    let id: UUID = UUID()
    
    var Title: String
    var Description: String
    var DueDate: Date?
    var AssignmentEnum: Int
    let DocumentID: String
    var AssignmentDuringClass: Bool
    var SelectedMonth: Int?
    var SelectedDay: Int?
}

struct GovernmentClassAddAssignmentView: View{
    @State var SelectedClass: ClassType
    @State var Title: String = ""
    @State var Description: String = ""
    @State var DueDate: Date = Date.now
    @State var AssignmentEnum: Int = 0
    @State var AssignmentDuringClass: Bool = false
    @State var SchoolDays: [DateProperty] = []
    @State var SelectedMonth: Int = 0
    @State var SelectedDay: Int = 0
    @State var ConfirmLoading: Bool = false
    var body: some View{
        ZStack{
            Rectangle()
                .fill(Color.marron)
                .ignoresSafeArea()
            ScrollView{
                VStack{
                    Text("Add Assignment")
                        .onAppear(){
                            SelectedMonth = Calendar.current.component(.month, from: Date())
                            SelectedMonth -= 1
                            GetDates()
                        }
                        .onChange(of: SelectedMonth){ value in
                            GetDates()
                        }
                    TextField("Title", text: $Title)
                    TextField("Decription", text: $Description)
                    Toggle(isOn: $AssignmentDuringClass){
                        Text("Assignment During Class")
                    }
                    if AssignmentDuringClass{
                        Group{
                            Picker("Month", selection: $SelectedMonth){
                                Text("January").tag(0)
                                Text("Febuary").tag(1)
                                Text("March").tag(2)
                                Group{
                                    Text("April").tag(3)
                                    Text("May").tag(4)
                                    Text("June").tag(5)
                                    Text("July").tag(6)
                                    Text("August").tag(7)
                                    Text("September").tag(8)
                                    Text("November").tag(9)
                                    Text("October").tag(10)
                                    Text("December").tag(11)
                                }
                            }
                        }
                        ForEach($SchoolDays, id: \.Date) { $day in
                            if day.SchoolDay != nil {
                                if day.SchoolDay == "A"{
                                    if SelectedClass.DayA != 0{
                                        Button{
                                            SelectedDay = day.Date
                                        } label: {
                                            Text("\(day.Date)")
                                                .foregroundColor(Color.white)
                                                .background(day.Date == SelectedDay ? Color.black:Color.blue)
                                        }
                                    }
                                }
                                if day.SchoolDay == "B"{
                                    if SelectedClass.DayB != 0{
                                        Button{
                                            SelectedDay = day.Date
                                        } label: {
                                            Text("\(day.Date)")
                                                .foregroundColor(Color.white)
                                                .background(day.Date == SelectedDay ? Color.black:Color.blue)
                                        }
                                    }
                                }
                                if day.SchoolDay == "C"{
                                    if SelectedClass.DayC != 0{
                                        Button{
                                            SelectedDay = day.Date
                                        } label: {
                                            Text("\(day.Date)")
                                                .foregroundColor(Color.white)
                                                .background(day.Date == SelectedDay ? Color.black:Color.blue)
                                        }
                                    }
                                }
                                if day.SchoolDay == "D"{
                                    if SelectedClass.DayD != 0{
                                        Button{
                                            SelectedDay = day.Date
                                        } label: {
                                            Text("\(day.Date)")
                                                .foregroundColor(Color.white)
                                                .background(day.Date == SelectedDay ? Color.black:Color.blue)
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        DatePicker("Enter Due Date", selection: $DueDate)
                            .datePickerStyle(GraphicalDatePickerStyle())
                            .frame(maxHeight: 400)
                    }
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
                            if ConfirmLoading == false{
                                
                                if AssignmentDuringClass{
                                    if SelectedDay == 0 {
                                        return
                                    }
                                }
                                ConfirmLoading = true
                                let db = Firestore.firestore()
                                var docRef = db.collection("Info").document("Hallo")
                                if SelectedClass.Section == 0{
                                    docRef = db.collection("Grade\(SelectedClass.Grade)Courses").document("\(SelectedClass.Name)").collection("Sections").document("\(SelectedClass.Section)").collection("Assignment").document("\(Date.now)")
                                } else {
                                    docRef = db.collection("Grade\(SelectedClass.Grade)Courses").document("\(SelectedClass.Name)").collection("Sections").document("\(SelectedClass.Section)-\(SelectedClass.SchoolYear!)").collection("Assignment").document("\(Date.now)")
                                }
                                var InputData: [String: Any] = [
                                    "Title":Title,
                                    "Description":Description,
                                    "AssignmentType":AssignmentEnum,
                                    "AssignmentDuringClass":AssignmentDuringClass
                                ]
                                if AssignmentDuringClass{
                                    InputData["Month"] = (SelectedMonth + 1)
                                    InputData["Day"] = SelectedDay
                                } else {
                                    InputData["DueDate"] = DueDate
                                }
                                docRef.setData(InputData) { error in
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
                    }
                }
            }
        }
    }
    func GetDates() {
        let db = FirebaseFirestore.Firestore.firestore()
        
        var NewSelectedDate: [DateProperty] = []
        
        let docRef = db.collection("Calendar").document("2023").collection("\(SelectedMonth + 1)")
        docRef.getDocuments { (snapshot, error) in
            guard let snapshot = snapshot, error == nil else {
             //handle error
             return
           }

           snapshot.documents.forEach({ (documentSnapshot) in
                let documentData = documentSnapshot.data()
                let day = documentData["Day"] as? Int
                if day != nil{
                    let value = documentData["value"] as? Int
                    let SchoolDay = documentData["SchoolDay"] as? String
                    if value != nil{
                        if value == 1{
                            NewSelectedDate.append(DateProperty(Date: day!, ColorName: "#ce0909", SchoolDay: SchoolDay, Value: 1))
                          
                        } else {
                           if value == 2{
                               NewSelectedDate.append(DateProperty(Date: day!, ColorName: "#762e05", SchoolDay: SchoolDay, Value: 2))
                             
                           } else {
                               if value == 3{
                                   NewSelectedDate.append(DateProperty(Date: day!, ColorName: "#9309ce", SchoolDay: SchoolDay, Value: 3))
                                  
                               } else {
                                   if value == 4{
                                       NewSelectedDate.append(DateProperty(Date: day!, ColorName: "#05760e", SchoolDay: SchoolDay, Value: 4))
                                       
                                   } else {
                                       if value == 5{
                                           NewSelectedDate.append(DateProperty(Date: day!, ColorName: "#f6c72c", SchoolDay: SchoolDay, Value: 5))
                                           
                                       } else {
                                           if value == 6{
                                               NewSelectedDate.append(DateProperty(Date: day!, ColorName: "#2c47f6", SchoolDay: SchoolDay, Value: 6))
                                              
                                           } else {
                                               if value == 7{
                                                   NewSelectedDate.append(DateProperty(Date: day!, ColorName: "#f62cce", SchoolDay: SchoolDay, Value: 7))
                                                 
                                               }
                                           }
                                       }
                                   }
                               }
                           }
                        }
                    } else {
                        let SchoolDay = documentData["SchoolDay"] as? String
                        NewSelectedDate.append(DateProperty(Date: day!, ColorName: nil, SchoolDay: SchoolDay, Value: nil))
                    }
                   
                }
           })
            SchoolDays = NewSelectedDate
        }
    }
}

struct GovernmentClassEditAssignmentView: View{
    @State var SelectedClass: ClassType
    @State var SelectedAssignment: AssignmentType
    @State var SchoolDays: [DateProperty] = []
    @State var ConfirmLoading: Bool = false
    var body: some View{
        ZStack{
            Rectangle()
                .fill(Color.marron)
                .ignoresSafeArea()
            ScrollView{
                VStack{
                    Text("Edit Assignment")
                    TextField("Title", text: $SelectedAssignment.Title)
                    TextField("Decription", text: $SelectedAssignment.Description)
                    if SelectedAssignment.AssignmentDuringClass {
                        DatePicker("Enter Due Date", selection: $SelectedAssignment.DueDate.toUnwrapped(defaultValue: Date.now))
                            .datePickerStyle(GraphicalDatePickerStyle())
                            .frame(maxHeight: 400)
                    } else {
                        Group{
                            Picker("Month", selection: $SelectedAssignment.SelectedMonth){
                                Text("January").tag(0)
                                Text("Febuary").tag(1)
                                Text("March").tag(2)
                                Group{
                                    Text("April").tag(3)
                                    Text("May").tag(4)
                                    Text("June").tag(5)
                                    Text("July").tag(6)
                                    Text("August").tag(7)
                                    Text("September").tag(8)
                                    Text("November").tag(9)
                                    Text("October").tag(10)
                                    Text("December").tag(11)
                                }
                            }
                        }
                        ForEach($SchoolDays, id: \.Date) { $day in
                            if day.SchoolDay != nil {
                                if day.SchoolDay == "A"{
                                    if SelectedClass.DayA != 0{
                                        Button{
                                            SelectedAssignment.SelectedDay = day.Date
                                        } label: {
                                            Text("\(day.Date)")
                                                .foregroundColor(Color.white)
                                                .background(day.Date == SelectedAssignment.SelectedDay ? Color.black:Color.blue)
                                        }
                                    }
                                }
                                if day.SchoolDay == "B"{
                                    if SelectedClass.DayB != 0{
                                        Button{
                                            SelectedAssignment.SelectedDay = day.Date
                                        } label: {
                                            Text("\(day.Date)")
                                                .foregroundColor(Color.white)
                                                .background(day.Date == SelectedAssignment.SelectedDay ? Color.black:Color.blue)
                                        }
                                    }
                                }
                                if day.SchoolDay == "C"{
                                    if SelectedClass.DayC != 0{
                                        Button{
                                            SelectedAssignment.SelectedDay = day.Date
                                        } label: {
                                            Text("\(day.Date)")
                                                .foregroundColor(Color.white)
                                                .background(day.Date == SelectedAssignment.SelectedDay ? Color.black:Color.blue)
                                        }
                                    }
                                }
                                if day.SchoolDay == "D"{
                                    if SelectedClass.DayD != 0{
                                        Button{
                                            SelectedAssignment.SelectedDay = day.Date
                                        } label: {
                                            Text("\(day.Date)")
                                                .foregroundColor(Color.white)
                                                .background(day.Date == SelectedAssignment.SelectedDay ? Color.black:Color.blue)
                                        }
                                    }
                                }
                            }
                        }
                    }
                    Picker("What Type of Assignment", selection: $SelectedAssignment.AssignmentEnum){
                        Text("Project").tag(0)
                        Text("Test").tag(1)
                        Text("Quiz").tag(2)
                        Text("Assignment").tag(3)
                        Text("Homework").tag(4)
                        Text("Optional").tag(5)
                    }
                    if SelectedAssignment.Title != ""{
                        Button(){
                            if ConfirmLoading == false{
                                ConfirmLoading = true
                                let db = Firestore.firestore()
                                var docRef = db.collection("Info").document("Hallo")
                                if SelectedClass.Section == 0{
                                    docRef = db.collection("Grade\(SelectedClass.Grade)Courses").document("\(SelectedClass.Name)").collection("Sections").document("\(SelectedClass.Section)").collection("Assignment").document("\(SelectedAssignment.DocumentID)")
                                } else {
                                    docRef = db.collection("Grade\(SelectedClass.Grade)Courses").document("\(SelectedClass.Name)").collection("Sections").document("\(SelectedClass.Section)-\(SelectedClass.SchoolYear!)").collection("Assignment").document("\(SelectedAssignment.DocumentID)")
                                }
                                var InputData: [String: Any] = [
                                    "Title":SelectedAssignment.Title,
                                    "Description":SelectedAssignment.Description,
                                    "DueDate":SelectedAssignment.DueDate,
                                    "AssignmentType":SelectedAssignment.AssignmentEnum
                                ]
                                if  SelectedAssignment.AssignmentDuringClass{
                                    InputData["Month"] =  SelectedAssignment.SelectedMonth
                                    InputData["Day"] =  SelectedAssignment.SelectedDay
                                } else {
                                    InputData["DueDate"] =  SelectedAssignment.DueDate
                                }
                                docRef.updateData(InputData)
                            }
                        } label: {
                            Text("Confirm")
                        }
                    }
                }
            }
        }
    }
}

struct GovernmentClassAssignmentView: View{
    @State var ClassAssignments: [AssignmentType] = []
    @State var SelectedClass: ClassType
    var body: some View{
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
                    NavigationLink(destination: GovernmentClassEditAssignmentView(SelectedClass: SelectedClass, SelectedAssignment: SelectAssignment)){
                        HStack{
                            Text(SelectAssignment.Title)
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
            NavigationLink(destination: GovernmentClassAddAssignmentView(SelectedClass: SelectedClass)){
                Text("Add Assignment")
            }
        }.background(Color.marron)
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
                         print("Description")
                         return
                     }
                     guard let AssignmentEnum = data["AssignmentType"] as? Int else {
                         print("Type")
                         return
                     }
                    guard let AssignmentDuringClass = data["AssignmentDuringClass"] as? Bool else {
                        print("During Class")
                        return
                    }
                    let documentID = document.documentID
                    if AssignmentDuringClass{
                        guard let AssignmentMonth = data["Month"] as? Int else {
                            return
                        }
                        guard let AssignmentDay = data["Day"] as? Int else {
                            return
                        }
                     
                        ClassAssignments.append(AssignmentType(Title: AssignmentTitle, Description: AssignmnetDescription, DueDate: nil, AssignmentEnum: AssignmentEnum, DocumentID: documentID, AssignmentDuringClass: AssignmentDuringClass, SelectedMonth: (AssignmentMonth + 1), SelectedDay: AssignmentDay))
                    } else {
                        guard let AssignmentDueDateTime = data["DueDate"] as? Timestamp else {
                            return
                        }
                        let AssignmentDueDate = AssignmentDueDateTime.dateValue()
                        ClassAssignments.append(AssignmentType(Title: AssignmentTitle, Description: AssignmnetDescription, DueDate: AssignmentDueDate, AssignmentEnum: AssignmentEnum, DocumentID: documentID, AssignmentDuringClass: AssignmentDuringClass, SelectedMonth: nil, SelectedDay: nil))
                    }
                }
            }
        }
    }
}

struct GovernmentClassExcludedDateView: View{
    @Binding var SelectedClass: ClassType
    
    @State var DaysInMonth: [Int] = []
    let Years: [Int] = [23,24,25,26,27,28,29,30,31,32,33]
    @State var SelectedMonth: Int = 1
    @State var SelectedDay: Int = 1
    @State var SelectedYear: Int = 23
    var body: some View{
        Text("Add Excluded Dates")
        Group{
            List(){
                ForEach(SelectedClass.NoClass!, id: \.self){ day in
                    Button(){
                        if let Index = SelectedClass.NoClass!.firstIndex(where: { $0 == day } ){
                            SelectedClass.NoClass!.remove(at: Index)
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
                SelectedClass.NoClass!.append("\(SelectedDay)-\(SelectedMonth)-20\(SelectedYear)")
            } label: {
                Text("Add")
            }
            Button(){
                let db = Firestore.firestore()
                
                let docRef = db.collection("Grade\(SelectedClass.Grade)Courses").document(SelectedClass.Name).collection("Sections").document("\(SelectedClass.Section)-\(SelectedClass.SchoolYear!)")
                
                docRef.updateData(["NoClass":SelectedClass.NoClass!])
            } label: {
                Text("CONFIRM")
            }
        }
    }
}
