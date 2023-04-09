//
//  Pauly_BackendApp.swift
//  Pauly Backend
//
//  Created by Andrew Mainella on 2023-03-15.
//

import SwiftUI
import FirebaseFirestore
import Firebase

@main
struct Pauly_BackendApp: App {
    @StateObject var firestoreManager = FirestoreManager()
    
    init() {
            FirebaseApp.configure()
        }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(firestoreManager)
        }
    }
}

class FirestoreManager: ObservableObject{
    @Published var Group: Int = 8
    
    init() {
        fetchRestaurant()
    }
    
    func fetchRestaurant()  {
        let db = Firestore.firestore()

        let docRef = db.collection("Messaging").document("Groups")
        
        docRef.getDocument { (document, error) in
            guard error == nil else {
                print("error", error ?? "")
                return
            }

            if let document = document, document.exists {
                let data = document.data()
                if let data = data {
                    self.Group = data["GroupsCount"] as? Int ?? 8
                }
            }
        }
    }
    
    func createRestaurant(restaurantName: String, docData: [String: Any], Grade: Int) {
        let db = Firestore.firestore()

        let docRef = db.collection("Courses").document("Grade\(Grade)").collection(restaurantName).document("Info")

        docRef.setData(docData) { error in
            if let error = error {
                print("Error writing document: \(error)")
            } else {
                print("Document successfully written!")
            }
        }
    }
    func createGroup(Username: String, docData: [String: Any], NewNum: Int) {
        let db = Firestore.firestore()

        
        let docRef = db.collection("Messaging").document("Groups").collection("Group\(NewNum)").document("Info")

        docRef.setData(docData) { error in
            if let error = error {
                print("Error writing document: \(error)")
            } else {
                print("Document successfully written!")
            }
        }
        
        let docRef1 = db.collection("Messaging").document("Groups")
        
        docRef1.setData(["GroupsCount":NewNum]) { error in
            if let error = error {
                print("Error writing document: \(error)")
            } else {
                print("Document successfully written!")
            }
        }
    }
}
