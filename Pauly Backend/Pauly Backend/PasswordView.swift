//
//  PasswordView.swift
//  Pauly Backend
//
//  Created by Andrew Mainella on 2023-04-01.
//

import SwiftUI
import FirebaseAuth
import MSAL

struct InitializeMicrosoft: View {
    @Binding var SelectedBackendMode: EnumBackendMode
    
    @Binding var AccessToken: String?
    
    @State var TextSize: CGSize = CGSize(width: 0.0, height: 0.0)
    @State var showingAlert = false
    @State var alertMessage = ""
    
    @State var MicrosoftLoading: Bool = false
    
    var microsoftProvider : OAuthProvider?
    
    init(AccessToken: Binding<String?>, SelectedBackendMode: Binding<EnumBackendMode>){
        self.microsoftProvider = OAuthProvider(providerID: "microsoft.com")
        self._AccessToken = AccessToken
        self._SelectedBackendMode = SelectedBackendMode
    }
    
    
    // Update the below to your client ID you received in the portal. The below is for running the demo only
    let kClientID = "82f52bae-8d11-4ed0-b1d1-83d76d2e605c0"
    let kGraphEndpoint = "https://graph.microsoft.com/"
    let kAuthority = "https://login.microsoftonline.com/common"
    let kRedirectUri = "msauth.Archimedes4.Pauly-Backend://auth"
    
    let kScopes: [String] = ["user.read"]
    

    var applicationContext : MSALPublicClientApplication?
    var webViewParamaters : MSALWebviewParameters?
    
    var callGraphButton: NSButton!
    var loggingText: NSTextView!
    var signOutButton: NSButton!
    
    var usernameLabel: NSTextField!

    var currentAccount: MSALAccount?
    
    
    var body: some View{
        VStack{
            Spacer()
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
            .buttonStyle(.plain)
            .alert(isPresented: $showingAlert) {
                Alert(title: Text("Error"), message: Text(alertMessage), dismissButton: .default(Text("OK")))
            }
            Spacer()
        }.background(Color.marron)
    }
    
    func signIn () {
        let config = MSALPublicClientApplicationConfig(clientId: "82f52bae-8d11-4ed0-b1d1-83d76d2e605c")
        let application = try? MSALPublicClientApplication(configuration: config)
        let scopes = ["User.Read", "Mail.Send", "Sites.ReadWrite.All", "Files.ReadWrite.All", "Chat.ReadWrite"]
                
        let webviewParameters = MSALWebviewParameters()
        
        let interactiveParameters = MSALInteractiveTokenParameters(scopes: scopes, webviewParameters: webviewParameters)
        
        application!.acquireToken(with: interactiveParameters, completionBlock: { (result, error) in
                        
            guard let authResult = result, error == nil else {
                print(error!.localizedDescription)
                return
            }
                        
            // Get access token from result
            AccessToken = authResult.accessToken
            // You'll want to get the account identifier to retrieve and reuse the account for later acquireToken calls
            let accountIdentifier = authResult.account.identifier
            SelectedBackendMode = .Overview
        })
        
    }
}

struct SizeCalculator: ViewModifier {
    
    @Binding var size: CGSize
    
    func body(content: Content) -> some View {
        content
            .background(
                GeometryReader { proxy in
                    Color.clear // we just want the reader to get triggered, so let's use an empty color
                        .onAppear {
                            size = proxy.size
                        }
                }
            )
    }
}

extension View {
    func saveSize(in size: Binding<CGSize>) -> some View {
        modifier(SizeCalculator(size: size))
    }
}

struct PasswordView: View{
    
    @Binding var SelectedBackendMode: EnumBackendMode
    
    
    @State var GradeIn: Int = 0
    @State var AccessToken: String?
    
    @State var Username: String = ""
    @State var Password: String = ""
    
    
    enum FocusStates{
        case Username
        case Password
    }
    
    @FocusState private var focusedField: FocusStates?
    
    var body: some View{
        ZStack{
            Rectangle()
                .foregroundColor(Color.marron)
            VStack{
                Image("PaulyAdmin")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                Button(){
                    focusedField = .Username
                } label: {
                    TextField("", text: $Username)
                        .textFieldStyle(.plain)
                        .focused($focusedField, equals: .Username)
                        .onAppear(){
                            focusedField = .Username
                        }
                        .onSubmit {
                            focusedField = .Password
                        }
                        .frame(minWidth: 0, maxWidth: .infinity)
                        .padding()
                        .background(
                            RoundedRectangle(cornerRadius: 25)
                                .fill(Color.white)
                                .shadow(color: .gray, radius: 2, x: 0, y: 2)
                        )
                        .padding()
                }.buttonStyle(.plain)
                Button(){
                    focusedField = .Password
                } label: {
                    TextField("", text: $Password)
                        .textFieldStyle(.plain)
                        .focused($focusedField, equals: .Password)
                        .onSubmit{
                            SignInWithFirebase()
                        }
                        .frame(minWidth: 0, maxWidth: .infinity)
                        .padding()
                        .background(
                            RoundedRectangle(cornerRadius: 25)
                                .fill(Color.white)
                                .shadow(color: .gray, radius: 2, x: 0, y: 2)
                        )
                        .padding()
                }.buttonStyle(.plain)
                
                Button(){
                    SignInWithFirebase()
                } label: {
                    Text("Login")
                        .foregroundColor(.black)
                        .padding()
                        .padding([.leading, .trailing])
                        .background(
                            RoundedRectangle(cornerRadius: 15)
                                .fill(Color.blue)
                        )
                        .shadow(radius: 2)
                        .padding()
                }.buttonStyle(.plain)
            }
        }
    }
    func SignInWithFirebase() {
        Auth.auth().signIn(withEmail: Username, password: Password) { authResult, error in
            if error != nil{
                print(error)
            } else{
                if authResult != nil {
                    SelectedBackendMode = .Password1
                }
            }
        }
    }
}
