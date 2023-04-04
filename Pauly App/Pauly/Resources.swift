//
//  Resources.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-04-01.
//

import SwiftUI

struct Resources: View {
    @Binding var selectedProfileView: profileViewEnum
    @Binding var AccessToken: String?
    var body: some View {
        HStack{
            Button(){
                selectedProfileView = .Home
            } label: {
                HStack{
                    Image(systemName: "chevron.backward")
                    Text("Back")
                }
            }.padding()
            Spacer()
        }
        Text("Resourses")
        Button(){
            Task{
                do{
                    try await MSALTools().callMicrosoftGraphForFile(accessToken: AccessToken!)
                } catch {
                    print("Api Error")
                }
            }
        } label: {
            Text("Make Graph Call")
        }
    }
}

struct Resources_Previews: PreviewProvider {
    static var previews: some View {
        Resources(selectedProfileView: .constant(.Resourses), AccessToken: .constant("Nop"))
    }
}
