//
//  ContentView.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-02-23.
//

import SwiftUI
import MSAL
import FirebaseCore
import FirebaseAuth
import FirebaseFirestore

public enum WindowSrceens{
    case PasswordWindow
    case ChatHomePage
    case HomePage
    case QuizHomePage
    case Calendar
    case NewUser
    case Profile
    case Sports
}

struct DateProperty: Codable{
    let Date: Int
    let ColorName: String
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
    @State var SelectedDates: [DateProperty] = []
    
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
                                    if let index = SelectedDates.firstIndex(where: { $0.Date == textval }){
                                        let var1: DateProperty = SelectedDates[index]
                                        Rectangle()
                                            .foregroundColor(Color(hexString: var1.ColorName))
                                            .frame(width: geometry1.size.width * 0.2, height: geometry1.size.height * 0.145)
                                            .border(Color.black)
                                    } else{
                                        Rectangle()
                                            .foregroundColor(.white)
                                            .frame(width: geometry1.size.width * 0.2, height: geometry1.size.height * 0.145)
                                            .border(Color.black)
                                    }
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
            .onAppear(){
                let output = UserDefaults.standard.data(forKey: "SelectedDatePauly")
                if output != nil{
                    SelectedDates = try! JSONDecoder().decode([DateProperty].self, from: output!)
                } else {
                    UserDefaults.standard.set([], forKey: "SelectedDatePauly")
                }
                
                Task{
                    do{
                        let db = FirebaseFirestore.Firestore.firestore()
                        
                        var NewSelectedDate: [DateProperty] = []
                        
                        let monthInt = Calendar.current.component(.month, from: Date())
                        let docRef = db.collection("Calendar").document("2023").collection("\(monthInt)")
                        docRef.getDocuments { (snapshot, error) in
                            guard let snapshot = snapshot, error == nil else {
                             //handle error
                             return
                           }
                           print("Number of documents: \(snapshot.documents.count ?? -1)")
                           snapshot.documents.forEach({ (documentSnapshot) in
                                let documentData = documentSnapshot.data()
                                let day = documentData["Day"] as? Int ?? 0
                                let value = documentData["value"] as? Int
                                if value == 1{
                                   NewSelectedDate.append(DateProperty(Date: day, ColorName: "#ce0909"))
                                } else {
                                   if value == 2{
                                       NewSelectedDate.append(DateProperty(Date: day, ColorName: "#762e05"))
                                   } else {
                                       if value == 3{
                                           NewSelectedDate.append(DateProperty(Date: day, ColorName: "#9309ce"))
                                       } else {
                                           if value == 4{
                                               NewSelectedDate.append(DateProperty(Date: day, ColorName: "#05760e"))
                                           } else {
                                               if value == 5{
                                                   NewSelectedDate.append(DateProperty(Date: day, ColorName: "#f6c72c"))
                                               } else {
                                                   if value == 6{
                                                       NewSelectedDate.append(DateProperty(Date: day, ColorName: "#2c47f6"))
                                                   } else {
                                                       if value == 7{
                                                           NewSelectedDate.append(DateProperty(Date: day, ColorName: "#f62cce"))
                                                       }
                                                   }
                                               }
                                           }
                                       }
                                   }
                                }
                               SelectedDates = NewSelectedDate
                               do{
                                   let saving = try JSONEncoder().encode(NewSelectedDate)
                                   UserDefaults.standard.set(saving, forKey: "SelectedDatePauly")
                               } catch {
                                   print("OH NO AN ERROR Look at month view userdefaults")
                               }
                           })
                        }
                    } catch {
                        print("Error")
                    }
                }
            }
        }
    }
}

