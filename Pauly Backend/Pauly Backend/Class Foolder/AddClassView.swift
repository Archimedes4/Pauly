//
//  AddClassView.swift
//  Pauly Backend
//
//  Created by Andrew Mainella on 2023-03-21.
//

import SwiftUI
import FirebaseCore
import FirebaseAuth
import FirebaseFirestore

struct CardType: Hashable {
    let FirebaseID: Int
    let Use: String
    let BackgroundStyle: Int
    let Opacity: String
    
    //Card Face
    let Title: String?
    let Caption: String?
    let ImageRef: String?
    let SelectedColor: String?
    let LongText: String?
    
    //Card Destintation
    let CardData: [String]
    let CardDataName: [String]
    let CardDataType: [String]
    
    let Permissions: [String]
    let Hidden: Bool
    
}

//struct AddClassViewList: View{
//    @Binding var AvaliableCards: [CardType]
//    @Binding var Cards: [Int]
//    @Binding var NumberOfCards: Int
//    @Binding var CoursesAvaliable: [String]
//    @Binding var Grade: Int
//    
//    var body: some View{
//        ForEach(AvaliableCards, id: \.FirebaseID) { card in
//            Button(){
//                Cards.append(card.FirebaseID)
//                NumberOfCards += 1
//            } label: {
//                HStack{
//                    Text(card.Use)
//                    Text(String(describing: card))
//                }
//            }
//        }
//        .onAppear(){
//            Task{
//                do{
//                    AvaliableCards = []
//                    let db = Firestore.firestore()
//
//                    let docRef = db.collection("Cards")
//                    docRef.getDocuments { (snapshot, error) in
//                        guard let snapshot = snapshot, error == nil else {
//                         //handle error
//                         return
//                       }
//                       print("Number of documents: \(snapshot.documents.count ?? -1)")
//                       snapshot.documents.forEach({ (documentSnapshot) in
//                           let documentData = documentSnapshot.data()
//                           let CardID = documentData["FirebaseID"] as? Int ?? 0
//                           let CardUse = documentData["Use"] as? String ?? "Error"
//                           let CardTitle = documentData["Title"] as? String ?? "Error"
//                           let CardCaption = documentData["Caption"] as? String ?? "Error"
//                           let CardDestination = documentData["Destination"] as? Int ?? 0
//                           let CardCardData = documentData["CardData"] as? [String] ?? []
//                           let CardCardDataName = documentData["CardDataName"] as? [String] ?? []
//                           if CardID != 0 {
//                               AvaliableCards.append(CardType(FirebaseID: CardID, Use: CardUse, Title: CardTitle, Caption: CardCaption, Destination: CardDestination, CardData: CardCardData, CardDataName: CardCardDataName))
//                           }
//                           
//                       })
//                     }
//                } catch {
//                    print("Error")
//                }
//            }
//        }
//        .onAppear(){
//            let db = FirebaseFirestore.Firestore.firestore()
//            
//            let docRef = db.collection("Grade\(Grade)Courses")
//            
//            docRef.getDocuments { (snapshot, error) in
//                 guard let snapshot = snapshot, error == nil else {
//                  //handle error
//                  return
//                }
//                snapshot.documents.forEach({ (documentSnapshot) in
//                  let documentData = documentSnapshot.data()
//                  let name = documentData["CourseName"] as? String
//                    CoursesAvaliable.append(name ?? "Error")
//                })
//              }
//        }
//        .onChange(of: Grade){ newvalue in
//            CoursesAvaliable = []
//            let db = FirebaseFirestore.Firestore.firestore()
//            
//            let docRef = db.collection("Grade\(Grade)Courses")
//            
//            docRef.getDocuments { (snapshot, error) in
//                 guard let snapshot = snapshot, error == nil else {
//                  //handle error
//                  return
//                }
//                snapshot.documents.forEach({ (documentSnapshot) in
//                  let documentData = documentSnapshot.data()
//                  let name = documentData["CourseName"] as? String
//                    CoursesAvaliable.append(name ?? "Error")
//                })
//              }
//        }
//        
//    }
//}


