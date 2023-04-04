//
//  MSAL.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-03-10.
//

import Foundation
import MSAL
import SwiftUI
import UIKit


// MARK: - GraphResponce
struct GraphResponce: Codable {
    let odataContext: String?
    let businessPhones: [String]?
    let displayName, givenName: String?
    let jobTitle: String?
    let mail: String?
    let mobilePhone: String?
    let officeLocation: String?
    let preferredLanguage: String?
    let surname, userPrincipalName, id: String?

    enum CodingKeys: String, CodingKey {
        case odataContext = "@odata.context"
        case businessPhones, displayName, givenName, jobTitle, mail, mobilePhone, officeLocation, preferredLanguage, surname, userPrincipalName, id
    }
}

// MARK: - GraphMailPost
struct GraphMailPost: Codable {
    let message: Message
    // MARK: - Message
    struct Message: Codable {
        let subject: String
        let body: Body
        let toRecipients: [ToRecipient]
        let internetMessageHeaders: [InternetMessageHeader]?
        // MARK: - Body
        struct Body: Codable {
            let contentType, content: String
        }
        // MARK: - InternetMessageHeader
        struct InternetMessageHeader: Codable {
            let name, value: String
        }
        // MARK: - ToRecipient
        struct ToRecipient: Codable {
            let emailAddress: EmailAddress
            // MARK: - EmailAddress
            struct EmailAddress: Codable {
                let address: String
            }
        }
    }
}

struct MSALViewLogin: View {
    @EnvironmentObject var msalModel: MSALScreenViewModel
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @State var Account: MSALAccount?
    var body: some View {
        VStack {
            HStack{
                Button(){
                    WindowMode.SelectedWindowMode = .HomePage
                } label: {
                    HStack{
                        Image(systemName: "chevron.backward")
                        Text("Back")
                        Spacer()
                    }
                }.padding()
            }
            Image("SaintPaulLogo")
                .resizable()
                .aspectRatio(contentMode: .fit)
            Text("👋 Please Enter Your Login Details")
                .font(.largeTitle)
                .padding()
            Button("Login with MSAL") {
                msalModel.loadMSALScreen(AccountMode: WindowMode.SelectedWindowMode, Grade: WindowMode.GradeIn, UsernameIn: WindowMode.UsernameIn, FirstName: WindowMode.FirstName, LastName: WindowMode.LastName, SelectedCourses: WindowMode.SelectedCourses)
            }
            .onAppear(){
                msalModel.loadMSALScreen(AccountMode: WindowMode.SelectedWindowMode, Grade: WindowMode.GradeIn, UsernameIn: WindowMode.UsernameIn, FirstName: WindowMode.FirstName, LastName: WindowMode.LastName, SelectedCourses: WindowMode.SelectedCourses)
            }
            Spacer()
        }.background(Color.marron)
        .edgesIgnoringSafeArea(.all)
    }
}

struct MSALView: View{
    @StateObject var msalModel: MSALScreenViewModel = MSALScreenViewModel()
    @State var Account: MSALAccount?
    @EnvironmentObject var WindowMode: SelectedWindowMode
    var body: some View{
        MSALScreenView_UI(viewModel: msalModel, AccountValue: $Account)
            .frame(alignment: .center)
            .environmentObject(WindowMode)
            .environmentObject(msalModel)
            .background(Color.marron)
    }
}

// A lot of this code was from stack overflow/ microsoft docs/ what I did was integrate with swiftui https://stackoverflow.com/questions/70654875/im-trying-to-convert-a-msal-login-from-uikit-to-swiftui-and-not-sure-how-i-can?noredirect=1#comment124903620_70654875
//This is the source of truth the user input will be held here
class MSALScreenViewModel: ObservableObject, MSALScreenViewModelProtocol{

    ///reference to UIKit
    var uiViewController: MSALScreenViewControllerProtocol? = nil

    @Published var accountName: String = ""
    @Published var scopes: [String] = []


    //MARK: MyAdsViewControllerProtocol
    func loadMSALScreen(AccountMode: WindowSrceens, Grade: Int, UsernameIn: String, FirstName: String, LastName: String, SelectedCourses: [CourseSelectedType]) {
        uiViewController?.loadMSALScreen(AccountMode: AccountMode, Grade: Grade, UsernameIn: UsernameIn, FirstName: FirstName, LastName: LastName, SelectedCourses: SelectedCourses)
    }
    
