//
//  GovernmentClassAddClassRootView.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-04-12.
//

import SwiftUI
import Foundation
import FirebaseCore
import FirebaseFirestore

struct AddRootClassView: View {
    @State var CourseName: String = ""
    @State var Teacher: String = ""
    @State var backgroundStyle: Int = 1
    @State var CoursesAvaliable: [String] = []
    @State var Grade: Int
    @State var NumberOfCards: Int = 0
    @State var isManditoryClass: Bool = false
    @State var Cards: [Int] = []
    @State var AvaliableCards: [CardType] = []
    @State var NotSelectedCards: [CardType] = []
    
    var body: some View{
        ZStack{
            Rectangle()
                .foregroundColor(Color.marron)
                .ignoresSafeArea()
            ScrollView(){
                VStack{
                    Group{
                        TextField("", text: $CourseName)
                            .padding(.leading)
                            .placeholder(when: CourseName.isEmpty){
                                Text("Course Name")
                                    .foregroundColor(.black)
                            }
                        TextField("", text: $Teacher)
                            .padding(.leading)
                            .placeholder(when: Teacher.isEmpty){
                                Text("Teacher")
                                    .foregroundColor(.black)
                            }
                        Toggle("Manditory Course", isOn: $isManditoryClass)
                    }
                    Picker("BackgroundStyle", selection: $backgroundStyle){
                        Text("Gradient 1").tag(1)
                    }
                    NavigationLink(destination: GovernmentSelectedAddCardsOverview(PageInfo: $Cards)){
                        Text("Edit Cards")
                    }
                    Button(){
                        do{
                            let inputData: [String: Any] = [
                                "CourseName":CourseName,
                                "Teacher": Teacher,
                                "Section":0,
                                "BackgroundStyle":backgroundStyle,
                                "NumberOfPages":NumberOfCards,
                                "Page Info":Cards
                            ]
                            
                            let db = FirebaseFirestore.Firestore.firestore()
                            
                            var docRef = db.collection("Grade\(Grade)Courses").document("\(CourseName)").collection("Sections").document("0")
                            
                            docRef.setData(inputData) { error in
                                if let error = error {
                                    print("Error writing document: \(error)")
                                } else {
                                    print("Document successfully written!")
                                }
                            }
                            
                            docRef = db.collection("Grade\(Grade)Courses").document("\(CourseName)")
                            
                            let inputData1: [String: Any] = [
                                "CourseName":CourseName
                            ]
                            
                            docRef.setData(inputData1) { error in
                                if let error = error {
                                    print("Error writing document: \(error)")
                                } else {
                                    print("Document successfully written!")
                                    if isManditoryClass{
                                        docRef = db.collection("MandatoryCourses").document("Grade\(Grade)")
                                        docRef.updateData([
                                            "Courses": FieldValue.arrayUnion([CourseName])
                                        ])
                                    } else {
                                    }
                                }
                            }

                        } catch {
                            print("An Error has occured")
                        }
                        
                    } label: {
                        HStack{
                            Text("Create")
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
