//
//  PasswordView.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-03-18.
//

import SwiftUI
import MSAL
import FirebaseCore
import FirebaseAuth
import FirebaseFirestore

struct CreateNewUserPageThreeView: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    
    @Binding var SelectedCourseViewPage: CourseViewPage
    @Binding var UsernameIn: String
    @Binding var GradeIn: Int
    @Binding var Password: String
    @Binding var CoursesSelected: [String]
    
    @State var FirstName: String = ""
    @State var LastName: String = ""
    @State var ConfirmPassword: String = ""
    @State var SelectedGrade: String = "9"
    @State var ShowingErrorMessage: Bool = false
    @State var ErrorMessage: String = ""
    @State var Grades: [String] = ["9", "10", "11", "12"]
    @State var showingPasswordsDoNotMatch: Bool = false
    @State var showingPleaseEnterAEmail: Bool = false
    @State var showingPleaseEnterAPassword: Bool = false
    
    var body: some View{
        GeometryReader{ value in
            ScrollView(.vertical, showsIndicators: false){
                VStack{
                    Group{
                        Spacer()
                        Spacer()
                        Spacer()
                        Text("Create New User")
                            .font(.custom("Chalkboard SE", size: 45.0))
                            .padding()
                        Button{
                            
                        } label: {
                            ZStack{
                                TextField("", text: $FirstName)
                                    .multilineTextAlignment(.leading)
                                    .textContentType(.username)
                                    .keyboardType(.default)
                                    .placeholder(when: FirstName.isEmpty) {
                                            Text("First Name").foregroundColor(.black)
                                    }
                                    .autocapitalization(.none)
                                    .background(Color.white)
                                    .frame(width: value.size.width * 0.76, height: value.size.height * 0.075, alignment: .leading)
                                    .cornerRadius(15)
                                    .padding()
                            }.padding()
                        }.background(
                            RoundedRectangle(cornerRadius: 25)
                                .fill(Color.white)
                                .shadow(color: .gray, radius: 2, x: 0, y: 2)
                        )
                    }
                    
                    if showingPleaseEnterAEmail{
                        HStack{
                            Image(systemName: "exclamationmark.circle")
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .foregroundColor(.red)
                            Text("Please Enter A First Name!")
                                .foregroundColor(.red)
                        }
                    }
                    
                    Button{
                        
                    } label: {
                        ZStack{
                            TextField("", text: $LastName)
                                .multilineTextAlignment(.leading)
                                .textContentType(.newPassword)
                                .keyboardType(.default)
                                .placeholder(when: LastName.isEmpty) {
                                        Text("Last Name").foregroundColor(.black)
                                }
                                .autocapitalization(.none)
                                .background(Color.white)
                                .frame(width: value.size.width * 0.76, height: value.size.height * 0.075, alignment: .leading)
                                .cornerRadius(15)
                                .padding()
                        }.padding()
                    }.background(
                        RoundedRectangle(cornerRadius: 25)
                            .fill(Color.white)
                            .shadow(color: .gray, radius: 2, x: 0, y: 2)
                    )
                    .padding(.top)
                    
                    if showingPleaseEnterAPassword{
                        HStack{
                            Image(systemName: "exclamationmark.circle")
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .foregroundColor(.red)
                            Text("Please Enter A Last Name!")
                                .foregroundColor(.red)
                        }
                    }
                    
                    Button(){
                        //TO DO CHECK IF USER EXISTS IN FIREBASE BEFORE WRITE AS IN THEY CREATE TWO USERS WITH DIFFERENT EMAILS BUT SAME NAME
                        if FirstName != "" && LastName != ""{
                            Auth.auth().createUser(withEmail: UsernameIn, password: Password) { authResult, error in
                                if error != nil{
                                    print(error?.localizedDescription)
                                } else {
                                    let db = FirebaseFirestore.Firestore.firestore()
                                    
                                    let user = Auth.auth().currentUser
                                    if let user = user {
                                      // The user's ID, unique to the Firebase project.
                                      // Do NOT use this value to authenticate with your backend server,
                                      // if you have one. Use getTokenWithCompletion:completion: instead.
                                        let uid = user.uid
                                        let docRef = db.collection("Users").document(uid)
                                        
                                        let inputData: [String: Any] = [
                                            "First Name":FirstName,
                                            "Last Name": LastName,
                                            "Classes":CoursesSelected,
                                            "Grade":GradeIn,
                                            "Email":UsernameIn,
                                            "uid":uid,
                                            "Groups":[],
                                            
                                        ]
                                        
                                        docRef.setData(inputData) { error in
                                            if let error = error {
                                                print("Error writing document: \(error)")
                                            } else {
                                                WindowMode.SelectedWindowMode = .HomePage
                                                print("Document successfully written!")
                                            }
                                        }
                                    } else {
                                        print("Nope")
                                    }
                                    
                                }
                            }
                        }
                    } label: {
                        Text("Confirm")
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
                    Button{
                        WindowMode.SelectedWindowMode = .PasswordWindow
                    } label: {
                        Text("BACK")
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
                    }.padding(.top, -15)
                }
            }.background(Color.marron)
            .frame(width: value.size.width * 1.0)
            .edgesIgnoringSafeArea(.all)
        }
    }
}

