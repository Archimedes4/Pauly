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
    let ColorName: String?
    let SchoolDay: String?
    let Value: Int?
}

struct MonthView: View{
    @Binding var ScrollMessage: String
    @Binding var AnimationSpeed: Double
    
    @State var SquareSize: CGSize = CGSize(width: 0.0, height: 0.0)
    
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
    
    init(ScrollMessageIn: Binding<String>, AnimationSpeedIn: Binding<Double>) {
        self._ScrollMessage = ScrollMessageIn
        self._AnimationSpeed = AnimationSpeedIn
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
                            let textval: Int = Functions().getDay(value: value, startdate: StartDate) ?? 0
                            if textval != 0{
                                let date = Date()
                                let calendar = Calendar.current
                                let day = calendar.component(.day, from: date)
                                if day == (textval){
                                    Rectangle()
                                        .foregroundColor(.red)
                                        .frame(width: geometry1.size.width * 0.2, height: geometry1.size.height * 0.145)
                                        .border(Color.black)
                                        .saveSize(in: $SquareSize)
                                } else{
                                    if day >= (textval + 1){
                                        Rectangle()
                                            .foregroundColor(.gray)
                                            .frame(width: geometry1.size.width * 0.2, height: geometry1.size.height * 0.145)
                                            .border(Color.black)
                                            .saveSize(in: $SquareSize)
                                    } else{
                                        if let index = SelectedDates.firstIndex(where: { $0.Date == textval }){
                                            let var1: DateProperty = SelectedDates[index]
                                            if var1.ColorName != nil{
                                                Rectangle()
                                                    .foregroundColor(Color(hexString: var1.ColorName!))
                                                    .frame(width: geometry1.size.width * 0.2, height: geometry1.size.height * 0.145)
                                                    .border(Color.black)
                                                    .saveSize(in: $SquareSize)
                                            } else {
                                                Rectangle()
                                                    .foregroundColor(.white)
                                                    .frame(width: geometry1.size.width * 0.2, height: geometry1.size.height * 0.145)
                                                    .border(Color.black)
                                                    .saveSize(in: $SquareSize)
                                            }
                                        } else{
                                            Rectangle()
                                                .foregroundColor(.white)
                                                .frame(width: geometry1.size.width * 0.2, height: geometry1.size.height * 0.145)
                                                .border(Color.black)
                                                .saveSize(in: $SquareSize)
                                        }
                                    }
                                }
                                VStack(spacing: 0){
                                    if let index = SelectedDates.firstIndex(where: { $0.Date == textval }){
                                        let var1: DateProperty = SelectedDates[index]
                                        if var1.SchoolDay != nil{
                                            HStack(){
                                                Spacer()
                                                Text(var1.SchoolDay ?? "Error")
                                                    .foregroundColor(.black)
                                                    .frame(height: geometry1.size.height * 0.03)
                                                    .offset(x: -geometry1.size.width * 0.005, y: SquareSize.height * 0.4) //, y: (geometry1.size.height * 0.03)
                                            }
                                            HStack{
                                                Spacer()
                                                Text("\(textval)")
                                                    .foregroundColor(Color.black)
                                                Spacer()
                                            }
                                            Spacer()
                                        } else {
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
                                        Spacer()
                                        HStack{
                                            Spacer()
                                            Text("\(textval)")
                                                .foregroundColor(Color.black)
                                            Spacer()
                                        }
                                        Spacer()
                                    }
                                }.frame(width: SquareSize.width, height: SquareSize.height)
                            } else {
                                Rectangle()
                                    .foregroundColor(.white)
                                    .frame(width: geometry1.size.width * 0.2, height: geometry1.size.height * 0.145)
                                    .border(Color.black)
                                    .saveSize(in: $SquareSize)
                            }
                        } else {
                            Rectangle()
                                .foregroundColor(.white)
                                .frame(width: geometry1.size.width * 0.2, height: geometry1.size.height * 0.145)
                                .border(Color.black)
                                .saveSize(in: $SquareSize)
                        }
                    }.frame(width: geometry1.size.width * 0.2, height: geometry1.size.height * 0.145)
                }
            }.padding(0)
            .onAppear(){
                let output = UserDefaults.standard.data(forKey: "SelectedDatePauly")
                if output != nil{
                    do{
                        SelectedDates = try JSONDecoder().decode([DateProperty].self, from: output!)
                    } catch {
                        print("Could Decoder User Defaults")
                        UserDefaults.standard.set([], forKey: "SelectedDatePauly")
                    }
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

                           snapshot.documents.forEach({ (documentSnapshot) in
                                let documentData = documentSnapshot.data()
                                let day = documentData["Day"] as? Int
                                if day != nil{
                                    let value = documentData["value"] as? Int
                                    let SchoolDay = documentData["SchoolDay"] as? String
                                    if value != nil{
                                        if value == 1{
                                            NewSelectedDate.append(DateProperty(Date: day!, ColorName: "#ce0909", SchoolDay: SchoolDay, Value: 1))
                                          
                                        } else {
                                           if value == 2{
                                               NewSelectedDate.append(DateProperty(Date: day!, ColorName: "#762e05", SchoolDay: SchoolDay, Value: 2))
                                             
                                           } else {
                                               if value == 3{
                                                   NewSelectedDate.append(DateProperty(Date: day!, ColorName: "#9309ce", SchoolDay: SchoolDay, Value: 3))
                                                  
                                               } else {
                                                   if value == 4{
                                                       NewSelectedDate.append(DateProperty(Date: day!, ColorName: "#05760e", SchoolDay: SchoolDay, Value: 4))
                                                       
                                                   } else {
                                                       if value == 5{
                                                           NewSelectedDate.append(DateProperty(Date: day!, ColorName: "#f6c72c", SchoolDay: SchoolDay, Value: 5))
                                                           
                                                       } else {
                                                           if value == 6{
                                                               NewSelectedDate.append(DateProperty(Date: day!, ColorName: "#2c47f6", SchoolDay: SchoolDay, Value: 6))
                                                              
                                                           } else {
                                                               if value == 7{
                                                                   NewSelectedDate.append(DateProperty(Date: day!, ColorName: "#f62cce", SchoolDay: SchoolDay, Value: 7))
                                                                 
                                                               }
                                                           }
                                                       }
                                                   }
                                               }
                                           }
                                        }
                                    } else {
                                        let SchoolDay = documentData["SchoolDay"] as? String
                                        NewSelectedDate.append(DateProperty(Date: day!, ColorName: nil, SchoolDay: SchoolDay, Value: nil))
                                    }
                                   
                                }
                           })
                            SelectedDates = NewSelectedDate
                            do{
                                let saving = try JSONEncoder().encode(NewSelectedDate)
                                UserDefaults.standard.set(saving, forKey: "SelectedDatePauly")
                            } catch {
                                print("OH NO AN ERROR Look at month view userdefaults")
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

#if DEBUG
struct MonthViewHomePreview: PreviewProvider {
    static var previews: some View {
        MonthView(ScrollMessageIn: .constant("Testing"), AnimationSpeedIn: .constant(10))
    }
}
#endif

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
    @Binding var AnimationDuration: Double
    
    @State var xOffset: CGFloat = 0
    
    var content: (() -> Content)

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
            withAnimation(.linear(duration: AnimationDuration).repeatForever(autoreverses: false)) {
                self.xOffset = -contentWidth
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
    @State var Height: CGFloat
    
    var body: some View {
        VStack{
            Text(text)
                .font(.custom("Chalkboard SE", size: Height * 0.08, relativeTo: .title))
                .fixedSize(horizontal: true, vertical: true)
                .foregroundColor(.white)
        }.frame(width: Width ,height: size/4, alignment: .leading)
//        GeometryReader{ value in
//        }
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
    
    @State private var AnimationDuration = 10.0
    @State var width: CGSize = CGSize(width: 0.0, height: 0.0)
    @State var ScrollText: String = ""
    
    var body: some View{
        GeometryReader{ geometry in
            VStack(alignment: .leading, spacing: 0){
                if width.width == 0.0 {
                    if ScrollText != ""{
                        ScrollView(.horizontal){
                            Text(ScrollText)
                                .font(.custom("Chalkboard SE", size: geometry.size.height * 0.08, relativeTo: .title))
                                .fixedSize(horizontal: true, vertical: true)
                                .foregroundColor(.white)
                                .saveSize(in: $width)
                        }.frame(width: geometry.size.width * 1.0, height: geometry.size.height * 0.99)
                        .padding(.bottom, 0.01)
                    } else {
                        ProgressView()
                            .frame(width: geometry.size.width * 1.0, height: geometry.size.height * 0.1)
                    }
                } else {
                    Button{
                        print(width)
                    } label: {
                        let size = geometry.size.width
                        InfiniteScroller(contentWidth: width.width * 2, AnimationDuration: $AnimationDuration) {
                            HStack(spacing: 0) {
                                SildingTileView(size: size, text: ScrollText, Width: $width.width, Height: geometry.size.height)
                                SildingTileView(size: size, text: ScrollText, Width: $width.width, Height: geometry.size.height)
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
                        MonthView(ScrollMessageIn: $ScrollText, AnimationSpeedIn: $AnimationDuration)
                            .frame(width: geometry.size.width * 1.0, height: geometry.size.height * 0.3)
                            .background(Color.marron)
                            .border(.black)
                    }
                }
                .frame(width: geometry.size.width * 0.999, height: geometry.size.height * 0.4)
                .edgesIgnoringSafeArea(.all)
                .buttonStyle(.plain)
                .background(Color.white)
                .onChange(of: ScrollText){ NewText in
                    width.width = 0.0
                }
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
                    .border(width: 1.0, edges: [.top], color: .black)
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
                    .border(width: 1.0, edges: [.top, .leading], color: .black)
                    .frame(width: geometry.size.width * 0.5, height: geometry.size.height * 0.25)
                }.frame(width: geometry.size.width * 1.0, height: geometry.size.height * 0.25)
                HStack(alignment: .top, spacing: 0){
                    Button(){
                        WindowMode.SelectedWindowMode = .ChatHomePage
                    } label: {
                        ZStack{
                            Rectangle()
                                .foregroundColor(Color.marron)
                                .frame(width: geometry.size.width * 0.5, height: geometry.size.height * 0.25)
                            Image("MessagingIcon")
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                    
                            
                        }
                    }
                    .buttonStyle(.plain)
                    .border(width: 1.0, edges: [.top], color: .black)
                    .frame(width: geometry.size.width * 0.5, height: geometry.size.height * 0.25, alignment: .top)
                    Rectangle()
                        .foregroundColor(.black)
                        .frame(width: 1.0, height: geometry.size.height * 0.3)
                    Button(){
                        WindowMode.SelectedWindowMode = .Profile
                    } label: {
                        ZStack{
                            Rectangle()
                                .foregroundColor(Color.marron)
                                .frame(width: geometry.size.width * 0.5, height: geometry.size.height * 0.25)
                            Image(systemName: "person.crop.circle")
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .foregroundColor(.black)
                                .padding()
                    
                        }
                    }
                    .buttonStyle(.plain)
                    .border(width: 1.0, edges: [.top], color: .black)
                    .frame(width: geometry.size.width * 0.5, height: geometry.size.height * 0.25, alignment: .top)
                }
                .edgesIgnoringSafeArea(.all)
            }.background(Color.marron)
            .onAppear(){
                let db = Firestore.firestore()
                
                let docRef = db.collection("PaulyInfo").document("Info")
                
                docRef.getDocument(){ (document, error) in
                    guard error == nil else {
                        print("error", error ?? "")
                        return
                    }
                    
                    if let document = document, document.exists {
                        let data = document.data()
                        if let data = data {
                            ScrollText  = data["Message"] as? String ?? ""
                            AnimationDuration = (data["AnimationSpeed"] as? Double)!
                        }
                    }
                }
            }
        }
    }
}

extension View {
    func border(width: CGFloat, edges: [Edge], color: Color) -> some View {
        overlay(EdgeBorder(width: width, edges: edges).foregroundColor(color))
    }
}
struct EdgeBorder: Shape {
    var width: CGFloat
    var edges: [Edge]

    func path(in rect: CGRect) -> Path {
        var path = Path()
        for edge in edges {
            var x: CGFloat {
                switch edge {
                case .top, .bottom, .leading: return rect.minX
                case .trailing: return rect.maxX - width
                }
            }

            var y: CGFloat {
                switch edge {
                case .top, .leading, .trailing: return rect.minY
                case .bottom: return rect.maxY - width
                }
            }

            var w: CGFloat {
                switch edge {
                case .top, .bottom: return rect.width
                case .leading, .trailing: return width
                }
            }

            var h: CGFloat {
                switch edge {
                case .top, .bottom: return width
                case .leading, .trailing: return rect.height
                }
            }
            path.addRect(CGRect(x: x, y: y, width: w, height: h))
        }
        return path
    }
}

class SelectedWindowMode: ObservableObject{
    @Published var SelectedWindowMode: WindowSrceens = .PasswordWindow
    @Published var GradeIn: Int = 8
    @Published var UsernameIn: String = ""
    @Published var FirstName: String = ""
    @Published var LastName: String = ""
    @Published var SelectedCourses: [CourseSelectedType] = []
    @Published var TimesRecieved: Bool = false
}

struct ContentView: View {
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @State var accountToken: String?
    @State var MSALAccount: MSALAccount?
    
    var body: some View{
        switch WindowMode.SelectedWindowMode{
        case .Calendar:
            CalendarHomePage()
                .environmentObject(WindowMode)
        case .HomePage:
            HomePage()
                .environmentObject(WindowMode)
                .onAppear(){
                    let db = Firestore.firestore()
                    
                    let docRef = db.collection("Users").document(WindowMode.UsernameIn)
                    
                    let inputData: [String: Any] = [
                        "NotificationToken":UserDefaults.standard.string(forKey: "DeviceToken") ?? "Oh No"
                    ]
                    
                    docRef.updateData(inputData) { error in
                        if let error = error {
                            print("Error writing document: \(error)")
                        }
                    }
                }
        case .ChatHomePage:
            ChatOverView(accessToken: $accountToken, MSALAccount: $MSALAccount)
                .environmentObject(WindowMode)
        case .NewUser:
            CreateNewUserView(GradeIn: $WindowMode.GradeIn)
                .environment(\.colorScheme, .light)
                .environmentObject(WindowMode)
        case .PasswordWindow:
            PasswordView(accessToken: $accountToken, GradeIn: $WindowMode.GradeIn)
                .environment(\.colorScheme, .light)
                .environmentObject(WindowMode)
        case .QuizHomePage:
            QuizView(accessToken: $accountToken, MSALAccount: $MSALAccount)
                .environmentObject(WindowMode)
        case .Profile:
            ProfileViewMain(AccessToken: $accountToken)
                .environmentObject(WindowMode)
        case .Sports:
            SportsView(accessToken: $accountToken)
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
