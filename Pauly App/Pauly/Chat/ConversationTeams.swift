//
//  ConversationTeams.swift
//  
//
//  Created by Andrew Mainella on 2023-04-20.
//

import SwiftUI
import UIKit

struct UIKLabel: UIViewRepresentable {
    
    typealias TheUIView = UILabel
    fileprivate var configuration = { (view: TheUIView) in }

    func makeUIView(context: UIViewRepresentableContext<Self>) -> TheUIView {
        let label = TheUIView()
        return label
    }
    func updateUIView(_ uiView: TheUIView, context: UIViewRepresentableContext<Self>) {
        configuration(uiView)
    }
}

struct CoversationTeamsMessgeBubleText: View{
    @Binding var ContentText: NSAttributedString // Content
    @State var size: CGSize // Size of Meessage Button View
    var body: some View{
        UIKLabel(configuration: { label in
            label.preferredMaxLayoutWidth = size.width * 0.8
            label.lineBreakMode = .byWordWrapping
            label.numberOfLines = 0
            label.attributedText = ContentText
            label.textAlignment = .right
            label.backgroundColor = .blue
            
        })
    }
}

struct CoversationTeamsMessgeBubleTextSize: View{
    @Binding var mesage: TeamsMessageType
    @State var HtmlText: String = ""
    @State var ContentText: NSAttributedString = NSAttributedString("") // Content
    @State var size: CGSize // Size of Meessage Button View
    @Binding var MicrosoftUserUID: String
    @Binding var RecievedAllMessages: Bool
    @Binding var SeenLastMessage: Bool
    @Binding var OldestCurrentMessage: Date
    var body: some View{
        UIKLabel(configuration: { label in
            label.preferredMaxLayoutWidth = size.width * 0.4
            label.lineBreakMode = .byWordWrapping
            label.numberOfLines = 0
            label.attributedText = ContentText
            label.textColor = .black
            label.backgroundColor = .clear
            
            let size = CGSize(width: label.frame.width, height: 2000)
            let boundingBox = label.attributedText!.boundingRect(
                with: size,
                options: [.usesLineFragmentOrigin, .usesFontLeading, .usesDeviceMetrics],
                context: nil
            )
            DispatchQueue.global(qos: .userInitiated).async {
                mesage.MessageSize = boundingBox.size
            }
        })
        .onAppear(){
            //Get Message Content
            if mesage.MicrosoftSenderID == MicrosoftUserUID{
                HtmlText = "<span style=\"font-family: HelveticaNeue; font-size: 16\">\(mesage.Content)"
                if let nsAttributedString = try? NSAttributedString(data: Data(HtmlText.utf8), options: [.documentType: NSAttributedString.DocumentType.html, .characterEncoding: String.Encoding.utf8.rawValue], documentAttributes: nil) {
                    ContentText = nsAttributedString
                }
            } else {
                HtmlText = "<span style=\"font-family: HelveticaNeue; font-size: 16\">\(mesage.Sender): \(mesage.Content)"
                if let nsAttributedString = try? NSAttributedString(data: Data(HtmlText.utf8), options: [.documentType: NSAttributedString.DocumentType.html, .characterEncoding: String.Encoding.utf8.rawValue], documentAttributes: nil) {
                    ContentText = nsAttributedString
                }
            }
            //Looking if end
            if RecievedAllMessages == false{
                if OldestCurrentMessage >= mesage.DateSent{
                    SeenLastMessage = true
                }
            }
        }
    }
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
    @State var CurrentTime: String = ""
    let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()
    @State var TimerCount: Int = 0
    @State var MicrosoftUserUID: String = ""
    @State var MessageURLString: String = ""
    @State var SeenLastMessage: Bool = false
    @State var OldestCurrentMessage: Date = Date.now
    @State var RecievedAllMessages: Bool = false
    @State var PageLoading: Bool = true
    var body: some View{
        if PageLoading{
            Spacer()
            ProgressView()
                .onAppear(){
                    MessageURLString = "https://graph.microsoft.com/v1.0/me/chats/\(SelectedMessageTeams!.GraphChatID)/messages"
                    Task{
                        do{
                            MicrosoftUserUID =  try await FetchMicrosoftUserInfo()
                            try await GetConversationTeams()
                        } catch {
                            print(error)
                        }
                    }
                }
            Spacer()
        } else {
            ZStack{
                Rectangle()
                    .foregroundColor(Color.marron)
                    .ignoresSafeArea()
                GeometryReader{ geo in
                    VStack{
                        ScrollViewReader{ scroll in
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
                                    Text("Conversation Teams")
                                        .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
                                    Toggle("Show Time Stamp", isOn: $ShowingTimeStamps)
                                        .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
                                        .onAppear(){
                                            let formatter = ISO8601DateFormatter()
                                            formatter.timeZone = TimeZone(identifier: "UTC")
                                            CurrentTime = formatter.string(from: Date())
                                            
                                        }
                                        .onReceive(timer){ value in
                                            TimerCount += 1
                                            if TimerCount >= 5{
                                                Task{
                                                    do{
                                                        try await GetCurrentConversationTeams()
                                                        if SeenLastMessage{
                                                            try await GetConversationTeams()
                                                            SeenLastMessage = false
                                                        }
                                                    } catch{
                                                        print("error has occured")
                                                    }
                                                }
                                            }
                                        }
                                    LazyVStack{
                                        ForEach($TeamsMesages.sorted(by: { $0.wrappedValue.DateSent > $1.wrappedValue.DateSent }), id: \.wrappedValue.Id) { mesage in
//                                            ZStack{
//                                                HStack{
//                                                    if mesage.wrappedValue.MicrosoftSenderID == MicrosoftUserUID{
//                                                        Spacer()
//                                                    }
//                                                    RoundedRectangle(cornerRadius: 20)
//                                                        .fill(Color.white)
//                                                        .frame(width: mesage.wrappedValue.MessageSize.width * 1.2, height: mesage.wrappedValue.MessageSize.height * 1.2)
//                                                    if mesage.wrappedValue.MicrosoftSenderID != MicrosoftUserUID{
//                                                        Spacer()
//                                                    }
//                                                }
                                                HStack{
                                                    if mesage.wrappedValue.MicrosoftSenderID == MicrosoftUserUID{
                                                        Spacer()
                                                    }
    //                                                ZStack{
    ////                                                    RoundedRectangle(cornerRadius: 20)
    ////                                                        .fill(Color.white)
    ////                                                        .frame(width: mesage.wrappedValue.MessageSize.width * 1.2, height: mesage.wrappedValue.MessageSize.height * 1.2)
    //                                                    CoversationTeamsMessgeBubleTextSize(mesage: mesage, size: geo.size, MicrosoftUserUID: $MicrosoftUserUID, RecievedAllMessages: $RecievedAllMessages, SeenLastMessage: $SeenLastMessage, OldestCurrentMessage: $OldestCurrentMessage)
    ////                                                            .frame(width: mesage.wrappedValue.MessageSize.width, height: mesage.wrappedValue.MessageSize.height)
    //                                                            .padding([.top, .bottom])
    //
    //                                                }.frame(width: mesage.wrappedValue.MessageSize.width, height: mesage.wrappedValue.MessageSize.height)
                                                    CoversationTeamsMessgeBubleTextSize(mesage: mesage, size: geo.size, MicrosoftUserUID: $MicrosoftUserUID, RecievedAllMessages: $RecievedAllMessages, SeenLastMessage: $SeenLastMessage, OldestCurrentMessage: $OldestCurrentMessage)
//                                                        .frame(width: mesage.wrappedValue.MessageSize.width, height: mesage.wrappedValue.MessageSize.height)
                                                    if mesage.wrappedValue.MicrosoftSenderID != MicrosoftUserUID{
                                                        Spacer()
                                                    }
                                                }
                                            }
//                                        }
                                        if RecievedAllMessages{
                                            Text("Start of conversation")
                                        }
                                    }
                                }.background(Color.marron)
                            }//mark
                        }
                        HStack{
                            TextField("", text: $Message, axis: .vertical)
                                .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
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
                                .placeholder(when: Message.isEmpty){
                                    Text("Message")
                                        .padding(.leading)
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
                                    .resizable()
                                    .aspectRatio(contentMode: .fit)
                                    .frame(height: geo.size.height * 0.05)
                            }
                        }.padding([.leading, .trailing])
                    }
                }
            }
        }
    }
    func FetchMicrosoftUserInfo() async throws -> String{
        let urlUser = URL(string: "https://graph.microsoft.com/v1.0/me")
        var requestUser = URLRequest(url: urlUser!)
        requestUser.httpMethod = "GET"
        requestUser.setValue("application/json", forHTTPHeaderField: "Content-Type")
        requestUser.setValue("Bearer \(accessToken!)", forHTTPHeaderField: "Authorization")
        let (data, _) = try await URLSession.shared.data(for: requestUser)
        do{
            if let json = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
                print(json)
                guard let UserUid = json["id"] as? String else {
                    return ""
                }
                print("Yay \(UserUid)")
                return UserUid
            }
        } catch {
            throw GraphCallingErrors.CouldNotDecodeAPI
        }
        throw GraphCallingErrors.CouldNotDecodeAPI
    }
    
    func GetCurrentConversationTeams() async throws {
        let formatter = ISO8601DateFormatter()
        formatter.timeZone = TimeZone(identifier: "UTC")
        let nowDate = Date.now
        guard let futureTime = Calendar.current.date(byAdding: .day, value: 1, to: nowDate) else {
            return
        }
        let NowTime = formatter.string(from: futureTime)
        let urlUser = URL(string: "https://graph.microsoft.com/v1.0/me/chats/\(SelectedMessageTeams!.GraphChatID)/messages?$filter=lastModifiedDateTime%20gt%20\(CurrentTime)%20and%20lastModifiedDateTime%20lt%20\(NowTime)")
        var requestUser = URLRequest(url: urlUser!)
        // Set the Authorization header for the request. We use Bearer tokens, so we specify Bearer + the token we got from the result
        requestUser.httpMethod = "GET"
        requestUser.setValue("application/json", forHTTPHeaderField: "Content-Type")
        requestUser.setValue("Bearer \(accessToken!)", forHTTPHeaderField: "Authorization")
        
        let dataTask = URLSession.shared.dataTask(with: requestUser) { (data, response, error) in
            if let error = error {
                print("Request error: ", error)
                return
            }

            guard let response = response as? HTTPURLResponse else { return }

            if response.statusCode == 200 {
                guard let data = data else { return }
                do{
                    if let json = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
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
                            guard let UserUid = MessageUser?["id"] as? String else {
                                return
                            }
                            guard let SentDateTime = Message["createdDateTime"] as? String else {
                                return
                            }
                            guard let MicrosoftId = Message["id"] as? String else {
                                return
                            }
                            let formatter1 = ISO8601DateFormatter()
                            formatter1.formatOptions = [.withInternetDateTime]
                            formatter1.formatOptions.insert(.withFractionalSeconds)
                            let SentDate = formatter1.date(from: SentDateTime)
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
                                if TeamsMesages.contains(where: { $0.MicrosoftID == MicrosoftId }) == false{
                                    TeamsMesages.append(TeamsMessageType(DateSent: SentDate!, Content: MessageContent, Sender: MessageDisplayName, MicrosoftID: MicrosoftId, MicrosoftSenderID: UserUid, MessageSize: CGSize(width: 0.0, height: 0.0), Attachments: AttachmentData))
                                }
                                if let lastest = TeamsMesages.max(by: { $0.DateSent < $1.DateSent }) {
                                    // use earliest reminder
                                    OldestCurrentMessage = lastest.DateSent
                                }
                            } else {
                                if TeamsMesages.contains(where: { $0.MicrosoftID == MicrosoftId }) == false{
                                    TeamsMesages.append(TeamsMessageType(DateSent: SentDate!, Content: MessageContent, Sender: MessageDisplayName, MicrosoftID: MicrosoftId, MicrosoftSenderID: UserUid, MessageSize: CGSize(width: 0.0, height: 0.0), Attachments: nil))
                                }
                                if let lastest = TeamsMesages.max(by: { $0.DateSent < $1.DateSent }) {
                                    // use earliest reminder
                                    OldestCurrentMessage = lastest.DateSent
                                }
                            }
                        }
                    }
                } catch {
                    print("Could Not Decode")
                }
            }
        }

        dataTask.resume()
    }
    
    func GetConversationTeams() async throws {
        let urlUser = URL(string: MessageURLString)
        var requestUser = URLRequest(url: urlUser!)
        // Set the Authorization header for the request. We use Bearer tokens, so we specify Bearer + the token we got from the result
        requestUser.httpMethod = "GET"
        requestUser.setValue("application/json", forHTTPHeaderField: "Content-Type")
        requestUser.setValue("Bearer \(accessToken!)", forHTTPHeaderField: "Authorization")
        let (data, _) = try await URLSession.shared.data(for: requestUser)
        do{
            if let json = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
                let NextLink = json["@odata.nextLink"] as? String
                if NextLink == nil{
                    RecievedAllMessages = true
                } else {
                    MessageURLString = NextLink!
                }
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
                    guard let UserUid = MessageUser?["id"] as? String else {
                        return
                    }
                    guard let SentDateTime = Message["createdDateTime"] as? String else {
                        return
                    }
                    let formatter1 = ISO8601DateFormatter()
                    formatter1.formatOptions = [.withInternetDateTime]
                    formatter1.formatOptions.insert(.withFractionalSeconds)
                    let SentDate = formatter1.date(from: SentDateTime)
                    guard let MicrosoftId = Message["id"] as? String else {
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
                        if TeamsMesages.contains(where: { $0.MicrosoftID == MicrosoftId }) == false{
                            TeamsMesages.append(TeamsMessageType(DateSent: SentDate!, Content: MessageContent, Sender: MessageDisplayName, MicrosoftID: MicrosoftId, MicrosoftSenderID: UserUid, MessageSize: CGSize(width: 0.0, height: 0.0), Attachments: AttachmentData))
                        }
                        if let lastest = TeamsMesages.max(by: { $0.DateSent < $1.DateSent }) {
                            // use earliest reminder
                            OldestCurrentMessage = lastest.DateSent
                        }
                    } else {
                        if TeamsMesages.contains(where: { $0.MicrosoftID == MicrosoftId }) == false{
                            TeamsMesages.append(TeamsMessageType(DateSent: SentDate!, Content: MessageContent, Sender: MessageDisplayName, MicrosoftID: MicrosoftId, MicrosoftSenderID: UserUid, MessageSize: CGSize(width: 0.0, height: 0.0), Attachments: nil))
                        }
                        if let lastest = TeamsMesages.max(by: { $0.DateSent < $1.DateSent }) {
                            // use earliest reminder
                            OldestCurrentMessage = lastest.DateSent
                        }
                    }
                }
                PageLoading = false
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
                Message = ""
                try await GetCurrentConversationTeams()
            }
        } catch {
            throw GraphCallingErrors.CouldNotDecodeAPI
        }
    }
}