    func acquireTokenSilently(_ account : MSALAccount!, AccountMode: WindowSrceens, Grade: Int, UsernameIn: String, FirstName: String, LastName: String, SelectedCourses: [CourseSelectedType]) {
        uiViewController?.acquireTokenSilently(account, AccountMode: AccountMode, Grade: Grade, UsernameIn: UsernameIn, FirstName: FirstName, LastName: LastName, SelectedCourses: SelectedCourses)
    }
    

    func getAccountName() -> String {
        return accountName
    }
}

struct MSALScreenView_UI: UIViewControllerRepresentable{
    @ObservedObject var viewModel: MSALScreenViewModel
    @Binding var AccountValue: MSALAccount?
    func makeUIViewController(context: Context) -> some MSALScreenViewController {
        return MSALScreenViewController(viewModel: viewModel, AccountValue: $AccountValue)
    }

    func updateUIViewController(_ uiViewController: UIViewControllerType, context: Context) {
    }
}

class MSALScreenViewController: UIViewController, MSALScreenViewControllerProtocol {
    
    let msalModel = MSALScreenViewModel()

    var uiViewController: MSALScreenViewModelProtocol?
    ///SwiftUI Delegate
    var viewModel: MSALScreenViewModelProtocol
    
    let kClientID = "82f52bae-8d11-4ed0-b1d1-83d76d2e605c"
    let kGraphEndpoint = "https://graph.microsoft.com/" // the Microsoft Graph endpoint
    let kAuthority = "https://login.microsoftonline.com/common" // this authority allows a personal Microsoft account and a work or school account in any organization's Azure AD tenant to sign in

    let kScopes: [String] = ["user.read", "Files.Read.All", "Mail.Send", "ChatMessage.Send", "Chat.ReadWrite"] // request permission to read the profile of the signed-in user

    var accessToken = String()
    var applicationContext : MSALPublicClientApplication?
    var webViewParameters : MSALWebviewParameters?
    var currentAccount: MSALAccount?