struct CreateNewUserPageTwoView: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    
    @Environment(\.colorScheme) var colorScheme
    @Binding var SelectedCourseViewPage: CourseViewPage
    @Binding var Username: String
    @Binding var Password: String
    @Binding var GradeIn: Int
    @State var AvaliableCourses: [String] = []
    @State var ErrorMessage: String = ""
    @State var ShowingErrorMessage: Bool = false
    @Binding var CoursesSelected: [String]
    var body: some View{
        if AvaliableCourses.count == 0{
            ProgressView()
                .onAppear(){
                    Task{
                        do{
                            let db = Firestore.firestore()
                            
                            let docRef = db.collection("Courses").document("Grade\(WindowMode.GradeIn)")
                            docRef.getDocument { (document, error) in
                                guard error == nil else {
                                    print("error", error ?? "")
                                    return
                                }
                                
                                if let document = document, document.exists {
                                    let data = document.data()
                                    if let data = data {
                                        let results = data["Courses"] as! NSArray as? [String] ?? []
                                        AvaliableCourses = results
                                    }
                                }
                            }
                        } catch {
                            print("Error")
                        }
                    }
                }
        } else {
            GeometryReader{ geo in
                VStack{
                    HStack(){
                        Button{
                            SelectedCourseViewPage = .PageOne
                        } label: {
                            HStack{
                                Image(systemName: "chevron.backward")
                                Text("Back")
                            }
                        }.padding(.leading)
                        Spacer()
                        Text("Select Grade \(GradeIn) Class")
                            .foregroundColor(colorScheme == .dark ? Color.black : Color.white)
                        Spacer()
                        Spacer()
                    }
                    List(AvaliableCourses, id: \.self) { course in
                        Button{
                            if let index = AvaliableCourses.firstIndex(where: { $0 == course}){
                                AvaliableCourses.remove(at: index)
                            }
                            CoursesSelected.append(course)
                        } label: {
                            Text(course)
                        }.buttonStyle(.plain)
                    }.background(Color.marron)
                }.background(Color.marron)
            }
        }
        
        Button(){
            SelectedCourseViewPage = .PageThree
        } label: {
            Text("NEXT")
        }
        Button(){
            SelectedCourseViewPage = .PageOne
        } label: {
            Text("BACK")
        }
    }
}

