//
//  Messaging.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-03-18.
//

import Foundation
import SwiftUI
import UIKit
import MSAL
import FirebaseCore
import FirebaseAuth
import FirebaseFirestore
import UIKit

enum MessagingEnum{
    case Home
    case CreateMessage
    case Conversation
    case ConversationTeams
}

struct GroupType{
    let Users: [String]
    let ChatId: Int
    var NumberOfMessages: Int
    var Tokens: [String]
}

struct TeamsGroupType{
    var LastMessageContent: String?
    let Members: [String]
    let TeamsChatType: String
    let GraphChatID: String
    var Sender: String?
}

struct MessagingType {
    let sender, message, time: String
    var ErrorType: String?
    let ErrorID: Int?
}

struct MessagingHomePageTeamMembersView: View {
    @State var TeamMemberText: String = ""
    @State var Members: [String]
    var body: some View{
        Text(TeamMemberText)
            .onAppear(){
                var CurrentMemberCount: Int = 0
                for member in Members{
                    CurrentMemberCount += 1
                    if CurrentMemberCount <= 2{
                        if CurrentMemberCount == Members.count{
                            TeamMemberText.append("\(member)")
                        } else {
                            TeamMemberText.append("\(member),")
                        }
                    } else {
                        if CurrentMemberCount == 3{
                            TeamMemberText.append("+\(Members.count - 3)Members")
                        }
                    }
                }
            }
    }
}

