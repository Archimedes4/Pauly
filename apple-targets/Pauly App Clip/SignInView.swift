//
//  SignInView.swift
//  Pauly App Clip
//
//  Created by Andrew Mainella on 2024-04-10.
//

import SwiftUI
import MSAL

struct SignInView: View {
    @Binding var paulyAccessToken: String
    @Binding var graphAccessToken: String
    func signIn() {
        do {
            let clientId = "08624b03-1aa6-40c4-8fb3-149c39026dff"
            
            guard let authorityURL = URL(string: "https://login.microsoftonline.com/551df04d-543a-4d61-955e-e4294c4cf950") else {
                  return
            }
            let authority = try MSALAADAuthority(url: authorityURL)
                    
            let msalConfiguration = MSALPublicClientApplicationConfig(clientId: clientId,
                                                                      redirectUri: "msauth.Archimedes4.App-Clip-Testing.Clip://auth",
                                                                      authority: authority)
            if let bundleIdentifier = Bundle.main.bundleIdentifier {
                msalConfiguration.cacheConfig.keychainSharingGroup = bundleIdentifier
            }
            let applicationContext = try MSALPublicClientApplication(configuration: msalConfiguration)
            let keyWindow = UIApplication.shared.windows.filter {$0.isKeyWindow}.first
                    
            if var topController = keyWindow?.rootViewController {
                while let presentedViewController = topController.presentedViewController {
                    topController = presentedViewController
                }
                let webViewParamaters = MSALWebviewParameters(authPresentationViewController: topController)
                let parameters = MSALInteractiveTokenParameters(scopes: ["api://\(clientId)/api/commissions"], webviewParameters: webViewParamaters)
                parameters.promptType = .selectAccount
                
                applicationContext.acquireToken(with: parameters) { (result, error) in
                    guard let result = result else {
                        paulyAccessToken = ""
                        return
                    }
                    paulyAccessToken = result.accessToken
                    let parameters = MSALSilentTokenParameters(scopes: ["Sites.Read.All"], account: result.account)
                    applicationContext.acquireTokenSilent(with: parameters) { (graphResult, graphError) in
                        guard let graphResult = graphResult else {
                            graphAccessToken = ""
                            return
                        }
                        graphAccessToken = graphResult.accessToken
                    }
                }
            } else {
            }
        } catch {
            print(error.localizedDescription)
        }
    }
    var body: some View {
        VStack {
            Spacer()
            VStack {
                HStack {
                    Image("PaulyLogo")
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(width: 90, height: 142)
                    Text("auly")
                        .font(.custom("Bukhari-Script", size: 70))
                        .foregroundStyle(.white)
                        .fixedSize()
                }
                Button(action: signIn) {
                    Text("SIGN IN")
                        .padding()
                        .padding(.horizontal, 75)
                        .background(Color.white)
                        .clipShape(Capsule())
                        .font(Font.custom("Roboto-Bold", size: 20))
                        .foregroundStyle(.black)
                }
            }
            Spacer()
            Text("A.M.D.G")
                .foregroundStyle(Color.white)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color("Maroon"))
    }
}