//https://stackoverflow.com/questions/36341358/how-to-convert-uicolor-to-string-and-string-to-uicolor-using-swift#answer-62192394 Start
extension Color {
    init?(hexString: String) {

        let rgbaData = getrgbaData(hexString: hexString)

        if(rgbaData != nil){

            self.init(
                        .sRGB,
                        red:     Double(rgbaData!.r),
                        green:   Double(rgbaData!.g),
                        blue:    Double(rgbaData!.b),
                        opacity: Double(rgbaData!.a)
                    )
            return
        }
        return nil
    }
}
private func getrgbaData(hexString: String) -> (r: CGFloat, g: CGFloat, b: CGFloat, a: CGFloat)? {

    var rgbaData : (r: CGFloat, g: CGFloat, b: CGFloat, a: CGFloat)? = nil

    if hexString.hasPrefix("#") {

        let start = hexString.index(hexString.startIndex, offsetBy: 1)
        let hexColor = String(hexString[start...]) // Swift 4

        let scanner = Scanner(string: hexColor)
        var hexNumber: UInt64 = 0

        if scanner.scanHexInt64(&hexNumber) {

            rgbaData = { // start of a closure expression that returns a Vehicle
                switch hexColor.count {
                case 8:

                    return ( r: CGFloat((hexNumber & 0xff000000) >> 24) / 255,
                             g: CGFloat((hexNumber & 0x00ff0000) >> 16) / 255,
                             b: CGFloat((hexNumber & 0x0000ff00) >> 8)  / 255,
                             a: CGFloat( hexNumber & 0x000000ff)        / 255
                           )
                case 6:

                    return ( r: CGFloat((hexNumber & 0xff0000) >> 16) / 255,
                             g: CGFloat((hexNumber & 0x00ff00) >> 8)  / 255,
                             b: CGFloat((hexNumber & 0x0000ff))       / 255,
                             a: 1.0
                           )
                default:
                    return nil
                }
            }()

        }
    }

    return rgbaData
}
//End

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

struct SildingTileView: View {
    var size: CGFloat
    var text: String
    @Binding var Width: CGFloat
    
    var body: some View {
        VStack{
            VStack{
                GeometryReader{ value in
                    Text(text)
                        .font(.custom("Chalkboard SE", size: 65))
                        .fixedSize(horizontal: true, vertical: true)
                        .edgesIgnoringSafeArea(.all)
                        .foregroundColor(.white)
                }
            }.frame(width: Width/4 ,height: size/4, alignment: .leading)
            .edgesIgnoringSafeArea(.all)
        }
    }
}

struct HomePage: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    
    @State private var animationAmount = 1.0
    @State var width: CGFloat = 0.0
    @State var ScrollText: String = "In Loving Memory of Yash Varma "
    @State var ShowingTextView: Bool = true
    var body: some View{
        GeometryReader{ geometry in
            VStack(alignment: .leading, spacing: 0){
                Button{
                    print(width)
                } label: {
                    if ShowingTextView{
                        Text(ScrollText)
                            .font(.custom("Chalkboard SE", size: 65))
                            .fixedSize(horizontal: true, vertical: true)
                            .onAppear(){
                                width = 0.0
                            }
                            .background(GeometryGetter(rect: $width))
                            .onAppear(){
                                ShowingTextView = false
                            }
                    } else {
                        let size = geometry.size.width
                        InfiniteScroller(contentWidth: 2206.6666666666665) {
                            HStack(spacing: 0) {
                                SildingTileView(size: size, text: ScrollText, Width: $width)
                                SildingTileView(size: size, text: ScrollText, Width: $width)
                            }
                        }.onAppear(){
                            print(width)
                        }
                    }
                }.frame(width: geometry.size.width * 1.0, height: geometry.size.height * 0.1)
                Button(){
                    WindowMode.SelectedWindowMode = .Calendar
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
                        WindowMode.SelectedWindowMode = .QuizHomePage
                    } label: {
                        ZStack{
                            Rectangle()
                                .foregroundColor(Color.marron)
                                .frame(width: geometry.size.width * 0.5, height: geometry.size.height * 0.25)
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
                        WindowMode.SelectedWindowMode = .Sports
                    } label: {
                        ZStack{
                            Rectangle()
                                .foregroundColor(Color.marron)
                                .frame(width: geometry.size.width * 0.5, height: geometry.size.height * 0.25)
                            Image("Football")
                                .resizable()
                                .padding()
                                .scaledToFit()
                        }
                    }
                    .buttonStyle(.plain)
                    .border(.black)
                    .frame(width: geometry.size.width * 0.5, height: geometry.size.height * 0.25)
                }.frame(width: geometry.size.width * 1.0, height: geometry.size.height * 0.25)
                HStack(spacing: 0){
                    Button(){
                        WindowMode.SelectedWindowMode = .ChatHomePage
                    } label: {
                        ZStack{
                            Rectangle()
                                .foregroundColor(Color.marron)
                                .frame(width: geometry.size.width * 0.5, height: geometry.size.height * 0.3)
                            Image("MessagingIcon")
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .background(Color.marron)
                                .frame(width: geometry.size.width * 0.5, height: geometry.size.height * 0.3)
                        }
                    }
                    .buttonStyle(.plain)
                    .border(.black)
                    .frame(width: geometry.size.width * 0.5, height: geometry.size.height * 0.3)
                    Button(){
                        WindowMode.SelectedWindowMode = .Profile
                    } label: {
                        ZStack{
                            Rectangle()
                                .foregroundColor(Color.marron)
                                .frame(width: geometry.size.width * 0.5, height: geometry.size.height * 0.3)
                            Image(systemName: "person.crop.circle")
                                .resizable()
                                .padding()
                                .aspectRatio(contentMode: .fit)
                                .frame(width: geometry.size.width * 0.5, height: geometry.size.height * 0.3)
                        }
                    }
                    .buttonStyle(.plain)
                    .border(.black)
                    .frame(width: geometry.size.width * 0.5, height: geometry.size.height * 0.3)
                }.frame(width: geometry.size.width * 0.999, height: geometry.size.height * 0.3)
                .edgesIgnoringSafeArea(.all)
            }.background(Color.marron)
        }
    }
}

