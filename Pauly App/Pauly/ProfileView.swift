//
//  ProfileView.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-03-11.
//

import Foundation
import SwiftUI
import FirebaseAuth
import FirebaseFirestore
import CoreLocation
import WidgetKit

enum profileViewEnum {
    case Home
    case Pauly
    case Leaderboard
    case Commissions
    case Resourses
    case Elections
    case GovernmentView
}

struct ProfileViewMain: View{
    @Binding var AccessToken: String?
    @EnvironmentObject var WindowMode: SelectedWindowMode
    
    @State var selectedProfileView: profileViewEnum = .Home
    var body: some View{
        switch selectedProfileView {
        case .Home:
            ProfileViewHome(selectedProfileView: $selectedProfileView)
                .environmentObject(WindowMode)
        case .Pauly:
            ProfileViewPauly(selectedProfileView: $selectedProfileView, accessToken: $AccessToken)
                .environmentObject(WindowMode)
        case .Leaderboard:
            ProfileViewLeaderboard(selectedProfileView: $selectedProfileView)
        case .Commissions:
            ProfileViewCommissions(accessToken: $AccessToken, selectedProfileView: $selectedProfileView)
                .environmentObject(WindowMode)
                .transition(.asymmetric(insertion: AnyTransition.opacity.combined(with: .slide), removal: .scale))
        case .Resourses:
            Resources(selectedProfileView: $selectedProfileView, AccessToken: $AccessToken)
        case.Elections:
            ElectionsView(selectedProfileView: $selectedProfileView)
        case .GovernmentView:
            GovernmentView(selectedProfileView: $selectedProfileView, accessToken: $AccessToken)
                .environmentObject(WindowMode)
        }
    }
}

