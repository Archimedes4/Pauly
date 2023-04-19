//
//  CalendarPageView.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-03-03.
//

import Foundation
import SwiftUI
import FirebaseFirestore

enum SelectedCalendarMode: String, CaseIterable{
    case Day = "Day"
    case Week = "Week"
    case Month = "Month"
}

struct NoClassType{
    let Day: Int
    let Month: Int
    let Year: Int
}

struct CalendarCourseType{
    let Name: String
    let Semester: Int
    let DayA: Int
    let DayB: Int
    let DayC: Int
    let DayD: Int
    let NoClass: [NoClassType]
    let Year: Int
    let Assignments: [AssignmentTypeQuiz]
}

struct EventType{
    let id: UUID = UUID()
    let Name: String
    let StartTime: Date
    let EndTime: Date
    let EventColor: Color
}

struct CalendarHomePage: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @Environment(\.colorScheme) var colorScheme
    @State var SelectedMode: SelectedCalendarMode.RawValue = SelectedCalendarMode.Day.rawValue
    @State var CalendarClasses: [CalendarCourseType] = []
    @State var SelectedDates: [DateProperty] = []
    
    var body: some View{
        VStack(spacing: 0){
            HStack{
                Button(){
                    WindowMode.SelectedWindowMode = .HomePage
                } label: {
                    HStack {
                        Image(systemName: "chevron.backward")
                            .padding(.leading)
                        Text("Back")
                    }
                }
                VStack{
                    Picker("Apperance", selection: $SelectedMode){
                        ForEach(SelectedCalendarMode.allCases, id: \.rawValue){ value in
                            Text(value.rawValue)
                              
                        }
                    }.pickerStyle(.segmented)
                    .tint(colorScheme == .dark ? Color.black : Color.white)
                }
            }.background(Color.marron)
            if SelectedMode == "Day" {
                CalendarDayView(CalendarClasses: $CalendarClasses, SelectedDates: $SelectedDates)
                    .environmentObject(WindowMode)
            } else {
                if SelectedMode == "Week" {
                    WeekView(CalendarClasses: $CalendarClasses, SelectedDates: $SelectedDates)
                        .environmentObject(WindowMode)
                } else {
                    if SelectedMode == "Month" {
                        MonthViewMain()
                    }
                }
            }
        }.onAppear(){
            GetSchoolDays()
        }
    }
    func GetSchoolDays(){
        let output = UserDefaults.standard.data(forKey: "SelectedDatePauly")
        if output != nil{
            do{
                SelectedDates = try JSONDecoder().decode([DateProperty].self, from: output!)
            } catch {
                print("Could Decoder User Defaults")
                UserDefaults.standard.set([], forKey: "SelectedDatePauly")
            }
        }
    }
}

struct CalendarDayView: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @Binding var CalendarClasses: [CalendarCourseType]
    @Binding var SelectedDates: [DateProperty]
    @State var SelectedDay: Date = Date.now
    var body: some View{
        VStack(spacing: 0){
            HStack{
                Spacer()
                Button(){
                    SelectedDay = Calendar.current.date(byAdding: .day, value: -1, to: SelectedDay)!
                } label: {
                    Image(systemName: "chevron.left")
                }
                Text(SelectedDay.formatted(date: .long, time: .omitted))
                Button(){
                    SelectedDay = Calendar.current.date(byAdding: .day, value: 1, to: SelectedDay)!
                } label: {
                    Image(systemName: "chevron.forward")
                }
                if SelectedDay.formatted(date: .numeric, time: .omitted) != Date.now.formatted(date: .numeric, time: .omitted){
                    Button(){
                        SelectedDay = Date.now
                    } label: {
                        Text("Today")
                    }
                }
                Spacer()
            }.background(Color.marron, ignoresSafeAreaEdges: .all)
            DayView(CalendarClasses: $CalendarClasses, SelectedDates: $SelectedDates, SelectedDay: $SelectedDay)
                .environmentObject(WindowMode)
        }
    }
}

class AppConfig: ObservableObject {
    @Published var timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()
}

extension String {
    static var currentTime: String {
        let Now = Date.now
        let formatter3 = DateFormatter()
        formatter3.dateFormat = "H:mm"
        let CurrentTime = formatter3.string(from: Now)
        return CurrentTime
    }
}

//Debug
extension String {
  func toDate(withFormat format: String = "yyyy-MM-dd") -> Date {
    let dateFormatter = DateFormatter()
    dateFormatter.dateFormat = format
    guard let date = dateFormatter.date(from: self) else {
      preconditionFailure("Take a look to format")
    }
    return date
  }
}

