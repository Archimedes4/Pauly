//
//  ChatHomePage.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-03-04.
//

import Foundation
import SwiftUI

enum ChatMode: String, CaseIterable{
    case Home = "Home"
    case GymBro = "Gym Bro"
    case MessageLEGO = "Message LEGO"
    case TutorHomePage = "Tutor Home Page"
    case ReportBug = "Report Bug"
    case Message = "Message"
}

struct GymBroPage: View{
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
        Text("Report a Bug")
    }
}

enum MessagingEnum{
    case Home
    case CreateMessage
    case Coversation
}

struct MessageBubbleView: View {
    @State var textSize: CGRect = .zero
    let Message: String
    let InputColor: Color
    let TimeStamp: String?
    let Sender: String?
    var body: some View {
        ZStack {
            Rectangle()
                .foregroundColor(InputColor)
                .frame(width: textSize.size.width, height: textSize.size.height)
                .cornerRadius(15)
            VStack{
                if Sender != nil{
                    Text(Sender ?? " ")
                        .font(.caption2)
                }
                Text(Message)
                    .padding()
                if TimeStamp != nil{
                    Text(TimeStamp ?? " ")
                        .font(.caption2)
                }
            }.saveBounds(viewId: 1)
        }
        .retrieveBounds(viewId: 1, $textSize)
    }
}

struct Conversation: View{
    @Binding var SelectMessagingMode: MessagingEnum
    @Binding var SelectedDatum1: Datum1
    @Binding var Username: String
    @Binding var TwoPersonMode: Bool
    @State var Message = ""
    @State var Messages: [Datum2] = []
    @State var ShowingTimeStamps: Bool = false
    var body: some View{
        HStack{
            Button(){
                SelectMessagingMode = .Home
            } label: {
                HStack{
                    Image(systemName: "chevron.backward")
                    Text("Back")
                }
            }.padding()
            Spacer()
        }
        Text("Conversation")
        Toggle("Show Time Stamp", isOn: $ShowingTimeStamps)
        Button("Refresh"){
            Task{
                let result1 = try await Functions().LoadDataMessage(extensionvar: "CheckForMessages/\(SelectedDatum1.chatID)")
                Messages = result1.data
            }
        }
        ScrollView(){
            ForEach(Messages, id: \.time) { Message in
                if Message.sender == Username{
                    HStack{
                        Spacer()
                        VStack{
                            MessageBubbleView(Message: Message.message, InputColor: Color.blue, TimeStamp: ShowingTimeStamps ? Message.time:nil, Sender: nil)
                        }.padding()
                    }
                } else {
                    HStack{
                        VStack{
                            MessageBubbleView(Message: Message.message, InputColor: Color.gray, TimeStamp: ShowingTimeStamps ? Message.time:nil, Sender: Message.sender)
                        }.padding()
                        Spacer()
                    }
                }
            }
        }.onAppear(){
            Task{
                let result1 = try await Functions().LoadDataMessage(extensionvar: "CheckForMessages/\(SelectedDatum1.chatID)")
                Messages = result1.data
            }
        }
        TextField("Message Content", text: $Message)
            .onSubmit {
                if Message != ""{
                    Task{
                        let SentMessage = Message.replacingOccurrences(of: " ", with: "_")
                        let result = try await Functions().loadData(extensionvar: "SendMessage/\(SelectedDatum1.chatID)/\(Username)/\(SentMessage)")
                        if result.result == "Success"{
                            let result1 = try await Functions().LoadDataMessage(extensionvar: "CheckForMessages/\(SelectedDatum1.chatID)")
                            Messages = result1.data
                        }
                    }
                }
            }
        Button("Send Message"){
            if Message != ""{
                Task{
                    let SentMessage = Message.replacingOccurrences(of: " ", with: "_")
                    let result = try await Functions().loadData(extensionvar: "SendMessage/\(SelectedDatum1.chatID)/\(Username)/\(SentMessage)")
                    if result.result == "Success"{
                        let result1 = try await Functions().LoadDataMessage(extensionvar: "CheckForMessages/\(SelectedDatum1.chatID)")
                        Messages = result1.data
                    }
                }
            }
        }
    }
}

struct CreateNewConversation: View{
    @Binding var SelectMessagingMode: MessagingEnum
    @State var Users: [String] = []
    @State var SelectedUsers: [String] = []
    @State private var searchText = ""
    @Binding var Username: String
    
    var body: some View{
        VStack{
            Button(){
                SelectMessagingMode = .Home
            } label: {
                HStack{
                    Image(systemName: "chevron.backward")
                    Text("Back")
                    Spacer()
                }
            }.padding()
            Text("Create New Contact")
            Text("Selected Users: \(SelectedUsers.description)")
            Button{
                
            } label: {
                HStack {
                    Image(systemName: "magnifyingglass")
                    TextField("Search", text: $searchText).foregroundColor(Color.black).font(Font.system(size: 16)).background(Color.white).frame(alignment: .leading)
                }
                .background(Color.white)
                .cornerRadius(10)
                .overlay(RoundedRectangle(cornerRadius: 10).stroke(lineWidth: 2).foregroundColor(Color.black))
                .padding()
            }.buttonStyle(.plain)
            List(){
                ForEach(searchResults, id: \.self){ User in
                    Button{
                        SelectedUsers.append(User)
                        if let index = Users.firstIndex(of: User){
                            Users.remove(at: index)
                        }
                    } label: {
                        Text(User)
                    }
                }
            }.onAppear(){
                Task{
                    let response = try await Functions().LoadDataUsers(extensionvar: "UserList")
                    if response.result == "Success"{
                        Users = response.users
                        if let index = Users.firstIndex(of: Username){
                            Users.remove(at: index)
                        }
                    } else {
                        print("Handle This Error")
                        //TO DO MAKE ERROR HANDLING
                    }
                }
            }
            .searchable(text: $searchText)
            .background(Color.marron)
            Button{
                if SelectedUsers.count >= 1{
                    var insertstring = ""
                    for x in SelectedUsers{
                        insertstring.append("\(x),")
                    }
                    insertstring.append(Username)
                    Task{
                        let result = try await Functions().loadData(extensionvar: "CreateGroup/\(insertstring)")
                        if result.result == "Success"{
                            SelectMessagingMode = .Home
                        }
                    }
                } else {
                    print("Nope")
                }
            } label: {
                Text("Create Conversation")
            }
        }.background(Color.marron)
    }
    var searchResults: [String] {
            if searchText.isEmpty {
                return Users
            } else {
                return Users.filter { $0.contains(searchText) }
            }
        }
}

