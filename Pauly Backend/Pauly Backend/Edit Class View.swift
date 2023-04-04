//
//  Edit Class View.swift
//  Pauly Backend
//
//  Created by Andrew Mainella on 2023-03-17.
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
    @Binding var Grade: Int
    @Binding var CourseNameSelected: String
    @Binding var EditClassPageSelected: EditClassViewPages
    @Binding var Section: Int
    @Binding var LastPageSelected: EditClassViewPages
    
    @State var SelectedCards: [CardType] = []
    @State var NotSelectedCards: [CardType] = []
    @Binding var Cards: [Int]
    
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
    
    var body: some View{
        ZStack{
            Rectangle()
                .foregroundColor(Color.marron)
            VStack{
                Text("Edit Class")
                Picker("BackgroundStyle", selection: $backgroundStyle){
                    Text("Gradient 1").tag(1)
                }
                HStack{
                    VStack{
                        Text("Not Slected Cards")
                        ForEach(NotSelectedCards, id: \.FirebaseID) { x in
                            Button(){
                                if let Index = NotSelectedCards.firstIndex(where: { $0.FirebaseID == x.FirebaseID }){
                                    NotSelectedCards.remove(at: Index)
                                    Cards.append(x.FirebaseID)
                                    SelectedCards.append(x)
                                    DidCardsChange = true
                                    
                                }
                            } label: {
                                Text(x.Use)
                            }
                        }
                    }
                    VStack{
                        Text("Selected Cards")
                        ForEach(Cards, id: \.self) { card in
                            if let index = SelectedCards.firstIndex(where: {$0.FirebaseID == card}) {
                                let ButtonCard = SelectedCards[index]
                                Button(){
                                    NotSelectedCards.append(ButtonCard)
                                    if let Index = SelectedCards.firstIndex(where: { $0.FirebaseID == card }){
                                        SelectedCards.remove(at: Index)
                                        if let CardIndex = Cards.firstIndex(where: { $0 == card }){
                                            Cards.remove(at: CardIndex)
                                            DidCardsChange = true
                                        }
                                    }
                                } label: {
                                    Text(ButtonCard.Title)
                                    Text(ButtonCard.Use)
                                }
                            } else {
                                Text("error")
                                    .onAppear(){
                                        print(card)
                                        print(SelectedCards)
                                    }
                            }
                        }
                    }
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
                    Button(){
                        EditClassPageSelected = .PageTwo
                    } label: {
                        Text("Back")
                    }.onAppear(){
                        GetCards()
                        let db = Firestore.firestore()
                        
                        var SectionID: String = ""
                        if Section == 0{
                            SectionID = "0"
                        } else {
                            SectionID = "\(Section)-2023"
                        }
                        
                        let docRef = db.collection("Grade\(Grade)Courses").document(CourseNameSelected).collection("Sections").document(SectionID)
                        docRef.getDocument { (document, error) in
                            guard error == nil else {
                                print("error", error ?? "")
                                return
                            }

                            if let document = document, document.exists {
                                let data = document.data()
                                if let data = data {
                                    backgroundStyle = data["BackgroundStyle"] as? Int ?? 1
                                    Cards = data["Page Info"] as! NSArray as? [Int] ?? []
                                }
                            }
                        }
                    }
                    Spacer()
                    Button(){
                        EditClassPageSelected = .EditCards
                        LastPageSelected = .PageThree
                    } label: {
                        Text("Edit Cards")
                    }
                    Spacer()
                    Button(){
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
                                    EditClassPageSelected = .PageTwo
                                }
                            }
                        }
                    } label: {
                        Text("Confirm")
                    }
                    Spacer()
                }
            }
        }
    }
    func GetCards() {
        do{
            NotSelectedCards = []
            let db = Firestore.firestore()
            
            var docRef = db.collection("Cards")
            docRef.getDocuments { (snapshot, error) in
                guard let snapshot = snapshot, error == nil else {
                 //handle error
                 return
               }
               print("Number of documents: \(snapshot.documents.count ?? -1)")
               snapshot.documents.forEach({ (documentSnapshot) in
                   let documentData = documentSnapshot.data()
                   let CardID = documentData["FirebaseID"] as? Int ?? 0
                   let CardUse = documentData["Use"] as? String ?? "Error"
                   let CardTitle = documentData["Title"] as? String ?? "Error"
                   let CardCaption = documentData["Caption"] as? String ?? "Error"
                   let CardDestination = documentData["Destination"] as? Int ?? 0
                   let CardCardData = documentData["CardData"] as? [String] ?? []
                   let CardCardDataName = documentData["CardDataName"] as? [String] ?? []
                   if CardID != 0{
                       NotSelectedCards.append(CardType(FirebaseID: CardID, Use: CardUse, Title: CardTitle, Caption: CardCaption, Destination: CardDestination, CardData: CardCardData, CardDataName: CardCardDataName, CardDataType: nil))
                   }
               })
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
                             for k in Cards{
                                 if let Index = NotSelectedCards.firstIndex(where: { $0.FirebaseID == k }){
                                     SelectedCards.append(NotSelectedCards[Index])
                                     NotSelectedCards.remove(at: Index)
                                 }
                             }
                         }
                     }

                 }
             }
        } catch {
            print("Error")
        }
    }
}

