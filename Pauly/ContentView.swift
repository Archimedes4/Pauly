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
    case ChatHomePage
    case LectureHomePage
    case HomePage
    case QuizHomePage
    case Calendar
    case NewUser
}

struct ChatHomePage: View{
    @Binding var WindowMode: WindowSrceens
    var body: some View{
        Text("Chat Home Page")
        Button("Back"){
            WindowMode = .HomePage
        }
    }
}


struct MonthView: View{
    let date: Date
    let dateFormatter: DateFormatter
    let columns = [
        GridItem(.flexible(), spacing: 0),
        GridItem(.flexible(), spacing: 0),
        GridItem(.flexible(), spacing: 0),
        GridItem(.flexible(), spacing: 0),
        GridItem(.flexible(), spacing: 0)
    ]
    
    init() {
        date = Date()
        dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "MMMM yyyy"
    }
    
    var body: some View{
        GeometryReader{ geometry1 in
            LazyVGrid(columns: columns, spacing: 0){
                let Count = Functions().getDaysInMonth(Input: Date.now)
                let StartDate = Functions().FindFirstDayinMonth()
                ForEach(0..<5){ day in
                    if day == 0{
                        Text("Monday")
                            .frame(width: geometry1.size.width * 0.2, height: geometry1.size.height * 0.13)
                    }
                    if day == 1{
                        Text("Tuesday")
                            .frame(width: geometry1.size.width * 0.2, height: geometry1.size.height * 0.13)
                    }
                    if day == 2{
                        Text("Wensday")
                            .frame(width: geometry1.size.width * 0.2, height: geometry1.size.height * 0.13)
                    }
                    if day == 3{
                        Text("Thursday")
                            .frame(width: geometry1.size.width * 0.2, height: geometry1.size.height * 0.13)
                    }
                    if day == 4{
                        Text("Friday")
                            .frame(width: geometry1.size.width * 0.2, height: geometry1.size.height * 0.13)
                    }
                }
                let daySelected: Int = (((Count + StartDate) - 2) - ((Count/7) * 2))
                ForEach(0..<30){ value in
                    ZStack{
                        if value >= (StartDate - 1) && value <= daySelected {
                            let textval: Int = Functions().getDay(value: value, startdate: StartDate)
                            let date = Date()
                            let calendar = Calendar.current
                            let day = calendar.component(.day, from: date)
                            if day == (textval){
                                Rectangle()
                                    .foregroundColor(.red)
                                    .frame(width: geometry1.size.width * 0.2, height: geometry1.size.height * 0.145)
                                    .border(Color.black)
                            } else{
                                if day >= (textval + 1){
                                    Rectangle()
                                        .foregroundColor(.gray)
                                        .frame(width: geometry1.size.width * 0.2, height: geometry1.size.height * 0.145)
                                        .border(Color.black)
                                } else{
                                    Rectangle()
                                        .foregroundColor(.white)
                                        .frame(width: geometry1.size.width * 0.2, height: geometry1.size.height * 0.145)
                                        .border(Color.black)
                                }
                            }
                            VStack{
                                Spacer()
                                HStack{
                                    Spacer()
                                    Text("\(textval)")
                                        .foregroundColor(Color.black)
                                    Spacer()
                                }
                                Spacer()
                            }
                        } else {
                            Rectangle()
                                .foregroundColor(.white)
                                .frame(width: geometry1.size.width * 0.2, height: geometry1.size.height * 0.145)
                                .border(Color.black)
                        }
                    }.frame(width: geometry1.size.width * 0.2, height: geometry1.size.height * 0.145)
                }
            }.padding(0)
        }
    }
}

struct InfiniteScroller<Content: View>: View {
    var contentWidth: CGFloat
    var content: (() -> Content)
    
    @State
    var xOffset: CGFloat = 0

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 0) {
                    content()
                    content()
                }
                .offset(x: xOffset, y: 0)
        }
        .disabled(true)
        .onAppear {
            withAnimation(.linear(duration: 10).repeatForever(autoreverses: false)) {
                xOffset = -contentWidth
            }
        }
    }
}

