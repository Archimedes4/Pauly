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
import Firebase
import FirebaseFirestore




@main
struct PaulyApp: App {
    
    @Environment(\.scenePhase) private var phase
    @UIApplicationDelegateAdaptor(AppDelegate.self) var delegate
    
    @State private var counter = 0;
    
    init() {
            FirebaseApp.configure()
        }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(\.colorScheme, .light)
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

      let deviceToken:[String: String] = ["token": fcmToken ?? ""]
        print("Device token: ", deviceToken) // This token can be used for testing notifications on FCM
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

//func createRestaurant(restaurantName: String, docData: [String: Any], Grade: Int) {
//    let db = Firestore.firestore()
//
//    let docRef = db.collection("Courses").document("Grade\(Grade)").collection(restaurantName).document("Info")
//
//    docRef.setData(docData) { error in
//        if let error = error {
//            print("Error writing document: \(error)")
//        } else {
//            print("Document successfully written!")
//        }
//    }
//}
//func createGroup(Username: String, docData: [String: Any], NewNum: Int) {
//    let db = Firestore.firestore()
//
//
//    let docRef = db.collection("Messaging").document("Groups").collection("Group\(NewNum)").document("Info")
//
//    docRef.setData(docData) { error in
//        if let error = error {
//            print("Error writing document: \(error)")
//        } else {
//            print("Document successfully written!")
//        }
//    }
//
//    let docRef1 = db.collection("Messaging").document("Groups")
//
//    docRef1.setData(["GroupsCount":NewNum]) { error in
//        if let error = error {
//            print("Error writing document: \(error)")
//        } else {
//            print("Document successfully written!")
//        }
//    }
//}
