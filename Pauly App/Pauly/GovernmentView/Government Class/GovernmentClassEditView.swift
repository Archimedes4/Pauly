//
//  GovernmentClassEditView.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-04-12.
//

import Foundation
import SwiftUI
import FirebaseCore
import FirebaseAuth
import FirebaseFirestore

enum EditCardMode{
    case Data
    case Name
    case NewValue
    case Confirm
}

struct EditClassViewPageThree: View{
    @State var Grade: Int
    @State var CourseNameSelected: String
    @State var Section: Int
    
    @State var Cards: [Int] = []
    
    @State var backgroundStyle: Int = 1
    
    @State var BackgoundStyle: Int = 1
    @State var DidCardsChange: Bool = false
    
    @State var SelectedSemester: Int = 1
    let Semesters: [Int] = [1,2]
    let Periods: [Int] = [0,1,2,3,4,5]
    
    @State var SelectedPeriodDayA: Int = 0
    @State var SelectedPeriodDayB: Int = 0
    @State var SelectedPeriodDayC: Int = 0
    @State var SelectedPeriodDayD: Int = 0
    
    @State var DaysInMonth: [Int] = []
    let Years: [Int] = [23,24,25,26,27,28,29,30,31,32,33]
    @State var SelectedMonth: Int = 1
    @State var SelectedDay: Int = 1
    @State var SelectedYear: Int = 23
    
    @State var NoClass: [String] = []
    
    @State var ConfirmLoading: Bool = false
    
