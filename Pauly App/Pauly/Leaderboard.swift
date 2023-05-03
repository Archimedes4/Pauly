//
//  Leaderboard.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-03-23.
//

import Foundation
import SwiftUI
import FirebaseCore
import FirebaseAuth
import FirebaseFirestore

struct UserLeaderboard{
    let uid: String
    let Name: String
    let Score: Int
}

struct BackgroundLeaderboardView: View{
    @Binding var HightestValue: Int
    @Binding var SecondHightestValue: Int
    @Binding var ThirdHightestValue: Int
    
    @State var User: UserLeaderboard
    
    @State var SelectedColor: Color = .white
    
    @Environment(\.colorScheme) var colorScheme
    var body: some View{
        RoundedRectangle(cornerRadius: 20)
            .foregroundColor(SelectedColor)
            .padding()
            .onAppear(){
                SelectedColor = colorScheme == .light ? Color.white:Color.black
                if User.Score == HightestValue{
                    SelectedColor = .yellow
                } else {
                    if User.Score == SecondHightestValue{
                        SelectedColor = .gray
                    } else {
                        if User.Score == ThirdHightestValue{
                            SelectedColor = .brown
                        }
                    }
                }
            }
            
    }
}

struct ProfileViewLeaderboard: View{
    @Binding var selectedProfileView: profileViewEnum
    
    @State var Users: [UserLeaderboard] = []
    @State private var searchText = ""
    
    @Environment(\.colorScheme) var colorScheme
    
    @State var HightestValue: Int = 0
    @State var SecondHightestValue: Int = 0
    @State var ThirdHightestValue: Int = 0
    
    var body: some View{
        ZStack{
            Rectangle()
                .fill(Color.marron)
                .edgesIgnoringSafeArea(.all)
            ScrollView{
                VStack{
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
                    Image("Leaderboard")
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                    
                    Button{
                        
                    } label: {
                        HStack {
                            Image(systemName: "magnifyingglass")
                                .padding([.top, .bottom, .leading])
                            TextField("Search", text: $searchText).foregroundColor(Color.black).font(Font.system(size: 16)).background(Color.white).frame(alignment: .leading)
                                .padding([.top, .bottom])
                        }
                        .background(Color.white)
                        .cornerRadius(10)
                        .overlay(RoundedRectangle(cornerRadius: 10).stroke(lineWidth: 2).foregroundColor(Color.black))
                        .padding()
                    }.buttonStyle(.plain)
                    ForEach(searchResults.sorted(by: { $0.Score >= $1.Score} ), id: \.uid){ User in
                            Button{

                            } label: {
                                ZStack{
                                    BackgroundLeaderboardView(HightestValue: $HightestValue, SecondHightestValue: $SecondHightestValue, ThirdHightestValue: $ThirdHightestValue, User: User)
                                    HStack{
                                        Text(User.Name)
                                            .foregroundColor(colorScheme == .light ? Color.black:Color.white)
                                            .padding()
                                        Spacer()
                                        Text("\(User.Score)")
                                            .foregroundColor(colorScheme == .light ? Color.black:Color.white)
                                            .padding()
                                    }.padding()
                                }
                            }
                        }
                }
            }
            .onAppear(){
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
                        let score = documentData["Score"] as? Int ?? 0
                        let name = FirstNameOut + " " + LastNameOut
                        Users.append(UserLeaderboard(uid: uid, Name: name, Score: score))
                    })
                    var Array1: [Int] = []
                    for x in Users{
                        Array1.append(x.Score)
                    }
                    let Array2: [Int] = Array(Set(Array1))
                    let Array3: [Int] = Array2.sorted { $0 > $1}
                    if Array3.count >= 1{
                        HightestValue = Array3[0]
                        if Array3.count >= 2{
                            SecondHightestValue = Array3[1]
                            if Array3.count >= 3{
                                ThirdHightestValue = Array3[2]
                            }
                        }
                    }
                  }
            }
            .searchable(text: $searchText)
        }
    }
    var searchResults: [UserLeaderboard] {
            if searchText.isEmpty {
                return Users
            } else {
                return Users.filter { $0.Name.contains(searchText) }
            }
        }
}

#if DEBUG
struct LeaderboardPreview: PreviewProvider {
    static var previews: some View {
        ProfileViewLeaderboard(selectedProfileView: .constant(.Leaderboard))
    }
}
#endif
