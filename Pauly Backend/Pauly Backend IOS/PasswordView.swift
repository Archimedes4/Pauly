//
//  PassswordView.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-03-18.
//

import Foundation
import SwiftUI
import MSAL
import FirebaseCore
import FirebaseAuth
import FirebaseFirestore
import Firebase


struct InitializeMicrosoft: View {
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @Binding var GradeIn: Int
    @Binding var accessToken: String?
    
    @State var TextSize: CGSize = CGSize(width: 0.0, height: 0.0)
    @State var showingAlert = false
    @State var alertMessage = ""
    
    @State var MicrosoftLoading: Bool = false
    
    var microsoftProvider : OAuthProvider?
    
    init(GradeIn: Binding<Int>, accessToken: Binding<String?>){
        self.microsoftProvider = OAuthProvider(providerID: "microsoft.com")
        self._GradeIn = GradeIn
        self._accessToken = accessToken
    }
    
    var body: some View{
        Button(){
            MicrosoftLoading = true
            signIn()
        } label: {
            if MicrosoftLoading{
                ProgressView()
                    .frame(minWidth: 0, maxWidth: .infinity)
                    .padding()
                    .background(
                        RoundedRectangle(cornerRadius: 25)
                            .fill(Color.white)
                            .shadow(color: .gray, radius: 2, x: 0, y: 2)
                    )
                    .padding()
            } else {
                HStack{
                    Image("MicrosoftLogo")
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(height: TextSize.height)
                    
                    Text("SIGN IN WITH MICROSOFT")
                        .font(.system(size: 17))
                        .fontWeight(.bold)
                        .foregroundColor(.black)
                        .saveSize(in: $TextSize)
                }.frame(minWidth: 0, maxWidth: .infinity)
                .padding()
                .background(
                    RoundedRectangle(cornerRadius: 25)
                        .fill(Color.white)
                        .shadow(color: .gray, radius: 2, x: 0, y: 2)
                )
                .padding()
            }
        }
        .alert(isPresented: $showingAlert) {
            Alert(title: Text("Error"), message: Text(alertMessage), dismissButton: .default(Text("OK")))
        }
    }
    
    func signIn () {
        microsoftProvider?.scopes = ["user.read", "Files.Read.All", "Mail.Send", "ChatMessage.Send", "Chat.ReadWrite", "User.ReadBasic.All"]
        self.microsoftProvider?.getCredentialWith(_: nil){credential, error in
                   if error != nil {
                       let castedError = error! as NSError
                       print(castedError)
                       MicrosoftLoading = false
                       // Handle error.

                   }
                   if let credential = credential {
                       Auth.auth().signIn(with: credential) { (authResult, error) in
                           if error != nil {
                               let castedError = error! as NSError
                               print(castedError)
                               MicrosoftLoading = false
                               // Handle error.
                           }

                           guard let authResult = authResult else {
                               print("Couldn't get graph authResult")
                               MicrosoftLoading = false
                               return
                           }

                           // get credential and token when login successfully
                           let microCredential = authResult.credential as! OAuthCredential
                           accessToken = microCredential.accessToken!

                           let user = Auth.auth().currentUser
                           if let user = user {
                               // The user's ID, unique to the Firebase project.
                               // Do NOT use this value to authenticate with your backend server,
                               // if you have one. Use getTokenWithCompletion:completion: instead.
                               let uid = user.uid
                               let db = Firestore.firestore()
                               let docRef = db.collection("Users").document(uid)
                               docRef.getDocument { (document, error) in
                                   guard error == nil else {
                                       print("error", error ?? "")
                                       MicrosoftLoading = false
                                       return
                                   }
       
                                   if let document = document, document.exists {
                                       let data = document.data()
                                       if let data = data {
                                           GradeIn = data["Grade"] as? Int ?? 8
                                           let GroupPassword = data["Groups"] as! NSArray as? [Int] ?? []
                                           let FirstNamePassword = data["First Name"] as! String
                                           let LastNamePassword = data["Last Name"] as! String
                                           let ClassesPassword = data["Classes"] as! NSArray as! [String]
                                           let GradePassword = data["Grade"] as! Int
                                           if let error = error {
                                               print("Error writing document: \(error)")
                                               MicrosoftLoading = false
                                           } else {
                                               WindowMode.UsernameIn = uid
                                               WindowMode.FirstName = FirstNamePassword
                                               WindowMode.LastName = LastNamePassword
                                               var OutputCorses: [CourseSelectedType] = []
                                               for k in ClassesPassword{
                                                   let outputarray = k.split(separator: "-")
                                                   OutputCorses.append(CourseSelectedType(Name: String(outputarray[0]), Section: Int(outputarray[1])!, Year: Int(outputarray[2])!))
                                               }
                                               WindowMode.SelectedCourses = OutputCorses
                                               WindowMode.SelectedWindowMode = .HomePage
                                               
                                           }
                                       }
                                   }
                               }
                           }
                          
                       }
                   }
               }
    }
}