struct WeekView: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @Binding var CalendarClasses: [CalendarCourseType]
    @Binding var SelectedDates: [DateProperty]
    @State var CurrentEvents: [EventType] = []
    @State var SelectedDay: Date = Date.now
    @State var Days: [Date] = []
    let Modes: [String] = ["Schedule", "Events"]
    @State var SelectedMode: String = "Schedule"
    @State var SelectedDate: Int = 0
    var body: some View{
        GeometryReader{ geo in
            VStack(alignment: .center){
                HStack{
                    Spacer()
                    Button(){
                        SelectedDay = Calendar.current.date(byAdding: .day, value: -7, to: SelectedDay)!
                        Days = GetDates(CurrentDate: SelectedDay)
                    } label: {
                        Image(systemName: "chevron.left")
                    }
                    Text(SelectedDay, format: .dateTime.month().year())
                    Button(){
                        SelectedDay = Calendar.current.date(byAdding: .day, value: 7, to: SelectedDay)!
                        Days = GetDates(CurrentDate: SelectedDay)
                    } label: {
                        Image(systemName: "chevron.forward")
                    }
                    if SelectedDay.formatted(date: .numeric, time: .omitted) != Date.now.formatted(date: .numeric, time: .omitted){
                        Button(){
                            SelectedDay = Date.now
                            Days = GetDates(CurrentDate: SelectedDay)
                        } label: {
                            Text("Today")
                        }
                    }
                    Spacer()
                }
                HStack{
                    ForEach(Days, id: \.self){ WeekDay in
                        let monthInt = Calendar.current.dateComponents([.day], from: Date())
                        let CurrentDay = Calendar.current.dateComponents([.day], from: WeekDay)
                        if CurrentDay == monthInt {
                            Button{
                                SelectedDate = CurrentDay.day ?? 100
                                SelectedDay = WeekDay
                            } label: {
                                ZStack{
                                    Circle()
                                        .strokeBorder(SelectedDate == (CurrentDay.day ?? 100) ? Color.blue:Color.clear, lineWidth: 2.0)
                                        .background(Circle().fill(.red))
                                        .frame(width: geo.size.width * 0.1, height: geo.size.height * 0.1)
                                    Text(WeekDay, format: .dateTime.day())
                                        .foregroundColor(.black)
                                }.onAppear(){
                                    SelectedDate = monthInt.day ?? 0
                                }
                            }
                        } else {
                            Button{
                                SelectedDate = CurrentDay.day ?? 100
                                SelectedDay = WeekDay
                            } label: {
                                ZStack{
                                    Circle()
                                        .strokeBorder(SelectedDate == (CurrentDay.day ?? 100) ? Color.blue:Color.clear, lineWidth: 2.0)
                                        .background(Circle().fill(.gray))
                                        .frame(width: geo.size.width * 0.1, height: geo.size.height * 0.1)
                                    Text(WeekDay, format: .dateTime.day())
                                        .foregroundColor(.black)
                                }
                            }
                        }
                    }
                }.onAppear(){
                    Days = GetDates(CurrentDate: SelectedDay)
                }
                Picker("", selection: $SelectedMode){
                    ForEach(Modes, id: \.self){
                        Text($0)
                    }
                }.pickerStyle(.segmented)
                Spacer()
                if SelectedMode == "Schedule"{
                    DayView(CalendarClasses: $CalendarClasses, SelectedDates: $SelectedDates, SelectedDay: $SelectedDay)
                        .environmentObject(WindowMode)
                } else {
                    if SelectedMode == "Events"{
                        CalendarEventsView(SelectedDay: $SelectedDay)
                            .environmentObject(WindowMode)
                    }
                }
            }.background(Color.marron)
        }
    }
    func GetDates(CurrentDate: Date) -> [Date] {
        let weekday = Calendar.current.component(.weekday, from: CurrentDate)
        var result: [Date] = []
        for x in 0..<weekday{
            result.append(Calendar.current.date(byAdding: .day, value: -x, to: CurrentDate)!)
        }
        for x in (weekday..<7).enumerated(){
            result.append(Calendar.current.date(byAdding: .day, value: (x.offset + 1), to: CurrentDate)!)
        }
        result.sort()
        return result
    }
}

struct MonthDataType{
    let id: UUID = UUID()
    let Showing: Bool
    let DayData: String
}