struct ProfileViewHome: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    
    @Binding var selectedProfileView: profileViewEnum
    
    @State var HasAccessToGovernment: Bool = false
    @State var TextSize: CGSize = CGSize(width: 0, height: 0)
    var body: some View{
        VStack{
            ScrollView{
                HStack{
                    Button(){
                        WindowMode.SelectedWindowMode = .HomePage
                    } label: {
                        HStack{
                            Image(systemName: "chevron.backward")
                            Text("Back")
                        }
                    }.padding(.leading)
                    Spacer()
                }
                Image("Profile")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                Button(){
                    selectedProfileView = .Leaderboard
                } label: {
                    HStack{
                        Image(systemName: "medal")
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .foregroundColor(.black)
                            .frame(height: TextSize.height)
                        Text("Leaderboard")
                            .font(.system(size: 17))
                            .fontWeight(.bold)
                            .foregroundColor(.black)
                            .saveSize(in: $TextSize)
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
                Button(){
                    selectedProfileView = .Commissions
                } label: {
                    HStack{
                        Image(systemName: "star")
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .foregroundColor(.black)
                            .frame(height: TextSize.height)
                        Text("Commissions")
                            .font(.system(size: 17))
                            .fontWeight(.bold)
                            .foregroundColor(.black)
                            .saveSize(in: $TextSize)
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
                Button(){
                    selectedProfileView = .Resourses
                } label: {
                    HStack{
                        Image(systemName: "filemenu.and.selection")
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .foregroundColor(.black)
                            .frame(height: TextSize.height)
                        Text("Resources")
                            .font(.system(size: 17))
                            .fontWeight(.bold)
                            .foregroundColor(.black)
                            .saveSize(in: $TextSize)
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
                Button(){
                    selectedProfileView = .Elections
                } label: {
                    HStack{
                        Image(systemName: "checkmark")
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .foregroundColor(.black)
                            .frame(height: TextSize.height)
                        Text("Elections")
                            .font(.system(size: 17))
                            .fontWeight(.bold)
                            .foregroundColor(.black)
                            .saveSize(in: $TextSize)
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
                Button(){
                    selectedProfileView = .Pauly
                } label: {
                    HStack{
                        Image(systemName: "gear")
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .foregroundColor(.black)
                            .frame(height: TextSize.height)
                        Text("Settings")
                            .font(.system(size: 17))
                            .fontWeight(.bold)
                            .foregroundColor(.black)
                            .saveSize(in: $TextSize)
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
                }.onAppear(){
                    CheckIfUserHasPerms(){ Result in
                        HasAccessToGovernment = Result
                    }
                }
                if HasAccessToGovernment{
                    Button(){
                        selectedProfileView = .GovernmentView
                    } label: {
                        HStack{
                            Image(systemName: "building.columns")
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .foregroundColor(.black)
                                .frame(height: TextSize.height)
                            Text("Government")
                                .font(.system(size: 17))
                                .fontWeight(.bold)
                                .foregroundColor(.black)
                                .saveSize(in: $TextSize)
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
                Spacer()
            }
        }.background(Color.marron)
    }
    func CheckIfUserHasPerms(completion: @escaping (Bool) -> ()) {
        guard let userUID = Auth.auth().currentUser?.uid else {
            completion(false)
            return
        }
        let db = Firestore.firestore()
        
        let docRef = db.collection("Users").document(userUID)
        
        docRef.getDocument { (document, error) in
            guard error == nil else {
                print("error", error ?? "")
                completion(false)
                return
            }
            
            if let document = document, document.exists {
                let data = document.data()
                if let data = data{
                    guard let CommissionsComplete = data["Permissions"] as? NSArray as? [Int] else {
                        completion(false)
                        return
                    }
                    if CommissionsComplete.contains(3){
                        completion(true)
                    }
                } else {
                    completion(false)
                }
            }
        }
    }
}

struct ProfileViewMangeSection: View{
    @State var AvaliableSections: [Int] = []
    
    @Binding var SelectedCourses: [CourseSelectedType]
    @State var Grade: Int
    @State var CourseName: String
    
    var body: some View{
        ZStack{
            Rectangle()
                .fill(Color.marron)
                .edgesIgnoringSafeArea(.all)
            VStack{
                HStack{
                    Spacer()
                    Text("Please Choose a Section")
                    Spacer()
                }
                if AvaliableSections.count != 0{
                    List{
                        ForEach(AvaliableSections, id: \.self){ section in
                            Button(){
                                SelectedCourses.append(CourseSelectedType(Name: CourseName, Section: section, Year: 2023, Grade: Grade))   //TO DO ADD YEAR
                            } label: {
                                Text("\(section)")
                            }
                        }
                    }.background(Color.marron)
                    .scrollContentBackground(.hidden)
                } else {
                    VStack{
                        Spacer()
                        ProgressView()
                        Text("If loading is taking a long time there are no sections")
                        Spacer()
                    }
                    
                }
            }.onAppear(){
                Task{
                    do{
                        let db = Firestore.firestore()
                        let docRef = db.collection("Grade\(Grade)Courses").document(CourseName).collection("Sections")
                        docRef.getDocuments { (snapshot, error) in
                            guard let snapshot = snapshot, error == nil else {
                             //handle error
                             return
                           }
                           snapshot.documents.forEach({ (documentSnapshot) in
                               let documentData = documentSnapshot.data()
                               let CoureseSectionNewUser = documentData["Section"] as? Int ?? 0
                               if CoureseSectionNewUser != 0 {
                                   AvaliableSections.append(CoureseSectionNewUser)
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
}

struct ProfileViewManageCourses: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    
    @Environment(\.colorScheme) var colorScheme
    
    @State var CoursesSelected: [CourseSelectedType] = []
    @State var AvaliableCourses: [String] = []
    
    @State var CurrentSchoolYear: Int = 2023
    @State var ErrorMessage: String = ""
    @State var ShowingErrorMessage: Bool = false
    let Sections: [Int] = [1,2,3,4,5,6,7]
    
    @State var PageLoading: Bool = true
    
    var body: some View{
        VStack{
            if PageLoading {
                ProgressView()
                    .onAppear(){
                        let db = Firestore.firestore()
                        let docRef = db.collection("Grade\(WindowMode.GradeIn)Courses")
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
                            CoursesSelected = WindowMode.SelectedCourses
                            PageLoading = false
                         }
                    }
            } else {
                GeometryReader{ geo in
                    VStack{
                        HStack(){
                            Spacer()
                            Text("Select Grade \(WindowMode.GradeIn ) Class")
                                .foregroundColor(colorScheme == .dark ? Color.black : Color.white)
                            Spacer()
                        }
                        List{
                            Section{
                                ForEach(CoursesSelected, id: \.id){ course in
                                    HStack{
                                        Text("\(course.Name)    Section:\(course.Section)")
                                        Spacer()
                                        Button{
                                            if let Index = CoursesSelected.firstIndex(where: { $0.id == course.id }){
                                                CoursesSelected.remove(at: Index)
                                                AvaliableCourses.append(course.Name)
                                            }
                                        } label: {
                                            Image(systemName: "minus.circle")
                                                .foregroundColor(.red)
                                        }.buttonStyle(.plain)
                                        
                                    }
                                }
                            }
                            //.shadow(color: .gray, radius: 2, x: 0, y: 2) //To DO add shadow to section
        
                            Section{
                                ForEach(AvaliableCourses, id: \.self){ course in
                                    if CoursesSelected.contains(where: { $0.Name == course }) == false{
                                        NavigationLink(destination: ProfileViewMangeSection(SelectedCourses: $CoursesSelected, Grade: WindowMode.GradeIn, CourseName: course)) {
                                            Text(course)
                                        }
                                    }
                                }
                            }
                        //.shadow(color: .gray, radius: 2, x: 0, y: 2)
                        }.background(Color.marron)
                        .scrollContentBackground(.hidden)
                        Button(){
                            let db = Firestore.firestore()
                            
                            let docRef = db.collection("Users").document(WindowMode.UsernameIn)
                            
                            var InputCourses: [String] = []
                            
                            for x in CoursesSelected{
                                InputCourses.append("\(x.Grade)-\(x.Name)-\(x.Section)-\(x.Year)")
                                WindowMode.SelectedCourses = CoursesSelected
                            }
                            
                            docRef.updateData(["Classes":InputCourses])
                        } label: {
                            Text("CONFIRM")
                                .font(.system(size: 17))
                                .fontWeight(.bold)
                                .foregroundColor(.black)
                                .frame(minWidth: 0, maxWidth: .infinity)
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
        }.background(Color.marron, ignoresSafeAreaEdges: .all)
    }
}

struct ProfileViewMicosoft: View{
    @Binding var accessToken: String?
    var microsoftProvider : OAuthProvider?
    @State var NewUsername: String = ""
    @State var NewPassword: String = ""
    @Environment(\.presentationMode) var presentationMode
    
    init(accessToken: Binding<String?>){
        self.microsoftProvider = OAuthProvider(providerID: "microsoft.com")
        self._accessToken = accessToken
    }
    
    var body: some View{
        ZStack{
            Rectangle()
                .fill(Color.marron)
                .ignoresSafeArea()
            VStack{
                Text("Microsoft")
                TextField("", text: $NewUsername)
                    .placeholder(when: NewUsername.isEmpty){
                        Text("Email")
                    }
                    .padding(.leading)
                    .autocapitalization(.none)
                TextField("", text: $NewPassword)
                    .placeholder(when: NewPassword.isEmpty){
                        Text("Password")
                    }
                    .padding(.leading)
                    .autocapitalization(.none)
                Button(){
                    microsoftProvider?.scopes = ["user.read", "Files.Read.All", "Mail.Send", "ChatMessage.Send", "Chat.ReadWrite", "User.ReadBasic.All"]
                    microsoftProvider?.customParameters = ["tenant":"d9ad3c89-6aed-4783-93ce-212b71ee98f3"]
                    self.microsoftProvider?.getCredentialWith(_: nil){credential, error in
                        if error != nil {
                            let castedError = error! as NSError
                            print(castedError)
                            // Handle error.
                            
                        }
                        if let credential = credential {
                            
                            
                            
                            Auth.auth().signIn(with: credential) { (authResult, error) in
                                if error != nil {
                                    let castedError = error! as NSError
                                    print(castedError)
                                    // Handle error.
                                }
                                
                                guard let authResult = authResult else {
                                    print("Couldn't get graph authResult")
                                    return
                                }
                                
                                // get credential and token when login successfully
                                let microCredential = authResult.credential as! OAuthCredential
                                accessToken = microCredential.accessToken!
                                
                                let credential = EmailAuthProvider.credential(withEmail: NewUsername, password: NewPassword)
                                
                                Auth.auth().currentUser?.link(with: credential) { authResult, Error in
                                    if Error != nil{
                                        print(Error)
                                    } else {
                                        self.presentationMode.wrappedValue.dismiss()
                                    }
                                }
                            }
                        }
                    }
                } label: {
                    HStack{
                        Text("Link Account To Microsoft")
                            .font(.system(size: 17))
                            .fontWeight(.bold)
                            .foregroundColor(.black)
                        Spacer()
                    }
                    .padding()
                    .background(
                            RoundedRectangle(cornerRadius: 25)
                                .foregroundColor(Color.white)
                    )
                    .padding()
                }
                Spacer()
            }
        }
    }
}

struct ProfileViewPauly: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @Binding var selectedProfileView: profileViewEnum
    @Binding var accessToken: String?
    @State var presentAlert: Bool = false
    @State var TextSize: CGSize = CGSize(width: 0.0, height: 0.0)
    @State var UserMicrosoft: Bool = false
    @State var UserEmail: Bool = false
    @State var ShowingEmailAlert: Bool = false
    @State var AlertMessage: String = ""
    @State var AlertTitle: String = ""
    var body: some View{
        NavigationView(){
            VStack{
                HStack{
                    Button(){
                        selectedProfileView = .Home
                    } label: {
                        HStack{
                            Image(systemName: "chevron.backward")
                            Text("Back")
                        }
                    }.padding()
                    Spacer()
                }
                Image("Settings")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                NavigationLink(destination: ProfileViewManageCourses()){
                    HStack{
                        Text("Courses")
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
                if UserMicrosoft && UserEmail == false{
                    NavigationLink(destination: ProfileViewMicosoft(accessToken: $accessToken).environmentObject(WindowMode)){
                        HStack{
                            Image("MicrosoftLogo")
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .frame(height: TextSize.height)
                            Text("Mircosoft")
                                .font(.system(size: 17))
                                .fontWeight(.bold)
                                .foregroundColor(.black)
                                .saveSize(in: $TextSize)
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
                if UserEmail{
                    Button(){
                        let providerData = Auth.auth().currentUser!.providerData
                        for x in providerData{
                            if x.providerID == "password"{
                                Auth.auth().sendPasswordReset(withEmail: x.email!) { (error) in
                                    if error == nil{
                                        AlertMessage = "\(String(describing: error))"
                                        AlertTitle = "Error"
                                        ShowingEmailAlert = true
                                    } else {
                                        AlertMessage = "An Email has been sent to  \(x.email!)"
                                        AlertTitle = "Success"
                                        ShowingEmailAlert = true
                                    }
                                }
                            }
                        }
                    } label: {
                        HStack{
                            Text("Send Update Password Email")
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
                    }.alert("Success", isPresented: $ShowingEmailAlert, actions: {
                        // 1
                        Button("Cancel", role: .cancel, action: {})
                    }, message: {
                        Text(AlertMessage)
                    })
                }
                Button(){
                    let firebaseAuth = Auth.auth()
                    do {
                        try firebaseAuth.signOut()
                        WidgetCenter.shared.reloadAllTimelines()
                        WindowMode.SelectedWindowMode = .PasswordWindow
                        UserMicrosoft = false
                        UserEmail = false
                    } catch let signOutError as NSError {
                        print("Error signing out: %@", signOutError)
                    }
                } label: {
                    Text("Sign Out")
                        .foregroundColor(.black)
                        .frame(minWidth: 0, maxWidth: .infinity)
                        .padding()
                        .background(
                            RoundedRectangle(cornerRadius: 15)
                                .fill(Color.white)
                        )
                        .padding()
                }
                Button(){
                    presentAlert = true
                } label: {
                    HStack{
                        Image(systemName: "trash")
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .foregroundColor(.white)
                            .frame(height: TextSize.height)
                        Text("DELETE ACCOUNT")
                            .foregroundColor(.white)
                            .saveSize(in: $TextSize)
                    }
                    .frame(minWidth: 0, maxWidth: .infinity)
                    .padding()
                    .background(
                        RoundedRectangle(cornerRadius: 15)
                            .fill(Color.red)
                    )
                    .padding()
                }.alert("Are you sure?", isPresented: $presentAlert, actions: {
                    // 1
                    Button("Cancel", role: .cancel, action: {})
                    
                    Button("PERMANATLY DELETE ACCOUNT", role: .destructive, action: {
                        let user = Auth.auth().currentUser
                        let userUid = Auth.auth().currentUser?.uid
                        
                        let db = Firestore.firestore()
                        
                        db.collection("Users").document(userUid!).delete() { err in
                            if let err = err {
                                print("Error removing document: \(err)")
                            } else {
                                user?.delete { error in
                                    if let error = error {
                                        // An error happened.
                                    } else {
                                        // Account deleted.
                                        WidgetCenter.shared.reloadAllTimelines()
                                        WindowMode.SelectedWindowMode = .PasswordWindow
                                    }
                                }
                            }
                        }
                    })
                }, message: {
                    Text("THIS WILL PERMANATLY DELETE YOUR ACCOUNT")
                })
                .onAppear(){
                    CheckProviderID()
                }
                Text("Pauly created by Andrew Mainella,")
                    .foregroundColor(.white)
                Text("Designed in Winnipeg, Manitoba.")
                    .foregroundColor(.white)
                Spacer()
                
            }.background(Color.marron)
        }
    }
    func CheckProviderID(){
        let UserArray = Auth.auth().currentUser!.providerData
        for x in UserArray{
            print(x.providerID)
            if x.providerID == "microsoft.com"{
                UserMicrosoft = true
            }
            if x.providerID == "password"{
                UserEmail = true
            }
        }
    }
}

//#if DEBUG
//struct CommissionsPreview: PreviewProvider {
//    static var previews: some View {
//        ProfileViewCommissions(selectedProfileView: .constant(.Commissions))
//    }
//}
//#endif