class SelectedWindowMode: ObservableObject{
    @Published var SelectedWindowMode: WindowSrceens = .PasswordWindow
    @Published var GradeIn: Int = 8
    @Published var UsernameIn: String = ""
}

struct ContentView: View {
    @StateObject var WindowMode: SelectedWindowMode = SelectedWindowMode()
    @State var accountToken: String?
    @State var MSALAccount: MSALAccount?
    
    var body: some View {
        if WindowMode.SelectedWindowMode == .PasswordWindow{
            PasswordView(UsernameIn: $WindowMode.UsernameIn, GradeIn: $WindowMode.GradeIn)
                .environment(\.colorScheme, .light)
                .environmentObject(WindowMode)
        }
        if WindowMode.SelectedWindowMode == .NewUser{
            CreateNewUserView(UsernameIn: $WindowMode.UsernameIn, GradeIn: $WindowMode.GradeIn)
                .environment(\.colorScheme, .light)
                .environmentObject(WindowMode)
        }
        if WindowMode.SelectedWindowMode == .HomePage{
            HomePage()
                .environmentObject(WindowMode)
        }
        if WindowMode.SelectedWindowMode == .QuizHomePage{
            QuizView(accessToken: $accountToken, MSALAccount: $MSALAccount)
                .environmentObject(WindowMode)
            
        }
        if WindowMode.SelectedWindowMode == .Calendar{
            CalendarHomePage()
                .environmentObject(WindowMode)
        }
        if WindowMode.SelectedWindowMode == .ChatHomePage{
            ChatOverView(accessToken: $accountToken, MSALAccount: $MSALAccount)
                .environmentObject(WindowMode)
        }
        if WindowMode.SelectedWindowMode == .Profile{
            ProfileViewMain()
                .environmentObject(WindowMode)
        }
        if WindowMode.SelectedWindowMode == .Sports{
            SportsView()
                .environmentObject(WindowMode)
        }
    }
}