struct MonthViewMain: View{
    @State var SelectedDate: Date = Date.now
    @State var Year: Int = 2020
    @State var Month: String = "January"
    @State var Day: Int = 1
    @State var StartDate: Int = 0
    @State var daySelected: Int = 0
    @State var count: Int = 0
    @State var MonthData: [MonthDataType] = []
    
    let DaysInWeek: [String] = ["Sat", "Mon", "Tue", "Wen", "Thu", "Fri", "Sun"]
    
    let columns = [
        GridItem(.flexible(), spacing: 0),
        GridItem(.flexible(), spacing: 0),
        GridItem(.flexible(), spacing: 0),
        GridItem(.flexible(), spacing: 0),
        GridItem(.flexible(), spacing: 0),
        GridItem(.flexible(), spacing: 0),
        GridItem(.flexible(), spacing: 0)
    ]
    
    var body: some View{
        ZStack{
            Rectangle()
                .fill(Color.marron)
                .ignoresSafeArea()
            GeometryReader{ geo in
                VStack{
                    HStack{
                        Text(String(Year))
                            .padding(.leading)
                        Spacer()
                    }
                    HStack{
                        Text(Month)
                            .padding(.leading)
                            .font(.title)
                        Spacer()
                        let NowYear = Calendar.current.dateComponents([.year], from: Date.now).year
                        let NowMonth = Calendar.current.dateComponents([.month], from: Date.now).month
                        let CurrentMonth = Calendar.current.dateComponents([.month], from: SelectedDate).month
                        if Year != NowYear || CurrentMonth != NowMonth{
                            Button(){
                                SelectedDate = Date.now
                            } label: {
                                Text("Today")
                                    .foregroundColor(.black)
                            }
                        }
                        Button(){
                            SelectedDate = Calendar.current.date(byAdding: .month, value: -1, to: SelectedDate)!
                        } label: {
                            Image(systemName: "chevron.left")
                                .foregroundColor(.black)
                        }
                        Button(){
                            SelectedDate = Calendar.current.date(byAdding: .month, value: 1, to: SelectedDate)!
                        } label: {
                            Image(systemName: "chevron.forward")
                                .foregroundColor(.black)
                        }.padding(.trailing)
                    }
                    LazyVGrid(columns: columns, spacing: 0){
                        ForEach(DaysInWeek, id: \.self){ DOW in
                            Text(DOW)
                        }

                        ForEach(MonthData, id: \.id){ value in
                            Button(){
                                if value.Showing{
                                    // Specify date components
                                    var dateComponents = DateComponents()
                                    let CurrentYear = Calendar.current.dateComponents([.year], from: SelectedDate).year
                                    let CurrentMonth = Calendar.current.dateComponents([.month], from: SelectedDate).month
                                    dateComponents.year = CurrentYear
                                    dateComponents.month = CurrentMonth
                                    dateComponents.day = Int(value.DayData)
                                    dateComponents.timeZone = TimeZone(abbreviation: "CDT") // Japan Standard Time
                                    dateComponents.hour = 0
                                    dateComponents.minute = 0

                                    // Create date from components
                                    let userCalendar = Calendar(identifier: .gregorian) // since the components above (like year 1980) are for Gregorian
                                    SelectedDate = userCalendar.date(from: dateComponents)!
                                }
                            } label: {
                                CalendarCardView(geo:geo.size, value: value)
                            }
                        }
                    }
                    CalendarEventsView(SelectedDay: $SelectedDate)
                }
                .onAppear(){
                    FetchData()
                }
                .onChange(of: SelectedDate){ value in
                    FetchData()
                }
            }
        }
    }
    func FetchData() {
        Year = Calendar.current.component(.year, from: SelectedDate)
        let dateComponents = Calendar.current.dateComponents([.year, .month], from: SelectedDate)
        let startOfMonth = Calendar.current.date(from: dateComponents)!
        let myCalendar = Calendar(identifier: .gregorian)
        let weekDay = myCalendar.component(.weekday, from: startOfMonth)
        StartDate = weekDay
        Day = Calendar.current.dateComponents([.day], from: SelectedDate).day!
        count = Functions().getDaysInMonth(Input: SelectedDate)
        if StartDate >= 1{
            daySelected = (count + StartDate - 2)
        } else {
            daySelected = (count + StartDate)
        }
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "LLLL"
        Month = dateFormatter.string(from: SelectedDate)
        
        MonthData = []
        for x in 0..<42{
            if x >= (StartDate - 1) && x <= daySelected {
                MonthData.append(MonthDataType(Showing: true, DayData: "\(x - StartDate + 2)"))
            } else {
                MonthData.append(MonthDataType(Showing: false, DayData: ""))
            }
        }
    }
    @ViewBuilder
    func CalendarCardView(geo: CGSize, value: MonthDataType) -> some View {
        ZStack{
            Rectangle()
                .fill(Color.marron)
                .frame(width: geo.width * 0.14285714285714, height: geo.width * 0.14285714285714)
            if value.Showing{
                if Int(value.DayData) == Day{
                    RadialGradient(
                              gradient: Gradient(colors: [.white, .marron]),
                              center: .center,
                              startRadius: 10,
                              endRadius: 25
                          )
                    .opacity(0.75)
                } else {
                    let NowYear = Calendar.current.dateComponents([.year], from: Date.now).year
                    let NowMonth = Calendar.current.dateComponents([.month], from: Date.now).month
                    let CurrentMonth = Calendar.current.dateComponents([.month], from: SelectedDate).month
                    let NowDay = Calendar.current.dateComponents([.day], from: Date.now).day
                    if NowYear == Year && NowMonth == CurrentMonth && NowDay == Int(value.DayData){
                        RadialGradient(
                                  gradient: Gradient(colors: [.gray, .marron]),
                                  center: .center,
                                  startRadius: 10,
                                  endRadius: 25
                              )
                        .opacity(0.75)
                    }
                }
                Text("\(value.DayData)")
                    .foregroundColor(.black)
            }
        }
    }
}

