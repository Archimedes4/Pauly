//
//  PermissionsManager.swift
//  Pauly Backend
//
//  Created by Andrew Mainella on 2023-04-06.
//

import SwiftUI
import FirebaseFirestore

struct UserPermissionsType{
    let id: UUID = UUID()
    let Name: String
    var Permissions: [Int]
    let UserID: String
}

enum PermissionsManagerViewMode{
    case Home
    case User
}

struct PermissionsManager: View {
    @State var SelectedPermissionsManagerViewMode: PermissionsManagerViewMode = .Home
    @State var SelectedUser: UserPermissionsType?
    var body: some View{
        switch SelectedPermissionsManagerViewMode {
        case .Home:
            PermissionsManagerHome(SelectedUser: $SelectedUser, SelectedPermissionsManagerViewMode: $SelectedPermissionsManagerViewMode)
        case .User:
            PermissionsManagerUser(SelectedUser: $SelectedUser, SelectedPermissionsManagerViewMode: $SelectedPermissionsManagerViewMode)
        }
    }
}

struct PermissionsManagerHome: View{
    @Binding var SelectedUser: UserPermissionsType?
    @Binding var SelectedPermissionsManagerViewMode: PermissionsManagerViewMode
    @State var users: [UserPermissionsType] = []
    @State var loadingUsers: Bool = true
    var body: some View {
        VStack{
            Text("Permissions Manager")
            if loadingUsers{
                ProgressView()
                    .onAppear() {
                        FetchUsers()
                    }
            } else {
                List(){
                    ForEach(users, id: \.id) { user in
                        Button(){
                            SelectedUser = user
                            SelectedPermissionsManagerViewMode = .User
                        } label: {
                            HStack{
                                Text(user.Name)
                                Divider()
                                Text(user.Permissions.description)
                            }
                        }
                    }
                }
            }
        }
    }
    func FetchUsers() {
        let db = Firestore.firestore()
        let docRef = db.collection("Users")
        docRef.getDocuments { (snapshot, error) in
           guard let snapshot = snapshot, error == nil else {
            //handle error
            return
          }
          snapshot.documents.forEach({ (documentSnapshot) in
            let documentData = documentSnapshot.data()
              let FirstName = documentData["First Name"] as? String
              let LastName = documentData["Last Name"] as? String
              let Per = documentData["Permissions"] as? NSArray as? [Int] ?? []
              let UserID = documentData["uid"] as? String
              users.append(UserPermissionsType(Name: "\(FirstName!) \(LastName!)", Permissions: Per, UserID: UserID!))
          })
            loadingUsers = false
        }
    }
}