struct CreateNewUserPageTwoView: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    
    @Environment(\.colorScheme) var colorScheme
    @Binding var SelectedCourseViewPage: CourseViewPage
    @Binding var Username: String
    @Binding var Password: String
    @Binding var GradeIn: Int
    @State var AvaliableCourses: [Course] = []
    @State var ErrorMessage: String = ""
    @State var ShowingErrorMessage: Bool = false
    @State var CoursesSelected: [Course] = []
    var body: some View{
        if AvaliableCourses.count == 0{
            ProgressView()
                .onAppear(){
                    Task{
                        let response = try await Functions().LoadDataJsonEcoder(extensionvar: "Classes/\(GradeIn)")
                        print(response.result)
                        if response.result == "Success"{
                            for x in response.classes{
                                let CourseName: String = x.name
                                let Teachers: [String] = x.teachers
                                AvaliableCourses.append(Course(CourseName: CourseName, Teacher: Teachers))
                            }
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
        } else {
            GeometryReader{ geo in
                VStack{
                    HStack(){
                        Button{
                            SelectedCourseViewPage = .PageOne
                        } label: {
                            HStack{
                                Image(systemName: "chevron.backward")
                                Text("Back")
                            }
                        }.padding(.leading)
                        Spacer()
                        Text("Select Grade \(GradeIn) Class")
                            .foregroundColor(colorScheme == .dark ? Color.black : Color.white)
                        Spacer()
                        Spacer()
                    }
                    List(AvaliableCourses, id: \.CourseName) { course in
                        Button{
                            if let index = AvaliableCourses.firstIndex(where: { $0.CourseName == course.CourseName }){
                                AvaliableCourses.remove(at: index)
                            }
                            CoursesSelected.append(course)
                        } label: {
                            Text(course.CourseName)
                        }.buttonStyle(.plain)
                    }.background(Color.marron)
                }.background(Color.marron)
            }
        }
        
        Button(){
            Auth.auth().createUser(withEmail: Username, password: Password) { authResult, error in
              // ...
                if error != nil{
                    print(error?.localizedDescription)
                } else {
                    WindowMode.SelectedWindowMode = .HomePage
                }
            }
        } label: {
            Text("CONFIRM")
        }
        Button(){
            SelectedCourseViewPage = .PageOne
        } label: {
            Text("BACK")
        }
    }
}

struct CreateNewUserPageOneView: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    
    @Binding var SelectedCourseViewPage: CourseViewPage
    @Binding var UsernameIn: String
    @Binding var GradeIn: Int
    @State var Username: String = ""
    @Binding var Password: String
    @State var ConfirmPassword: String = ""
    @State var SelectedGrade: String = "9"
    @State var ShowingErrorMessage: Bool = false
    @State var ErrorMessage: String = ""
    @State var Grades: [String] = ["9", "10", "11", "12"]
    @State var showingPasswordsDoNotMatch: Bool = false
    @State var showingPleaseEnterAEmail: Bool = false
    @State var showingPleaseEnterAPassword: Bool = false
    
    var body: some View{
        GeometryReader{ value in
            ScrollView(.vertical, showsIndicators: false){
                VStack{
                    Group{
                        Spacer()
                        Spacer()
                        Spacer()
                        Text("Create New User")
                            .font(.custom("Chalkboard SE", size: 45.0))
                            .padding()
                        Button{
                            
                        } label: {
                            ZStack{
                                TextField("", text: $Username)
                                    .multilineTextAlignment(.leading)
                                    .textContentType(.username)
                                    .keyboardType(.default)
                                    .placeholder(when: Username.isEmpty) {
                                            Text("Email").foregroundColor(.black)
                                    }
                                    .autocapitalization(.none)
                                    .background(Color.white)
                                    .frame(width: value.size.width * 0.76, height: value.size.height * 0.075, alignment: .leading)
                                    .cornerRadius(15)
                                    .padding()
                            }.padding()
                        }.background(
                            RoundedRectangle(cornerRadius: 25)
                                .fill(Color.white)
                                .shadow(color: .gray, radius: 2, x: 0, y: 2)
                        )
                    }
                    
                    if showingPleaseEnterAEmail{
                        HStack{
                            Image(systemName: "exclamationmark.circle")
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .foregroundColor(.red)
                            Text("Please Enter A Email!")
                                .foregroundColor(.red)
                        }
                    }
                    
                    Button{
                        
                    } label: {
                        ZStack{
                            TextField("", text: $Password)
                                .multilineTextAlignment(.leading)
                                .textContentType(.newPassword)
                                .keyboardType(.default)
                                .placeholder(when: Username.isEmpty) {
                                        Text("Password").foregroundColor(.black)
                                }
                                .autocapitalization(.none)
                                .background(Color.white)
                                .frame(width: value.size.width * 0.76, height: value.size.height * 0.075, alignment: .leading)
                                .cornerRadius(15)
                                .padding()
                        }.padding()
                    }.background(
                        RoundedRectangle(cornerRadius: 25)
                            .fill(Color.white)
                            .shadow(color: .gray, radius: 2, x: 0, y: 2)
                    )
                    .padding(.top)
                    
                    if showingPleaseEnterAPassword{
                        HStack{
                            Image(systemName: "exclamationmark.circle")
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .foregroundColor(.red)
                            Text("Please Enter A Password!")
                                .foregroundColor(.red)
                        }
                    }
                    
                    Button{
                        
                    } label: {
                        ZStack{
                            SecureField("", text: $ConfirmPassword)
                                .multilineTextAlignment(.leading)
                                .textContentType(.newPassword)
                                .keyboardType(.default)
                                .placeholder(when: Username.isEmpty) {
                                        Text("Confirm Password").foregroundColor(.black)
                                }
                                .autocapitalization(.none)
                                .background(Color.white)
                                .frame(width: value.size.width * 0.76, height: value.size.height * 0.075, alignment: .leading)
                                .cornerRadius(15)
                                .padding()
                        }.padding()
                    }.background(
                        RoundedRectangle(cornerRadius: 25)
                            .fill(Color.white)
                            .shadow(color: .gray, radius: 2, x: 0, y: 2)
                    )
                    .padding(.top)
                    
                    if showingPasswordsDoNotMatch{
                        HStack{
                            Image(systemName: "exclamationmark.circle")
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .foregroundColor(.red)
                            Text("Passwords Do Not Match!")
                                .foregroundColor(.red)
                        }
                    }
                    
                    Button{
                        
                    } label: {
                        ZStack{
                            Picker("Please choose a Grade", selection: $SelectedGrade) {
                                ForEach(Grades, id: \.self) {
                                    Text($0)
                                }
                            }.frame(width: value.size.width * 0.76, height: value.size.height * 0.055, alignment: .leading)
                            .padding()
                            .foregroundColor(.black)
                            .pickerStyle(.menu)
                        }.padding()
                    }.background(
                        RoundedRectangle(cornerRadius: 25)
                            .fill(Color.white)
                            .shadow(color: .gray, radius: 2, x: 0, y: 2)
                    )
                    .padding(.top)
                    
                    Button(){
                        if Username != "" {
                            showingPleaseEnterAEmail = false
                            if Password != ""{
                                showingPleaseEnterAPassword = false
                                if Password == ConfirmPassword{
                                    GradeIn = Int(SelectedGrade) ?? 8
                                    UsernameIn = Username
                                    SelectedCourseViewPage = .PageTwo
                                } else {
                                    showingPasswordsDoNotMatch = true
                                }
                            } else {
                                showingPleaseEnterAPassword = true
                            }
                        } else {
                            showingPleaseEnterAEmail = true
                        }
                        //TO DO Next
                    } label: {
                        Text("NEXT")
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
                    Button{
                        WindowMode.SelectedWindowMode = .PasswordWindow
                    } label: {
                        Text("BACK")
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
                    }.padding(.top, -15)
                }
            }.background(Color.marron)
            .frame(width: value.size.width * 1.0)
            .edgesIgnoringSafeArea(.all)
        }
    }
}

enum CourseViewPage{
    case PageOne
    case PageTwo
}
struct CreateNewUserView: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    
    @Binding var UsernameIn: String
    @Binding var GradeIn: Int
    
    @State var Password: String = ""
    @State var SelectedCourseViewPage: CourseViewPage = .PageOne
    
    var body: some View{
        if SelectedCourseViewPage == .PageOne{
            CreateNewUserPageOneView(SelectedCourseViewPage: $SelectedCourseViewPage, UsernameIn: $UsernameIn, GradeIn: $GradeIn, Password: $Password)
                .environmentObject(WindowMode)
        } else {
            CreateNewUserPageTwoView(SelectedCourseViewPage: $SelectedCourseViewPage, Username: $UsernameIn, Password: $Password, GradeIn: $GradeIn)
                .environmentObject(WindowMode)
        }
    }
}

struct PasswordView: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    
    @Binding var UsernameIn: String
    @Binding var GradeIn: Int
    @State var Username: String = ""
    @State var Password: String = ""
    @State var ShowingErrorMessage: Bool = false
    @State var ErrorMessage: String = ""
    @State var AnimationValueUsername: Int = 0
    @State var notLoadingPassword: Bool = true
    @State var ShowingFailureToFindUserError: Bool = false
    @State var ShowingIncorrectPasswordError: Bool = false
    
    enum FocusedField {
            case username, password
        }
    
    @FocusState private var focusedField: FocusedField?
    
    var body: some View {
        GeometryReader{ value in
            ZStack{
                Rectangle()
                    .foregroundColor(Color.marron)
                ScrollView{
                    VStack{
                        VStack{
                            Spacer()
                            Spacer()
                            Spacer()
                            HStack{
                                Spacer()
                                Image("PaulyText")
                                    .resizable()
                                    .aspectRatio(contentMode: .fit)
                                    .scaledToFit()
                                    .padding()
                                    .frame(alignment: .leading)
                                    .shadow(color: .gray, radius: 2, x: 0, y: 2)
                                Spacer()
                            }
                        }.frame(width: value.size.width * 1.0, height: value.size.height * 0.3, alignment: .leading)
                        Button(){
                            focusedField = .username
                        } label: {
                            ZStack{
                                TextField("", text: $Username)
                                    .multilineTextAlignment(.leading)
                                    .textContentType(.username)
                                    .keyboardType(.default)
                                    .placeholder(when: Username.isEmpty) {
                                        Text("Email").foregroundColor(.black)
                                    }
                                    .autocapitalization(.none)
                                    .background(Color.white)
                                    .frame(width: value.size.width * 0.6, height: value.size.height * 0.15, alignment: .leading)
                                    .cornerRadius(15)
                                    .padding()
                                    .focused($focusedField, equals: .username)
                            }.padding()
                        }
                        .frame(width: value.size.width * 0.92, height: value.size.height * 0.15, alignment: .leading)
                        .background(
                            RoundedRectangle(cornerRadius: 25)
                                .fill(Color.white)
                                .shadow(color: .gray, radius: 2, x: 0, y: 2)
                        )
                        .padding(.bottom)
                        
                        if ShowingFailureToFindUserError{
                            HStack{
                                Image(systemName: "exclamationmark.circle")
                                    .resizable()
                                    .aspectRatio(contentMode: .fit)
                                    .foregroundColor(.red)
                                Text("Pauly couldn't find an account with the Username.")
                                    .foregroundColor(.red)
                            }.frame(height: value.size.height * 0.035)
                        }
                        
                        Button(){
                            focusedField = .password
                        } label: {
                            ZStack{
                                SecureField("", text: $Password)
                                    .multilineTextAlignment(.leading)
                                    .textContentType(.password)
                                    .placeholder(when: Password.isEmpty) {
                                        Text("Password").foregroundColor(.black)
                                    }
                                    .autocapitalization(.none)
                                    .background(Color.white)
                                    .frame(width: value.size.width * 0.6, height: value.size.height * 0.15, alignment: .leading)
                                    .cornerRadius(15)
                                    .padding()
                                    .onSubmit {
                                        if notLoadingPassword{
                                            if Username != "" && Password != ""{
                                                notLoadingPassword = false
                                                print(Username)
                                                Auth.auth().signIn(withEmail: Username, password: Password) { authResult, error in
                                                    guard self != nil else { return }
                                                    if authResult?.user != nil{
                                                        GradeIn = 11
                                                        UsernameIn = "Andrew"
                                                        WindowMode.SelectedWindowMode = .HomePage
                                                    } else {
                                                        if error != nil{
                                                            if error!.localizedDescription == "The password is invalid or the user does not have a password."{
                                                                notLoadingPassword = true
                                                                ShowingIncorrectPasswordError = true
                                                                ShowingFailureToFindUserError = false
                                                            } else {
                                                                if error!.localizedDescription == "The email address is badly formatted."{
                                                                    notLoadingPassword = true
                                                                    ShowingErrorMessage = true
                                                                    ErrorMessage = "Invalid Parameters"
                                                                } else {
                                                                    if error!.localizedDescription == "There is no user record corresponding to this identifier. The user may have been deleted."{
                                                                        notLoadingPassword = true
                                                                        ShowingFailureToFindUserError = true
                                                                        ShowingIncorrectPasswordError = false
                                                                    } else {
                                                                        notLoadingPassword = true
                                                                        ShowingErrorMessage = true
                                                                        ErrorMessage = "Invalid Parameters"
                                                                        print(error?.localizedDescription)
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    .focused($focusedField, equals: .password)
                            }.padding()
                        }
                        .frame(width: value.size.width * 0.92, height: value.size.height * 0.15, alignment: .leading)
                        .background(
                            RoundedRectangle(cornerRadius: 25)
                                .fill(Color.white)
                                .shadow(color: .gray, radius: 2, x: 0, y: 2)
                        )
                        .padding(.bottom)
                        .padding(.top)
                        
                        if ShowingIncorrectPasswordError{
                            HStack{
                                Image(systemName: "exclamationmark.circle")
                                    .resizable()
                                    .aspectRatio(contentMode: .fit)
                                    .foregroundColor(.red)
                                Text("Incorrect Password")
                                    .foregroundColor(.red)
                            }.frame(height: value.size.height * 0.035)
                        }
                        
                        Button(){
                            if notLoadingPassword{
                                if Username != "" && Password != ""{
                                    notLoadingPassword = false
                                    print(Username)
                                    Auth.auth().signIn(withEmail: Username, password: Password) { authResult, error in
                                        guard self != nil else { return }
                                        if authResult?.user != nil{
                                            GradeIn = 11
                                            UsernameIn = "Andrew"
                                            WindowMode.SelectedWindowMode = .HomePage
                                        } else {
                                            if error != nil{
                                                if error!.localizedDescription == "The password is invalid or the user does not have a password."{
                                                    notLoadingPassword = true
                                                    ShowingIncorrectPasswordError = true
                                                    ShowingFailureToFindUserError = false
                                                } else {
                                                    if error!.localizedDescription == "The email address is badly formatted."{
                                                        notLoadingPassword = true
                                                        ShowingErrorMessage = true
                                                        ErrorMessage = "Invalid Parameters"
                                                    } else {
                                                        if error!.localizedDescription == "There is no user record corresponding to this identifier. The user may have been deleted."{
                                                            notLoadingPassword = true
                                                            ShowingFailureToFindUserError = true
                                                            ShowingIncorrectPasswordError = false
                                                        } else {
                                                            notLoadingPassword = true
                                                            ShowingErrorMessage = true
                                                            ErrorMessage = "Invalid Parameters"
                                                            print(error?.localizedDescription)
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        } label: {
                            if notLoadingPassword{
                                Text("SIGN IN")
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
                            } else {
                                ProgressView()
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
                        Button(){
                            WindowMode.SelectedWindowMode = .NewUser
                        } label: {
                            Text("CREATE NEW USER")
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
                    }.frame(maxHeight: .infinity)
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
}

extension Color {
    static let marron = Color("Marron")
}

//https://stackoverflow.com/questions/57688242/swiftui-how-to-change-the-placeholder-color-of-the-textfield

extension View {
    func placeholder<Content: View>(
        when shouldShow: Bool,
        alignment: Alignment = .leading,
        @ViewBuilder placeholder: () -> Content) -> some View {

        ZStack(alignment: alignment) {
            placeholder().opacity(shouldShow ? 1 : 0)
            self
        }
    }
}
