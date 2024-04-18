//
//  Pauly_App_ClipApp.swift
//  Pauly App Clip
//
//  Created by Andrew Mainella on 2024-04-09.
//

import SwiftUI

enum ClipStateEnum {
    case commission
    case clamingCommission
    case claimedCommission
    case commissionError
    case Message
}

@main
struct Pauly_App_ClipApp: App {
    @State var paulyAccessToken: String = ""
    @State var graphAccessToken: String = ""
    @State var clipState: ClipStateEnum = ClipStateEnum.commission
    var body: some Scene {
        WindowGroup {
            if (paulyAccessToken == "" || graphAccessToken == "") {
                SignInView(paulyAccessToken: $paulyAccessToken, graphAccessToken: $graphAccessToken)
            } else if (clipState != ClipStateEnum.Message) {
                CommissionView(paulyAccessToken: $paulyAccessToken, graphAccessToken: $graphAccessToken, clipState: $clipState)
            } else {
                MessageView()
            }
        }
    }
}
