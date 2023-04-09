//
//  PaulyWidgetBundle.swift
//  PaulyWidget
//
//  Created by Andrew Mainella on 2023-04-05.
//

import WidgetKit
import SwiftUI
import FirebaseAuth
import Firebase

@main
struct PaulyWidgetBundle: WidgetBundle {
    init() {
            FirebaseApp.configure()
        do{
            try Auth.auth().useUserAccessGroup("SYV2CK2N9N.com.Archimedes4.Pauly")
        } catch {
            print(error.localizedDescription)
        }
    }
    var body: some Widget {
        PaulyWidget()
        PaulyWidgetLiveActivity()
    }
}
