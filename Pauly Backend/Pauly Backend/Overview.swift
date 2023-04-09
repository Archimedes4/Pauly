//
//  Overview.swift
//  Pauly Backend
//
//  Created by Andrew Mainella on 2023-03-21.
//

import Foundation
import SwiftUI
import FirebaseCore
import FirebaseFirestore

struct Overview: View {
    @Binding var AddingEmumSelcted: AddingEnum
    @Binding var SelectedBackendMode: EnumBackendMode
    @Binding var AccessToken: String?
    
    var body: some View {
        GeometryReader{ geo in
            ZStack{
                Rectangle()
                    .fill(Color.marron)
                HStack{
                    VStack {
                        Group{
                            Image("PaulyAdminSide")
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                            Divider()
                            Button(){
                                AddingEmumSelcted = .Group
                            } label: {
                                HStack{
                                    Image(systemName: "paperplane")
                                        .resizable()
                                        .aspectRatio(contentMode: .fit)
                                        .frame(width: geo.size.width * 0.02, height: geo.size.height * 0.02)
                                    Text("Messaging")
                                    Spacer()
                                    if AddingEmumSelcted == .Group{
                                        Rectangle()
                                            .frame(width: 2, height: geo.size.height * 0.03)
                                            .foregroundColor(.orange)
                                    }
                                }
                            }.buttonStyle(.plain)
                        }
                        Button(){
                            AddingEmumSelcted = .Calendar
                        } label: {
                            HStack{
                                Image(systemName: "calendar")
                                    .resizable()
                                    .aspectRatio(contentMode: .fit)
                                    .frame(width: geo.size.width * 0.02, height: geo.size.height * 0.02)
                                Text("Calendar")
                                Spacer()
                                if AddingEmumSelcted == .Calendar{
                                    Rectangle()
                                        .frame(width: 2, height: geo.size.height * 0.03)
                                        .foregroundColor(.orange)
                                }
                            }
                        }.buttonStyle(.plain)
                        Button(){
                            AddingEmumSelcted = .Class
                        } label: {
                            HStack{
                                Image(systemName: "graduationcap")
                                    .resizable()
                                    .aspectRatio(contentMode: .fit)
                                    .frame(width: geo.size.width * 0.02, height: geo.size.height * 0.02)
                                Text("Classes")
                                Spacer()
                                if AddingEmumSelcted == .Class{
                                    Rectangle()
                                        .frame(width: 2, height: geo.size.height * 0.03)
                                        .foregroundColor(.orange)
                                }
                            }
                        }.buttonStyle(.plain)
                        Button(){
                            AddingEmumSelcted = .Sports
                        } label: {
                            HStack{
                                Image(systemName: "football.fill")
                                    .resizable()
                                    .aspectRatio(contentMode: .fit)
                                    .frame(width: geo.size.width * 0.02, height: geo.size.height * 0.02)
                                Text("Sports")
                                Spacer()
                                if AddingEmumSelcted == .Sports{
                                    Rectangle()
                                        .frame(width: 2, height: geo.size.height * 0.03)
                                        .foregroundColor(.orange)
                                }
                            }
                        }.buttonStyle(.plain)
                        Button(){
                            AddingEmumSelcted = .Commissions
                        } label: {
                            HStack{
                                Image(systemName: "star.fill")
                                    .resizable()
                                    .aspectRatio(contentMode: .fit)
                                    .frame(width: geo.size.width * 0.02, height: geo.size.height * 0.02)
                                Text("Commissions")
                                Spacer()
                                if AddingEmumSelcted == .Commissions{
                                    Rectangle()
                                        .frame(width: 2, height: geo.size.height * 0.03)
                                        .foregroundColor(.orange)
                                }
                            }
                        }.buttonStyle(.plain)
                        Button(){
                            AddingEmumSelcted = .Files
                        } label: {
                            HStack{
                                Image(systemName: "folder.fill")
                                    .resizable()
                                    .aspectRatio(contentMode: .fit)
                                    .frame(width: geo.size.width * 0.02, height: geo.size.height * 0.02)
                                Text("Files")
                                Spacer()
                                if AddingEmumSelcted == .Files{
                                    Rectangle()
                                        .frame(width: 2, height: geo.size.height * 0.03)
                                        .foregroundColor(.orange)
                                }
                            }
                        }.buttonStyle(.plain)
                        Button(){
                            AddingEmumSelcted = .Card
                        } label: {
                            HStack{
                                Image(systemName: "menucard")
                                    .resizable()
                                    .aspectRatio(contentMode: .fit)
                                    .frame(width: geo.size.width * 0.02, height: geo.size.height * 0.02)
                                Text("Cards")
                                Spacer()
                                if AddingEmumSelcted == .Account{
                                    Rectangle()
                                        .frame(width: 2, height: geo.size.height * 0.03)
                                        .foregroundColor(.orange)
                                }
                            }
                        }.buttonStyle(.plain)
                        Button(){
                            AddingEmumSelcted = .Permissions
                        } label: {
                            HStack{
                                Image(systemName: "hand.raised")
                                    .resizable()
                                    .aspectRatio(contentMode: .fit)
                                    .frame(width: geo.size.width * 0.02, height: geo.size.height * 0.02)
                                Text("Permissions")
                                Spacer()
                                if AddingEmumSelcted == .Permissions{
                                    Rectangle()
                                        .frame(width: 2, height: geo.size.height * 0.03)
                                        .foregroundColor(.orange)
                                }
                            }
                        }.buttonStyle(.plain)
                        Button(){
                            
                        } label: {
                            HStack{
                                Image(systemName: "person.fill")
                                    .resizable()
                                    .aspectRatio(contentMode: .fit)
                                    .frame(width: geo.size.width * 0.02, height: geo.size.height * 0.02)
                                Text("Account")
                                Spacer()
                                if AddingEmumSelcted == .Account{
                                    Rectangle()
                                        .frame(width: 2, height: geo.size.height * 0.03)
                                        .foregroundColor(.orange)
                                }
                            }
                        }.buttonStyle(.plain)
                        Spacer()
                    }
                    .background(Color.marron)
                    .padding()
                    .frame(width: geo.size.width * 0.15)
                    Divider()
                    AddingView(AddingEmumSelcted: $AddingEmumSelcted, SelectedBackendMode: $SelectedBackendMode, AccessToken: $AccessToken)
                }
            }
        }
    }
}