struct GeometryGetter: View {
    @Binding var rect: CGFloat

    var body: some View {
        GeometryReader { (g) -> Path in
            DispatchQueue.main.async { // avoids warning: 'Modifying state during view update.' Doesn't look very reliable, but works.
                self.rect = g.size.width * 2
            }
            return Path() // could be some other dummy view
        }
    }
}

struct ColorView: View {
    var size: CGFloat
    var text: String
    @Binding var Width: CGFloat
    
    var body: some View {
        VStack{
            VStack{
                GeometryReader{ value in
                    Text(text)
                        .font(.system(size: 80))
                        .fixedSize(horizontal: true, vertical: true)
                        .edgesIgnoringSafeArea(.all)
                        .background(GeometryGetter(rect: $Width))
                        .foregroundColor(.white)
                }
            }.frame(width: Width/2 ,height: size/4, alignment: .leading)
            .edgesIgnoringSafeArea(.all)
        }
    }
}

struct HomePage: View{
    @Binding var WindowMode: WindowSrceens
    @State private var animationAmount = 1.0
    @State var width: CGFloat = 0.0
    @State var ScrollText: String = "Today's Special Is Fish and Chips"
    @State var ShowingTextView: Bool = true
    var body: some View{
        GeometryReader{ geometry in
            VStack(alignment: .leading, spacing: 0){
                Button{
                    print(width)
                } label: {
                    if ShowingTextView{
                        Text(ScrollText)
                            .background(GeometryGetter(rect: $width))
                            .onAppear(){
                                ShowingTextView = false
                            }
                    }
                    let size = geometry.size.width
                    InfiniteScroller(contentWidth: 2206.6666666666665) {
                        HStack(spacing: 0) {
                            ColorView(size: size, text: "Today's Special Is Fish and Chips ", Width: $width)
                            ColorView(size: size, text: "Today's Special Is Fish and Chips ", Width: $width)
                        }
                    }.onAppear(){
                        print(width)
                    }
                }.frame(width: geometry.size.width * 1.0, height: geometry.size.height * 0.1)
                Button(){
                    WindowMode = .Calendar
                } label: {
                    VStack(spacing: 0){
                        Image("CalendarText")
                            .resizable()
                            .frame(width: geometry.size.width * 1.0, height: geometry.size.height * 0.1)
                            .background(Color.marron)
                            .border(.black)
                            .aspectRatio(contentMode: .fit)
                        MonthView()
                            .frame(width: geometry.size.width * 1.0, height: geometry.size.height * 0.3)
                            .background(Color.marron)
                            .border(.black)
                    }
                }
                .frame(width: geometry.size.width * 0.999, height: geometry.size.height * 0.4)
                .edgesIgnoringSafeArea(.all)
                .buttonStyle(.plain)
                .background(Color.white)
                HStack(spacing: 0){
                    Button(){
                        WindowMode = .QuizHomePage
                    } label: {
                        ZStack{
                            Rectangle()
                                .foregroundColor(Color.marron)
                                .scaledToFill()
                            Image("QuizIcon")
                                .resizable()
                                .padding()
                                .scaledToFit()
                        }
                    }
                    .buttonStyle(.plain)
                    .border(.black)
                    .frame(width: geometry.size.width * 0.5, height: geometry.size.height * 0.25)
                    Button(){
                        WindowMode = .LectureHomePage
                    } label: {
                        ZStack{
                            Rectangle()
                                .foregroundColor(Color.marron)
                                .scaledToFill()
                            Image("VideoButton")
                                .resizable()
                                .padding()
                                .scaledToFit()
                        }
                    }
                    .buttonStyle(.plain)
                    .border(.black)
                    .frame(width: geometry.size.width * 0.5, height: geometry.size.height * 0.25)
                }.frame(width: geometry.size.width * 1.0, height: geometry.size.height * 0.25)
                Button(){
                    WindowMode = .ChatHomePage
                } label: {
                    ZStack{
                        Rectangle()
                            .foregroundColor(Color.marron)
                        Image("MessagingIcon")
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .background(Color.marron)
                    }
                }
                .padding(.leading, -geometry.size.width * 0.025)
                .border(.black)
                .foregroundColor(.black)
                .edgesIgnoringSafeArea(.all)
                .frame(width: geometry.size.width * 0.999, height: geometry.size.height * 0.25)
                .scaledToFill()
            }.background(Color.marron)
        }
    }
}

