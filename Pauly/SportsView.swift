//
//  SportsView.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-03-16.
//

import Foundation
import SwiftUI

struct ScoresView: View{
    @Binding var SelectedSport: String
    var body: some View{
        Text("Scores")
    }
}

struct Crusaders: View{
    @Binding var SelectedSport: String
    var body: some View{
        Text("Crusaders")
    }
}

struct InSportView: View{
    let Modes: [String] = ["Crusaders", "Scores"]
    @State var SelectedMode: String = "Crusaders"
    var body: some View{
        Picker("", selection: $SelectedMode){
            ForEach(Modes, id: \.self){
                Text($0)
            }
        }.pickerStyle(.segmented)
    }
}

struct HighlightView: View{
    var body: some View{
        Text("Highlights")
    }
}

struct SportsView: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    let Sports: [String] = ["Highlights", "Badminton", "Basketball", "Beach Volleyball", "Cross Country", "Curling", "Football", "Golf", "Hockey", "Rugby", "Soccer", "Track & Field", "Ultimate Frisbee", "Volleyball", "Wrestling"]
    @State var SelectedSport: String = "Highlights"
    var body: some View{
        ZStack{
            Rectangle()
                .fill(Color.marron)
            VStack{
                HStack{
                    Button{
                        WindowMode.SelectedWindowMode = .HomePage
                    } label: {
                        HStack{
                            Image(systemName: "chevron.backward")
                            Text("Back")
                        }
                    }.padding(.leading)
                    Spacer()
                }
                Text("Sports")
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack {
                        ForEach(Sports, id: \.self) { sport in
                            Text("\(sport)")
                                .foregroundColor(sport == SelectedSport ? .red : .black)
                                .gesture(TapGesture().onEnded({ SelectedSport = sport }))
                        }
                    }
                }
                if SelectedSport == "Highlights"{
                    HighlightView()
                } else {
                    InSportView()
                }
            }
        }.edgesIgnoringSafeArea(.all)
    }
}
