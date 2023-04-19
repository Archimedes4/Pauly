//
//  GovernmentClassEditView.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-04-12.
//

import Foundation
import SwiftUI
import FirebaseCore
import FirebaseFirestore

struct AddClassView: View{
    let Sections: [Int] = [1,2,3,4,5,6,7]
    
    @State var CourseName: String
    @State var Teacher: String = ""
    @State var SchoolYear: Int = 2023
    @State var backgroundStyle: Int = 1
    @State var Section: Int = 1
    @State var CoursesAvaliable: [String] = []
    @State var Grade: Int

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
                .foregroundColor(.marron)
                .ignoresSafeArea()
            VStack{
                Group{
                    TextField("Teacher", text: $Teacher)
                        .padding()
                        .placeholder(when: Teacher.isEmpty){
                            Text("Teacher")
                                .foregroundColor(.black)
                        }
                    Picker("Section", selection: $Section){
                        ForEach(Sections, id: \.self) {
                            Text("\($0)")
                        }
                    }
                    Picker("BackgroundStyle", selection: $backgroundStyle){
                        Text("Gradient 1").tag(1)
                    }
                }
                NavigationLink(destination: GovernmentSelectedAddCardsOverview(PageInfo: $Cards)){
                    HStack{
                        Text("Edit Cards")
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
                        }.scrollContentBackground(.hidden)
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
                            HStack{
                                Text("Add")
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
                            "NoClass":NoClass,
                            "Semester":SelectedSemester
                        ]

                        let db = Firestore.firestore()

                        
                        print(" Grade\(Grade)Courses\(CourseName)/Sections/\(Section)-\(SchoolYear)")
                        
                        let docRef = db.collection("Grade\(Grade)Courses").document("\(CourseName)").collection("Sections").document("\(Section)-\(SchoolYear)")
                      
                        docRef.setData(inputData) { error in
                            if let error = error {
                                print("Error writing document: \(error)")
                            } else {
                                print("Document successfully written!")
                            }
                        }
                    } catch {
                        print("An Error has occured")
                    }

                } label: {
                    HStack{
                        Text("Create")
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