struct ContentView: View {
    @State private var WindowMode: WindowSrceens = .PasswordWindow
    
    var body: some View {
        if WindowMode == .PasswordWindow{
            PasswordView(WindowMode: $WindowMode)
        }
        if WindowMode == .NewUser{
            CreateNewUserView(WindowMode: $WindowMode)
        }
        if WindowMode == .HomePage{
            HomePage(WindowMode: $WindowMode)
        }
        if WindowMode == .QuizHomePage{
            QuizView(WindowMode: $WindowMode)
        }
        if WindowMode == .Calendar{
            CalendarHomePage(WindowMode: $WindowMode)
        }
        if WindowMode == .LectureHomePage{
            LetureHomePage(WindowMode: $WindowMode)
        }
        if WindowMode == .ChatHomePage{
            ChatHomePage(WindowMode: $WindowMode)
        }
    }
}

struct CreateNewUserView: View{
    @Binding var WindowMode: WindowSrceens
    @State var Username: String = ""
    @State var Password: String = ""
    @State var ConfirmPassword: String = ""
    @State var Grade: String = ""
    @State var ShowingErrorMessage: Bool = false
    @State var ErrorMessage: String = ""
    @State var ShowingPopUpError: Bool = false
    
    var body: some View{
        GeometryReader{ value in
            ZStack{
                Rectangle()
                    .foregroundColor(Color.marron)
                VStack(spacing:0){
                    Text("Create New User")
                    ZStack{
                        Rectangle()
                            .foregroundColor(.white)
                            .frame(width: value.size.width * 0.7, height: value.size.height * 0.15, alignment: .center)
                            .cornerRadius(15)
                        TextField("Username", text: $Username)
                            .background(Color.white)
                            .frame(width: value.size.width * 0.7, height: value.size.height * 0.15, alignment: .center)
                    }.padding()
                    ZStack{
                        Rectangle()
                            .foregroundColor(.white)
                            .frame(width: value.size.width * 0.7, height: value.size.height * 0.15, alignment: .center)
                            .cornerRadius(15)
                        SecureField("Password", text: $Password)
                            .background(Color.white)
                            .frame(width: value.size.width * 0.7, height: value.size.height * 0.15, alignment: .center)
                            .cornerRadius(15)
                    }.padding()
                    ZStack{
                        Rectangle()
                            .foregroundColor(.white)
                            .frame(width: value.size.width * 0.7, height: value.size.height * 0.15, alignment: .center)
                            .cornerRadius(15)
                        SecureField("Confirm Password", text: $ConfirmPassword)
                            .background(Color.white)
                            .frame(width: value.size.width * 0.7, height: value.size.height * 0.15, alignment: .center)
                            .cornerRadius(15)
                    }.padding()
                    ZStack{
                        Rectangle()
                            .foregroundColor(.white)
                            .frame(width: value.size.width * 0.7, height: value.size.height * 0.15, alignment: .center)
                            .cornerRadius(15)
                        TextField("Grade", text: $Grade)
                            .background(Color.white)
                            .frame(width: value.size.width * 0.7, height: value.size.height * 0.15, alignment: .center)
                            .cornerRadius(15)
                            .onSubmit {
                                if Grade != "9" && Grade != "10" && Grade != "11" && Grade != "12"{
                                    ShowingPopUpError = true
                                } else {
                                    ShowingPopUpError = false
                                }
                            }
                    }.padding()
                    if ShowingPopUpError{
                        Text("Please Enter A Valid Grade (9, 10, 11, 12)")
                            .foregroundColor(.red)
                            .font(.caption)
                    }
                    HStack(spacing: 0){
                        Button(){
                            if Password == ConfirmPassword && ShowingPopUpError == false{
                                Task{
                                    let response = try await Functions().loadData(extensionvar: "CUsername/\(Username)/\(Password)")
                                    print(response.result)
                                    if response.result == "Success"{
                                        WindowMode = .HomePage
                                    } else {
                                        if response.result == "Invalid Parameter"{
                                            ShowingErrorMessage = true
                                            ErrorMessage = "Invalid Parameters"
                                        } else {
                                            print(response)
                                        }
                                    }
                                }
                            } else {
                                ErrorMessage = "Passwords do not match"
                                ShowingErrorMessage = true
                            }
                        } label: {
                            ZStack{
                                Rectangle()
                                    .foregroundColor(.white)
                                    .frame(width: value.size.width * 0.4, height: value.size.height * 0.15, alignment: .center)
                                    .cornerRadius(15)
                                Text("Confirm")
                            }.frame(width: value.size.width * 0.4, height: value.size.height * 0.15, alignment: .center)
                        }.buttonStyle(.plain)
                        .frame(width: value.size.width * 0.4, height: value.size.height * 0.15, alignment: .center)
                        .cornerRadius(15)
                        
                        Button{
                            WindowMode = .PasswordWindow
                        } label: {
                            ZStack{
                                Rectangle()
                                    .foregroundColor(.white)
                                    .frame(width: value.size.width * 0.4, height: value.size.height * 0.15, alignment: .center)
                                    .cornerRadius(15)
                                Text("Back")
                            }
                        }.frame(width: value.size.width * 0.4, height: value.size.height * 0.15, alignment: .center)
                    }.frame(width: value.size.width * 0.7, height: value.size.height * 0.15, alignment: .center)
                    .cornerRadius(15)
                }
            }.edgesIgnoringSafeArea(.all)
        }
    }
}

