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
    @Binding var accessToken: String?
    @Binding var SelectedBackendMode: SelectedBackendModeEnum
    
    @State var TextSize: CGSize = CGSize(width: 0.0, height: 0.0)
    @State var showingAlert = false
    @State var alertMessage = ""
    
    @State var MicrosoftLoading: Bool = false
    
    var microsoftProvider : OAuthProvider?
    
    init(accessToken: Binding<String?>, SelectedBackendMode: Binding<SelectedBackendModeEnum>){
        self.microsoftProvider = OAuthProvider(providerID: "microsoft.com")
        self._accessToken = accessToken
        self._SelectedBackendMode = SelectedBackendMode
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
                           SelectedBackendMode = .Home
                          
                       }
                   }
               }
    }
}

struct PasswordView: View{
    @Binding var accessToken: String?
    @Binding var SelectedBackendMode: SelectedBackendModeEnum
    
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
                                Image("PaulyAdmin")
                                    .resizable()
                                    .aspectRatio(contentMode: .fit)
                                    .scaledToFit()
                                    .padding()
                                    .frame(alignment: .leading)
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
                        InitializeMicrosoft(accessToken: $accessToken, SelectedBackendMode: $SelectedBackendMode)
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
                        SelectedBackendMode = .Home
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