struct CreateNewUserPageOneView: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    
    @Binding var SelectedCourseViewPage: CourseViewPage
    @Binding var UsernameIn: String
    @Binding var GradeIn: Int
    @State var Username: String = ""
    @Binding var Password: String
    @State var ConfirmPassword: String = ""
    @State var SelectedGrade: String = "9"
    @State var ShowingErrorMessage: Bool = false
    @State var ErrorMessage: String = ""
    @State var Grades: [String] = ["9", "10", "11", "12"]
    @State var showingPasswordsDoNotMatch: Bool = false
    @State var showingPleaseEnterAEmail: Bool = false
    @State var showingPleaseEnterAPassword: Bool = false
    
    var body: some View{
        GeometryReader{ value in
            ScrollView(.vertical, showsIndicators: false){
                VStack{
                    Group{
                        Spacer()
                        Spacer()
                        Spacer()
                        Text("Create New User")
                            .font(.custom("Chalkboard SE", size: 45.0))
                            .padding()
                        Button{
                            
                        } label: {
                            ZStack{
                                TextField("", text: $Username)
                                    .multilineTextAlignment(.leading)
                                    .textContentType(.username)
                                    .keyboardType(.default)
                                    .placeholder(when: Username.isEmpty) {
                                            Text("Email").foregroundColor(.black)
                                    }
                                    .autocapitalization(.none)
                                    .background(Color.white)
                                    .frame(width: value.size.width * 0.76, height: value.size.height * 0.075, alignment: .leading)
                                    .cornerRadius(15)
                                    .padding()
                            }.padding()
                        }.background(
                            RoundedRectangle(cornerRadius: 25)
                                .fill(Color.white)
                                .shadow(color: .gray, radius: 2, x: 0, y: 2)
                        )
                    }
                    
                    if showingPleaseEnterAEmail{
                        HStack{
                            Image(systemName: "exclamationmark.circle")
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .foregroundColor(.red)
                            Text("Please Enter A Email!")
                                .foregroundColor(.red)
                        }
                    }
                    
                    Button{
                        
                    } label: {
                        ZStack{
                            TextField("", text: $Password)
                                .multilineTextAlignment(.leading)
                                .textContentType(.newPassword)
                                .keyboardType(.default)
                                .placeholder(when: Username.isEmpty) {
                                        Text("Password").foregroundColor(.black)
                                }
                                .autocapitalization(.none)
                                .background(Color.white)
                                .frame(width: value.size.width * 0.76, height: value.size.height * 0.075, alignment: .leading)
                                .cornerRadius(15)
                                .padding()
                        }.padding()
                    }.background(
                        RoundedRectangle(cornerRadius: 25)
                            .fill(Color.white)
                            .shadow(color: .gray, radius: 2, x: 0, y: 2)
                    )
                    .padding(.top)
                    
                    if showingPleaseEnterAPassword{
                        HStack{
                            Image(systemName: "exclamationmark.circle")
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .foregroundColor(.red)
                            Text("Please Enter A Password!")
                                .foregroundColor(.red)
                        }
                    }
                    
                    Button{
                        
                    } label: {
                        ZStack{
                            SecureField("", text: $ConfirmPassword)
                                .multilineTextAlignment(.leading)
                                .textContentType(.newPassword)
                                .keyboardType(.default)
                                .placeholder(when: Username.isEmpty) {
                                        Text("Confirm Password").foregroundColor(.black)
                                }
                                .autocapitalization(.none)
                                .background(Color.white)
                                .frame(width: value.size.width * 0.76, height: value.size.height * 0.075, alignment: .leading)
                                .cornerRadius(15)
                                .padding()
                        }.padding()
                    }.background(
                        RoundedRectangle(cornerRadius: 25)
                            .fill(Color.white)
                            .shadow(color: .gray, radius: 2, x: 0, y: 2)
                    )
                    .padding(.top)
                    
                    if showingPasswordsDoNotMatch{
                        HStack{
                            Image(systemName: "exclamationmark.circle")
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .foregroundColor(.red)
                            Text("Passwords Do Not Match!")
                                .foregroundColor(.red)
                        }
                    }
                    
                    Button{
                        
                    } label: {
                        ZStack{
                            Picker("Please choose a Grade", selection: $SelectedGrade) {
                                ForEach(Grades, id: \.self) {
                                    Text($0)
                                }
                            }.frame(width: value.size.width * 0.76, height: value.size.height * 0.055, alignment: .leading)
                            .padding()
                            .foregroundColor(.black)
                            .pickerStyle(.menu)
                        }.padding()
                    }.background(
                        RoundedRectangle(cornerRadius: 25)
                            .fill(Color.white)
                            .shadow(color: .gray, radius: 2, x: 0, y: 2)
                    )
                    .padding(.top)
                    
                    Button(){
                        if Username != "" {
                            showingPleaseEnterAEmail = false
                            if Password != ""{
                                showingPleaseEnterAPassword = false
                                if Password == ConfirmPassword{
                                    GradeIn = Int(SelectedGrade) ?? 8
                                    UsernameIn = Username
                                    SelectedCourseViewPage = .PageTwo
                                } else {
                                    showingPasswordsDoNotMatch = true
                                }
                            } else {
                                showingPleaseEnterAPassword = true
                            }
                        } else {
                            showingPleaseEnterAEmail = true
                        }
                        //TO DO Next
                    } label: {
                        Text("NEXT")
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
                    Button{
                        WindowMode.SelectedWindowMode = .PasswordWindow
                    } label: {
                        Text("BACK")
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
                    }.padding(.top, -15)
                }
            }.background(Color.marron)
            .frame(width: value.size.width * 1.0)
            .edgesIgnoringSafeArea(.all)
        }
    }
}

enum CourseViewPage{
    case PageOne
    case PageTwo
    case PageThree
}


struct CreateNewUserView: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    
    @Binding var UsernameIn: String
    @Binding var GradeIn: Int
    
    @State var Password: String = ""
    @State var SelectedCourseViewPage: CourseViewPage = .PageOne
    @State var CoursesSelected: [String] = []
    
    var body: some View{
        if SelectedCourseViewPage == .PageOne{
            CreateNewUserPageOneView(SelectedCourseViewPage: $SelectedCourseViewPage, UsernameIn: $UsernameIn, GradeIn: $GradeIn, Password: $Password)
                .environmentObject(WindowMode)
        } else {
            if SelectedCourseViewPage == .PageTwo{
                CreateNewUserPageTwoView(SelectedCourseViewPage: $SelectedCourseViewPage, Username: $UsernameIn, Password: $Password, GradeIn: $GradeIn, CoursesSelected: $CoursesSelected)
                    .environmentObject(WindowMode)
            } else {
                CreateNewUserPageThreeView(SelectedCourseViewPage: $SelectedCourseViewPage, UsernameIn: $UsernameIn, GradeIn: $GradeIn, Password: $Password, CoursesSelected: $CoursesSelected)
            }
        }
    }
}
