//
//  ContentView.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-02-23.
//

import SwiftUI

enum WindowSrceens{
    case PasswordWindow
    case TurorForm
    case TurtorChat
    case HomePage
    case Quiz
    case Calendar
}

struct Course{
    let Course: String
    let Grade: [Int]
    let Teacher: String
}

struct QuizView: View{
    @Binding var WindowMode: WindowSrceens
    var body: some View{
        VStack{
            Text("Quizes")
            Button("Back"){
                WindowMode = .HomePage
            }
        }.background(Color.marron)
    }
}

struct HomePage: View{
    @Binding var WindowMode: WindowSrceens
    var body: some View{
        Text("Home Page")
        Button("Quizes"){
            WindowMode = .Quiz
        }
        Button("Log Out"){
            WindowMode = .PasswordWindow
        }
    }
}

struct ContentView: View {
    @State private var WindowMode: WindowSrceens = .PasswordWindow
    var body: some View {
        if WindowMode == .PasswordWindow{
            PasswordView(WindowMode: $WindowMode)
        }
        if WindowMode == .HomePage{
            HomePage(WindowMode: $WindowMode)
        }
        if WindowMode == .Quiz{
            QuizView(WindowMode: $WindowMode)
        }
    }
}

struct PasswordView: View{
    @Binding var WindowMode: WindowSrceens
    
    @State var Username: String = ""
    @State var Password: String = ""
    var body: some View {
        ZStack{
            Rectangle()
                .foregroundColor(Color.marron)
            VStack {
                Text("Login")
                TextField("Username", text: $Username)
                    .background(Color.white)
                    .frame(minWidth: 50.0, idealWidth: 90.0, maxWidth: 120.0, minHeight: 50.0, idealHeight: 90.0, maxHeight: 120.0, alignment: .center)
        
                SecureField("Password", text: $Password)
                    .background(Color.white)
                    .frame(minWidth: 50.0, idealWidth: 90.0, maxWidth: 120.0, minHeight: 50.0, idealHeight: 90.0, maxHeight: 120.0, alignment: .center)
                    .onSubmit {
                        print("Test")
                        WindowMode = .HomePage
                    }
            }
        }.edgesIgnoringSafeArea(.all)
    }
}
extension Color {
    static let marron = Color("Marron")
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