enum AddingEnum{
    case Group
    case Calendar
    case Class
    case Sports
    case Commissions
    case Files
    case Card
    case Account
    case Permissions
}

struct AddingView: View{
    @Binding var AddingEmumSelcted: AddingEnum
    @Binding var SelectedBackendMode: EnumBackendMode
    @Binding var AccessToken: String?
    
    @State var AvaliableFiles: [GraphFileResponceType] = []
    
    var body: some View{
        switch AddingEmumSelcted {
        case .Group:
            AddGroupView(SelectedBackendMode: $SelectedBackendMode)
        case .Calendar:
            AddCalendarView(SelectedBackendMode: $SelectedBackendMode)
        case .Class:
            EditClassView(SelectedBackendMode: $SelectedBackendMode, AddingEmumSelcted: $AddingEmumSelcted, AccessToken: $AccessToken)
        case .Sports:
            SportsView()
        case .Commissions:
            CommitionsView(AccessToken: $AccessToken)
        case .Files:
            MicrosoftGraphFilesManager(AccessToken: $AccessToken, AvaliableFiles: $AvaliableFiles)
        case .Card:
            CardView(EditClassPageSelected: .constant(.PageOne), LastPageSelected: .constant(.PageOne), AccessToken: $AccessToken)
        case .Account:
            Text("Placehodler")
        case .Permissions:
            PermissionsManager()
        }
    }
}