    init(viewModel: MSALScreenViewModelProtocol, AccountValue: Binding<MSALAccount?>) {
        self.viewModel = viewModel
        
        super.init(nibName: nil, bundle: .main)
        // Link between UIKit and SwiftUI
        self.viewModel.uiViewController = self
        let controller = UIHostingController(rootView: MSALViewLogin())
               addChild(controller)
               controller.view.translatesAutoresizingMaskIntoConstraints = false
               view.addSubview(controller.view)
               controller.didMove(toParent: self)

               NSLayoutConstraint.activate([
                    controller.view.widthAnchor.constraint(equalTo: view.widthAnchor, multiplier: 1.0),
                    controller.view.heightAnchor.constraint(equalTo: view.heightAnchor, multiplier: 1.0),
                   controller.view.centerXAnchor.constraint(equalTo: view.centerXAnchor),
                   controller.view.centerYAnchor.constraint(equalTo: view.centerYAnchor)
               ])
        
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    func loadMSALScreen(AccountMode: WindowSrceens, Grade: Int, UsernameIn: String, FirstName: String, LastName: String, SelectedCourses: [CourseSelectedType]) {
        do {
            let authority = try MSALB2CAuthority(url: URL(string: "https://login.microsoftonline.com/common")!)
            let pcaConfig = MSALPublicClientApplicationConfig(clientId: "82f52bae-8d11-4ed0-b1d1-83d76d2e605c", redirectUri: "msauth.Archimedes4.Pauly://auth", authority: authority)
            let application = try MSALPublicClientApplication(configuration: pcaConfig)
            let webViewParameters1 = MSALWebviewParameters(authPresentationViewController: self)
            let interactiveParameters = MSALInteractiveTokenParameters(scopes: ["user.read", "Files.Read.All", "Mail.Send"], webviewParameters: webViewParameters1)
            application.acquireToken(with: interactiveParameters) { (result, error) in
                guard let result = result else {
                    print("error \(error?.localizedDescription)")
                    print("Error2:\(String(describing: error))")
                    return
                }
                if let account = result.account.username{
                    print(account)
                    self.applicationContext = application
                    
                    var newselectedWindowMode = SelectedWindowMode()
                    newselectedWindowMode.SelectedWindowMode = AccountMode
                    newselectedWindowMode.UsernameIn = UsernameIn
                    newselectedWindowMode.GradeIn = Grade
                    newselectedWindowMode.FirstName = FirstName
                    newselectedWindowMode.LastName = LastName
                    newselectedWindowMode.SelectedCourses = SelectedCourses
                    UIApplication.shared.windows.first { $0.isKeyWindow }!.rootViewController = UIHostingController(rootView: ContentView(WindowMode: newselectedWindowMode, MSALAccount: result.account))
                }
            }
        } catch {
            print("\(#function) logging error \(error)")
        }
    }
    func acquireTokenInteractively() {

        guard let applicationContext = self.applicationContext else { return }
        guard let webViewParameters = self.webViewParameters else { return }

        // #1
        let parameters = MSALInteractiveTokenParameters(scopes: kScopes, webviewParameters: webViewParameters)
        parameters.promptType = .selectAccount

        // #2
        applicationContext.acquireToken(with: parameters) { (result, error) in

            // #3
            if let error = error {

                self.updateLogging(text: "Could not acquire token: \(error)")
                return
            }

            guard let result = result else {

                self.updateLogging(text: "Could not acquire token: No result returned")
                return
            }

            // #4
            self.accessToken = result.accessToken
            self.updateLogging(text: "Access token is \(self.accessToken)")
            self.updateCurrentAccount(account: result.account)
            self.getContentWithToken()
        }
    }
    func acquireTokenSilently(_ account : MSALAccount!, AccountMode: WindowSrceens, Grade: Int, UsernameIn: String, FirstName: String, LastName: String, SelectedCourses: [CourseSelectedType]) {
        do{
            let authority1 = try MSALB2CAuthority(url: URL(string: "https://login.microsoftonline.com/common")!)
            let pcaConfig1 = MSALPublicClientApplicationConfig(clientId: "82f52bae-8d11-4ed0-b1d1-83d76d2e605c", redirectUri: "msauth.Archimedes4.Pauly://auth", authority: authority1)
            let applicationContext = try MSALPublicClientApplication(configuration: pcaConfig1)

                /**

                 Acquire a token for an existing account silently

                 - forScopes:           Permissions you want included in the access token received
                 in the result in the completionBlock. Not all scopes are
                 guaranteed to be included in the access token returned.
                 - account:             An account object that we retrieved from the application object before that the
                 authentication flow will be locked down to.
                 */

                let parameters = MSALSilentTokenParameters(scopes: ["user.read"], account: account!)

                applicationContext.acquireTokenSilent(with: parameters) { (result, error) in

                    if let error = error {

                        let nsError = error as NSError

                        // interactionRequired means we need to ask the user to sign-in. This usually happens
                        // when the user's Refresh Token is expired or if the user has changed their password
                        // among other possible reasons.

                        if (nsError.domain == MSALErrorDomain) {

                            if (nsError.code == MSALError.interactionRequired.rawValue) {

                                DispatchQueue.main.async {
                                    self.acquireTokenInteractively()
                                }
                                return
                            }
                        }

                        self.updateLogging(text: "Could not acquire token silently: \(error)")
                        return
                    }

                    guard let result = result else {

                        self.updateLogging(text: "Could not acquire token: No result returned")
                        return
                    }

                    self.accessToken = result.accessToken
                    self.updateSignOutButton(enabled: true)
                    self.getContentWithToken()
                    var newselectedWindowMode = SelectedWindowMode()
                    newselectedWindowMode.SelectedWindowMode = AccountMode
                    newselectedWindowMode.UsernameIn = UsernameIn
                    newselectedWindowMode.GradeIn = Grade
                    newselectedWindowMode.FirstName = FirstName
                    newselectedWindowMode.LastName = LastName
                    newselectedWindowMode.SelectedCourses = SelectedCourses
                    UIApplication.shared.windows.first { $0.isKeyWindow }!.rootViewController = UIHostingController(rootView: ContentView(WindowMode: newselectedWindowMode, accountToken: result.accessToken, MSALAccount: account))
                }
        } catch {
            print("\(#function) logging error \(error)")
        }
    }
    func getGraphEndpoint() -> String {
            return kGraphEndpoint.hasSuffix("/") ? (kGraphEndpoint + "v1.0/me/") : (kGraphEndpoint + "/v1.0/me/");
        }
    func getContentWithToken() {
        // Specify the Graph API endpoint
        let graphURI = getGraphEndpoint()
        print(graphURI)
        let url = URL(string: graphURI)
        var request = URLRequest(url: url!)

        // Set the Authorization header for the request. We use Bearer tokens, so we specify Bearer + the token we got from the result
        request.setValue("Bearer \(self.accessToken)", forHTTPHeaderField: "Authorization")

        URLSession.shared.dataTask(with: request) { data, response, error in

            if let error = error {
                self.updateLogging(text: "Couldn't get graph result: \(error)")
                return
            }

            guard let result = try? JSONSerialization.jsonObject(with: data!, options: []) else {

                self.updateLogging(text: "Couldn't deserialize result JSON")
                return
            }
        }.resume()
    }
    func updateLogging(text : String) {

            if Thread.isMainThread {
//                self.loggingText.text = text
                //Handel Logging Text
            } else {
                DispatchQueue.main.async {
//                    self.loggingText.text = text
                    //Handel Logging Text
                }
            }
        }
    func updateSignOutButton(enabled : Bool) {
        if Thread.isMainThread {
//                self.signOutButton.isEnabled = enabled
            //Handel SignOut
        } else {
            DispatchQueue.main.async {
//                    self.signOutButton.isEnabled = enabled
                //Handel Signout
            }
        }
    }
    func updateAccountLabel() {

        guard let currentAccount = self.currentAccount else {
//                self.usernameLabel.text = "Signed out"
            //Handel account label
            return
        }

//            self.usernameLabel.text = currentAccount.username
        //handel account lable
    }
    func updateCurrentAccount(account: MSALAccount?) {
        self.currentAccount = account
        self.updateAccountLabel()
        self.updateSignOutButton(enabled: account != nil)
    }
}

//Protocols aren't needed but it makes the code reusable and you can see the connection protocol = interface
protocol MSALScreenViewModelProtocol{
    ///Reference to the MSAL  view controller
    var uiViewController: MSALScreenViewControllerProtocol? { get set }

