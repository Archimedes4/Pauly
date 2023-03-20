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

enum MessagingEnum{
    case Home
    case CreateMessage
    case Coversation
}

struct GroupType{
    let Users: [String]
    let ChatId: Int
    var NumberOfMessages: Int
}

struct MessagingType {
    let sender, message, time: String
    var ErrorType: String?
    let ErrorID: Int?
}

struct MessagingHomePage: View{
    @Binding var SelectedChatMode: ChatMode
    @Binding var SelectMessagingMode: MessagingEnum
    @Binding var Username: String
    @Binding var SelectedDatum1: GroupType
    @Binding var TwoPersonMode: Bool
    @State var Groups: [GroupType] = []
    @Environment(\.colorScheme) var colorScheme
    var body: some View{
        VStack{
            HStack{
                Button(){
                    SelectedChatMode = .Home
                } label: {
                    HStack{
                        Image(systemName: "chevron.backward")
                            .foregroundColor(Color.red)
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
            Text("Messaging")
                .font(.custom("Chalkboard SE", size: 25))
                .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
            List{
                ForEach(Groups, id: \.ChatId){ value in
                    MessagingGroupButton(SelectMessagingMode: $SelectMessagingMode, SelectedDatum1: $SelectedDatum1, TwoPersonMode: $TwoPersonMode, Username: $Username, Datum1Input: value)
                }
            }.onAppear(){
                Task{
                    print("Here")
                    do{
                        let db = Firestore.firestore()
                        
                        print(Username)
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
                                        print(results)
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
                                                        let GroupID = data["GroupsID"] as? Int ?? 0
                                                        let Users = data["Members"] as! NSArray as? [String] ?? []
                                                        let NumberOfMessages = data["MessagesCount"] as? Int ?? 0
                                                        Groups.append(GroupType(Users: Users, ChatId: GroupID, NumberOfMessages: NumberOfMessages))
                                                    }
                                                }
                                            }
                                        }
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
        }
    }
}

struct MessagingPage: View{
    @Binding var SelectedChatMode: ChatMode
    @State var SelectMessagingMode: MessagingEnum = .Home
    @State var SelectedDatum1: GroupType = GroupType(Users: ["Error"], ChatId: 0, NumberOfMessages: 0)
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

struct MessagingGroupButton: View{
    @Binding var SelectMessagingMode: MessagingEnum
    @Binding var SelectedDatum1: GroupType
    @Binding var TwoPersonMode: Bool
    @Binding var Username: String
    var Datum1Input: GroupType
    @State var InsertString: String = ""
    var body: some View{
        Button{
            SelectMessagingMode = .Coversation
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
                            InsertString.append("\(x) ")
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

struct Conversation: View{
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
                    Text("Back")
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
            let formatter = DateFormatter()
            formatter.dateFormat = "yyyy/MM/dd HH:mm"
            let someDateTime = formatter.date(from: "\(Date.now)")
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
                
                docRef.setData(GroupOut) { error in
                    if let error = error {
                        print("Error writing document: \(error)")
                    } else {
                        print("Document successfully written!")
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
        var MessagesOutput: [MessagingType] = []
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
                    MessagesOutput.append(MessagingType(sender: Sender, message: Contents, time: Time, ErrorType: nil, ErrorID: nil))
                    Messages = MessagesOutput
                })
              }
    }
}

struct AvaliableUser{
    let Name: String
    let uid: String
}

struct CreateNewConversation: View{
    @Binding var SelectMessagingMode: MessagingEnum
    @State var Users: [AvaliableUser] = []
    @State var SelectedUsers: [AvaliableUser] = []
    @State private var searchText = ""
    @Binding var Username: String
    @State var SelectedUsersText: String = ""
    
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
                ForEach(searchResults, id: \.Name){ User in
                    Button{
                        SelectedUsers.append(User)
                        if let index = Users.firstIndex(where: { $0.Name == User.Name }){
                            Users.remove(at: index)
                        }
                        var outputString: String = ""
                        for x in SelectedUsers{
                            outputString.append(x.Name)
                        }
                        SelectedUsersText = outputString
                    } label: {
                        Text(User.Name)
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
                                    Users.append(AvaliableUser(Name: name, uid: uid))
                                })
                              }
                        if let index = Users.firstIndex(where: { $0.uid == Username }){
                            Users.remove(at: index)
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
                                    let inputData5: [String: Any] = [
                                        "GroupID":(TotalCount + 1),
                                        "Members":OutputUsers,
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
                return Users.filter { $0.Name.contains(searchText) }
            }
        }
}