struct AddClassViewAvaliableCoursesView: View{
    @Binding var Cards: [Int]
    @State var UnSelectedCard: [CardType] = []
    @State var SelectedCards: [CardType] = []
    var body: some View{
        HStack{
            VStack{
                Text("Selected Cards")
                ForEach(Cards, id: \.self){ card in
                    Button(){
                        if let Index = Cards.firstIndex(where: { $0 == card }){
                            Cards.remove(at: Index)
                            if let CardIndex = SelectedCards.firstIndex(where: { $0.FirebaseID == card }){
                                UnSelectedCard.append(SelectedCards[CardIndex])
                                SelectedCards.remove(at: CardIndex)
                            }
                        }
                    } label: {
                        HStack{
                            Text("\(card)")
                            Divider()
                            let CardValue = SelectedCards.firstIndex(where: { $0.FirebaseID == card })
                           
                            Text(SelectedCards[CardValue ?? 0].Use)
                        }
                    }
                }
            }
            VStack{
                Text("Avaliable Cards")
                ForEach(UnSelectedCard, id: \.FirebaseID) { card in
                    Button(){
                        if let Index = UnSelectedCard.firstIndex(where: { $0.FirebaseID == card.FirebaseID }){
                            UnSelectedCard.remove(at: Index)
                            Cards.append(card.FirebaseID)
                            SelectedCards.append(card)
                        }
                    } label: {
                        Text(card.Use)
                    }
                }
            }
        }.onAppear(){
            Task{
                do{
                    let db = Firestore.firestore()

                    let docRef = db.collection("Cards")
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
                           let CardCardDataType = documentData["CardDataType"] as? [String] ?? []
                           let CardBackgroundStyle = documentData["BackgroundStyle"] as? Int ?? 0
                           let CardOpacity = documentData["Opacity"] as? String ?? "Error"
                           let Permissions = documentData["Permissions"] as? NSArray as? [String]
                           let Hidden = documentData["Hidden"] as? Bool
                           if CardID != 0 {
                               UnSelectedCard.append(CardType(FirebaseID: CardID, Use: CardUse, BackgroundStyle: CardBackgroundStyle, Opacity: CardOpacity, Title: CardTitle, Caption: CardCaption, ImageRef: nil, SelectedColor: nil, LongText: nil, CardData: CardCardDataType, CardDataName: CardCardDataName, CardDataType: CardCardDataType, Permissions: Permissions!, Hidden: Hidden!))
                           }
                           
                       })
                     }
                } catch {
                    print("Error")
                }
            }
        }
    }
}

struct AddClassView: View{
    @Binding var EditClassPageSelected: EditClassViewPages

    let Grades: [Int] = [9, 10 ,11 ,12]
    let Sections: [Int] = [1,2,3,4,5,6,7]
    
    @State var CourseName: String = ""
    @State var Teacher: String = ""
    @State var SchoolYear: Int = 2023
    @State var backgroundStyle: Int = 1
    @State var Section: Int = 1
    @State var CoursesAvaliable: [String] = []
    @State var Grade: Int = 9

    @State var Cards: [Int] = []
    @State var NumberOfCards: Int = 0
    
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
                .foregroundColor(.gray)
            VStack{
                Group{
                    Picker("Please choose a grade", selection: $Grade) {
                        ForEach(Grades, id: \.self) {
                            Text("\($0)")
                        }
                    }
                    Picker("Please Choose a Class", selection: $CourseName){
                        ForEach(CoursesAvaliable, id: \.self) { card in
                            Text(card)
                        }
                    }
                    TextField("Teacher", text: $Teacher)
                    Picker("Section", selection: $Section){
                        ForEach(Sections, id: \.self) {
                            Text("\($0)")
                        }
                    }
                    Picker("BackgroundStyle", selection: $backgroundStyle){
                        Text("Gradient 1").tag(1)
                    }
                }

                AddClassViewAvaliableCoursesView(Cards: $Cards)
                Button(){
                    EditClassPageSelected = .EditCards
                } label: {
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
                Button(){
                    do{
                        let inputData: [String: Any] = [
                            "CourseName":CourseName,
                            "Teacher": Teacher,
                            "School Year":SchoolYear,
                            "Section":Section,
                            "BackgroundStyle":backgroundStyle,
                            "NumberOfPages":NumberOfCards,
                            "Page Info":Cards,
                            "DayA":SelectedPeriodDayA,
                            "DayB":SelectedPeriodDayB,
                            "DayC":SelectedPeriodDayC,
                            "DayD":SelectedPeriodDayD,
                            "NoClass":NoClass
                        ]

                        let db = FirebaseFirestore.Firestore.firestore()

                        var docRef = db.collection("Grade\(Grade)Courses").document("\(CourseName)").collection("Sections").document("\(Section)-\(SchoolYear)")

                        docRef.setData(inputData) { error in
                            if let error = error {
                                print("Error writing document: \(error)")
                            } else {
                                print("Document successfully written!")
                            }
                        }
                        EditClassPageSelected = .PageTwo
                    } catch {
                        print("An Error has occured")
                    }

                } label: {
                    Text("Create")
                }
                Button(){
                    EditClassPageSelected = .PageThree
                } label: {
                    Text("Back")
                }
            }.onAppear(){
                let db = FirebaseFirestore.Firestore.firestore()
                
                let docRef = db.collection("Grade\(Grade)Courses")
                
                docRef.getDocuments { (snapshot, error) in
                     guard let snapshot = snapshot, error == nil else {
                      //handle error
                      return
                    }
                    snapshot.documents.forEach({ (documentSnapshot) in
                      let documentData = documentSnapshot.data()
                      let name = documentData["CourseName"] as? String
                        CoursesAvaliable.append(name ?? "Error")
                    })
                  }
            }
            .onChange(of: Grade){ newvalue in
                CoursesAvaliable = []
                let db = FirebaseFirestore.Firestore.firestore()
                
                let docRef = db.collection("Grade\(Grade)Courses")
                
                docRef.getDocuments { (snapshot, error) in
                     guard let snapshot = snapshot, error == nil else {
                      //handle error
                      return
                    }
                    snapshot.documents.forEach({ (documentSnapshot) in
                      let documentData = documentSnapshot.data()
                      let name = documentData["CourseName"] as? String
                        CoursesAvaliable.append(name ?? "Error")
                    })
                  }
            }
        }
    }
}
