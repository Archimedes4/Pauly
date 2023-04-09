//
//  ChatHomePage.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-03-04.
//

import Foundation
import SwiftUI
import UIKit
import MSAL
import FirebaseCore
import FirebaseAuth
import FirebaseFirestore

public enum ChatMode: String, CaseIterable{
    case Home = "Home"
    case GymBro = "Gym Bro"
    case MessageLEGO = "Message LEGO"
    case TutorHomePage = "Tutor Home Page"
    case ReportBug = "Report Bug"
    case Message = "Message"
}

struct GymBroPage: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    
    @Binding var SelectedChatMode: ChatMode
    @Binding var AccessToken: String?
    
    @State var ChatData: GraphMailPost?
    @State var WhenMeeting: String = ""
    @State var SelectedGymBroService: String = "Diet"
    @State var SelectedTime: String = "3"
    
    let GymBroServices: [String] = ["Diet", "Arm Strenght", "Leg Strength", "Endurance"]
    let Times: [String] = ["1", "2", "3", "4", "5", "6"]
    
    var body: some View{
        VStack{
            HStack{
                Button(){
                    SelectedChatMode = .Home
                } label: {
                    HStack{
                        Image(systemName: "chevron.backward")
                        Text("Back")
                        Spacer()
                    }
                }.padding()
            }
            Image("GymBroRequest")
                .resizable()
                .aspectRatio(contentMode: .fit)
            HStack{
                Text("Hello my name is \(WindowMode.FirstName) \(WindowMode.LastName),")
                    .padding()
                Spacer()
            }
            HStack{
                Text("I would like help with")
                    .padding([.top, .leading, .bottom])
                Picker("", selection: $SelectedGymBroService){
                    ForEach(GymBroServices, id: \.self){
                        Text($0)
                    }
                }
                Text(".")
                Spacer()
            }
            HStack{
                Text("I would like to meet")
                    .padding([.top, .leading, .bottom])
                Picker("", selection: $SelectedTime){
                    ForEach(Times, id: \.self){
                        Text($0)
                    }
                }
                Text("Time(s) per week.")
                Spacer()
            }
            TextField("When You would like to meet", text: $WhenMeeting)
                .padding(.leading)
            Text("Thank You!")
            Button(){
                let Content: String = "Hello my name is \(WindowMode.FirstName) \(WindowMode.LastName), \n I would like help with \(SelectedGymBroService). \n I would like to meet \(SelectedTime) times per week. \n \(WhenMeeting) \n Thank You!"
                
                ChatData = GraphMailPost(message: GraphMailPost.Message(subject: "GYM BRO REQUEST", body: GraphMailPost.Message.Body(contentType: "HTML", content: Content), toRecipients: [GraphMailPost.Message.ToRecipient(emailAddress: GraphMailPost.Message.ToRecipient.EmailAddress(address: "andrewmainella@icloud.com"))], internetMessageHeaders: nil))
                if ChatData != nil{
                    MSALTools().callMailApi(Data: ChatData!, AccessToken: AccessToken!)
                }
            } label: {
                Text("Send")
                    .font(.system(size: 17))
                    .fontWeight(.bold)
                    .foregroundColor(.black)
                    .frame(minWidth: 0, maxWidth: .infinity)
                    .padding()
                    .background(
                        RoundedRectangle(cornerRadius: 25)
                            .fill(Color.white)
                            .shadow(color: .gray, radius: 2, x: 0, y: 2)
                    )
                    .padding()
            }
            Spacer()
        }.background(Color.marron)
    }
}