struct PasswordView: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    
    @Binding var accessToken: String?
    @Binding var GradeIn: Int
    
    @State var Username: String = ""
    @State var Password: String = ""
    @State var ShowingErrorMessage: Bool = false
    @State var ErrorMessage: String = ""
    @State var AnimationValueUsername: Int = 0
    @State var notLoadingPassword: Bool = true
    @State var ShowingFailureToFindUserError: Bool = false
    @State var ShowingIncorrectPasswordError: Bool = false
    
    enum FocusedField {
            case username, password
        }
    
    @FocusState private var focusedField: FocusedField?
    
    var body: some View {
        GeometryReader{ value in
            ZStack{
                Rectangle()
                    .foregroundColor(Color.marron)
                ScrollView{
                    VStack{
                        VStack{
                            Spacer()
                            Spacer()
                            Spacer()
                            HStack{
                                Spacer()
                                Image("PaulyText")
                                    .resizable()
                                    .aspectRatio(contentMode: .fit)
                                    .scaledToFit()
                                    .padding()
                                    .frame(alignment: .leading)
                                    .shadow(color: .gray, radius: 2, x: 0, y: 2)
                                Spacer()
                            }
                        }.frame(width: value.size.width * 1.0, height: value.size.height * 0.3, alignment: .leading)
                        Button(){
                            focusedField = .username
                        } label: {
                            TextField("", text: $Username)
                                .multilineTextAlignment(.leading)
                                .textContentType(.username)
                                .keyboardType(.emailAddress)
                                .placeholder(when: Username.isEmpty) {
                                    Text("Email").foregroundColor(.black)
                                }
                                .padding()
                                .focused($focusedField, equals: .username)
                                .padding(.leading, value.size.width * 0.05)
                                .autocapitalization(.none)
                                .frame(width: value.size.width * 0.92, height: value.size.height * 0.15, alignment: .leading)
                                .background(
                                    RoundedRectangle(cornerRadius: 25)
                                        .fill(Color.white)
                                        .shadow(color: .gray, radius: 2, x: 0, y: 2)
                                )
                                .onSubmit{
                                    focusedField = .password
                                }

                        }.padding(.bottom)
                        
                        if ShowingFailureToFindUserError{
                            HStack{
                                Image(systemName: "exclamationmark.circle")
                                    .resizable()
                                    .aspectRatio(contentMode: .fit)
                                    .foregroundColor(.red)
                                Text("Pauly couldn't find an account with the Username.")
                                    .foregroundColor(.red)
                            }.frame(height: value.size.height * 0.035)
                        }
                        
                        Button(){
                            focusedField = .password
                        } label: {
                            SecureField("", text: $Password)
                                .multilineTextAlignment(.leading)
                                .textContentType(.password)
                                .keyboardType(.default)
                                .placeholder(when: Password.isEmpty) {
                                    Text("Password").foregroundColor(.black)
                                }
                                .autocapitalization(.none)
                                .padding()
                                .padding(.leading, value.size.width * 0.05)
                                .focused($focusedField, equals: .password)
                                .frame(width: value.size.width * 0.92, height: value.size.height * 0.15, alignment: .leading)
                                .background(
                                    RoundedRectangle(cornerRadius: 25)
                                        .fill(Color.white)
                                        .shadow(color: .gray, radius: 2, x: 0, y: 2)
                                )
                                .onSubmit {
                                    SignIn()
                                }
                        }.padding()
                        
                        if ShowingIncorrectPasswordError{
                            HStack{
                                Image(systemName: "exclamationmark.circle")
                                    .resizable()
                                    .aspectRatio(contentMode: .fit)
                                    .foregroundColor(.red)
                                Text("Incorrect Password")
                                    .foregroundColor(.red)
                            }.frame(height: value.size.height * 0.035)
                        }
                        
                        Button(){
                            SignIn()
                        } label: {
                            if notLoadingPassword{
                                Text("SIGN IN")
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
                            } else {
                                ProgressView()
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
                        Button(){
                            WindowMode.SelectedWindowMode = .NewUser
                        } label: {
                            Text("CREATE NEW USER")
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
                        InitializeMicrosoft(GradeIn: $GradeIn, accessToken: $accessToken)
                            .environmentObject(WindowMode)
                    }.frame(maxHeight: .infinity)
                }
                if ShowingErrorMessage {
                    ZStack{
                        Rectangle()
                            .foregroundColor(.white)
                            .frame(width: 100, height: 100)
                        VStack{
                            Text(ErrorMessage)
                            Button("Close Window"){
                                ShowingErrorMessage = false
                            }
                        }
                    }
                }
            }.edgesIgnoringSafeArea(.all)
        }
    }
    func SignIn(){
        if notLoadingPassword{
            if Username != "" && Password != ""{
                notLoadingPassword = false
                Auth.auth().signIn(withEmail: Username, password: Password) { authResult, error in
                    guard self != nil else { return }
                    if authResult?.user != nil{
                        let user = Auth.auth().currentUser
                        if let user = user {
                            // The user's ID, unique to the Firebase project.
                            // Do NOT use this value to authenticate with your backend server,
                            // if you have one. Use getTokenWithCompletion:completion: instead.
                            let uid = user.uid
                            let db = Firestore.firestore()
                            let docRef = db.collection("Users").document(uid)
                            docRef.getDocument { (document, error) in
                                guard error == nil else {
                                    print("error", error ?? "")
                                    return
                                }
    
                                if let document = document, document.exists {
                                    let data = document.data()
                                    if let data = data {
                                        GradeIn = data["Grade"] as? Int ?? 8
                                        let GroupPassword = data["Groups"] as! NSArray as? [Int] ?? []
                                        let FirstNamePassword = data["First Name"] as! String
                                        let LastNamePassword = data["Last Name"] as! String
                                        let ClassesPassword = data["Classes"] as! NSArray as! [String]
                                        let GradePassword = data["Grade"] as! Int
                                        let EmailPassword = data["Email"] as! String
                                        let uidPassword  = data["uid"] as! String
                                        let outputData: [String:Any] = [
                                            "First Name":FirstNamePassword,
                                            "Last Name": LastNamePassword,
                                            "Classes":ClassesPassword,
                                            "Grade":GradePassword,
                                            "Email":EmailPassword,
                                            "uid":uidPassword,
                                            "Groups":GroupPassword,
                                            "Token":"Test"
                                        ]
                                        docRef.setData(outputData) { error in
                                            if let error = error {
                                                print("Error writing document: \(error)")
                                            } else {
                                                WindowMode.UsernameIn = uid
                                                WindowMode.FirstName = FirstNamePassword
                                                WindowMode.LastName = LastNamePassword
                                                var OutputCorses: [CourseSelectedType] = []
                                                for k in ClassesPassword{
                                                    let outputarray = k.split(separator: "-")
                                                    OutputCorses.append(CourseSelectedType(Name: String(outputarray[0]), Section: Int(outputarray[1])!, Year: Int(outputarray[2])!))
                                                }
                                                WindowMode.SelectedCourses = OutputCorses
                                                WindowMode.SelectedWindowMode = .HomePage
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        if error != nil{
                            if error!.localizedDescription == "The password is invalid or the user does not have a password."{
                                notLoadingPassword = true
                                ShowingIncorrectPasswordError = true
                                ShowingFailureToFindUserError = false
                            } else {
                                if error!.localizedDescription == "The email address is badly formatted."{
                                    notLoadingPassword = true
                                    ShowingErrorMessage = true
                                    ErrorMessage = "Invalid Parameters"
                                } else {
                                    if error!.localizedDescription == "There is no user record corresponding to this identifier. The user may have been deleted."{
                                        notLoadingPassword = true
                                        ShowingFailureToFindUserError = true
                                        ShowingIncorrectPasswordError = false
                                    } else {
                                        notLoadingPassword = true
                                        ShowingErrorMessage = true
                                        ErrorMessage = "Invalid Parameters"
                                        print(error?.localizedDescription)
                                    }
                                }
                            }//TO DO FIX THIS START UP CRAP
                        }
                    }
                }
            }
        }
    }
}

