//
//  AddClassViewRoot.swift
//  Pauly Backend
//
//  Created by Andrew Mainella on 2023-03-20.
//

import Foundation
import SwiftUI
import FirebaseCore
import FirebaseFirestore

struct AddRootClassView: View {
    @Binding var EditClassPageSelected: EditClassViewPages
    @Binding var LastPageSelected: EditClassViewPages
    
    @State var CourseName: String = ""
    @State var Teacher: String = ""
    @State var backgroundStyle: Int = 1
    @State var CoursesAvaliable: [String] = []
    @State var Grade: Int = 9
    @State var NumberOfCards: Int = 0
    @State var isManditoryClass: Bool = false
    let Grades: [Int] = [9, 10 ,11 ,12]

    @State var Cards: [Int] = []
    @State var AvaliableCards: [CardType] = []
    @State var NotSelectedCards: [CardType] = []
    
    var body: some View{
        ZStack{
            Rectangle()
                .foregroundColor(.gray)
            ScrollView(){
                VStack{
                    Picker("Please choose a grade", selection: $Grade) {
                        ForEach(Grades, id: \.self) {
                            Text("\($0)")
                        }
                    }
                    Group{
                        TextField("Course Name", text: $CourseName)
                        TextField("Teacher", text: $Teacher)
                        Toggle("Manditory Course", isOn: $isManditoryClass)
                    }
                    Picker("BackgroundStyle", selection: $backgroundStyle){
                        Text("Gradient 1").tag(1)
                    }
                    Text("Selected Cards")
                    HStack{
                        VStack{
                            if NotSelectedCards.count != 0{
                                ForEach(NotSelectedCards, id: \.FirebaseID) { x in
                                    Text(x.Use)
                                }
                            } else {
                                Text("No Cards Selected")
                            }
                        }
                        Divider()
                        VStack{
                            ForEach(Cards, id: \.self) { card in
                                if let index = AvaliableCards.firstIndex(where: {$0.FirebaseID == card}){
                                    let ButtonCard = AvaliableCards[index]
                                    Button(){

                                    } label: {
                                        Text(ButtonCard.Title ?? "Title")
                                        Text(ButtonCard.Use)
                                    }.onAppear(){
                                        if let newindex = NotSelectedCards.firstIndex(where: {$0.FirebaseID  == card}){
                                            NotSelectedCards.remove(at: newindex)
                                        }
                                    }
                                } else {
                                    Text("error")
                                }
                            }
                        }
                    }
                    Button{
                        EditClassPageSelected = .EditCards
                        LastPageSelected = .PageOne
                    } label: {
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
                                        EditClassPageSelected = .PageOne
                                    } else {
                                        EditClassPageSelected = .PageOne
                                    }
                                }
                            }

                        } catch {
                            print("An Error has occured")
                        }
                        
                    } label: {
                        Text("Create")
                    }
                    Button(){
                        EditClassPageSelected = .PageOne
                    } label: {
                        Text("Back")
                    }
                    .onAppear(){
                        GetCards()
                    }
                }
            }
        }
    }
    func GetCards() {
        Task{
            do{
                AvaliableCards = []
                let db = Firestore.firestore()
                
                let docRef = db.collection("Cards")
                docRef.getDocuments { (snapshot, error) in
                    guard let snapshot = snapshot, error == nil else {
                     //handle error
                     return
                   }
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
                       if CardID != 0{
                           AvaliableCards.append(CardType(FirebaseID: CardID, Use: CardUse, BackgroundStyle: CardBackgroundStyle, Opacity: CardOpacity, Title: CardTitle, Caption: CardCaption, ImageRef: nil, SelectedColor: nil, LongText: nil, CardData: CardCardDataType, CardDataName: CardCardDataName, CardDataType: CardCardDataType, Permissions: [], Hidden: false))
                           NotSelectedCards.append(CardType(FirebaseID: CardID, Use: CardUse, BackgroundStyle: CardBackgroundStyle, Opacity: CardOpacity, Title: CardTitle, Caption: CardCaption, ImageRef: nil, SelectedColor: nil, LongText: nil, CardData: CardCardDataType, CardDataName: CardCardDataName, CardDataType: CardCardDataType, Permissions: [], Hidden: false))
                       }
                   })
                 }
            } catch {
                print("Error")
            }
        }
    }
}