struct MessageLEGO: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    
    
    @Environment(\.colorScheme) var colorScheme
    
    @Binding var SelectedChatMode: ChatMode
    @Binding var AccessToken: String?
    
    @State var Content: String = ""
    @State var ChatData: GraphMailPost?
    
    var body: some View{
        GeometryReader{ geo in
            VStack(alignment: .center){
                HStack{
                    Button(){
                        SelectedChatMode = .Home
                    } label: {
                        HStack{
                            Image(systemName: "chevron.backward")
                            Text("Back")
                        }.background(colorScheme == .light ? Color.white.opacity(0.4):Color.black.opacity(0.4))
                            .cornerRadius(25)
                    }.padding()
                        .foregroundColor(.black)
                    Spacer()
                }
                Image("MessageLego")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: geo.size.width * 0.9, height: geo.size.height * 0.3)
                    .padding(-geo.size.height * 0.125)
                VStack{
                    HStack{
                        Text("Hello Papa,")
                            .padding([.leading, .top])
                            .padding(.leading, -geo.size.width * 0.02)
                        Spacer()
                    }
                    TextEditor(text: $Content)
                        .scrollContentBackground(.hidden)
                        .frame(width: geo.size.width * 0.9, height: geo.size.height * 0.6, alignment: .trailing)
        
                        
                    HStack{
                        Text("Thank you,")
                            .padding(.leading)
                        Spacer()
                    }
                    HStack{
                        Text("\(WindowMode.FirstName), \(WindowMode.LastName)")
                            .padding([.leading, .bottom])
                        Spacer()
                    }
                }
                .background(colorScheme == .light ? Color.white.opacity(0.4):Color.black.opacity(0.4)).cornerRadius(20)
                .overlay(
                           RoundedRectangle(cornerRadius: 20)
                               .stroke(Color.black, lineWidth: 3)
                       )
                .padding([.leading, .trailing])
                .padding(.top)
                Button(){
                    ChatData = GraphMailPost(message: GraphMailPost.Message(subject: "LEGO MESSAGE", body: GraphMailPost.Message.Body(contentType: "HTML", content: Content), toRecipients: [GraphMailPost.Message.ToRecipient(emailAddress: GraphMailPost.Message.ToRecipient.EmailAddress(address: "andrewmainella@icloud.com"))], internetMessageHeaders: nil))
                    if ChatData != nil{
                        MSALTools().callMailApi(Data: ChatData!, AccessToken: AccessToken!)
                    }
                } label: {
                    Text("SEND")
                        .font(.system(size: 17))
                        .fontWeight(.bold)
                        .foregroundColor(.black)
                        .frame(minWidth: 0, maxWidth: .infinity)
                        .padding()
                        .background(
                            RoundedRectangle(cornerRadius: 25)
                                .fill(Color.white)
                                .shadow(color: .gray, radius: 2, x: 0, y: 2)
                        )
                        .padding()
                }
            }.background(
                Image("LegoWallpaper")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .scaledToFill()
                    .edgesIgnoringSafeArea(.all)
            )
        }
    }
}

enum TutoringMode{
    case Home
    case RequestTutorForm
    case RequestToBeATutor
}

struct TutoringHomePage: View{
    @Binding var TutoringModeSelected: TutoringMode
    @Binding var SelectedChatMode: ChatMode
    
    
    var body: some View{
        GeometryReader{ geo in
            ZStack{
                Rectangle()
                    .fill(Color.marron)
                    .edgesIgnoringSafeArea(.all)
                VStack{
                    HStack{
                        Button(){
                            SelectedChatMode = .Home
                        } label: {
                            HStack{
                                Image(systemName: "chevron.backward")
                                Text("Back")
                                Spacer()
                            }
                        }.padding()
                    }
                    Image("TutoringText")
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                    Button{
                        TutoringModeSelected = .RequestTutorForm
                    } label: {
                        Text("Request a Tutor")
                            .frame(width: geo.size.width * 0.8, height: geo.size.height * 0.2)
                            .foregroundColor(.black)
                            .background(
                                RoundedRectangle(cornerRadius: 25)
                                    .fill(Color.white)
                                    .shadow(color: .gray, radius: 2, x: 0, y: 2)
                            )
                            .padding()
                    }
                    .buttonStyle(.plain)
                    
                    Button{
                        TutoringModeSelected = .RequestToBeATutor
                    } label: {
                        Text("Request to be a Tutor")
                            .frame(width: geo.size.width * 0.8, height: geo.size.height * 0.2)
                            .foregroundColor(.black)
                            .background(
                                RoundedRectangle(cornerRadius: 25)
                                    .fill(Color.white)
                                    .shadow(color: .gray, radius: 2, x: 0, y: 2)
                            )
                            .padding()
                    }
                    .buttonStyle(.plain)
                    Spacer()
                }.background(Color.marron)
            }
        }
    }
}

