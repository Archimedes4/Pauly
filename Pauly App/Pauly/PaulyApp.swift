//
//  PaulyApp.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-02-23.
//

import SwiftUI
import BackgroundTasks
import FirebaseCore
import FirebaseMessaging
import FirebaseFirestore
import FirebaseAuth



@main
struct PaulyApp: App {
    
    @Environment(\.scenePhase) private var phase
    @UIApplicationDelegateAdaptor(AppDelegate.self) var delegate
    
    @State private var counter = 0;
    
    @State var Token: String = ""
    
    @StateObject var WindowMode: SelectedWindowMode = SelectedWindowMode()
    @State var AccessToken: String = ""
    var microsoftProvider: OAuthProvider?
    init() {
            FirebaseApp.configure()
        do{
            try Auth.auth().useUserAccessGroup("SYV2CK2N9N.com.Archimedes4.Pauly")
            let handle = Auth.auth().addStateDidChangeListener { auth, user in
              // ...
//                print(auth.currentUser?.displayName)
//                guard let user = Auth.auth().currentUser else {
//                               //handle error
//                               return
//                           }
//               user.getIDToken() { (res, err) in
//                   if err != nil {
//                       print("*** TOKEN() ERROR: \(err!)")
//                       //handle error
//                   } else {
//                       print("*** TOKEN() SUCCESS: \(err)")
//                       print(res)
//                       if res != nil{
//                           Auth.auth().signIn(withCustomToken: (res ?? "")){ (User, Error) in
//                               print(Error?.localizedDescription)
//                               print(Error.debugDescription)
//                               if User?.credential != nil{
//                                   let microCredential = User?.credential as! OAuthCredential
//                                   print( microCredential.accessToken)
//                               }
//                           }
//                       }
//                   }
//               }
            }
            let User = Auth.auth().currentUser
            print(User)
            if let User = User {
                microsoftProvider = OAuthProvider(providerID: "microsoft.com")
            } else {
                print("NOPE THIS DOES NOT WORK")
            }
        } catch let error as NSError {
            print("Error changing user access group: %@", error)
        }
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView(accountToken: AccessToken)
                .environmentObject(WindowMode)
                .onAppear(){
                    let User = Auth.auth().currentUser
                    
                    if User != nil {
                        let firebaseAuth = Auth.auth()
                        do {
                            try firebaseAuth.signOut()
//                            signIn()
                        } catch let signOutError as NSError {
                          print("Error signing out: %@", signOutError)
                        }
                    } else {
                        print("Not Signed In")
                    }
                }
        }
    }
    func signIn () {
        microsoftProvider?.scopes = ["user.read", "Files.Read.All", "Mail.Send", "ChatMessage.Send", "Chat.ReadWrite", "User.ReadBasic.All"]
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
                           AccessToken = microCredential.accessToken!

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
                                           WindowMode.GradeIn = data["Grade"] as? Int ?? 8
                                           let GroupPassword = data["Groups"] as! NSArray as? [Int] ?? []
                                           let FirstNamePassword = data["First Name"] as! String
                                           let LastNamePassword = data["Last Name"] as! String
                                           let ClassesPassword = data["Classes"] as! NSArray as! [String]
                                           let GradePassword = data["Grade"] as! Int
                                           if let error = error {
                                               print("Error writing document: \(error)")
                                           } else {
                                               WindowMode.UsernameIn = uid
                                               WindowMode.FirstName = FirstNamePassword
                                               WindowMode.LastName = LastNamePassword
                                               var OutputCorses: [CourseSelectedType] = []
                                               for k in ClassesPassword{
                                                   let outputarray = k.split(separator: "-")
                                                   OutputCorses.append(CourseSelectedType(Name: String(outputarray[1]), Section: Int(outputarray[2])!, Year: Int(outputarray[3])!, Grade: Int(outputarray[0])!))
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

class AppDelegate: NSObject, UIApplicationDelegate {
    let gcmMessageIDKey = "gcm.message_id"

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
        Messaging.messaging().delegate = self

        // For iOS 10 display notification (sent via APNS)
        UNUserNotificationCenter.current().delegate = self

        let authOptions: UNAuthorizationOptions = [.alert, .badge, .sound]
        UNUserNotificationCenter.current().requestAuthorization(
            options: authOptions,
            completionHandler: {_, _ in }
        )
        application.registerForRemoteNotifications()
        return true
    }

    func application(_ application: UIApplication, didReceiveRemoteNotification userInfo: [AnyHashable: Any],
                     fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {

      if let messageID = userInfo[gcmMessageIDKey] {
        print("Message ID: \(messageID)")
      }

      print(userInfo)

      completionHandler(UIBackgroundFetchResult.newData)
    }
}
extension AppDelegate: MessagingDelegate {
    func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
//        print("Device token: ", deviceToken) // This token can be used for testing notifications on FCM
        UserDefaults.standard.set(fcmToken, forKey: "DeviceToken")
    }
}

extension AppDelegate : UNUserNotificationCenterDelegate {

  // Receive displayed notifications for iOS 10 devices.
  func userNotificationCenter(_ center: UNUserNotificationCenter,
                              willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
    let userInfo = notification.request.content.userInfo

    if let messageID = userInfo[gcmMessageIDKey] {
        print("Message ID: \(messageID)")
    }

    print(userInfo)

    // Change this to your preferred presentation option
    completionHandler([[.banner, .badge, .sound]])
  }

    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {

    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {

    }

  func userNotificationCenter(_ center: UNUserNotificationCenter,
                              didReceive response: UNNotificationResponse,
                              withCompletionHandler completionHandler: @escaping () -> Void) {
    let userInfo = response.notification.request.content.userInfo

    if let messageID = userInfo[gcmMessageIDKey] {
      print("Message ID from userNotificationCenter didReceive: \(messageID)")
    }

    print(userInfo)

    completionHandler()
  }
}


//
//  FireBase.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-03-16.
//

class GetClassData: ObservableObject{
    @Published var Group: Int = 8
    
    init(Grade: Int) {
        fetchClasses(Grade: Grade)
    }
    
    func fetchClasses(Grade: Int)  {
        let db = Firestore.firestore()

        let docRef = db.collection("Courses").document("Grade\(Grade)")
        
        docRef.getDocument { (document, error) in
            guard error == nil else {
                print("error", error ?? "")
                return
            }

            if let document = document, document.exists {
                print(document.description)
                let data = document.data()
                if let data = data {
                    self.Group = data["GroupsCount"] as? Int ?? 8
                }
            }
        }
    }
}
