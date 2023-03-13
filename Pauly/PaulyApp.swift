//
//  PaulyApp.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-02-23.
//

import SwiftUI
import BackgroundTasks

@main
struct PaulyApp: App {
    
    @Environment(\.scenePhase) private var phase
    
    @State private var counter = 0;
    
    var body: some Scene {
        WindowGroup {
            ContentView(WindowMode: .PasswordWindow)
                .environment(\.colorScheme, .light)
//                .onChange(of: phase) { newPhase in
//                    switch newPhase {
//                    case .background:
//                        scheduleDataRefetch()
//                    default: break
//                    }
////                }
//                .backgroundTask(.appRefresh("com.url.myidentifier")) {
//                    let request = URLRequest(url: URL(string: "https://cae5-24-76-193-238.ngrok.io/CheckForNotifiactions/Andrew")!)
//                    guard let data = try? await URLSession.shared.data(for: request).0 else {
//                        return
//                    }
//
//                    let decoder = JSONDecoder()
//                    guard let products = try? decoder.decode(NotificationResonpce.self, from: data) else {
//                        return
//                    }
//
//                    if !products.data && !Task.isCancelled {
//                        print("Here")
//                    }
//                }
        }
    }

//    func scheduleDataRefetch() {
//
//        let request = BGAppRefreshTaskRequest(identifier: "com.url.myidentifier")
//        request.earliestBeginDate = .now.addingTimeInterval(5)
//        do {
//            try BGTaskScheduler.shared.submit(request)
//            // HERE I SET THE BREAKPOINT IF WORKING WITH DEBUGGER
//            print("Background Task scheduled..")
//        } catch {
//            print("Could not first-time schedule app refresh: \(error)")
//        }
//    }
}