struct PermissionsManagerUser: View{
    @Binding var SelectedUser: UserPermissionsType?
    @Binding var SelectedPermissionsManagerViewMode: PermissionsManagerViewMode
    let AvaliablePermissions: [Int] = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19]
    @State var SelectedPermission: Int = 0
    @State var Classes: [String] = []
    @State var Teams: [String] = []
    @State var SelectedCardPermissionState: Int = 0
    @State var SelectedClassPermissionState: Int = 0
    @State var ClassSelectedGrade: Int = 0
    @State var ClassSelectedCourse: String = ""
    @State var ClassSelectedSection: String = ""
    let AvaliableGrade: [Int] = [9,10,11,12]
    @State var AvaliableCoursesForGrade: [String] = []
    @State var AvaliableSectionsForCourse: [String] = []
    @State var SelectedSportsPermissionState: Int = 0
    @State var AvaliableSports: [String] = []
    @State var SelectedSport: String = ""
    @State var AvaliableSeason: [Int] = []
    @State var SelectedSeason: Int = 0
    @State var AvaliableTeams: [String] = []
    @State var SelectedTeam: String = ""
    @State var PermissionsChanged: Bool = false
    @State var TeamsPermissions: [String] = []
    @State var ClassPermissions: [String] = []
    var body: some View{
        VStack{
            Button(){
                SelectedPermissionsManagerViewMode = .Home
            } label: {
                Text("back")
            }
            Text("User \(SelectedUser!.Name)")
                .onAppear(){
                    if SelectedUser!.Permissions.contains(15){
                        let db = Firestore.firestore()
                        
                        let docRef = db.collection("Users").document(SelectedUser!.UserID)
                        
                        docRef.getDocument { (document, error) in
                            guard error == nil else {
                                print("error", error ?? "")
                                return
                            }
                            
                            if let document = document, document.exists {
                                let data = document.data()
                                if let data = data {
                                    SelectedSportsPermissionState = data["SportsMode"] as! Int
                                    if SelectedSportsPermissionState == 0{
                                        TeamsPermissions = data["SportPerms"] as! NSArray as? [String] ?? []
                                    }
                                }
                            }
                        }
                    }
                    if SelectedUser!.Permissions.contains(16){
                        let db = Firestore.firestore()
                        
                        let docRef = db.collection("Users").document(SelectedUser!.UserID)
                        
                        docRef.getDocument { (document, error) in
                            guard error == nil else {
                                print("error", error ?? "")
                                return
                            }
                            
                            if let document = document, document.exists {
                                let data = document.data()
                                if let data = data {
                                    SelectedCardPermissionState = data["CardMode"] as! Int
                                }
                            }
                        }
                    }
                    if SelectedUser!.Permissions.contains(19){
                        let db = Firestore.firestore()
                        
                        let docRef = db.collection("Users").document(SelectedUser!.UserID)
                        
                        docRef.getDocument { (document, error) in
                            guard error == nil else {
                                print("error", error ?? "")
                                return
                            }
                            
                            if let document = document, document.exists {
                                let data = document.data()
                                if let data = data {
                                    SelectedClassPermissionState = data["ClassMode"] as! Int
                                    if SelectedClassPermissionState == 0{
                                        ClassPermissions = data["ClassPerms"] as! NSArray as? [String] ?? []
                                    }
                                }
                            }
                        }
                    }
                }
            List(){
                ForEach(SelectedUser!.Permissions, id: \.self){ Perm in
                    HStack{
                        Text("\(Perm)")
                        Button(){
                            if let Index = SelectedUser!.Permissions.firstIndex(where: { $0 == Perm }){
                                SelectedUser!.Permissions.remove(at: Index)
                            }
                        } label: {
                            Text("Remove")
                        }
                    }
                }
            }
            Picker("Selected Permission", selection: $SelectedPermission){
                ForEach(AvaliablePermissions, id: \.self){ permission in
                    Text("\(permission)")
                }
            }
            if SelectedPermission != 0{
                if SelectedPermission == 15{
                    Picker("Sports Permission", selection: $SelectedSportsPermissionState){
                        Text("Sport").tag(0)
                        Text("Absolute").tag(1)
                    }
                    if SelectedSportsPermissionState == 0{
                        VStack{
                            Text(TeamsPermissions.description)
                            HStack{
                                Picker("Selected Sport", selection: $SelectedSport){
                                    ForEach(AvaliableSports, id: \.self){ sport in
                                        Text(sport)
                                    }
                                }
                                Picker("Selected Season", selection: $SelectedSeason){
                                    ForEach(AvaliableSeason, id: \.self){ sport in
                                        Text("\(sport)")
                                    }
                                }
                                Picker("Selected Team", selection: $SelectedTeam){
                                    ForEach(AvaliableTeams, id: \.self){ sport in
                                        Text(sport)
                                    }
                                }
                                Button("Confirm"){
                                    if SelectedSport == "Highlights"{
                                        TeamsPermissions.append("Highlights")
                                        PermissionsChanged = true
                                    } else {
                                        if SelectedSport != "" && SelectedSeason != 0 && SelectedTeam != ""{
                                            TeamsPermissions.append("\(SelectedSport)-\(SelectedSeason)-\(SelectedTeam)")
                                            PermissionsChanged = true
                                        }
                                    }
                                }
                            }.onAppear() {
                                AvaliableSports = []
                                
                                let db = FirebaseFirestore.Firestore.firestore()
                                
                                let docRef = db.collection("Sports")
                                
                                docRef.getDocuments { (snapshot, error) in
                                     guard let snapshot = snapshot, error == nil else {
                                      //handle error
                                      return
                                    }
                                    snapshot.documents.forEach({ (documentSnapshot) in
                                      let documentData = documentSnapshot.data()
                                      let name = documentData["Name"] as? String
                                        AvaliableSports.append(name ?? "Error")
                                    })
                                  }
                            }
                            .onChange(of: SelectedSport){ sport in
                                if SelectedSport == "Highlights"{
                                    SelectedSeason = 0
                                    SelectedTeam = "N/A"
                                } else {
                                    let db = FirebaseFirestore.Firestore.firestore()
                                    
                                    let docRef = db.collection("Sports").document(SelectedSport).collection("Seasons")
                                    
                                    docRef.getDocuments { (snapshot, error) in
                                         guard let snapshot = snapshot, error == nil else {
                                          //handle error
                                          return
                                        }
                                        snapshot.documents.forEach({ (documentSnapshot) in
                                          let documentData = documentSnapshot.data()
                                          let name = documentData["Season"] as? Int
                                            AvaliableSeason.append(name!)
                                        })
                                      }
                                }
                            }
                            .onChange(of: SelectedSeason){ sport in
                                let db = FirebaseFirestore.Firestore.firestore()
                                
                                let docRef = db.collection("Sports").document(SelectedSport).collection("Seasons").document("\(SelectedSeason)").collection("Teams")
                                
                                docRef.getDocuments { (snapshot, error) in
                                     guard let snapshot = snapshot, error == nil else {
                                      //handle error
                                      return
                                    }
                                    snapshot.documents.forEach({ (documentSnapshot) in
                                      let documentData = documentSnapshot.data()
                                      let name = documentData["TeamName"] as? String
                                        AvaliableTeams.append(name!)
                                    })
                                  }
                            }
                        }
                        
                    }
                } else {
                    if SelectedPermission == 16{
                        Picker("Card Permission", selection: $SelectedCardPermissionState){
                            Text("User").tag(0)
                            Text("Absolute").tag(1)
                        }
                    } else {
                        if SelectedPermission == 19{
                            Picker("Class Permission", selection: $SelectedClassPermissionState){
                                Text("Class").tag(0)
                                Text("Absolute").tag(1)
                            }
                            if SelectedClassPermissionState == 0{
                                VStack{
                                    Text(ClassPermissions.description)
                                    HStack{
                                        Picker("SelectedGrade", selection: $ClassSelectedGrade){
                                            ForEach(AvaliableGrade, id: \.self){ grade in
                                                Text("\(grade)")
                                            }
                                        }
                                        Picker("SelectedCourse", selection: $ClassSelectedCourse){
                                            ForEach(AvaliableCoursesForGrade, id: \.self){ grade in
                                                Text("\(grade)")
                                            }
                                        }
                                        Picker("SelectedSection", selection: $ClassSelectedSection){
                                            ForEach(AvaliableSectionsForCourse, id: \.self){ grade in
                                                Text("\(grade)")
                                            }
                                        }
                                        Button("Confirm"){
                                            if ClassSelectedGrade != 0 && ClassSelectedCourse != "" && ClassSelectedSection != ""{
                                                ClassPermissions.append("\(ClassSelectedGrade)-\(ClassSelectedCourse)-\(ClassSelectedSection)")
                                                PermissionsChanged = true
                                            }
                                        }
                                    }.onAppear(){
                                        let db = FirebaseFirestore.Firestore.firestore()
                                        
                                        let docRef = db.collection("Grade\(ClassSelectedGrade)Courses")
                                        
                                        docRef.getDocuments { (snapshot, error) in
                                             guard let snapshot = snapshot, error == nil else {
                                              //handle error
                                              return
                                            }
                                            snapshot.documents.forEach({ (documentSnapshot) in
                                              let documentData = documentSnapshot.data()
                                              let name = documentData["CourseName"] as? String
                                                AvaliableCoursesForGrade.append(name ?? "Error")
                                            })
                                          }
                                    }
                                    .onChange(of: ClassSelectedGrade){ newvalue in
                                        AvaliableCoursesForGrade = []
                                        let db = FirebaseFirestore.Firestore.firestore()
                                        
                                        let docRef = db.collection("Grade\(ClassSelectedGrade)Courses")
                                        
                                        docRef.getDocuments { (snapshot, error) in
                                             guard let snapshot = snapshot, error == nil else {
                                              //handle error
                                              return
                                            }
                                            snapshot.documents.forEach({ (documentSnapshot) in
                                              let documentData = documentSnapshot.data()
                                              let name = documentData["CourseName"] as? String
                                                AvaliableCoursesForGrade.append(name ?? "Error")
                                            })
                                          }
                                    }
                                    .onChange(of: ClassSelectedCourse){ course in
                                        let db = FirebaseFirestore.Firestore.firestore()
                                        
                                        let docRef = db.collection("Grade\(ClassSelectedGrade)Courses").document(ClassSelectedCourse).collection("Sections")
                                        
                                        docRef.getDocuments { (snapshot, error) in
                                             guard let snapshot = snapshot, error == nil else {
                                              //handle error
                                              return
                                            }
                                            snapshot.documents.forEach({ (documentSnapshot) in
                                              let documentData = documentSnapshot.data()
                                              let name = documentData["Section"] as? Int
                                                if name != 0{
                                                    let Year = documentData["School Year"] as? Int
                                                    AvaliableSectionsForCourse.append("\(name!)-\(Year!)")
                                                } else {
                                                    AvaliableSectionsForCourse.append("\(name!)")
                                                }
                                            })
                                          }
                                        
                                    }
                                }
                            }
                        }
                    }
                }
                HStack{
                    Button(){
                        if SelectedUser!.Permissions.contains(SelectedPermission){
                            
                        } else {
                            SelectedUser!.Permissions.append(SelectedPermission)
                            PermissionsChanged = true
                        }
                    } label: {
                        Text("Add Permission")
                    }
                    Button(){
                        if PermissionsChanged{
                            let db = Firestore.firestore()
                            
                            let docRef = db.collection("Users").document(SelectedUser!.UserID)
                            
                            var InputData: [String: Any] = [
                                "Permissions":SelectedUser!.Permissions
                            ]
                            if SelectedUser!.Permissions.contains(15){
                                InputData["SportsMode"] = SelectedSportsPermissionState
                                InputData["SportPerms"] = TeamsPermissions
                            }
                            if SelectedUser!.Permissions.contains(19){
                                InputData["ClassPerms"] = ClassPermissions
                                InputData["ClassMode"] = SelectedClassPermissionState
                            }
                            if SelectedUser!.Permissions.contains(16){
                                InputData["CardMode"] = SelectedCardPermissionState
                            }
                            docRef.setData(InputData, merge: true){ error in
                                if let error = error {
                                    print("Error writing document: \(error)")
                                } else {
                                    print("Document successfully written!")
                                }
                            }
                        }
                    } label: {
                        Text("Confirm")
                    }
                    Button(){
                        SelectedPermissionsManagerViewMode = .Home
                    } label: {
                        Text("Back")
                    }
                }
            }
        }
    }
    func FetchGradeCourses() {
        
    }
}