struct EditClassViewPageTwo: View{
    @Binding var Grade: Int
    @Binding var SelectedClass: String
    @Binding var SelectedSection: Int
    @State var AvaliableSections: [Int] = []
    @Binding var EditClassPageSelected: EditClassViewPages
    var body: some View{
        VStack{
            HStack{
                Button(){
                    EditClassPageSelected = .PageOne
                } label: {
                    Text("Back")
                }
                Spacer()
                Text("Please Choose a Section")
                    .font(.largeTitle)
                Spacer()
                Spacer()
            }
            List(){
                ForEach(AvaliableSections, id: \.self){ Section in
                    Button(){
                        EditClassPageSelected = .PageThree
                        SelectedSection = Section
                    } label: {
                        Text("\(Section)")
                    }
                }
                Button(){
                    EditClassPageSelected = .AddClass
                } label: {
                    Text("Add A Section")
                }
            }.onAppear(){
                GetSections()
            }
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
    @Binding var SelectedBackendMode: EnumBackendMode
    @Binding var Grade: Int
    @Binding var SelectedClass: String
    @Binding var EditClassPageSelected: EditClassViewPages
    @Binding var AddingEmumSelcted: AddingEnum
    
    let Grades: [Int] = [9, 10 ,11 ,12]
    
    @State var AvaliableCourses: [String] = []
    
    var body: some View{
        VStack{
            Text("Choose Class")
            Picker("Please Choose a Grade", selection: $Grade) {
                ForEach(Grades, id: \.self) {
                    Text("\($0)")
                }
            }
            List{
                ForEach(AvaliableCourses, id: \.self){ Avaliable in
                    Button(){
                        SelectedClass = Avaliable
                        EditClassPageSelected = .PageTwo
                    } label: {
                        Text(Avaliable)
                    }
                }
                Button(){
                    EditClassPageSelected = .AddRootClass
                } label: {
                    Text("Add Class")
                }
                Button(){
                    EditClassPageSelected = .EditManditoryClasses
                } label: {
                    Text("Edit Manditory Classes")
                }
            }.onAppear(){
                GetCourses()
            }
            .onChange(of: Grade){ value in
                GetCourses()
            }
            .padding()
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
    @Binding var EditClassPageSelected: EditClassViewPages
    @State var AvaliableCourses: [String] = []
    @State var ManditoryCourses: [String] = []
    let AvaiableGrades: [Int] = [9, 10, 11, 12]
    @State var SelectedGrade: Int = 9
    @State var isAnyChange: Bool = false
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
                    Task{
                        do{
                            let db = Firestore.firestore()
                            
                            let docRef = db.collection("MandatoryCourses").document("Grade\(SelectedGrade)")
                            docRef.updateData(["Courses": ManditoryCourses]) { error in
                                if let error = error {
                                    print("Error updating document: \(error)")
                                } else {
                                    print("Document successfully updated!")
                                    EditClassPageSelected = .PageOne
                                }
                            }
                        } catch {
                            print("Error")
                        }
                    }
                } else {
                    EditClassPageSelected = .PageOne
                }
            } label: {
                Text("Confirm Changes")
            }
            Button(){
                EditClassPageSelected = .PageOne
            } label: {
                Text("Back")
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
        Task{
            do{
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
            } catch {
                print("Error")
            }
        }
    }
}

enum EditClassViewPages{
    case PageOne
    case PageTwo
    case PageThree
    case AddClass
    case AddRootClass
    case EditCards
    case EditManditoryClasses
}

struct EditClassView: View{
    @Binding var SelectedBackendMode: EnumBackendMode
    @Binding var AddingEmumSelcted: AddingEnum
    @Binding var AccessToken: String?

    @State var LastPageSelected: EditClassViewPages = .PageOne
    @State var Cards: [Int] = []
    @State var CourseNameSelected: String = ""
    @State var Grade: Int = 9
    @State var SelectedSection: Int = 0
    @State var EditClassPageSelected: EditClassViewPages = .PageOne
    
    var body: some View{
        switch EditClassPageSelected {
        case .PageOne:
            EditClassViewPageOne(SelectedBackendMode: $SelectedBackendMode, Grade: $Grade, SelectedClass: $CourseNameSelected, EditClassPageSelected: $EditClassPageSelected, AddingEmumSelcted: $AddingEmumSelcted)
        case .PageTwo:
            EditClassViewPageTwo(Grade: $Grade, SelectedClass: $CourseNameSelected, SelectedSection: $SelectedSection, EditClassPageSelected: $EditClassPageSelected)
        case .PageThree:
            EditClassViewPageThree(Grade: $Grade, CourseNameSelected: $CourseNameSelected, EditClassPageSelected: $EditClassPageSelected, Section: $SelectedSection, LastPageSelected: $LastPageSelected, Cards: $Cards)
        case .AddClass:
            AddClassView(EditClassPageSelected: $EditClassPageSelected)
        case .AddRootClass:
            AddRootClassView(EditClassPageSelected: $EditClassPageSelected, LastPageSelected: $LastPageSelected)
        case .EditCards:
            CardView(EditClassPageSelected: $EditClassPageSelected, LastPageSelected: $LastPageSelected, AccessToken: $AccessToken)
        case .EditManditoryClasses:
            EditManditoryClassesView(EditClassPageSelected: $EditClassPageSelected)
        }
    }
}