    ///Tells the viewController to load MSAL screen
    func loadMSALScreen(AccountMode: WindowSrceens, Grade: Int, UsernameIn: String, FirstName: String, LastName: String, SelectedCourses: [CourseSelectedType])
    func getAccountName() -> String
    func acquireTokenSilently(_ account : MSALAccount!, AccountMode: WindowSrceens, Grade: Int, UsernameIn: String, FirstName: String, LastName: String, SelectedCourses: [CourseSelectedType])
}

protocol MSALScreenViewControllerProtocol: UIViewController{
    ///Reference to the SwiftUI ViewModel
    var viewModel: MSALScreenViewModelProtocol { get set }

    func loadMSALScreen(AccountMode: WindowSrceens, Grade: Int, UsernameIn: String, FirstName: String, LastName: String, SelectedCourses: [CourseSelectedType])
    func acquireTokenSilently(_ account : MSALAccount!, AccountMode: WindowSrceens, Grade: Int, UsernameIn: String, FirstName: String, LastName: String, SelectedCourses: [CourseSelectedType])
}

enum GraphCallingErrors: Error{
    case APICallFailed
    case CouldNotDecodeAPI
    case ClientIDNotFound
}

class MSALTools{
    func callMailApi(Data: GraphMailPost, AccessToken: String) {
        Task{
            var uri: String = "https://graph.microsoft.com/v1.0/me/sendMail"
            print(uri)
            let url = URL(string: uri)
            var request = URLRequest(url: url!)
            // Set the Authorization header for the request. We use Bearer tokens, so we specify Bearer + the token we got from the result
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.setValue("Bearer \(AccessToken)", forHTTPHeaderField: "Authorization")

            guard let encoded = try? JSONEncoder().encode(Data) else {
                print("Failed to encode order")
                return
            }
            do {
                let (data, _) = try await URLSession.shared.upload(for: request, from: encoded)
                // handle the result
            } catch {
                print("Checkout failed.")
            }
        }
    }
    func callMicrosoftGraphForFile(accessToken: String) async throws -> Data{
        let uri: String = "https://graph.microsoft.com/v1.0/sites/gocrusadersca.sharepoint.com/drives/b!zIcLAzhGl06gRGJixzLOqTlvR0kRrEdOqJon3lE-eoNdeOIH9vqcQpTtFQdPx2X3/items/01DNRXO756Y2GOVW7725BZO354PWSELRRZ/children"
        let url = URL(string: uri)
        var request = URLRequest(url: url!)
        // Set the Authorization header for the request. We use Bearer tokens, so we specify Bearer + the token we got from the result
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        
        do{
            let (data, _) = try await URLSession.shared.data(for: request)
            do {
                // make sure this JSON is in the format we expect
                if let json = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
                    // try to read out a string array
                    print(json)
                }
            } catch let error as NSError {
                print("Failed to load: \(error.localizedDescription)")
            }
            return data
        } catch{
            throw GraphCallingErrors.APICallFailed
        }
    }
}















