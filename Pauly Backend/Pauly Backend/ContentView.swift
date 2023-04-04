//
//  ContentView.swift
//  Pauly Backend
//
//  Created by Andrew Mainella on 2023-03-15.
//

import SwiftUI
import FirebaseCore
import FirebaseAuth
import FirebaseFirestore

enum EnumBackendMode{
    case Password
    case Password1
    case Overview
}

struct ContentView: View{
    @State var SelectedBackendMode: EnumBackendMode = .Password
    @State var AddingEmumSelcted: AddingEnum = .Class
    @State var AccessToken: String?
    
    var body: some View{
        if SelectedBackendMode == .Password{
            PasswordView(SelectedBackendMode: $SelectedBackendMode)
        } else {
            if SelectedBackendMode == .Password1{
                InitializeMicrosoft(AccessToken: $AccessToken, SelectedBackendMode: $SelectedBackendMode)
            } else {
                if SelectedBackendMode == .Overview{
                    Overview(AddingEmumSelcted: $AddingEmumSelcted, SelectedBackendMode: $SelectedBackendMode, AccessToken: $AccessToken)
                }
            }
        }
    }
}

struct AddGroupView: View{
    @EnvironmentObject var Firestore: FirestoreManager
    
    @Binding var SelectedBackendMode: EnumBackendMode
    
    @State var Username: String = ""
    @State var ChatID: String = ""
    @State var Members: [[String:String]] = []
    @State var MembersCount: Int = 0
    var body: some View{
        ZStack{
            Rectangle()
                .foregroundColor(.gray)
            VStack{
                Text(Members.description)
                TextField("", text: $Username)
                Button(){
                    MembersCount += 1
                    Members.append(["User\(MembersCount)":Username])
                    Username = ""
                } label: {
                    Text("Add User")
                }
                Button(){
                    let Number = Firestore.Group
                    Firestore.Group = Number + 1
                    let inputData: [String: Any] = [
                        "Members":Members,
                        "GroupID":(Number + 1),
                        "MembersCount":MembersCount
                    ]
                    FirestoreManager().createGroup(Username: Username, docData: inputData, NewNum: (Number + 1))
                    SelectedBackendMode = .Overview
                } label: {
                    Text("Create")
                }
                
                Button(){
                    SelectedBackendMode = .Overview
                } label: {
                    Text("Back")
                }
                Button(){
                    FirestoreManager().fetchRestaurant()
                } label: {
                    Text("Number")
                }
            }
        }
    }
}

struct AddCalendarView: View{
    
    @Binding var SelectedBackendMode: EnumBackendMode
    
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
            VStack{
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
            .background(
                RoundedRectangle(cornerRadius: 25)
                    .fill(Color.white)
                    .shadow(color: .gray, radius: 2, x: 0, y: 2)
            )
        }
    }
}

extension Color{
    static var marron: Color {
        return Color("Marron")
    }
}