struct MessagingGroupButton: View{
    @Binding var SelectMessagingMode: MessagingEnum
    @Binding var SelectedDatum1: Datum1
    @Binding var TwoPersonMode: Bool
    @Binding var Username: String
    var Datum1Input: Datum1
    @State var InsertString: String = ""
    var body: some View{
        Button{
            SelectMessagingMode = .Coversation
            SelectedDatum1 = Datum1Input
            if Datum1Input.users.count == 2{
                TwoPersonMode = true
            } else {
                TwoPersonMode = false
            }
        } label: {
            Text("\(InsertString)")
                .onAppear(){
                    for x in Datum1Input.users{
                        if x == Username{
                            continue
                        } else {
                            InsertString.append("\(x) ")
                        }
                    }
                }
        }
    }
}

struct MessagingHomePage: View{
    @Binding var SelectedChatMode: ChatMode
    @Binding var SelectMessagingMode: MessagingEnum
    @Binding var Username: String
    @Binding var SelectedDatum1: Datum1
    @Binding var TwoPersonMode: Bool
    @State var Groups: [Datum1] = []
    var body: some View{
        VStack{
            HStack{
                Button(){
                    SelectedChatMode = .Home
                } label: {
                    HStack{
                        Image(systemName: "chevron.backward")
                        Text("Back")
                    }
                }.padding()
                Spacer()
                Button{
                    SelectMessagingMode = .CreateMessage
                } label: {
                    Image(systemName: "square.and.pencil")
                }
            }
            Text("Messaging")
            List{
                ForEach(Groups, id: \.chatID){ value in
                    MessagingGroupButton(SelectMessagingMode: $SelectMessagingMode, SelectedDatum1: $SelectedDatum1, TwoPersonMode: $TwoPersonMode, Username: $Username, Datum1Input: value)
                }
            }.onAppear(){
                Task{
                    let response = try await Functions().LoadDataChatID(extensionvar: "FetchGroups/\(Username)")
                    for x in response.data {
                        Groups.append(x)
                    }
                }
            }
        }
    }
}

struct MessagingPage: View{
    @Binding var SelectedChatMode: ChatMode
    @State var SelectMessagingMode: MessagingEnum = .Home
    @State var SelectedDatum1: Datum1 = Datum1(users: ["Error"], chatID: 0)
    @State var TwoPersonMode: Bool = false
    @Binding var Username: String
    var body: some View{
        if SelectMessagingMode == .Home{
            MessagingHomePage(SelectedChatMode: $SelectedChatMode, SelectMessagingMode: $SelectMessagingMode, Username: $Username, SelectedDatum1: $SelectedDatum1, TwoPersonMode: $TwoPersonMode)
        } else {
            if SelectMessagingMode == .Coversation{
                Conversation(SelectMessagingMode: $SelectMessagingMode, SelectedDatum1: $SelectedDatum1, Username: $Username, TwoPersonMode: $TwoPersonMode)
            } else {
                if SelectMessagingMode == .CreateMessage{
                    CreateNewConversation(SelectMessagingMode: $SelectMessagingMode, Username: $Username)
                }
            }
        }
    }
}

struct ChatHomePage: View{
    @Binding var SelectedChatMode: ChatMode
    @Binding var WindowMode: WindowSrceens
    var body: some View{
        HStack{
            GeometryReader{ geo in
                VStack{
                    HStack{
                        Button(){
                            WindowMode = .HomePage
                        } label: {
                            HStack{
                                Image(systemName: "chevron.backward")
                                Text("Back")
                                Spacer()
                            }
                        }.padding()
                    }
                    Text("Messaging")
                        .font(.system(size: 60.0))
                        .padding()
                    ForEach(ChatMode.allCases, id: \.rawValue){ Selectmode in
                        if Selectmode != .Home{
                            Button{
                                SelectedChatMode = Selectmode
                            } label: {
                                ZStack{
                                    Rectangle()
                                        .foregroundColor(.white)
                                        .frame(width: geo.frame(in: .global).width * 0.8, height: geo.frame(in: .global).height * 0.15)
                                        .cornerRadius(15)
                                    Text(Selectmode.rawValue)
                                        .foregroundColor(.black)
                                }
                            }
                        }
                    }
                }
            }
        }.background(Color.marron)
    }
}

struct ChatOverView: View{
    @Binding var WindowMode: WindowSrceens
    @Binding var Username: String
    @State var SelectedChatMode: ChatMode = .Home
    var body: some View{
        if SelectedChatMode == .Home{
            ChatHomePage(SelectedChatMode: $SelectedChatMode, WindowMode: $WindowMode)
        } else {
            if SelectedChatMode == .GymBro{
                GymBroPage(SelectedChatMode: $SelectedChatMode)
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
                                MessagingPage(SelectedChatMode: $SelectedChatMode, Username: $Username)
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