//// Update the below to your client ID you received in the portal. The below is for running the demo only

//struct MSALLoggedinView: View{
//    @StateObject var msalModel: MSALScreenViewModel = MSALScreenViewModel()
//    let username: String
//    let accountValue: MSALAccount
//    let accessToken: String?
//    let kGraphEndpoint = "https://graph.microsoft.com/"
//    @State var ApiExtention: String = ""
//    @State var ShowingAccessToken: Bool = false
//    @State var UserID: String = ""
//    @State var notShowingMailView: Bool = true
//    @State var accountValue1: MSALAccount?
//    var body: some View{
//        if notShowingMailView{
//            ScrollView{
//                Text("Welcome")
//                Text(username)
//                if accessToken != nil{
//                    if ShowingAccessToken{
//                        Text(accessToken ?? "Error")
//                        Button("Get Acess Token"){
//                            msalModel.acquireTokenSilently(accountValue, AccountMode: <#WindowSrceens#>)
//                        }.onAppear(){
//                            if accessToken?.count ?? 100 <= 10{
//                                msalModel.acquireTokenSilently(accountValue)
//                            }
//                        }
//                        Button("Hide AccessToken"){
//                            ShowingAccessToken = false
//                        }
//                        Button("Print Token"){
//                            print(accessToken)
//                        }
//                    } else {
//                        Button("Show Access Token"){
//                            ShowingAccessToken = true
//                        }.onAppear(){
//                            if accessToken?.count ?? 100 <= 10{
//                                msalModel.acquireTokenSilently(accountValue)
//                            }
//                        }
//                    }
//                    Text("ID: \(UserID)")
//                        .textSelection(.enabled)
//                    TextField("Extention", text: $ApiExtention)
//                    Button("Call API"){
//                        Task{
//                            var uri: String = "https://graph.microsoft.com/v1.0"
//                            uri = uri + ApiExtention
//                            print(uri)
//                            let url = URL(string: uri)
//                            var request = URLRequest(url: url!)
//                            // Set the Authorization header for the request. We use Bearer tokens, so we specify Bearer + the token we got from the result
//                            request.httpMethod = "GET"
//                            request.setValue("Bearer \(self.accessToken!)", forHTTPHeaderField: "Authorization")
//
//                            URLSession.shared.dataTask(with: request) { data, response, error in
//
//                                if let error = error {
//                                    print("Error")
//                                    return
//                                }
//                                guard let result2 = try? JSONSerialization.jsonObject(with: data!, options: []) else {
//                                    print("OH NO REE")
//                                    return
//                                }
//                                print(result2)
//                            }.resume()
//
//                        }
//                    }
//                    Button("Call API Orignially"){
//                        Task{
//                            var graphURI = getGraphEndpoint()
//                            graphURI = graphURI + ApiExtention
//                            print(graphURI)
//                            let url = URL(string: graphURI)
//                            var request = URLRequest(url: url!)
//                            // Set the Authorization header for the request. We use Bearer tokens, so we specify Bearer + the token we got from the result
//                            request.setValue("Bearer \(self.accessToken!)", forHTTPHeaderField: "Authorization")
//
//                            URLSession.shared.dataTask(with: request) { data, response, error in
//
//                                if let error = error {
//                                    print("Error")
//                                    return
//                                }
//                                guard let result2 = try? JSONDecoder().decode(GraphResponce.self, from: data!) else {
//                                    print("OH NO REE")
//                                    return
//                                }
//                                UserID = result2.id!
//                                print(UserID)
//                            }.resume()
//
//                        }
//                    }
//                    Button("Mail View"){
//                        notShowingMailView = false
//                    }
//                }
//        }
//        } else {
//            MailViewMSAL(notShowingMailView: $notShowingMailView, accessToken: accessToken!)
//        }
//
//        MSALScreenView_UI(viewModel: msalModel, AccountValue: $accountValue1)
//            .frame(width: 250, height: 250, alignment: .center)
//    }
//    func getGraphEndpoint() -> String {
//            return kGraphEndpoint.hasSuffix("/") ? (kGraphEndpoint + "v1.0/me/") : (kGraphEndpoint + "/v1.0/me/");
//        }
//}
