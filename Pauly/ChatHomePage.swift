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
    @Binding var SelectedChatMode: ChatMode
    @Binding var AccessToken: String
    @State var ChatData: GraphMailPost?
    @State var Subject: String = ""
    @State var Content: String = ""
    
    
    var body: some View{
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
        Button("Add Data"){
            ChatData = GraphMailPost(message: GraphMailPost.Message(subject: Subject, body: GraphMailPost.Message.Body(contentType: "HTML", content: Content), toRecipients: [GraphMailPost.Message.ToRecipient(emailAddress: GraphMailPost.Message.ToRecipient.EmailAddress(address: "andrewmainella@icloud.com"))], internetMessageHeaders: nil))
        }
        Button("Send Message"){
            if ChatData != nil{
                MSALTools().callMailApi(Data: ChatData!, AccessToken: AccessToken)
            }
        }
        Text("Gym Bro Page")
    }
}

struct MessageLEGO: View{
    @Binding var SelectedChatMode: ChatMode
    var body: some View{
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
        Text("Message Lego")
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
        Text("Tutoring Home Page")
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
        Text("Tutoring Page")
        Button{
            TutoringModeSelected = .RequestTutorForm
        } label: {
            Text("Request a Tutor")
        }
        Button{
            TutoringModeSelected = .RequestToBeATutor
        } label: {
            Text("Request to be a Tutor")
        }
    }
}

struct RequestATutor: View{
    @State var isShowingMailView = false
    @Binding var TutoringModeSelected: TutoringMode
    var body: some View{
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
        Text("Request a Tutor")
    }
}

struct RequestToBeATutor: View{
    @Binding var TutoringModeSelected: TutoringMode
    var body: some View{
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
        Text("Request To Be a Tutor")
    }
}

struct TutoringPage: View{
    @Binding var SelectedChatMode: ChatMode
    @State var TutoringModeSelected: TutoringMode = .Home
    var body: some View{
        if TutoringModeSelected == .Home{
            TutoringHomePage(TutoringModeSelected: $TutoringModeSelected, SelectedChatMode: $SelectedChatMode)
        } else {
            if TutoringModeSelected == .RequestToBeATutor{
                RequestToBeATutor(TutoringModeSelected: $TutoringModeSelected)
            } else {
                if TutoringModeSelected == .RequestTutorForm{
                    RequestATutor(TutoringModeSelected: $TutoringModeSelected)
                }
            }
        }
    }
}

struct BugReport: View{
    @Binding var SelectedChatMode: ChatMode
    var BugTypes: [String] = ["Can't Find something", "App doen't look right"]
    @State var SelectedBugType: String = "Can't Find something"
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
            Picker("Type", selection: $SelectedBugType){
                ForEach(BugTypes, id: \.self){
                    Text($0)
                }
            }
            Button{
                
            } label: {
                Text("Submit")
            }.background(
                RoundedRectangle(cornerRadius: 25)
                    .fill(Color.white)
                    .shadow(color: .gray, radius: 2, x: 0, y: 2)
            )
        }
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
                    Text("Messaging")
                        .font(.custom("Chalkboard SE", size: 60.0))
                        .padding()
                    ForEach(ChatMode.allCases, id: \.rawValue){ Selectmode in
                        if Selectmode != .Home{
                            Button{
                                SelectedChatMode = Selectmode
                            } label: {
                                Text(Selectmode.rawValue)
                                    .foregroundColor(.black)
                            }
                            .frame(width: geo.size.width * 0.8, height: geo.size.height * 0.2)
                            .background(
                                RoundedRectangle(cornerRadius: 25)
                                    .fill(Color.white)
                                    .shadow(color: .gray, radius: 2, x: 0, y: 2)
                            )
                            .padding()
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
            MSALView()
                .environmentObject(WindowMode)
        } else {
            if accessToken == nil{
                Text("Please Wait One moment well Pauly gets everything ready")
                    .onAppear(){
                        if accessToken?.count ?? 0 <= 10{
                            msalModel.acquireTokenSilently(MSALAccount!, AccountMode: WindowMode.SelectedWindowMode, Grade: WindowMode.GradeIn, UsernameIn: WindowMode.UsernameIn)
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
                        GymBroPage(SelectedChatMode: $SelectedChatMode, AccessToken: $accessToken as! Binding<String>)
                    } else {
                        if SelectedChatMode == .MessageLEGO{
                            MessageLEGO(SelectedChatMode: $SelectedChatMode)
                        } else {
                            if SelectedChatMode == .ReportBug{
                                BugReport(SelectedChatMode: $SelectedChatMode)
                            } else {
                                if SelectedChatMode == .TutorHomePage{
                                    TutoringPage(SelectedChatMode: $SelectedChatMode)
                                } else {
                                    if SelectedChatMode == .Message{
                                        MessagingPage(SelectedChatMode: $SelectedChatMode, Username: $WindowMode.UsernameIn)
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