    var body: some View{
        ZStack{
            Rectangle()
                .foregroundColor(Color.marron)
            VStack{
                Text("Edit Class")
                    .onAppear(){
                        GetCards()
                    }
                Picker("BackgroundStyle", selection: $backgroundStyle){
                    Text("Gradient 1").tag(1)
                }
                NavigationLink(destination: GovernmentSelectedAddCardsOverview(PageInfo: $Cards)){
                    Text("Edit Cards")
                }
                Group{
                    Text("Schedual")
                    HStack{
                        Picker("Semester", selection: $SelectedSemester){
                            ForEach(Semesters, id: \.self){
                                Text("\($0)")
                            }
                        }
                        Picker("Day A", selection: $SelectedPeriodDayA){
                            ForEach(Periods, id: \.self){
                                Text("\($0)")
                            }
                        }
                        Picker("Day B", selection: $SelectedPeriodDayB){
                            ForEach(Periods, id: \.self){
                                Text("\($0)")
                            }
                        }
                        Picker("Day C", selection: $SelectedPeriodDayC){
                            ForEach(Periods, id: \.self){
                                Text("\($0)")
                            }
                        }
                        Picker("Day D", selection: $SelectedPeriodDayD){
                            ForEach(Periods, id: \.self){
                                Text("\($0)")
                            }
                        }
                    }
                    Text("Add Excluded Dates")
                    Group{
                        List(){
                            ForEach(NoClass, id: \.self){ day in
                                Button(){
                                    if let Index = NoClass.firstIndex(where: { $0 == day } ){
                                        NoClass.remove(at: Index)
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
                            NoClass.append("\(SelectedDay)-\(SelectedMonth)-20\(SelectedYear)")
                        } label: {
                            Text("Add")
                        }
                    }
                }
                HStack{
                    Spacer()
                    Button(){
                        ConfirmLoading = true
                        var InputData: [String: Any] = [:]
                        if DidCardsChange{
                            InputData["NumberOfPages"] = Cards.count
                            InputData["Page Info"] = Cards
                        }
                        if backgroundStyle != BackgoundStyle{
                            InputData["BackgroundStyle"] = BackgoundStyle
                        }
                        if DidCardsChange || backgroundStyle != BackgoundStyle{
                            let db = Firestore.firestore()
                            
                            var SectionID: String = ""
                            if Section == 0{
                                SectionID = "0"
                            } else {
                                SectionID = "\(Section)-2023"
                            }
                            
                            let ClassRef = db.collection("Grade\(Grade)Courses").document(CourseNameSelected).collection("Sections").document("\(SectionID)")
                            
                            ClassRef.updateData(InputData) {err in
                                if let err = err {
                                    print("Error updating document: \(err)")
                                } else {
                                    ConfirmLoading = false
                                }
                            }
                        }
                    } label: {
                        if ConfirmLoading{
                            ProgressView()
                        } else {
                            Text("Confirm")
                        }
                    }
                    Spacer()
                }
            }
        }
    }
    func GetCards() {
        let db = Firestore.firestore()
        
        var SectionID: String = ""
        if Section == 0{
            SectionID = "0"
        } else {
            SectionID = "\(Section)-2023"
        }
        
        let ClassRef = db.collection("Grade\(Grade)Courses").document(CourseNameSelected).collection("Sections").document("\(SectionID)")
        ClassRef.getDocument { (document, error) in
             guard error == nil else {
                 print("error", error ?? "")
                 return
             }

             if let document = document, document.exists {
                 let data = document.data()
                 if let data = data {
                     backgroundStyle = data["BackgroundStyle"] as? Int ?? 0
                     BackgoundStyle = backgroundStyle
                     Cards = data["Page Info"] as! NSArray as? [Int] ?? []
                 }
             }

         }
    }
}

struct EditClassViewPageTwo: View{
    @Binding var Grade: Int
    @State var SelectedClass: String
    @State var SelectedSection: Int = 0
    @State var AvaliableSections: [Int] = []
    var body: some View{
        VStack{
            HStack{
                Spacer()
                Text("Please Choose a Section")
                    .font(.title)
                Spacer()
                Spacer()
            }
            List(){
                ForEach(AvaliableSections, id: \.self){ Section in
                    NavigationLink(destination: EditClassViewPageThree(Grade: Grade, CourseNameSelected: SelectedClass, Section: Section)){
                        Text("\(Section)")
                    }
                }
                NavigationLink(destination: AddClassView(CourseName: SelectedClass, Grade: Grade)) {
                    Text("Add A Section")
                }
            }.onAppear(){
                GetSections()
            }
            .scrollContentBackground(.hidden)
            .padding()
        }.background(Color.marron)
    }
    func GetSections() {
        Task{
            do{
                AvaliableSections = []
                let db = Firestore.firestore()
                
                let docRef = db.collection("Grade\(Grade)Courses").document(SelectedClass).collection("Sections")
                docRef.getDocuments { (snapshot, error) in
                    guard let snapshot = snapshot, error == nil else {
                     //handle error
                     return
                   }
                   print("Number of documents: \(snapshot.documents.count ?? -1)")
                   snapshot.documents.forEach({ (documentSnapshot) in
                       let documentData = documentSnapshot.data()
                       let CourseNameNewUser = documentData["Section"] as? Int
                       AvaliableSections.append(CourseNameNewUser ?? 0)
                   })
                 }
            } catch {
                print("Error")
            }
        }
    }
}

struct EditClassViewPageOne: View{
    @State var Grade: Int
    @State var SelectedClass: String = ""
    
    @State var AvaliableCourses: [String] = []
    
    var body: some View{
        ZStack{
            Rectangle()
                .fill(Color.marron)
                .ignoresSafeArea()
            VStack{
                Text("Choose Class")
                List{
                    Section{
                        ForEach(AvaliableCourses, id: \.self){ Avaliable in
                            NavigationLink(destination: EditClassViewPageTwo(Grade: $Grade, SelectedClass: Avaliable)){
                                Text(Avaliable)
                            }
                        }
                    }
                    Section{
                        NavigationLink(destination: AddRootClassView(Grade: Grade)){
                            Text("Add Root Class")
                        }
                        NavigationLink(destination: EditManditoryClassesView()){
                            Text("Edit Mandatory Classes")
                        }
                    }
                }.onAppear(){
                    GetCourses()
                }
                .onChange(of: Grade){ value in
                    GetCourses()
                }
                .padding()
                .scrollContentBackground(.hidden)
            }
        }
    }
    func GetCourses() {
        Task{
            do{
                AvaliableCourses = []
                let db = Firestore.firestore()
                
                let docRef = db.collection("Grade\(Grade)Courses")
                docRef.getDocuments { (snapshot, error) in
                    guard let snapshot = snapshot, error == nil else {
                     //handle error
                     return
                   }
                   snapshot.documents.forEach({ (documentSnapshot) in
                       let documentData = documentSnapshot.data()
                       let CourseNameNewUser = documentData["CourseName"] as? String
                       AvaliableCourses.append(CourseNameNewUser ?? "Error")
                   })
                 }
            } catch {
                print("Error")
            }
        }
    }
}

struct EditManditoryClassesView: View{
    @State var AvaliableCourses: [String] = []
    @State var ManditoryCourses: [String] = []
    let AvaiableGrades: [Int] = [9, 10, 11, 12]
    @State var SelectedGrade: Int = 9
    @State var isAnyChange: Bool = false
    @State var ConfirmLoading: Bool = false
    var body: some View{
        VStack{
            Text("Edit Manditory Classes")
            Picker("Grade", selection: $SelectedGrade){
                ForEach(AvaiableGrades, id: \.self){grade in
                    Text("\(grade)")
                }
            }
            ScrollView(){
                HStack{
                    VStack{
                        Text("Non Manditory Courses")
                        ForEach(AvaliableCourses, id: \.self){ course in
                            Button(){
                                if let Index = AvaliableCourses.firstIndex(where: { $0 == course }){
                                    ManditoryCourses.append(course)
                                    AvaliableCourses.remove(at: Index)
                                    isAnyChange = true
                                }
                            } label: {
                                Text(course)
                            }
                        }
                        Spacer()
                    }
                    VStack{
                        Text("Manditory Courses")
                        ForEach(ManditoryCourses, id: \.self){ manditory in
                            Button(){
                                if let Index = ManditoryCourses.firstIndex(where: { $0 == manditory }){
                                    AvaliableCourses.append(manditory)
                                    ManditoryCourses.remove(at: Index)
                                    isAnyChange = true
                                }
                            } label: {
                                Text(manditory)
                            }
                        }
                        Spacer()
                    }
                }
            }.onAppear(){
                GetCourses()
            }
            .onChange(of: SelectedGrade){ _ in
                GetCourses()
            }
            Button(){
                if isAnyChange{
                    ConfirmLoading = true
                    let db = Firestore.firestore()
                    
                    let docRef = db.collection("MandatoryCourses").document("Grade\(SelectedGrade)")
                    docRef.updateData(["Courses": ManditoryCourses]) { error in
                        if let error = error {
                            print("Error updating document: \(error)")
                        } else {
                            ConfirmLoading = false
                        }
                    }
                }
            } label: {
                if ConfirmLoading{
                    ProgressView()
                } else {
                    Text("Confirm Changes")
                }
            }
        }
    }
    func GetCourses() {
        Task{
            do{
                AvaliableCourses = []
                let db = Firestore.firestore()
                
                let docRef = db.collection("Grade\(SelectedGrade)Courses")
                docRef.getDocuments { (snapshot, error) in
                    guard let snapshot = snapshot, error == nil else {
                     //handle error
                     return
                   }
                   snapshot.documents.forEach({ (documentSnapshot) in
                       let documentData = documentSnapshot.data()
                       let CourseNameNewUser = documentData["CourseName"] as? String
                       AvaliableCourses.append(CourseNameNewUser ?? "Error")
                   })
                    GetManditoryCourses()
                 }
            } catch {
                print("Error")
            }
        }
    }
    func GetManditoryCourses() {
        ManditoryCourses = []
        let db = Firestore.firestore()
        
        let docRef = db.collection("MandatoryCourses").document("Grade\(SelectedGrade)")
        docRef.getDocument { (document, error) in
             guard error == nil else {
                 print("error", error ?? "")
                 return
             }

             if let document = document, document.exists {
                 let data = document.data()
                 if let data = data {
                     ManditoryCourses = data["Courses"] as! NSArray as? [String] ?? []
                     for k in ManditoryCourses{
                         if let Index = AvaliableCourses.firstIndex(where: { $0 == k }){
                             AvaliableCourses.remove(at: Index)
                         }
                     }
                 }
             }

         }
    }
}
