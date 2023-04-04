//
//  CreateCommition.swift
//  Pauly Backend
//
//  Created by Andrew Mainella on 2023-03-30.
//

import Foundation
import SwiftUI
import FirebaseFirestore
import CoreLocation


struct CommitionType{
    let Title: String
    let Caption: String
    let StartDate: Date
    let EndDate: Date
    let Cards: [Int]
    let Hidden: Bool
    let FirebaseID: Int
    let Value: Int
}


struct CreateNewCommitionsView: View{
    @Binding var SelectedCommitionsModes: CommitionsModes
    @State var Title: String = ""
    @State var Caption: String = ""
    @State var StartDate: Date = Date.now
    @State var EndDate: Date = Date.now
    @State var SelectedCards: [Int] = []
    @State var Hidden: Bool = false
    @State var SelectedValue: Int = 1
    @State var FirebaseID: Int = 0
    @State var SelectedLongitude: String = ""
    @State var SelectedLaditude: String = ""
    @State var Proximity: String = ""
    @State var PaulyPoints: String = "0"
    let AvaliableValues: [Int] = [1,2,3,4,5]
    var body: some View{
        ScrollView{
            VStack{
                Group{
                    Text("CreateNewCommition")
                    TextField("Title", text: $Title)
                    TextField("Caption", text: $Caption)
                    DatePicker("Enter Start Date", selection: $StartDate)
                       .datePickerStyle(GraphicalDatePickerStyle())
                       .frame(maxHeight: 400)
                    DatePicker("Enter Start Date", selection: $EndDate)
                       .datePickerStyle(GraphicalDatePickerStyle())
                       .frame(maxHeight: 400)
                }
                AddClassViewAvaliableCoursesView(Cards: $SelectedCards)
                Button(){
                    SelectedCommitionsModes = .CardPage
                } label: {
                    HStack{
                        Text("Add Card")
                        Divider()
                        Text("Warning This will leave the page")
                            .foregroundColor(.red)
                    }
                }
                Toggle("Hidden?", isOn: $Hidden)
                
                TextField("How Many Points Is This is worth", text: $PaulyPoints)
                
                Picker("Selected Value", selection: $SelectedValue){
                    ForEach(AvaliableValues, id: \.self){
                        Text("\($0)")
                    }
                }
                if SelectedValue == 2 || SelectedValue == 4{
                    TextField("Laditude", text: $SelectedLaditude)
                    TextField("Longitude", text: $SelectedLongitude)
                    TextField("Proximity", text: $Proximity)
                }
                Button(){
                    do{
                        var inputData: [String: Any] = [
                            "Title":Title,
                            "Caption":Caption,
                            "StartDate":StartDate,
                            "EndDate":EndDate,
                            "SelectedCards":SelectedCards,
                            "Hidden":Hidden,
                            "Value":SelectedValue,
                            "Points":Int(PaulyPoints)!
                        ]
                        
                        if SelectedValue == 2 || SelectedValue == 4{
                            inputData["Coordinate"] = GeoPoint(latitude: Double(SelectedLaditude)!, longitude: Double(SelectedLongitude)!)
                            inputData["Proximity"] = Double(Proximity)!
                        }
                        let db = FirebaseFirestore.Firestore.firestore()

                        var docRef = db.collection("Commissions").document("CommissionsCount")

                        docRef.getDocument { (document, error) in
                             guard error == nil else {
                                 print("error", error ?? "")
                                 return
                             }

                             if let document = document, document.exists {
                                 let data = document.data()
                                 if let data = data {
                                     FirebaseID = (data["CommissionsCount"] as? Int ?? 0) + 1
                                     inputData["FirebaseID"] = FirebaseID
                                     docRef.setData(["CommissionsCount":FirebaseID]) { error in
                                         if let error = error {
                                             print("Error writing document: \(error)")
                                         } else {
                                             docRef = db.collection("Commissions").document("\(FirebaseID)")
                                             docRef.setData(inputData) { error in
                                                 if let error = error {
                                                     print("Error writing document: \(error)")
                                                 } else {
                                                     SelectedCommitionsModes = .HomePage
                                                 }
                                             }
                                         }
                                     }
                                 }
                             }
                         }
                    } catch {
                        print("An Error has occured")
                    }
                } label: {
                    Text("Confirm")
                }
                Button(){
                    SelectedCommitionsModes = .HomePage
                } label: {
                    Text("back")
                }
            }
        }
    }
}

struct CommitionsHomePageView: View{
    @Binding var SelectedCommitionsModes: CommitionsModes
    @State var AvaliableCommitions: [CommitionType] = []
    var body: some View{
        VStack{
            Text("Commissions")
            HStack{
                List{
                    ForEach(AvaliableCommitions, id: \.FirebaseID) { Commition in
                        HStack{
                            Text(Commition.Title)
                            Divider()
                            Text(Commition.Caption)
                        }
                    }
                    Button(){
                        SelectedCommitionsModes = .CreateNew
                    } label: {
                        Text("Create New Commition")
                    }
                }.padding()
            }
        }.onAppear(){
            FetchCommitions()
        }
    }
    func FetchCommitions() {
        Task{
            do{
                let db = Firestore.firestore()

                let docRef = db.collection("Commissions")
                docRef.getDocuments { (snapshot, error) in
                    guard let snapshot = snapshot, error == nil else {
                     //handle error
                     return
                   }
                   print("Number of documents: \(snapshot.documents.count ?? -1)")
                   snapshot.documents.forEach({ (documentSnapshot) in
                       let documentData = documentSnapshot.data()
                       print(documentData)
    
                       let CardID = documentData["FirebaseID"] as? Int ?? 0
                       
                       if CardID != 0 {
                           let CardStartStamp = documentData["StartDate"] as! Timestamp
                           let CardStart = CardStartStamp.dateValue()
                           let CardTitle = documentData["Title"] as? String ?? "Error"
                           let CardCaption = documentData["Caption"] as? String ?? "Error"
                           let CardEndStamp = documentData["EndDate"] as? Timestamp
                           let CardEnd = CardEndStamp!.dateValue()
                           let CardHidden = documentData["Hidden"] as? Bool
                           let CardValue = documentData["Value"] as? Int
                           let CardSelectedCards = documentData["SelectedCards"] as! NSArray as? [Int]
                           
                           AvaliableCommitions.append(CommitionType(Title: CardTitle, Caption: CardCaption, StartDate: CardStart, EndDate: CardEnd, Cards: CardSelectedCards!, Hidden: CardHidden!, FirebaseID: CardID, Value: CardValue!))
                       }
                       
                   })
                 }
            } catch {
                print("Error")
            }
        }
    }
}

enum CommitionsModes{
    case CreateNew
    case HomePage
    case CardPage
}

struct CommitionsView: View{
    @State var SelectedCommitionsModes: CommitionsModes = .HomePage
    @Binding var AccessToken: String?
    var body: some View{
        if SelectedCommitionsModes == .HomePage{
            CommitionsHomePageView(SelectedCommitionsModes: $SelectedCommitionsModes)
        } else {
            if SelectedCommitionsModes == .CreateNew{
                CreateNewCommitionsView(SelectedCommitionsModes: $SelectedCommitionsModes)
            } else {
                if SelectedCommitionsModes == .CardPage{
                    CardView(EditClassPageSelected: .constant(.PageOne), LastPageSelected: .constant(.PageOne), AccessToken: $AccessToken)
                }
            }
        }
    }
}
