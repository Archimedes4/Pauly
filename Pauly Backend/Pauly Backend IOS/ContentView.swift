//
//  ContentView.swift
//  Pauly Backend IOS
//
//  Created by Andrew Mainella on 2023-04-04.
//

import SwiftUI

enum SelectedBackendModeEnum{
    case Home
    case Password
}

struct ContentView: View {
    @State var SelectedBackendMode: SelectedBackendModeEnum = .Password
    @State var accessToken: String?
    var body: some View {
        switch SelectedBackendMode {
        case .Home:
            HomePageView()
        case .Password:
            PasswordView(accessToken: $accessToken, SelectedBackendMode: $SelectedBackendMode)
        }
    }
}