#if DEBUG
struct CircleImage_Previews: PreviewProvider {
    static var previews: some View {
        MonthViewMain()
    }
}
#endif
//
//LazyVGrid(columns: columns, spacing: 0){
//    let Count = Functions().getDaysInMonth(Input: Date.now)
//    let StartDate = Functions().FindFirstDayinMonth()
//    ForEach(0..<5){ day in
//        if day == 0{
//            Text("Monday")
//                .frame(width: geometry1.size.width * 0.2, height: geometry1.size.height * 0.1)
//        }
//        if day == 1{
//            Text("Tuesday")
//                .frame(width: geometry1.size.width * 0.2, height: geometry1.size.height * 0.1)
//        }
//        if day == 2{
//            Text("Wensday")
//                .frame(width: geometry1.size.width * 0.2, height: geometry1.size.height * 0.1)
//        }
//        if day == 3{
//            Text("Thursday")
//                .frame(width: geometry1.size.width * 0.2, height: geometry1.size.height * 0.1)
//        }
//        if day == 4{
//            Text("Friday")
//                .frame(width: geometry1.size.width * 0.2, height: geometry1.size.height * 0.1)
//        }
//    }
//    let daySelected: Int = (((Count + StartDate) - 2) - ((Count/7) * 2))
//    ForEach(0..<30){ value in
//        ZStack{
//            if value >= (StartDate - 1) && value <= daySelected {
//                let textval: Int = Functions().getDay(value: value, startdate: StartDate) ?? 0
//                if textval != 0{
//                    let date = Date()
//                    let calendar = Calendar.current
//                    let day = calendar.component(.day, from: date)
//                    if day == (textval){
//                        Rectangle()
//                            .foregroundColor(.red)
//                            .frame(width: geometry1.size.width * 0.2, height: geometry1.size.height * 0.1)
//                            .border(Color.black)
//                    } else{
//                        if day >= (textval + 1){
//                            Rectangle()
//                                .foregroundColor(.gray)
//                                .frame(width: geometry1.size.width * 0.2, height: geometry1.size.height * 0.1)
//                                .border(Color.black)
//                        } else{
//                            Rectangle()
//                                .foregroundColor(.white)
//                                .frame(width: geometry1.size.width * 0.2, height: geometry1.size.height * 0.1)
//                                .border(Color.black)
//                        }
//                    }
//                    VStack{
//                        Spacer()
//                        HStack{
//                            Spacer()
//                            Text("\(textval)")
//                                .foregroundColor(Color.black)
//                            Spacer()
//                        }
//                        Spacer()
//                    }
//                } else {
//                    Rectangle()
//                        .foregroundColor(.white)
//                        .frame(width: geometry1.size.width * 0.2, height: geometry1.size.height * 0.1)
//                        .border(Color.black)
//                }
//            } else {
//                Rectangle()
//                    .foregroundColor(.white)
//                    .frame(width: geometry1.size.width * 0.2, height: geometry1.size.height * 0.1)
//                    .border(Color.black)
//            }
//        }.frame(width: geometry1.size.width * 0.2, height: geometry1.size.height * 0.1)
//    }
//}.padding(0)
//}
