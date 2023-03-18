//
//  ProfileView.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-03-11.
//

import Foundation
import SwiftUI

enum profileViewEnum {
    case Home
    case Pauly
    case Leaderboard
    case Committions
    case Microsoft
    case UpdatePassword
}

struct ProfileViewMain: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    
    @State var selectedProfileView: profileViewEnum = .Home
    var body: some View{
        if selectedProfileView == .Home{
            ProfileViewHome(selectedProfileView: $selectedProfileView)
                .environmentObject(WindowMode)
        } else {
            if selectedProfileView == .Committions{
                ProfileViewCommitions(selectedProfileView: $selectedProfileView)
            } else {
                if selectedProfileView == .Leaderboard{
                    ProfileViewLeaderboard(selectedProfileView: $selectedProfileView)
                } else {
                    if selectedProfileView == .Pauly{
                        ProfileViewPauly(selectedProfileView: $selectedProfileView)
                    } else {
                        if selectedProfileView == .Microsoft{
                            ProfileViewMicosoft(selectedProfileView: $selectedProfileView)
                        } else {
                            if selectedProfileView == .UpdatePassword{
                                ProfileViewUpdatePassword(selectedProfileView: $selectedProfileView)
                            }
                        }
                    }
                }
            }
        }
    }
}

struct ProfileViewHome: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    
    @Binding var selectedProfileView: profileViewEnum
    
    var body: some View{
        HStack{
            Button(){
                WindowMode.SelectedWindowMode = .HomePage
            } label: {
                HStack{
                    Image(systemName: "chevron.backward")
                    Text("Back")
                }
            }.padding()
            Spacer()
        }
        
        Text("Home view")
        Button(){
            selectedProfileView = .Microsoft
        } label: {
            Text("Microsoft")
        }
        Button(){
            selectedProfileView = .Pauly
        } label: {
            Text("Pauly")
        }
        Button(){
            selectedProfileView = .Leaderboard
        } label: {
            Text("Leaderboard")
        }
        Button(){
            selectedProfileView = .Committions
        } label: {
            Text("Committions")
        }
    }
}

struct ProfileViewMicosoft: View{
    @Binding var selectedProfileView: profileViewEnum
    var body: some View{
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
        Text("Microsoft")
    }
}

struct ProfileViewPauly: View{
    @Binding var selectedProfileView: profileViewEnum
    var body: some View{
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
        Text("Pauly")
        Button(){
            
        } label: {
            Text("Update Password")
        }
    }
}

struct ProfileViewLeaderboard: View{
    @Binding var selectedProfileView: profileViewEnum
    var body: some View{
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
        Text("Leaderboard")
    }
}

struct ProfileViewCommitions: View{
    @Binding var selectedProfileView: profileViewEnum
    var body: some View{
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
        Text("Commisstions")
    }
}

struct ProfileViewUpdatePassword: View{
    @Binding var selectedProfileView: profileViewEnum
    var body: some View{
        HStack{
            Button(){
                selectedProfileView = .Pauly
            } label: {
                HStack{
                    Image(systemName: "chevron.backward")
                    Text("Back")
                }
            }.padding()
            Spacer()
        }
        Text("Update Password")
    }
}