struct MessagingHomePage: View{
    @Binding var accessToken: String?
    @Binding var SelectedChatMode: ChatMode
    @Binding var SelectMessagingMode: MessagingEnum
    @Binding var Username: String
    @Binding var SelectedDatum1: GroupType
    @Binding var TwoPersonMode: Bool
    @State var Groups: [GroupType] = []
    @State var GroupsTeams: [TeamsGroupType] = []
    @Environment(\.colorScheme) var colorScheme
    @State var SelectedMessagingTypeMode: String = "Pauly"
    let MessagingModes: [String] = ["Pauly", "Teams"]
    @State var LoadingGroups: Bool = true
    @State var TextSize: CGSize = CGSize(width: 0.0, height: 0.0)
    @State var LoadingTeamsGroups: Bool = true
    @Binding var SelectedMessageTeams: TeamsGroupType?
    var body: some View{
        GeometryReader{ geo in
            ZStack{
                Rectangle()
                    .fill(Color.marron)
                    .ignoresSafeArea()
                ScrollView{
                    VStack{
                        HStack{
                            Button(){
                                SelectedChatMode = .Home
                            } label: {
                                HStack{
                                    Image(systemName: "chevron.backward")
                                        .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
                                    Text("Back")
                                        .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
                                }
                            }.padding()
                            Spacer()
                            Button{
                                SelectMessagingMode = .CreateMessage
                            } label: {
                                Image(systemName: "square.and.pencil")
                            }
                            .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
                        }
                        Image("MessagingTeamsText")
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                        Picker("", selection: $SelectedMessagingTypeMode){
                            ForEach(MessagingModes, id: \.self){ type in
                                Button(){
                                    SelectedMessagingTypeMode = type
                                } label: {
                                    Text(type)
                                }
                            }
                        }.pickerStyle(.segmented)
                        if LoadingGroups{
                            Spacer()
                            ProgressView()
                                .scaleEffect(1)
                                .onAppear(){
                                    getGroups()
                                }
                            Spacer()
                        } else {
                            if SelectedMessagingTypeMode == "Pauly"{
                                if Groups.count != 0{
                                    ForEach(Groups, id: \.ChatId){ value in
                                        MessagingGroupButton(SelectMessagingMode: $SelectMessagingMode, SelectedDatum1: $SelectedDatum1, TwoPersonMode: $TwoPersonMode, Username: $Username, Datum1Input: value)
                                    }
                                } else {
                                    VStack{
                                        Text("You aren't a memeber of any chats")
                                            .padding()
                                        Button(){
                                            SelectMessagingMode = .CreateMessage
                                        } label: {
                                            HStack{
                                                Image(systemName: "square.and.pencil")
                                                Text("CREATE A NEW CONVERSATION")
                                                    .font(.system(size: 17))
                                                    .fontWeight(.bold)
                                                    .foregroundColor(.black)
                                                    .saveSize(in: $TextSize)
                                            }
                                            .frame(minWidth: 0, maxWidth: .infinity)
                                            .padding()
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
                            } else {
                                if SelectedMessagingTypeMode == "Teams"{
                                    if LoadingTeamsGroups{
                                        Spacer()
                                        ProgressView()
                                        Spacer()
                                    } else {
                                        if GroupsTeams.count == 0{
                                            Text("You aren't a member of any teams")
                                        } else {
                                            ForEach(GroupsTeams, id: \.GraphChatID){ value in
                                                Button(){
                                                    SelectedMessageTeams = value
                                                    SelectMessagingMode = .ConversationTeams
                                                } label: {
                                                    VStack(spacing: 0){
                                                        MessagingHomePageTeamMembersView(Members: value.Members)
                                                        Text("\(value.Sender ?? ""):")
                                                        HTMLStringView(htmlContent: "<meta name='viewport' content='width=device-width, shrink-to-fit=YES'>\(value.LastMessageContent ?? "<p>Error</p>")")
                                                            .padding([.leading, .bottom, .trailing])
                                                            .frame(height: geo.size.height * 0.15)
                                                    }.background(
                                                        RoundedRectangle(cornerRadius: 25)
                                                            .foregroundColor(.white)
                                                    )
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }.background(Color.marron)
                        .frame(maxHeight: .infinity)
                        .ignoresSafeArea()
                }
            }.onChange(of: SelectedMessagingTypeMode){ value in
                if SelectedMessagingTypeMode == "Pauly"{
                    getGroups()
                } else {
                    if SelectedMessagingTypeMode == "Teams"{
                        Task{
                            do{
                                try await getGrouspMS()
                            } catch{
                                print(error)
                            }
                        }
                    }
                }
            }
        }
    }
    func getGroups(){
        Task{
            do{
                let db = Firestore.firestore()
                let docRef = db.collection("Users").document(Username)
                docRef.getDocument { (document, error) in
                    guard error == nil else {
                        print("error", error ?? "")
                        return
                    }
                    
                    if let document = document, document.exists {
                        let data = document.data()
                        if let data = data {
                            if let results = data["Groups"] as! NSArray as? [Int]{
                                if results.count == 0{
                                    LoadingGroups = false
                                }
                                for x in results{
                                    let docRefGroup = db.collection("Groups").document("\(x)")
                                    docRefGroup.getDocument { (documentGroup, error) in
                                        guard error == nil else {
                                            print("error", error ?? "")
                                            return
                                        }
                                        if let documentGroup = documentGroup, documentGroup.exists {
                                            let data = documentGroup.data()
                                            if let data = data {
                                                let GroupID = data["GroupID"] as? Int ?? 0
                                                let Users = data["Members"] as! NSArray as? [String] ?? []
                                                let NumberOfMessages = data["MessagesCount"] as? Int ?? 0
                                                Groups.append(GroupType(Users: Users, ChatId: GroupID, NumberOfMessages: NumberOfMessages, Tokens: []))
                                            }
                                        }
                                    }
                                }
                                LoadingGroups = false
                            } else {
                                print("No Groups")
                            }
                        }
                    }
                }
            } catch {
                print("Error")
            }
        }
    }
    func getGrouspMS() async throws{
        let urlUser = URL(string: "https://graph.microsoft.com/v1.0/me")
        var requestUser = URLRequest(url: urlUser!)
        // Set the Authorization header for the request. We use Bearer tokens, so we specify Bearer + the token we got from the result
        requestUser.httpMethod = "GET"
        requestUser.setValue("application/json", forHTTPHeaderField: "Content-Type")
        requestUser.setValue("Bearer \(accessToken!)", forHTTPHeaderField: "Authorization")
        let (data, _) = try await URLSession.shared.data(for: requestUser)
        do{
            if let json = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
                guard let ClientUserID = json["id"] as? String else {
                    throw GraphCallingErrors.ClientIDNotFound
                }
                
                let url = URL(string: "https://graph.microsoft.com/v1.0/me/chats?$expand=members")
                var request = URLRequest(url: url!)
                // Set the Authorization header for the request. We use Bearer tokens, so we specify Bearer + the token we got from the result
                request.httpMethod = "GET"
                request.setValue("application/json", forHTTPHeaderField: "Content-Type")
                request.setValue("Bearer \(accessToken!)", forHTTPHeaderField: "Authorization")
                do{
                    let (data, _) = try await URLSession.shared.data(for: request)
                    do {
                        // make sure this JSON is in the format we expect
                        if let json = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
                            // try to read out a string array
                            guard let ChatJsonData = json["value"] as! NSArray as? [[String:Any]] else {
                                throw GraphCallingErrors.CouldNotDecodeAPI
                            }
                            for ChatGroup in ChatJsonData{
                                let ChatType = ChatGroup["chatType"] as? String
                                let ChatID = ChatGroup["id"] as? String
                                var ChatMembers: [String] = []
                                let Members = ChatGroup["members"] as! NSArray as? [[String: Any]]
                                for member in Members!{
                                    guard let memberID =  member["userId"] as? String else {
                                        continue
                                    }
                                    if memberID != ClientUserID{
                                        ChatMembers.append(member["displayName"] as! String)
                                    }
                                }
                                GroupsTeams.append(TeamsGroupType(LastMessageContent: nil, Members: ChatMembers, TeamsChatType: ChatType ?? "group", GraphChatID: ChatID!, Sender: nil))
                            }
                            let urlMessage = URL(string: "https://graph.microsoft.com/v1.0/me/chats?$expand=lastMessagePreview")
                            var requestMessage = URLRequest(url: urlMessage!)
                            // Set the Authorization header for the request. We use Bearer tokens, so we specify Bearer + the token we got from the result
                            requestMessage.httpMethod = "GET"
                            requestMessage.setValue("application/json", forHTTPHeaderField: "Content-Type")
                            requestMessage.setValue("Bearer \(accessToken!)", forHTTPHeaderField: "Authorization")
                            let (dataMessage, _) = try await URLSession.shared.data(for: requestMessage)
                            do{
                                if let jsonMessageOut = try JSONSerialization.jsonObject(with: dataMessage, options: []) as? [String: Any] {
                                    guard let messasgeJsonData = jsonMessageOut["value"] as! NSArray as? [[String:Any]] else {
                                        throw GraphCallingErrors.CouldNotDecodeAPI
                                    }
                                    for jsonMessage in messasgeJsonData{
                                        print(jsonMessage)
                                        let MessageGroupID = jsonMessage["id"] as? String
                                        if let Index = GroupsTeams.firstIndex(where: {$0.GraphChatID == MessageGroupID ?? "Error"}){
                                            let MessageGroupPreview = jsonMessage["lastMessagePreview"] as? [String: Any]
                                            let MessageGroupBody = MessageGroupPreview?["body"] as? [String:Any]
                                            let MessageGroupConent = MessageGroupBody?["content"] as? String
                                            let MessageGroupFrom = MessageGroupPreview?["from"] as? [String:Any]
                                            let MessageGroupUser = MessageGroupFrom?["user"] as? [String:Any]
                                            let MessageGroupDisplay = MessageGroupUser?["displayName"] as? String
                                            GroupsTeams[Index].Sender = MessageGroupDisplay ?? ""
                                            GroupsTeams[Index].LastMessageContent = MessageGroupConent ?? ""
                                        }
                                    }
                                    LoadingTeamsGroups = false
                                }
                            } catch {
                                print(error)
                            }
                        }
                    } catch let error as NSError {
                        print("Failed to load: \(error.localizedDescription)")
                    }
                } catch{
                    throw GraphCallingErrors.APICallFailed
                }
            }
        } catch {
            print(error)
        }
    }
}

extension String{
var htmlConvertedString : String{
    let string = self.replacingOccurrences(of: "<[^>]+>", with: "", options: .regularExpression, range: nil)
    return string
}}

struct MessagingPage: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @Binding var SelectedChatMode: ChatMode
    
    @State var SelectMessagingMode: MessagingEnum = .Home
    @State var SelectedDatum1: GroupType = GroupType(Users: ["Error"], ChatId: 0, NumberOfMessages: 0, Tokens: [])
    @State var SelectedTeamsGroupChat: TeamsGroupType?
    @State var TwoPersonMode: Bool = false
    @Binding var Username: String
    @Binding var accessToken: String?
    var body: some View{
        if SelectMessagingMode == .Home{
            MessagingHomePage(accessToken: $accessToken, SelectedChatMode: $SelectedChatMode, SelectMessagingMode: $SelectMessagingMode, Username: $Username, SelectedDatum1: $SelectedDatum1, TwoPersonMode: $TwoPersonMode, SelectedMessageTeams: $SelectedTeamsGroupChat)
        } else {
            if SelectMessagingMode == .Conversation{
                Conversation(SelectMessagingMode: $SelectMessagingMode, SelectedDatum1: $SelectedDatum1, Username: $Username, TwoPersonMode: $TwoPersonMode)
                    .environmentObject(WindowMode)
            } else {
                if SelectMessagingMode == .CreateMessage{
                    CreateNewConversation(SelectMessagingMode: $SelectMessagingMode, Username: $Username)
                } else {
                    if SelectMessagingMode == .ConversationTeams{
                        ConversationTeams(accessToken: $accessToken, SelectMessagingMode: $SelectMessagingMode, SelectedMessageTeams: $SelectedTeamsGroupChat)
                            .environmentObject(WindowMode)
                    }
                }
            }
        }
    }
}

struct MessagingGroupButton: View{
    @Binding var SelectMessagingMode: MessagingEnum
    @Binding var SelectedDatum1: GroupType
    @Binding var TwoPersonMode: Bool
    @Binding var Username: String
    @State var Datum1Input: GroupType
    @State var InsertString: String = ""
    var body: some View{
        Button{
            SelectMessagingMode = .Conversation
            SelectedDatum1 = Datum1Input
            if Datum1Input.Users.count == 2{
                TwoPersonMode = true
            } else {
                TwoPersonMode = false
            }
        } label: {
            Text("\(InsertString)")
                .onAppear(){
                    for x in Datum1Input.Users{
                        if x == Username{
                            continue
                        } else {
                            let db = Firestore.firestore()
                            let docRef = db.collection("Users").document(x)
                            docRef.getDocument { (document, error) in
                                guard error == nil else {
                                    print("error", error ?? "")
                                    return
                                }
                                
                                if let document = document, document.exists {
                                    let data = document.data()
                                    if let data = data {
                                        guard let UserFirstName = data["First Name"] as? String else {
                                            InsertString.append("Error")
                                            return
                                        }
                                        
                                        guard let UserLastName = data["Last Name"] as? String else {
                                            InsertString.append("Error")
                                            return
                                        }
                                        
                                        guard let UserToken = data["NotificationToken"] as? String else {
                                            return
                                        }
                                        
                                        Datum1Input.Tokens.append(UserToken)
                                        
                                        if let Index = Datum1Input.Users.firstIndex(where: { $0 == x }){
                                            if (Index + 1) == Datum1Input.Users.count{
                                                InsertString.append("\(UserFirstName) \(UserLastName)")
                                            } else {
                                                InsertString.append("\(UserFirstName) \(UserLastName),")
                                            }
                                        } else {
                                            InsertString.append("\(UserFirstName) \(UserLastName) ")
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

struct MessageBubbleView: View {
    @State var textSize: CGRect = .zero
    let Message: String
    let InputColor: Color
    let TimeStamp: String?
    let Sender: String?
    var ErrorValue: String?
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
                if ErrorValue != nil{
                    Text(ErrorValue ?? "")
                }
            }.saveBounds(viewId: 1)
        }
        .retrieveBounds(viewId: 1, $textSize)
    }
}

struct TeamsMessageType{
    let Id: UUID = UUID()
    let Content: String
    let Sender: String
    let Attachments: [AttachmentType]?
}

struct AttachmentType{
    let Id: UUID = UUID()
    let Name: String
    let Link: String
}

struct ConversationTeams: View{
    @Binding var accessToken: String?
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @Binding var SelectMessagingMode: MessagingEnum
    @Binding var SelectedMessageTeams: TeamsGroupType?
    @State var ShowingTimeStamps: Bool = false
    @State var TeamsMesages: [TeamsMessageType] = []
    @State var Message = ""
    @Environment(\.colorScheme) var colorScheme
    var body: some View{
        ZStack{
            Rectangle()
                .foregroundColor(Color.marron)
                .ignoresSafeArea()
            GeometryReader{ geo in
                VStack{
                    ScrollView{
                        VStack{
                            HStack{
                                Button(){
                                    SelectMessagingMode = .Home
                                } label: {
                                    HStack{
                                        Image(systemName: "chevron.backward")
                                            .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
                                        Text("Back")
                                            .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
                                    }
                                }.padding()
                                Spacer()
                            }
                            Text("Conversation")
                                .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
                            Toggle("Show Time Stamp", isOn: $ShowingTimeStamps)
                                .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
                                .onAppear(){
                                    Task{
                                        do{
                                            try await GetConversationTeams()
                                        } catch {
                                            print(error)
                                        }
                                    }
                                }
                            ForEach($TeamsMesages, id: \.Id) { mesage in
                                VStack{
                                    Text(mesage.wrappedValue.Sender)
                                        .onAppear(){
                                            print(mesage.wrappedValue.Attachments)
                                        }
                                    HTMLStringView(htmlContent: "<meta name='viewport' content='width=device-width, shrink-to-fit=YES'>\(mesage.wrappedValue.Content)")
                                        .padding([.leading, .bottom, .trailing])
                                        .frame(height: geo.size.height * 0.15)
                                    if mesage.wrappedValue.Attachments != nil{
                                        ScrollView(.horizontal){
                                            ForEach(mesage.wrappedValue.Attachments!, id: \.Id){ attach in
                                                Button(){
                                                    
                                                } label:{
                                                    Text(attach.Name)
                                                }
                                            }
                                        }
                                    }
                                }.background(
                                    Rectangle()
                                        .fill(Color.white)
                                )
                            }
                        }.background(Color.marron)
                    }
                    HStack{
                        TextField("Message", text: $Message)
                            .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
                            .cornerRadius(25)
                            .padding()
                            .overlay(
                                    RoundedRectangle(cornerRadius: 16)
                                        .stroke(.black, lineWidth: 2)
                                )
                            .onSubmit {
                                if Message != ""{
                                    Task{
                                        do{
                                            try await SendMessage()
                                        } catch {
                                            print(error)
                                        }
                                    }
                                }
                            }
                        Button(){
                            Task{
                                do{
                                    try await SendMessage()
                                } catch{
                                    print(error)
                                }
                            }
                        } label: {
                            Image(systemName: "arrow.up.circle")
                        }
                    }
                }
            }
        }
    }
    func GetConversationTeams() async throws {
        let urlUser = URL(string: "https://graph.microsoft.com/v1.0/me/chats/\(SelectedMessageTeams!.GraphChatID)/messages")
        var requestUser = URLRequest(url: urlUser!)
        // Set the Authorization header for the request. We use Bearer tokens, so we specify Bearer + the token we got from the result
        requestUser.httpMethod = "GET"
        requestUser.setValue("application/json", forHTTPHeaderField: "Content-Type")
        requestUser.setValue("Bearer \(accessToken!)", forHTTPHeaderField: "Authorization")
        let (data, _) = try await URLSession.shared.data(for: requestUser)
        do{
            if let json = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
                print(json)
                guard let MessageingArray = json["value"] as? NSArray as? [[String: Any]] else {
                    return
                }
                for Message in MessageingArray{
                    let MessageBody = Message["body"] as? [String:Any]
                    guard let MessageContent = MessageBody?["content"] as? String else {
                        return
                    }
                    let MessageFrom = Message["from"] as? [String: Any]
                    let MessageUser = MessageFrom?["user"] as? [String: Any]
                    guard let MessageDisplayName = MessageUser?["displayName"] as? String else{
                        return
                    }
                    let Attachement = Message["attachments"] as? NSArray as? [[String:Any]]
                    if Attachement != nil{
                        var AttachmentData: [AttachmentType] = []
                        for x in Attachement!{
                            guard let contentUrl = x["contentUrl"] as? String else{
                                return
                            }
                            guard let Name = x["name"] as? String else {
                                return
                            }
                            AttachmentData.append(AttachmentType(Name: Name, Link: contentUrl))
                        }
                        TeamsMesages.append(TeamsMessageType(Content: MessageContent, Sender: MessageDisplayName, Attachments: AttachmentData))
                    } else {
                        TeamsMesages.append(TeamsMessageType(Content: MessageContent, Sender: MessageDisplayName, Attachments: nil))
                    }
                }
            }
        } catch {
            throw GraphCallingErrors.CouldNotDecodeAPI
        }
    }
    func SendMessage() async throws {
        let urlUser = URL(string: "https://graph.microsoft.com/v1.0/me/chats/\(SelectedMessageTeams!.GraphChatID)/messages")
        var requestUser = URLRequest(url: urlUser!)
        // Set the Authorization header for the request. We use Bearer tokens, so we specify Bearer + the token we got from the result
        requestUser.httpMethod = "POST"
        requestUser.setValue("application/json", forHTTPHeaderField: "Content-Type")
        requestUser.setValue("Bearer \(accessToken!)", forHTTPHeaderField: "Authorization")
        let MessageData: [String:Any] = [
            "body":[
                "content":Message
            ]
        ]
        let jsonData = try JSONSerialization.data(withJSONObject: MessageData, options: .prettyPrinted)
        requestUser.httpBody = jsonData
        let (data, _) = try await URLSession.shared.data(for: requestUser)
        do{
            if let json = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
                print(json)
            }
        } catch {
            throw GraphCallingErrors.CouldNotDecodeAPI
        }
    }
}

struct Conversation: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @Binding var SelectMessagingMode: MessagingEnum
    @Binding var SelectedDatum1: GroupType
    @Binding var Username: String
    @Binding var TwoPersonMode: Bool
    @State var Message = ""
    @State var Messages: [MessagingType] = []
    @State var ShowingTimeStamps: Bool = false
    @State var NumberOfErrors: Int = 0
    @Environment(\.colorScheme) var colorScheme
    
    var body: some View{
        HStack{
            Button(){
                SelectMessagingMode = .Home
            } label: {
                HStack{
                    Image(systemName: "chevron.backward")
                        .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
                    Text("Back")
                        .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
                }
            }.padding()
            Spacer()
        }
        Text("Conversation")
            .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
        Toggle("Show Time Stamp", isOn: $ShowingTimeStamps)
            .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
        Button("Refresh"){
            GetMessages() 
        }
        .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
        ScrollView(){
            ForEach(Messages, id: \.time) { Message in
                if Message.sender == Username{
                    HStack{
                        Spacer()
                        VStack{
                            MessageBubbleView(Message: Message.message, InputColor: Color.blue, TimeStamp: ShowingTimeStamps ? Message.time:nil, Sender: nil, ErrorValue: Message.ErrorType)
                        }.padding()
                    }
                } else {
                    HStack{
                        VStack{
                            MessageBubbleView(Message: Message.message, InputColor: Color.gray, TimeStamp: ShowingTimeStamps ? Message.time:nil, Sender: Message.sender, ErrorValue: nil)
                        }.padding()
                        Spacer()
                    }
                }
            }
        }.onAppear(){
            GetMessages()
        }
        HStack{
            TextField("Message", text: $Message)
                .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
                .cornerRadius(25)
                .padding()
                .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(.black, lineWidth: 2)
                    )
                .onSubmit {
                    if Message != ""{
                        SendMessage()
                    }
                }
            Button(){
                SendMessage()
            } label: {
                Image(systemName: "arrow.up.circle")
            }
        }
    }
    func SendMessage(){
        if Message != ""{
            let someDateTime = "\(Date.now)"
            Messages.append(MessagingType(sender: Username, message: Message, time: "\(String(describing: someDateTime))", ErrorType: nil, ErrorID: NumberOfErrors))
            NumberOfErrors += 1
            Task{
                let db = Firestore.firestore()
                
                let docRef = db.collection("Groups").document("\(SelectedDatum1.ChatId)").collection("Messages").document("\(SelectedDatum1.NumberOfMessages + 1)")
                
                let MessagingOutputData: [String: Any] = [
                    "Sender":Username,
                    "Message":Message,
                    "Time":"\(String(describing: someDateTime))"
                ]
                
                print(someDateTime)
                print("\(String(describing: someDateTime))")
                
                docRef.setData(MessagingOutputData) { error in
                    if let error = error {
                        print("Error writing document: \(error)")
                    } else {
                        print("Document successfully written!")
                    }
                }
                
                let docRef1 = db.collection("Groups").document("\(SelectedDatum1.ChatId)")
                
                let GroupOut: [String: Any] = [
                    "GroupID":SelectedDatum1.ChatId,
                    "Members":SelectedDatum1.Users,
                    "MessagesCount":(SelectedDatum1.NumberOfMessages + 1)
                ]
                
                docRef1.setData(GroupOut) { error in
                    if let error = error {
                        print("Error writing document: \(error)")
                    } else {
                        guard let url = URL(string: "https://fcm.googleapis.com/fcm/send") else {
                            return
                        }
                        for o in SelectedDatum1.Tokens{
                            if TwoPersonMode{
                                let json: [String: Any] = [
                                    "to":o,
                                    "notification":[
                                        "title":"\(WindowMode.FirstName) \(WindowMode.LastName)",
                                        "body":Message
                                    ]
                                ]
                                var Request = URLRequest(url: url)
                                Request.httpMethod = "POST"
                                Request.httpBody = try? JSONSerialization.data(withJSONObject: json, options: [.prettyPrinted])
                                Request.setValue("application/json", forHTTPHeaderField: "Content-Type")
                                Request.setValue("key=AAAAVpxcvqo:APA91bGnz2Qy2pEgatRMecQ6u3nollz_Wo1pdyqT4F4t3Lywt6Uo_ZWWKYg-vIJj_NU7wRKZCrX5RBPtthLXEUFn1IYtm9Kt3nwxfq3VSJPuJv1qfvwkj2Y6rRiC27eeauxob-Dwcrli", forHTTPHeaderField: "Authorization")
                                let session = URLSession(configuration: .default)
                                session.dataTask(with: Request) { _ , _, err in
                                    if let err = err{
                                        print(err.localizedDescription)
                                        return
                                    }
                                }
                            } else {
                                let json: [String: Any] = [
                                    "to":o,
                                    "notification":[
                                        "title":"\(WindowMode.FirstName) \(WindowMode.LastName) \n To you & \(SelectedDatum1.Users.count - 2)",
                                        "body":Message
                                        ]
                                    ]
                                    var Request = URLRequest(url: url)
                                    Request.httpMethod = "POST"
                                    Request.httpBody = try? JSONSerialization.data(withJSONObject: json, options: [.prettyPrinted])
                                    Request.setValue("application/json", forHTTPHeaderField: "Content-Type")
                                    Request.setValue("key=AAAAVpxcvqo:APA91bGnz2Qy2pEgatRMecQ6u3nollz_Wo1pdyqT4F4t3Lywt6Uo_ZWWKYg-vIJj_NU7wRKZCrX5RBPtthLXEUFn1IYtm9Kt3nwxfq3VSJPuJv1qfvwkj2Y6rRiC27eeauxob-Dwcrli", forHTTPHeaderField: "Authorization")
                                    let session = URLSession(configuration: .default)
                                    session.dataTask(with: Request) { _ , _, err in
                                        if let err = err{
                                            print(err.localizedDescription)
                                            return
                                        }
                                    }
                            }
                        }
                    }
                }
                
                SelectedDatum1.NumberOfMessages += 1
                //TO DO ADD ERROR
            }
        }
    }
    func GetMessages(){
        let db = Firestore.firestore()
        
        let docRef = db.collection("Groups").document("\(SelectedDatum1.ChatId)").collection("Messages")
        var outputMessageArray: [MessagingType] = []
        docRef.getDocuments { (snapshot, error) in
            guard let snapshot = snapshot, error == nil else {
                //handle error
                return
            }
            snapshot.documents.forEach({ (documentSnapshot) in
                let documentData = documentSnapshot.data()
                let Sender = documentData["Sender"] as? String ?? "Error"
                let Contents = documentData["Message"] as? String ?? "Error"
                let Time = documentData["Time"] as? String ?? "Error"
                print("Sender:\(Sender), Contents:\(Contents), Time:\(Time)")
                let OutputMessage = MessagingType(sender: Sender, message: Contents, time: Time, ErrorType: nil, ErrorID: nil)
                outputMessageArray.append(OutputMessage)
            })
            Messages = outputMessageArray
        }
    }
}

struct AvaliableUser{
    let UsersName: String
    let uid: String
}

struct CreateNewConversation: View{
    @Binding var SelectMessagingMode: MessagingEnum
    @State var Users: [AvaliableUser] = []
    @State var SelectedUsers: [AvaliableUser] = []
    @State private var searchText = ""
    @Binding var Username: String
    @State var SelectedUsersText: String = ""
    @State var ClientUser: AvaliableUser?
    
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
            Text("Selected Users: \(SelectedUsersText)")

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
                ForEach(searchResults, id: \.UsersName){ User in
                    Button{
                        SelectedUsers.append(User)
                        if let index = Users.firstIndex(where: { $0.UsersName == User.UsersName }){
                            Users.remove(at: index)
                        }
                        var outputString: String = ""
                        for x in SelectedUsers{
                            outputString.append(x.UsersName)
                        }
                        SelectedUsersText = outputString
                    } label: {
                        Text(User.UsersName)
                    }
                }
            }.onAppear(){
                Task{
                    do{
                        let db = Firestore.firestore()
                        
                        let docRef = db.collection("Users")
                        docRef.getDocuments { (snapshot, error) in
                                 guard let snapshot = snapshot, error == nil else {
                                  //handle error
                                  return
                                }
                                snapshot.documents.forEach({ (documentSnapshot) in
                                    let documentData = documentSnapshot.data()
                                    let FirstNameOut = documentData["First Name"] as? String ?? "Error"
                                    let LastNameOut = documentData["Last Name"] as? String ?? "Error"
                                    let uid = documentData["uid"] as? String ?? "Error"
                                    let name = FirstNameOut + " " + LastNameOut
                                    Users.append(AvaliableUser(UsersName: name, uid: uid))
                                    if let index = Users.firstIndex(where: { $0.uid == Username }){
                                        ClientUser = AvaliableUser(UsersName: name, uid: uid)
                                        Users.remove(at: index)
                                    }
                                })
                              }
                    } catch {
                        print("Error")
                    }
                }
            }
            .searchable(text: $searchText)
            .background(Color.marron)
            Button{
                if SelectedUsers.count >= 1{
                    SelectedUsers.append(ClientUser!)
                    let db = FirebaseFirestore.Firestore.firestore()
                    //The user's ID, unique to the Firebase project.
                    // Do NOT use this value to authenticate with your backend server,
                    // if you have one. Use getTokenWithCompletion:completion: instead.
                    for x in SelectedUsers{
                        let docRef1 = db.collection("Groups").document("AmountOfGroups")
                        docRef1.getDocument { (document, error) in
                            guard error == nil else {
                                print("error", error ?? "")
                                return
                            }
                            if let document = document, document.exists {
                                let data = document.data()
                                if let data = data {
                                    let TotalCount = data["Count"] as! Int
                                    let docRef2 = db.collection("Groups").document("\(TotalCount + 1)")
                                    var OutputUsers: [String] = []
                                    for x in SelectedUsers{
                                        OutputUsers.append(x.uid)
                                    }

                                    var OutputUsersName: [String] = []
                                    for x in SelectedUsers{
                                        OutputUsersName.append(x.UsersName)
                                    }
    
                                    let inputData5: [String: Any] = [
                                        "GroupID":(TotalCount + 1),
                                        "Members":OutputUsers,
                                        "MembersNames":OutputUsersName,
                                        "MessagesCount":0
                                    ]
                                    docRef2.setData(inputData5) { error in
                                        if let error = error {
                                            print("Error writing document: \(error)")
                                        } else {
                                            SelectMessagingMode = .Home
                                            print("Document successfully written!")
                                        }
                                    }
                                    let inputData1: [String: Any] = [
                                        "Count":(TotalCount + 1),
                                    ]
                                    docRef1.setData(inputData1) { error in
                                        if let error = error {
                                            print("Error writing document: \(error)")
                                        } else {
                                            var PerviousGroupID: [Int] = []
                                            let docRef = db.collection("Users").document(x.uid)
                                            
                                            docRef.getDocument { (document, error) in
                                                guard error == nil else {
                                                    print("error", error ?? "")
                                                    return
                                                }
                                                if let document = document, document.exists {
                                                    let data = document.data()
                                                    if let data = data {
                                                        PerviousGroupID = data["Groups"] as! NSArray as? [Int] ?? []
                                                        PerviousGroupID.append(TotalCount + 1)
                                                        let FirstNameMessageing = data["First Name"] as! String
                                                        let LastNameMessageing = data["Last Name"] as! String
                                                        let ClassesMessageing = data["Classes"] as! NSArray as! [String]
                                                        let GradeMessageing = data["Grade"] as! Int
                                                        let EmailMessageing = data["Email"] as! String
                                                        let uidMessageing = data["uid"] as! String
                                                        let outputData: [String:Any] = [
                                                            "First Name":FirstNameMessageing,
                                                            "Last Name": LastNameMessageing,
                                                            "Classes":ClassesMessageing,
                                                            "Grade":GradeMessageing,
                                                            "Email":EmailMessageing,
                                                            "uid":uidMessageing,
                                                            "Groups":PerviousGroupID
                                                        ]
                                                        docRef.setData(outputData) { error in
                                                            if let error = error {
                                                                print("Error writing document: \(error)")
                                                            } else {
                                                                SelectMessagingMode = .Home
                                                                print("Document successfully written!")
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            print("Document successfully written!")
                                        }
                                    }
                                }
                            }
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
    var searchResults: [AvaliableUser] {
            if searchText.isEmpty {
                return Users
            } else {
                return Users.filter { $0.UsersName.contains(searchText) }
            }
        }
}
