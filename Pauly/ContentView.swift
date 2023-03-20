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
                self.rect = g.size.width
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
            GeometryReader{ value in
                Text(text)
                    .font(.custom("Chalkboard SE", size: 65))
                    .fixedSize(horizontal: true, vertical: true)
                    .foregroundColor(.white)
            }
        }.frame(width: Width ,height: size/4, alignment: .leading)
    }
}

struct SizeCalculator: ViewModifier {
    
    @Binding var size: CGSize
    
    func body(content: Content) -> some View {
        content
            .background(
                GeometryReader { proxy in
                    Color.clear // we just want the reader to get triggered, so let's use an empty color
                        .onAppear {
                            size = proxy.size
                        }
                }
            )
    }
}

extension View {
    func saveSize(in size: Binding<CGSize>) -> some View {
        modifier(SizeCalculator(size: size))
    }
}

struct HomePage: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    
    @State private var animationAmount = 1.0
    @State var width: CGSize = CGSize(width: 0.0, height: 0.0)
    @State var ScrollText: String = "In Loving Memory of Yash Varma "
    var body: some View{
        GeometryReader{ geometry in
            VStack(alignment: .leading, spacing: 0){
                if width.width == 0.0 {
                    ScrollView(.horizontal){
                        Text(ScrollText)
                            .font(.custom("Chalkboard SE", size: 65))
                            .fixedSize(horizontal: true, vertical: true)
                            .foregroundColor(.white)
                            .saveSize(in: $width)
                    }.frame(width: geometry.size.width * 1.0, height: geometry.size.height * 0.1)
                } else {
                    Button{
                        print(width)
                    } label: {
                        let size = geometry.size.width
                        InfiniteScroller(contentWidth: width.width * 2) {
                            HStack(spacing: 0) {
                                SildingTileView(size: size, text: ScrollText, Width: $width.width)
                                SildingTileView(size: size, text: ScrollText, Width: $width.width)
                            }
                        }
                    }.frame(width: geometry.size.width * 1.0, height: geometry.size.height * 0.1)
                }
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
                .onAppear(){
                    let db = Firestore.firestore()
                    
                    let docRef = db.collection("Users").document(WindowMode.UsernameIn)
                    
                    let inputData: [String: Any] = [
                        "NotificationToken":UserDefaults.standard.string(forKey: "DeviceToken") ?? "Oh No"
                    ]
                    
                    docRef.setData(inputData, merge: true) { error in
                        if let error = error {
                            print("Error writing document: \(error)")
                        } else {
                            WindowMode.SelectedWindowMode = .HomePage
                            print("Document successfully written!")
                        }
                    }
                }
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