struct RequestATutor: View{
    @Binding var AccessToken: String?
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @Binding var TutoringModeSelected: TutoringMode
    @State var TutorHelpText: String = ""
    var body: some View{
        VStack{
            HStack{
                Button(){
                    TutoringModeSelected = .Home
                } label: {
                    HStack{
                        Image(systemName: "chevron.backward")
                        Text("Back")
                        Spacer()
                    }
                }.padding()
            }
            Image("RequestATutor")
                .resizable()
            Text("Hello my name is \(WindowMode.FirstName) \(WindowMode.LastName),")
            Text("I would like help with with")
            TextField("What would you like a tutor for.", text: $TutorHelpText)
            Text("Thank you")
            Spacer()
        }.background(Color.marron)
    }
}

struct RequestToBeATutor: View{
    @Binding var AccessToken: String?
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @Binding var TutoringModeSelected: TutoringMode
    @State var Content: String = ""
    var body: some View{
        VStack{
            HStack{
                Button(){
                    TutoringModeSelected = .Home
                } label: {
                    HStack{
                        Image(systemName: "chevron.backward")
                        Text("Back")
                        Spacer()
                    }
                }.padding()
            }
            
            Image("RequestToBeATutor")
                .resizable()
            Spacer()
        }.background(Color.marron)
    }
}

struct TutoringPage: View{
    @Binding var AccessToken: String?
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @Binding var SelectedChatMode: ChatMode
    @State var TutoringModeSelected: TutoringMode = .Home
    var body: some View{
        if TutoringModeSelected == .Home{
            TutoringHomePage(TutoringModeSelected: $TutoringModeSelected, SelectedChatMode: $SelectedChatMode)
            
        } else {
            if TutoringModeSelected == .RequestToBeATutor{
                RequestToBeATutor(AccessToken: $AccessToken, TutoringModeSelected: $TutoringModeSelected)
                    .environmentObject(WindowMode)
            } else {
                if TutoringModeSelected == .RequestTutorForm{
                    RequestATutor(AccessToken: $AccessToken, TutoringModeSelected: $TutoringModeSelected)
                        .environmentObject(WindowMode)
                }
            }
        }
    }
}

struct BugReport: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @Binding var AccessToken: String?
    @Binding var SelectedChatMode: ChatMode
    @State var BugDiscription: String = ""
    var body: some View{
        VStack{
            HStack{
                Button(){
                    SelectedChatMode = .Home
                } label: {
                    HStack{
                        Image(systemName: "chevron.backward")
                        Text("Back")
                        Spacer()
                    }
                }.padding()
            }
            Text("Report a Bug")
            HStack{
                Text("Please describe the bug. Make sure to give details of what you were doing when in the app when it crashed.")
                Spacer()
            }
            TextEditor(text: $BugDiscription)
            Text("Thank you, \(WindowMode.FirstName) \(WindowMode.LastName)")
            Button{
                let Content = "Bug Report Submitted: \(Date.now) \n FirstName: \(WindowMode.FirstName) Last Name: \(WindowMode.LastName) User: \(WindowMode.UsernameIn) \n \(BugDiscription)"
                let ChatData = GraphMailPost(message: GraphMailPost.Message(subject: "BUG REPORT", body: GraphMailPost.Message.Body(contentType: "Text", content: Content), toRecipients: [GraphMailPost.Message.ToRecipient(emailAddress: GraphMailPost.Message.ToRecipient.EmailAddress(address: "andrewmainella@icloud.com"))], internetMessageHeaders: nil))
                if ChatData != nil{
                    MSALTools().callMailApi(Data: ChatData, AccessToken: AccessToken!)
                }
            } label: {
                Text("SUBMIT")
                    .font(.system(size: 17))
                    .fontWeight(.bold)
                    .foregroundColor(.black)
                    .frame(minWidth: 0, maxWidth: .infinity)
                    .padding()
                    .background(
                        RoundedRectangle(cornerRadius: 25)
                            .fill(Color.white)
                            .shadow(color: .gray, radius: 2, x: 0, y: 2)
                    )
                    .padding()
            }
        }.background(Color.marron)
    }
}

