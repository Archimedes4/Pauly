//
//  ContentView.swift
//  Pauly App Clip
//
//  Created by Andrew Mainella on 2024-04-09.
//

import SwiftUI
import AuthenticationServices
import StoreKit


struct MessageView: View {
    func displayOverlay() {
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene {
            let config = SKOverlay.AppClipConfiguration(position: .bottom)
            let overlay = SKOverlay(configuration: config)
            overlay.present(in: windowScene)
        }
    }
    var body: some View {
        VStack {
            Text("Hello, welcome to Pauly!")
            Text("Student Counil, would like to thank you for perticipatiting in the early version of Pauly. We have been hard at work to make Pauly the best possible.")
            
            Text("Submit feedback on your experience.")
            Text("Watch Pauly promo video.")
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color("Maroon"))
        .onAppear(perform: {
            displayOverlay()
        })
    }
}

//#Preview {
//    SignInView()
//}