struct PasswordView: View{
    @Binding var WindowMode: WindowSrceens
    
    @State var Username: String = ""
    @State var Password: String = ""
    @State var ShowingErrorMessage: Bool = false
    @State var ErrorMessage: String = ""
    
    var body: some View {
        ZStack{
            Rectangle()
                .foregroundColor(Color.marron)
            VStack {
                Text("Login")
                Button("ByPass"){
                    WindowMode = .HomePage
                }
                TextField("Username", text: $Username)
                    .background(Color.white)
                    .frame(minWidth: 50.0, idealWidth: 90.0, maxWidth: 120.0, minHeight: 50.0, idealHeight: 90.0, maxHeight: 120.0, alignment: .center)
        
                SecureField("Password", text: $Password)
                    .background(Color.white)
                    .frame(minWidth: 50.0, idealWidth: 90.0, maxWidth: 120.0, minHeight: 50.0, idealHeight: 90.0, maxHeight: 120.0, alignment: .center)
                    .onSubmit {
                        Task{
                            let response = try await Functions().loadData(extensionvar: "Authenticate/\(Username)/\(Password)")
                            print(response.result)
                            if response.result == "Success"{
                                WindowMode = .HomePage
                                print("Here")
                            } else {
                                if response.result == "Invalid Parameter"{
                                    ShowingErrorMessage = true
                                    ErrorMessage = "Invalid Parameters"
                                } else {
                                    print(response)
                                }
                            }
                        }
                    }
                Button(){
                    WindowMode = .NewUser
                } label: {
                    Text("Create New User")
                }
            }
            if ShowingErrorMessage {
                ZStack{
                    Rectangle()
                        .foregroundColor(.white)
                        .frame(width: 100, height: 100)
                    VStack{
                        Text(ErrorMessage)
                        Button("Close Window"){
                            ShowingErrorMessage = false
                        }
                    }
                }
            }
        }.edgesIgnoringSafeArea(.all)
    }
}
extension Color {
    static let marron = Color("Marron")
}
//
//struct CircleImage_Previews: PreviewProvider {
//    @State var mode: WindowSrceens = .HomePage
//    static var previews: some View {
//        HomePage(WindowMode: .HomePage)
//    }
//}