struct ChatHomePage: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    
    @Binding var SelectedChatMode: ChatMode
    var body: some View{
        HStack{
            GeometryReader{ geo in
                ScrollView(showsIndicators: false){
                    HStack{
                        Button(){
                            WindowMode.SelectedWindowMode = .HomePage
                        } label: {
                            HStack{
                                Image(systemName: "chevron.backward")
                                Text("Back")
                                Spacer()
                            }
                        }.padding()
                    }
                    Image("MessagingText")
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                    ForEach(ChatMode.allCases, id: \.rawValue){ Selectmode in
                        if Selectmode != .Home{
                            Button{
                                SelectedChatMode = Selectmode
                            } label: {
                                Text(Selectmode.rawValue)
                                    .foregroundColor(.black)
                                    .frame(width: geo.size.width * 0.8, height: geo.size.height * 0.2)
                                    .background(
                                        RoundedRectangle(cornerRadius: 25)
                                            .fill(Color.white)
                                            .shadow(color: .gray, radius: 2, x: 0, y: 2)
                                    )
                                    .padding()
                            }
                        }
                        Spacer()
                    }
                }.mask(
                    GeometryReader{ maskgeo in
                        VStack(spacing: 0) {

                            // Left gradient
                            LinearGradient(gradient:
                               Gradient(
                                   colors: [Color.black.opacity(0), Color.black]),
                                           startPoint: .top, endPoint: .bottom
                               )

                            // Middle
                            Group{
                                Rectangle().fill(Color.black)
                                    .frame(width: maskgeo.size.width * 1.0, height: maskgeo.size.height * 0.93)
                            }

                            // Right gradient
                            LinearGradient(gradient:
                               Gradient(
                                   colors: [Color.black, Color.black.opacity(0)]),
                                   startPoint: .top, endPoint: .bottom
                               )
                            }
                    }
                    )
            }
        }.background(Color.marron)
    }
}

