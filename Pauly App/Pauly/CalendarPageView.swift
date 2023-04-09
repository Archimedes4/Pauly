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
}

struct EventType{
    let id: UUID = UUID()
    let Name: String
    let StartTime: Date
    let EndTime: Date
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
                DayView(CalendarClasses: $CalendarClasses, SelectedDates: $SelectedDates)
            } else {
                if SelectedMode == "Week" {
                    WeekView(CalendarClasses: $CalendarClasses, SelectedDates: $SelectedDates)
                } else {
                    if SelectedMode == "Month" {
                        MonthViewMain()
                    }
                }
            }
        }.onAppear(){
            GetStudentSchedual()
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
    func GetStudentSchedual() {
        if WindowMode.TimesRecieved == false{
            for x in WindowMode.SelectedCourses{
                Task{
                    let db = FirebaseFirestore.Firestore.firestore()
            
                    let docRef = db.collection("Grade\(WindowMode.GradeIn)Courses").document(x.Name).collection("Sections").document("\(x.Section)-\(x.Year)")
                    docRef.getDocument { (document, error) in
                        guard error == nil else {
                            print("error", error ?? "")
                            return
                        }

                        if let document = document, document.exists {
                            let data = document.data()
                            if let data = data {
                                let Semester = data["Semester"] as? Int
                                let DayA = data["DayA"] as? Int
                                let DayB = data["DayB"] as? Int
                                let DayC = data["DayC"] as? Int
                                let DayD = data["DayD"] as? Int
                                let NoClass = data["NoClass"] as! NSArray as? [String]
                                let Year = data["School Year"] as? Int ?? 2020
                                var NoClassesOutArray: [NoClassType] = []
                                if NoClass != nil{
                                    for l in NoClass!{
                                        let Output = l.split(separator: "-")
                                        NoClassesOutArray.append(NoClassType(Day: Int(Output[0])!, Month: Int(Output[1])!, Year: Int(Output[2])!))
                                    }
                                }
                                CalendarClasses.append(CalendarCourseType(Name: x.Name, Semester: Semester!, DayA: DayA!, DayB: DayB!, DayC: DayC!, DayD: DayD!, NoClass: NoClassesOutArray, Year: Year))
                            }
                        }
                    }
                }
            }
            print("Done")
            print(CalendarClasses.description)
            
        }
    }
}

class AppConfig: ObservableObject {
    @Published var timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()
}

struct DayView: View{
    @StateObject var TimerInbound: AppConfig = AppConfig()
    
    @Binding var CalendarClasses: [CalendarCourseType]
    @Binding var SelectedDates: [DateProperty]
    @State var CurrentEvents: [EventType] = []
    