struct ChatOverView: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @StateObject var msalModel: MSALScreenViewModel = MSALScreenViewModel()
    
    @Binding var accessToken: String?
    @Binding var MSALAccount: MSALAccount?
    @State var SelectedChatMode: ChatMode = .Home
    var body: some View{
        if MSALAccount == nil{
            if accessToken == nil{
                MSALView()
                    .environmentObject(WindowMode)
            } else {
                if SelectedChatMode == .Home{
                    ChatHomePage(SelectedChatMode: $SelectedChatMode)
                        .environmentObject(WindowMode)
                } else {
                    if SelectedChatMode == .GymBro{
                        GymBroPage(SelectedChatMode: $SelectedChatMode, AccessToken: $accessToken)
                            .environmentObject(WindowMode)
                    } else {
                        if SelectedChatMode == .MessageLEGO{
                            MessageLEGO(SelectedChatMode: $SelectedChatMode, AccessToken: $accessToken)
                                .environmentObject(WindowMode)
                        } else {
                            if SelectedChatMode == .ReportBug{
                                BugReport(AccessToken: $accessToken, SelectedChatMode: $SelectedChatMode)
                                    .environmentObject(WindowMode)
                            } else {
                                if SelectedChatMode == .TutorHomePage{
                                    TutoringPage(AccessToken: $accessToken, SelectedChatMode: $SelectedChatMode)
                                        .environmentObject(WindowMode)
                                } else {
                                    if SelectedChatMode == .Message{
                                        MessagingPage(SelectedChatMode: $SelectedChatMode, Username: $WindowMode.UsernameIn, accessToken: $accessToken)
                                            .environmentObject(WindowMode)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } else {
            if accessToken == nil{
                Text("Please Wait One moment well Pauly gets everything ready")
                    .onAppear(){
                        if accessToken?.count ?? 0 <= 10{
                            msalModel.acquireTokenSilently(MSALAccount!, AccountMode: WindowMode.SelectedWindowMode, Grade: WindowMode.GradeIn, UsernameIn: WindowMode.UsernameIn, FirstName: WindowMode.FirstName, LastName: WindowMode.LastName, SelectedCourses: WindowMode.SelectedCourses)
                        }
                    }
                MSALScreenView_UI(viewModel: msalModel, AccountValue: $MSALAccount)
                    .frame(width: 1, height: 1, alignment: .bottom)
            } else {
                if SelectedChatMode == .Home{
                    ChatHomePage(SelectedChatMode: $SelectedChatMode)
                        .environmentObject(WindowMode)
                } else {
                    if SelectedChatMode == .GymBro{
                        GymBroPage(SelectedChatMode: $SelectedChatMode, AccessToken: $accessToken)
                            .environmentObject(WindowMode)
                    } else {
                        if SelectedChatMode == .MessageLEGO{
                            MessageLEGO(SelectedChatMode: $SelectedChatMode, AccessToken: $accessToken)
                                .environmentObject(WindowMode)
                        } else {
                            if SelectedChatMode == .ReportBug{
                                BugReport(AccessToken: $accessToken, SelectedChatMode: $SelectedChatMode)
                                    .environmentObject(WindowMode)
                            } else {
                                if SelectedChatMode == .TutorHomePage{
                                    TutoringPage(AccessToken: $accessToken, SelectedChatMode: $SelectedChatMode)
                                } else {
                                    if SelectedChatMode == .Message{
                                        MessagingPage(SelectedChatMode: $SelectedChatMode, Username: $WindowMode.UsernameIn, accessToken: $accessToken)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

extension View {
    public func saveBounds(viewId: Int, coordinateSpace: CoordinateSpace = .global) -> some View {
        background(GeometryReader { proxy in
            Color.clear.preference(key: SaveBoundsPrefKey.self, value: [SaveBoundsPrefData(viewId: viewId, bounds: proxy.frame(in: coordinateSpace))])
        })
    }
    
    public func retrieveBounds(viewId: Int, _ rect: Binding<CGRect>) -> some View {
        onPreferenceChange(SaveBoundsPrefKey.self) { preferences in
            DispatchQueue.main.async {
                // The async is used to prevent a possible blocking loop,
                // due to the child and the ancestor modifying each other.
                let p = preferences.first(where: { $0.viewId == viewId })
                rect.wrappedValue = p?.bounds ?? .zero
            }
        }
    }
}

//https://stackoverflow.com/questions/65514698/swiftui-how-to-get-the-length-in-points-of-a-text-inside-a-geometryreader

struct SaveBoundsPrefData: Equatable {
    let viewId: Int
    let bounds: CGRect
}

struct SaveBoundsPrefKey: PreferenceKey {
    static var defaultValue: [SaveBoundsPrefData] = []
    
    static func reduce(value: inout [SaveBoundsPrefData], nextValue: () -> [SaveBoundsPrefData]) {
        value.append(contentsOf: nextValue())
    }
    
    typealias Value = [SaveBoundsPrefData]
}