    @State var SelectedDay: Date = Date.now
    @Environment(\.colorScheme) var colorScheme
    @State var HeightOffsetTOP: Double = 0.0
    @State var TextSize: CGSize = CGSize(width: 0, height: 0)
    @State var Height: Double = 0.0
    @State var ScrollPosition: Int = 0
    @State var CurrentMinuiteInt: Int = 0
    @State var CurrentTime: String = "8:30"
    @State var DateIntFetched: Bool = false
    let HoursIN: [String] = ["12PM", "1AM", "2AM", "3AM", "4AM", "5AM", "6AM", "7AM", "8AM", "9AM", "10AM", "11AM", "12AM", "1PM", "2BM", "3PM", "4PM", "5PM", "6PM", "7PM", "8PM", "9PM",
    "10PM", "11PM"]
    var body: some View{
        VStack{
            HStack{
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
            }
            
            GeometryReader{ value in
                ScrollViewReader{ scroll in
                    ScrollView{
                        VStack{
                            ZStack{
                                VStack(spacing: 0){
                                    ForEach(HoursIN, id: \.self){value in
                                        HStack{
                                            let Result = CalculateIFSHOWING(value: value, Time: SelectedDay)
                                            if Result{
                                                Text(value)
                                                    .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
                                                    .saveSize(in: $TextSize)
                                            } else {
                                                Text(value)
                                                    .foregroundColor(Color.clear)
                                                    .saveSize(in: $TextSize)
                                            }
                                            VStack{
                                                Divider()
                                                    .background(.black)
                                            }
                                        }.padding()
                                        .padding(.top)
                                        .frame(maxWidth: .infinity)
                                    }
                                }.background(
                                    GeometryReader { proxy in
                                        Color.clear // we just want the reader to get triggered, so let's use an empty color
                                            .onAppear {
                                                Height = proxy.size.height
                                                
                                            }
                                    }
                                )
                                .onAppear(){
                                    FindDateProperty(Time: SelectedDay)
                                    let MinuiteInt = Calendar.current.dateComponents([.minute], from: Date.now).minute
                                    CurrentMinuiteInt = MinuiteInt!
                                    let HourInt = Calendar.current.dateComponents([.hour], from: Date.now).hour
                                    CurrentTime = "\(HourInt! % 12):\(MinuiteInt!)"
                                }
                                .onChange(of: SelectedDay){ time in
                                    FindDateProperty(Time: SelectedDay)
                                }
                                .onReceive(TimerInbound.timer){ _ in
                                    let MinuiteInt = Calendar.current.dateComponents([.minute], from: Date.now).minute
                                    if CurrentMinuiteInt != MinuiteInt! {
                                        CurrentMinuiteInt = MinuiteInt!
                                        let HourInt = Calendar.current.dateComponents([.hour], from: Date.now).hour
                                        CurrentTime = "\(HourInt! % 12):\(MinuiteInt!)"
                                        HeightOffsetTOP = FindTimeOffset(Time: Date.now)
                                    }
                                }
                                if Height != 0.0{
                                    ForEach(CurrentEvents, id:\.id){ event in
                                        let Offset = computeNewDate(from: event.StartTime, to: event.EndTime)
                                        let StartOffset = FindTimeOffset(Time: event.StartTime)
                                        VStack{
                                            HStack{
                                                ZStack{
                                                    HStack{
                                                        Spacer()
                                                        Rectangle()
                                                            .foregroundColor(.yellow)
                                                            .opacity(0.6)
                                                            .frame(width: value.size.width * 0.8,height: Offset)
                                                            .onAppear(){
                                                                print(value.size)
                                                            }
                                                    }
                                                    Text("\(event.Name)")
                                                }
                                            }.frame(width: value.size.width * 0.9, height: value.size.height * 0.005, alignment: .top)
                                                .offset(y: StartOffset + (TextSize.height / 2))
                                        }
                                        .offset(y: -Height/2)
                                        
                                    }
                                }
                               
                                if SelectedDay.formatted(date: .numeric, time: .omitted) == Date.now.formatted(date: .numeric, time: .omitted){
                                    if Height != 0.0{
                                        VStack{
                                            HStack{
                                                Text(CurrentTime)
                                                    .foregroundColor(.red)
                                                Rectangle()
                                                    .foregroundColor(.red)
                                                    .onAppear(){
                                                        print(value.size)
                                                    }
                                            }.frame(width: value.size.width * 0.9, height: value.size.height * 0.005, alignment: .top)
                                                .offset(y: HeightOffsetTOP)
                                        }.onAppear(){
                                            
                                            HeightOffsetTOP = FindTimeOffset(Time: Date.now)
                                            ScrollPosition = Int(HeightOffsetTOP)
                                            if ScrollPosition >= Int(Height){
                                                ScrollPosition = Int(Height)
                                            }
                                        }
                                        .offset(y: -Height/2)
                                    }
                                }
                                if Height != 0.0{
                                    ForEach(0..<Int(Height), id: \.self) { date in
                                        Text("Error")
                                            .id(date)
                                            .foregroundColor(.clear)
                                            .onAppear(){
                                                if date == ScrollPosition{
                                                    withAnimation {
                                                        scroll.scrollTo(ScrollPosition, anchor: .top)
                                                    }
                                                }
                                            }
                                    }
                                }
                            }
                        }.frame(maxHeight: .infinity)
                    }
                }
            }
        }.background(Color.marron)
    }
    func CalculateIFSHOWING(value: String, Time: Date) -> Bool{
        if SelectedDay.formatted(date: .numeric, time: .omitted) == Date.now.formatted(date: .numeric, time: .omitted){
            let HourInt = Calendar.current.dateComponents([.hour], from: Time).hour
            let MinuiteInt = Calendar.current.dateComponents([.minute], from: Time).minute
            let ValueArray = Array(value)
            var ValueInt = -1
            if ValueArray.count == 4{
                let ValueIntString = "\(ValueArray[0])" + "\(ValueArray[1])"
                ValueInt = Int(ValueIntString)!
            } else {
                ValueInt = Int("\(ValueArray[0])")!
            }
            var ValueIntDown = ValueInt - 1
            if ValueIntDown == 0{
                ValueIntDown = 12
            }
            if HourInt == ValueInt{
                if MinuiteInt! <= 20{
                    if ValueArray.count == 4{
                        print("In four")
                        if ValueArray[2] == "A"{
                            print("THis is in a1t")
                            print("This is hour: \(HourInt)")
                            if HourInt ?? 13 >= 13{
                                return true
                            }
                        } else {
                            if HourInt ?? 12 <= 12{
                                return true
                            }
                        }
                    } else {
                        if ValueArray[1] == "A"{
                            if HourInt ?? 13 >= 13{
                                return true
                            }
                        } else {
                            if HourInt ?? 12 <= 12{
                                return true
                            }
                        }
                    }
                    return false
                }
            } else {
                if HourInt == ValueIntDown{
                    if MinuiteInt! >= 40{
                        if ValueArray.count == 4{
                            if ValueArray[2] == "A"{
                                if HourInt ?? 13 >= 13{
                                    return true
                                }
                            } else {
                                if HourInt ?? 12 <= 12{
                                    return true
                                }
                            }
                        } else {
                            if ValueArray[1] == "A"{
                                if HourInt ?? 13 >= 13{
                                    return true
                                }
                            } else {
                                if HourInt ?? 12 <= 12{
                                    return true
                                }
                            }
                        }
                        return false
                    }
                }
            }
        }
        return true
    }
    func FindTimeOffset(Time: Date) -> Double {
        let HourWidth = Height / 24
        let MinutieWidth = Height / 1440
        let HourInt = Calendar.current.dateComponents([.hour], from: Time).hour
        let MinuiteInt = Calendar.current.dateComponents([.minute], from: Time).minute
        let ReturnOffset = (Double(HourWidth) * Double(HourInt!)) + (Double(MinutieWidth) * Double(MinuiteInt!)) + (HourWidth / 2)
        return ReturnOffset
    }
    func GetDate(Hour: Int, Minute: Int, Time: Date) -> Date {
        // Specify date components
        var dateComponents = DateComponents()
        dateComponents.year =  Calendar.current.dateComponents([.year], from: Time).year
        dateComponents.month = Calendar.current.dateComponents([.month], from: Time).month
        dateComponents.day = Calendar.current.dateComponents([.day], from: Time).day
        dateComponents.timeZone = TimeZone(abbreviation: "CDT") // Japan Standard Time
        dateComponents.hour = Hour
        dateComponents.minute = Minute

        // Create date from components
        let userCalendar = Calendar(identifier: .gregorian) // since the components above (like year 1980) are for Gregorian
        let someDateTime = userCalendar.date(from: dateComponents)
        return someDateTime!
    }
    func FindStartHourMinute(PeriodInt: Int, Schedual: Int?) -> (Int, Int, Int, Int){
        if Schedual != nil{
            if Schedual == 3 || Schedual == 4{
                if PeriodInt == 1{
                    return (8, 30, 9, 25)
                } else {
                    if PeriodInt == 2{
                        return (9, 30, 10, 35)
                    } else {
                        if PeriodInt == 3{
                            return (10, 40, 11, 35)
                        } else {
                            if PeriodInt == 4{
                                return (12, 30, 13, 25)
                            } else {
                                if PeriodInt == 5{
                                    return (13, 30, 14, 25)
                                } else {
                                    if PeriodInt == 0{
                                        return (0, 0, 0, 0)
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                if Schedual == 5 || Schedual == 6{
                    if PeriodInt == 1{
                        return (9, 30, 10, 25)
                    } else {
                        if PeriodInt == 2{
                            return (10, 30, 11, 30)
                        } else {
                            if PeriodInt == 3{
                                return (12, 20, 13, 15)
                            } else {
                                if PeriodInt == 4{
                                    return (13, 20, 14, 15)
                                } else {
                                    if PeriodInt == 5{
                                        return (14, 20, 15, 15)
                                    } else {
                                        if PeriodInt == 0{
                                            return (0, 0, 0, 0)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } else {
            if PeriodInt == 1{
                return (8, 30, 9, 35)
            } else {
                if PeriodInt == 2{
                    return (9, 40, 10, 55)
                } else {
                    if PeriodInt == 3{
                        return (11, 0, 12, 05)
                    } else {
                        if PeriodInt == 4{
                            return (13, 0, 14, 5)
                        } else {
                            if PeriodInt == 5{
                                return (14, 10, 15, 15)
                            } else {
                                if PeriodInt == 0{
                                    return (0, 0, 0, 0)
                                }
                            }
                        }
                    }
                }
            }
        }
        return (0, 0, 0, 0)
    }
    func FindPeriod(Class: CalendarCourseType, Day: String) -> Int{
        var PeriodInt = 0
        if Day == "A"{
            PeriodInt = Class.DayA
        } else {
            if Day == "B"{
                PeriodInt = Class.DayB
            } else {
                if Day == "C"{
                    PeriodInt = Class.DayC
                } else {
                    if Day == "D"{
                        PeriodInt = Class.DayD
                    }
                }
            }
        }
        return PeriodInt
    }
    func FindDateProperty(Time: Date){
        let YearInt = Calendar.current.dateComponents([.year], from: Time).year
        let monthInt = Calendar.current.dateComponents([.month], from: Time).month
        do{
            let db = FirebaseFirestore.Firestore.firestore()
            
            var NewSelectedDate: [DateProperty] = []
            
            let docRef = db.collection("Calendar").document("\(YearInt)").collection("\(monthInt!)")
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
                CurrentEvents = []
                let DayInt = Calendar.current.dateComponents([.day], from: Time).day
                if let CurrentDayProperty = NewSelectedDate.first(where: { $0.Date == DayInt }){
                    if CurrentDayProperty.SchoolDay != nil{
                        for o in CalendarClasses{
                            if o.Year == YearInt{
                                if monthInt! >= 2 && monthInt! <= 8{
                                    if o.Semester == 2{
                                        let PeriodInt = FindPeriod(Class: o, Day: CurrentDayProperty.SchoolDay!)
                                        let OutputIntTimes = FindStartHourMinute(PeriodInt: PeriodInt, Schedual: CurrentDayProperty.Value)
                                        let StartDate = GetDate(Hour: OutputIntTimes.0, Minute: OutputIntTimes.1, Time: Time)
                                        let EndDate = GetDate(Hour: OutputIntTimes.2, Minute: OutputIntTimes.3, Time: Time)

                                        CurrentEvents.append(EventType(Name: o.Name, StartTime: StartDate, EndTime: EndDate))
                                    }
                                } else {
                                    if o.Semester == 1{
                                        let PeriodInt = FindPeriod(Class: o, Day: CurrentDayProperty.SchoolDay!)
                                        let OutputIntTimes = FindStartHourMinute(PeriodInt: PeriodInt, Schedual: CurrentDayProperty.Value)
                                        let StartDate = GetDate(Hour: OutputIntTimes.0, Minute: OutputIntTimes.1, Time: Time)
                                        let EndDate = GetDate(Hour: OutputIntTimes.2, Minute: OutputIntTimes.3, Time: Time)

                                        CurrentEvents.append(EventType(Name: o.Name, StartTime: StartDate, EndTime: EndDate))
                                    }
                                }
                            }
                        }
                        print(CurrentEvents)
                    }
                }
            }
        } catch {
            print("Error")
        }
    }
    func computeNewDate(from fromDate: Date, to toDate: Date) -> Double  {
        
        let fromHourInt = Calendar.current.dateComponents([.hour], from: fromDate).hour
        let fromMinuiteInt = Calendar.current.dateComponents([.minute], from: fromDate).minute
        
        let ToHourInt = Calendar.current.dateComponents([.hour], from: toDate).hour
        let ToMinuiteInt = Calendar.current.dateComponents([.minute], from: toDate).minute
        
        let HourWidth = Height / 24
        let MinutieWidth = Height / 1440

        let HourIntValue = ToHourInt! - fromHourInt!
        let HourInt = abs(HourIntValue)
        let MinuiteIntValue = ToMinuiteInt! - fromMinuiteInt!
        let MinuiteInt = abs(MinuiteIntValue)
        
        let ReturnOffset = (Double(HourWidth) * Double(HourInt)) + (Double(MinutieWidth) * Double(MinuiteInt))
        return ReturnOffset
    }
    func FindOffsetEvent(Time: Date) -> Double{
        let HourWidth = Height / 24
        let MinutieWidth = Height / 1440
        
        let HourInt = (Calendar.current.dateComponents([.hour], from: Time).hour!)
        let MinuiteInt = Calendar.current.dateComponents([.minute], from: Time).minute
        let ReturnOffset = (Double(HourWidth) * Double(HourInt)) + (Double(MinutieWidth) * Double(MinuiteInt!)) + (HourWidth / 2)
        return ReturnOffset
    }
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
      preconditionFailure("Take a look to your format")
    }
    return date
  }
}
//Debug


struct WeekDayView: View{
    @Binding var CalendarClasses: [CalendarCourseType]
    @Binding var SelectedDates: [DateProperty]
    @State var CurrentEvents: [EventType] = []
    @Binding var SelectedDay: Date
    @State var TextSize: CGSize = CGSize(width: 0, height: 0)
    @Environment(\.colorScheme) var colorScheme
    @State var HeightOffsetTOP: Double = 0.0
    @State var Height: Double = 0.0
    @State var ScrollPosition: Int = 0
    let HoursIN: [String] = ["12PM", "1AM", "2AM", "3AM", "4AM", "5AM", "6AM", "7AM", "8AM", "9AM", "10AM", "11AM", "12AM", "1PM", "2BM", "3PM", "4PM", "5PM", "6PM", "7PM", "8PM", "9PM",
    "10PM", "11PM"]
    var body: some View{
            GeometryReader{ value in
                ScrollViewReader{ scroll in
                    ScrollView{
                            ZStack{
                                VStack(spacing: 0){
                                    ForEach(HoursIN, id: \.self){value in
                                        HStack{
                                            Text(value)
                                                .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
                                                .saveSize(in: $TextSize)
                                            VStack{
                                                Divider()
                                                    .background(.black)
                                            }
                                        }.padding()
                                        .padding(.top)
                                        .frame(maxWidth: .infinity)
                                    }
                                }.background( //Finding ScrollView Height
                                    GeometryReader { proxy in
                                        Color.clear // we just want the reader to get triggered, so let's use an empty color
                                            .onAppear {
                                                Height = proxy.size.height
                                            }
                                    }
                                )
                                .onAppear(){
                                    FindDateProperty(Time: SelectedDay)
                                    HeightOffsetTOP = FindTimeOffset(Time: SelectedDay)
                                    var ScrollPosition = Int(HeightOffsetTOP) - 500
                                    if ScrollPosition >= Int(Height){
                                        ScrollPosition = Int(Height)
                                    }
                                }
                                .onChange(of: SelectedDay){ time in
                                    FindDateProperty(Time: SelectedDay)
                                }
                                
                                if Height != 0.0{
                                    ForEach(CurrentEvents, id:\.id){ event in
                                        let Offset = computeNewDate(from: event.StartTime, to: event.EndTime)
                                        let StartOffset = FindTimeOffset(Time: event.StartTime)
                                        VStack{
                                            HStack{
                                                ZStack{
                                                    HStack{
                                                        Spacer()
                                                        Rectangle()
                                                            .foregroundColor(.yellow)
                                                            .opacity(0.6)
                                                            .frame(width: value.size.width * 0.8,height: Offset)
                                                            .onAppear(){
                                                                print(value.size)
                                                            }
                                                            
                                                    }
                                                    Text("\(event.Name)")
                                                }
                                            }.frame(width: value.size.width * 0.9, height: value.size.height * 0.005, alignment: .top)
                                                .offset(y: StartOffset + (TextSize.height / 2))
                                        }
                                        .offset(y: -Height/2)
                                    }
                                }
                                
                                if SelectedDay.formatted(date: .numeric, time: .omitted) == Date.now.formatted(date: .numeric, time: .omitted){
                                    if Height != 0.0{
                                        VStack{
                                            HStack{
                                                Text(verbatim: .currentTime)
                                                    .foregroundColor(.red)
                                                Rectangle()
                                                    .foregroundColor(.red)
                                                    .onAppear(){
                                                        print(value.size)
                                                    }
                                            }.frame(width: value.size.width * 0.9, height: value.size.height * 0.005, alignment: .top)
                                                .offset(y: HeightOffsetTOP)
                                        }
                                        .offset(y: -Height/2)
                                    }
                                }
                                if Height != 0.0{
                                    ForEach(0..<Int(Height), id: \.self) { date in
                                        Text("Error")
                                            .id(date)
                                            .foregroundColor(.clear)
                                            .onAppear(){
                                                scroll.scrollTo(ScrollPosition, anchor: .top)
                                            }
                                    }
                                }
                            }.frame(maxWidth: .infinity)
                    }
                }
            }
    }
    func FindTimeOffset(Time: Date) -> Double {
        let HourWidth = Height / 24
        let MinutieWidth = Height / 1440
        let HourInt = Calendar.current.dateComponents([.hour], from: Time).hour
        let MinuiteInt = Calendar.current.dateComponents([.minute], from: Time).minute
        let ReturnOffset = (Double(HourWidth) * Double(HourInt!)) + (Double(MinutieWidth) * Double(MinuiteInt!)) + (HourWidth / 2)
        return ReturnOffset
    }
    func GetDate(Hour: Int, Minute: Int, Time: Date) -> Date {
        // Specify date components
        var dateComponents = DateComponents()
        dateComponents.year =  Calendar.current.dateComponents([.year], from: Time).year
        dateComponents.month = Calendar.current.dateComponents([.month], from: Time).month
        dateComponents.day = Calendar.current.dateComponents([.day], from: Time).day
        dateComponents.timeZone = TimeZone(abbreviation: "CDT") // Japan Standard Time
        dateComponents.hour = Hour
        dateComponents.minute = Minute

        // Create date from components
        let userCalendar = Calendar(identifier: .gregorian) // since the components above (like year 1980) are for Gregorian
        let someDateTime = userCalendar.date(from: dateComponents)
        return someDateTime!
    }
    func FindStartHourMinute(PeriodInt: Int, Schedual: Int?) -> (Int, Int, Int, Int){
        if Schedual != nil{
            if Schedual == 3 || Schedual == 4{
                if PeriodInt == 1{
                    return (8, 30, 9, 25)
                } else {
                    if PeriodInt == 2{
                        return (9, 30, 10, 35)
                    } else {
                        if PeriodInt == 3{
                            return (10, 40, 11, 35)
                        } else {
                            if PeriodInt == 4{
                                return (12, 30, 13, 25)
                            } else {
                                if PeriodInt == 5{
                                    return (13, 30, 14, 25)
                                } else {
                                    if PeriodInt == 0{
                                        return (0, 0, 0, 0)
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                if Schedual == 5 || Schedual == 6{
                    if PeriodInt == 1{
                        return (9, 30, 10, 25)
                    } else {
                        if PeriodInt == 2{
                            return (10, 30, 11, 30)
                        } else {
                            if PeriodInt == 3{
                                return (12, 20, 13, 15)
                            } else {
                                if PeriodInt == 4{
                                    return (13, 20, 14, 15)
                                } else {
                                    if PeriodInt == 5{
                                        return (14, 20, 15, 15)
                                    } else {
                                        if PeriodInt == 0{
                                            return (0, 0, 0, 0)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } else {
            if PeriodInt == 1{
                return (8, 30, 9, 35)
            } else {
                if PeriodInt == 2{
                    return (9, 40, 10, 55)
                } else {
                    if PeriodInt == 3{
                        return (11, 0, 12, 05)
                    } else {
                        if PeriodInt == 4{
                            return (13, 0, 14, 5)
                        } else {
                            if PeriodInt == 5{
                                return (14, 10, 15, 15)
                            } else {
                                if PeriodInt == 0{
                                    return (0, 0, 0, 0)
                                }
                            }
                        }
                    }
                }
            }
        }
        return (0, 0, 0, 0)
    }
    func FindPeriod(Class: CalendarCourseType, Day: String) -> Int{
        var PeriodInt = 0
        if Day == "A"{
            PeriodInt = Class.DayA
        } else {
            if Day == "B"{
                PeriodInt = Class.DayB
            } else {
                if Day == "C"{
                    PeriodInt = Class.DayC
                } else {
                    if Day == "D"{
                        PeriodInt = Class.DayD
                    }
                }
            }
        }
        return PeriodInt
    }
    func FindDateProperty(Time: Date){
        CurrentEvents = []
        let DayInt = Calendar.current.dateComponents([.day], from: Time).day
        if let CurrentDayProperty = SelectedDates.first(where: { $0.Date == DayInt }){
            if CurrentDayProperty.SchoolDay != nil{
                for o in CalendarClasses{
                    let PeriodInt = FindPeriod(Class: o, Day: CurrentDayProperty.SchoolDay!)
                    print("Period Int: \(PeriodInt)")
                    let OutputIntTimes = FindStartHourMinute(PeriodInt: PeriodInt, Schedual: CurrentDayProperty.Value)
                    print("Output Times: \(OutputIntTimes)")
                    print("This is time: \(Time)")
                    let StartDate = GetDate(Hour: OutputIntTimes.0, Minute: OutputIntTimes.1, Time: Time)
                    let EndDate = GetDate(Hour: OutputIntTimes.2, Minute: OutputIntTimes.3, Time: Time)

                    CurrentEvents.append(EventType(Name: o.Name, StartTime: StartDate, EndTime: EndDate))
                }
                print(CurrentEvents)
            }
        }
    }
    func computeNewDate(from fromDate: Date, to toDate: Date) -> Double  {
        
        let fromHourInt = Calendar.current.dateComponents([.hour], from: fromDate).hour
        let fromMinuiteInt = Calendar.current.dateComponents([.minute], from: fromDate).minute
        
        let ToHourInt = Calendar.current.dateComponents([.hour], from: toDate).hour
        let ToMinuiteInt = Calendar.current.dateComponents([.minute], from: toDate).minute
        
        let HourWidth = Height / 24
        let MinutieWidth = Height / 1440

        let HourIntValue = ToHourInt! - fromHourInt!
        let HourInt = abs(HourIntValue)
        let MinuiteIntValue = ToMinuiteInt! - fromMinuiteInt!
        let MinuiteInt = abs(MinuiteIntValue)
        
        let ReturnOffset = (Double(HourWidth) * Double(HourInt)) + (Double(MinutieWidth) * Double(MinuiteInt))
        return ReturnOffset
    }
    func FindOffsetEvent(Time: Date) -> Double{
        let HourWidth = Height / 24
        let MinutieWidth = Height / 1440
        
        let HourInt = (Calendar.current.dateComponents([.hour], from: Time).hour!)
        let MinuiteInt = Calendar.current.dateComponents([.minute], from: Time).minute
        let ReturnOffset = (Double(HourWidth) * Double(HourInt)) + (Double(MinutieWidth) * Double(MinuiteInt!)) + (HourWidth / 2)
        return ReturnOffset
    }
}

struct WeekView: View{
    @Binding var CalendarClasses: [CalendarCourseType]
    @Binding var SelectedDates: [DateProperty]
    @State var CurrentEvents: [EventType] = []
    @State var SelectedDay: Date = Date.now
    @State var Days: [Date] = []
    let Modes: [String] = ["Schedual", "Events"]
    @State var SelectedMode: String = "Schedual"
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
                if SelectedMode == "Schedual"{
                    WeekDayView(CalendarClasses: $CalendarClasses, SelectedDates: $SelectedDates, CurrentEvents: CurrentEvents, SelectedDay: $SelectedDay)
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



//#if DEBUG
//struct MessageLegoPreview: PreviewProvider {
//    static var previews: some View {
//        WeekView()
//    }
//}
//#endif

struct MonthViewMain: View{
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

struct CalendarUI: UIViewRepresentable {
    
    let interval: DateInterval
    
    func makeUIView(context: Context) -> UICalendarView {
        let view = UICalendarView()
        view.calendar = Calendar.current
        view.availableDateRange = interval
        return view
    }
    
    func updateUIView(_ uiView: UICalendarView, context: Context) {
        
    }
    
}


//Testing
//                                    // Specify date components
//                                    var dateComponents = DateComponents()
//                                    dateComponents.year = 1980
//                                    dateComponents.month = 7
//                                    dateComponents.day = 11
//                                    dateComponents.timeZone = TimeZone(abbreviation: "CDT") // Japan Standard Time
//                                    dateComponents.hour = 10
//                                    dateComponents.minute = 0
//
//                                    // Create date from components
//                                    let userCalendar = Calendar(identifier: .gregorian) // since the components above (like year 1980) are for Gregorian
//                                    let someDateTime = userCalendar.date(from: dateComponents)
//                                    print("Some Date Time\(someDateTime)")
