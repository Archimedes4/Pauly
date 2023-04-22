//
//  CalendarPageDayView.swift
//  Pauly Backend
//
//  Created by Andrew Mainella on 2023-04-13.
//

import SwiftUI
import FirebaseFirestore

struct DayView: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    
    @StateObject var TimerInbound: AppConfig = AppConfig()
    
    @Binding var CalendarClasses: [CalendarCourseType]
    @Binding var SelectedDates: [DateProperty]
    @State var CurrentEvents: [EventType] = []
    @Binding var SelectedDay: Date
    
    @Environment(\.colorScheme) var colorScheme
    @State var HeightOffsetTOP: Double = 0.0
    @State var TextSize: CGSize = CGSize(width: 0, height: 0)
    @State var Height: Double = 0.0
    @State var ScrollPosition: Int = 0
    @State var CurrentMinuiteInt: Int = 0
    @State var CurrentTime: String = "8:30"
    @State var DateIntFetched: Bool = false
    @State var ShowingTime: Bool = true
    let HoursIN: [String] = ["12AM", "1AM", "2AM", "3AM", "4AM", "5AM", "6AM", "7AM", "8AM", "9AM", "10AM", "11AM", "12PM", "1PM", "2PM", "3PM", "4PM", "5PM", "6PM", "7PM", "8PM", "9PM",
    "10PM", "11PM"]
    var body: some View{
        VStack{
            GeometryReader{ Geovalue in
                ScrollViewReader{ scroll in
                    ScrollView{
                        VStack{
                            ZStack{
                                VStack(spacing: 0){
                                    if ShowingTime{
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
                                    GetStudentSchedual()
                                    HeightOffsetTOP = FindTimeOffset(Time: Date.now)
                                    let MinuiteInt = Calendar.current.dateComponents([.minute], from: Date.now).minute
                                    CurrentMinuiteInt = MinuiteInt!
                                    let HourInt = Calendar.current.dateComponents([.hour], from: Date.now).hour
                                    if "\(MinuiteInt ?? 10)".count == 1{
                                        CurrentTime = "\(HourInt! % 12):0\(MinuiteInt!)"
                                    } else {
                                        CurrentTime = "\(HourInt! % 12):\(MinuiteInt!)"
                                    }
                                    ScrollPosition = Int(HeightOffsetTOP)
                                    if ScrollPosition >= Int(Height){
                                        ScrollPosition = Int(Height)
                                    }
                                }
                                .onChange(of: SelectedDay){ time in
                                    FindDateProperty(Time: SelectedDay)
                                }
                                .onReceive(TimerInbound.timer){ _ in
                                    let MinuiteInt = Calendar.current.dateComponents([.minute], from: Date.now).minute
                                    if CurrentMinuiteInt != MinuiteInt! {
                                        ShowingTime = false
                                        CurrentMinuiteInt = MinuiteInt!
                                        let HourInt = Calendar.current.dateComponents([.hour], from: Date.now).hour
                                        if "\(MinuiteInt ?? 10)".count == 1{
                                            CurrentTime = "\(HourInt! % 12):0\(MinuiteInt!)"
                                        } else {
                                            CurrentTime = "\(HourInt! % 12):\(MinuiteInt!)"
                                        }
                                        HeightOffsetTOP = FindTimeOffset(Time: Date.now)
                                        ShowingTime = true
                                    }
                                }
                                if Height != 0.0{
                                    ForEach(CurrentEvents, id:\.id){ event in
                                        let Offset = computeNewDate(from: event.StartTime, to: event.EndTime)
                                        let StartOffset = FindTimeOffset(Time: event.StartTime)
                                        VStack{
                                            ZStack{
                                                HStack{
                                                    Spacer()
                                                    Rectangle()
                                                        .foregroundColor(event.EventColor)
                                                        .opacity(0.6)
                                                        .frame(width: Geovalue.size.width * 0.8,height: Offset)
                                                        .onAppear(){
                                                            print(CurrentEvents)
                                                        }
                                                }
                                                HStack{
                                                    Spacer()
                                                    HStack{
                                                        VStack{
                                                            HStack{
                                                                Text("\(event.Name)")
                                                                    .frame(alignment: .leading)
                                                                Spacer()
                                                            }
                                                            HStack{
                                                                Text("\(event.StartTime, style: .time) to \(event.EndTime, style: .time)")
                                                                    .frame(alignment: .leading)
                                                                Spacer()
                                                            }
                                                        }.padding(.leading)
                                                        Spacer()
                                                    }.frame(width: Geovalue.size.width * 0.8,height: Offset)
                                                }
                                            }
                                            .frame(width: Geovalue.size.width * 0.9, height: Offset, alignment: .top)
                                                .offset(y: StartOffset + (Height / 48))
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
                                                        print(Geovalue.size)
                                                    }
                                            }.frame(width: Geovalue.size.width * 0.9, height: Geovalue.size.height * 0.005, alignment: .top)
                                                .offset(y: HeightOffsetTOP)
                                        }
                                        .offset(y: -Height/2)
                                    }
                                }
                                if Height != 0.0{
                                    VStack(spacing: 0){
                                        ForEach(0..<Int(Height), id: \.self) { date in
                                            Rectangle()
                                                .frame(width: 10, height: 1)
                                                .id(date)
                                                .foregroundColor(.clear)
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
                if ValueArray[2] == "P"{
                    ValueInt += 12
                }
            } else {
                ValueInt = Int("\(ValueArray[0])")!
                if ValueArray[1] == "P"{
                    ValueInt += 12
                }
            }
            var ValueIntDown = ValueInt - 1
            if ValueIntDown == 0{
                ValueIntDown = 12
            }
            if HourInt! == ValueInt{
                if MinuiteInt! <= 20{
                    if ValueArray.count == 4{
                        print("In Four")
                        if ValueArray[2] == "A"{
                            print("Morning")
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
                            print("Morning")
                            if HourInt ?? 13 >= 13{
                                return true
                            }
                        } else {
                            if HourInt ?? 11 <= 11{
                                return true
                            }
                        }
                    }
                    return false
                }
            } else {
                if HourInt! == ValueIntDown{
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
        var ReturnOffset = (Double(HourWidth) * Double(HourInt!)) + (Double(MinutieWidth) * Double(MinuiteInt!)) + (HourWidth / 2)
        return ReturnOffset
    }
    func GetDate(Hour: Int, Minute: Int, Time: Date) -> Date {
        // Specify date components
        var dateComponents = DateComponents()
        dateComponents.year =  Calendar.current.dateComponents([.year], from: Time).year
        dateComponents.month = Calendar.current.dateComponents([.month], from: Time).month
        dateComponents.day = Calendar.current.dateComponents([.day], from: Time).day
        dateComponents.timeZone = TimeZone(abbreviation: "CDT")
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
    //Ryan was here April 13, 2023
    //Andrew was here April 13, 2023
    func FindDateProperty(Time: Date){
        let YearInt = Calendar.current.dateComponents([.year], from: Time).year
        let monthInt = Calendar.current.dateComponents([.month], from: Time).month
        do{
            let db = FirebaseFirestore.Firestore.firestore()
            
            var NewSelectedDate: [DateProperty] = []
            
            let docRef = db.collection("Calendar").document("\(YearInt!)").collection("\(monthInt!)")
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
                                        if o.NoClass.contains(where: { $0.Day == DayInt && $0.Month == monthInt && $0.Year == YearInt }){
                                            continue
                                        } else {
                                            let PeriodInt = FindPeriod(Class: o, Day: CurrentDayProperty.SchoolDay!)
                                            let OutputIntTimes = FindStartHourMinute(PeriodInt: PeriodInt, Schedual: CurrentDayProperty.Value)
                                            let StartDate = GetDate(Hour: OutputIntTimes.0, Minute: OutputIntTimes.1, Time: Time)
                                            let EndDate = GetDate(Hour: OutputIntTimes.2, Minute: OutputIntTimes.3, Time: Time)
                                            let EventColor = GetEventColor(MonthInt: monthInt!, DayInt: DayInt!, Class: o)
                                            CurrentEvents.append(EventType(Name: o.Name, StartTime: StartDate, EndTime: EndDate, EventColor: EventColor))
                                        }
                                    }
                                } else {
                                    if o.Semester == 1{
                                        if o.NoClass.contains(where: { $0.Day != DayInt && $0.Month != monthInt && $0.Year != YearInt }){
                                            continue
                                        } else {
                                            let PeriodInt = FindPeriod(Class: o, Day: CurrentDayProperty.SchoolDay!)
                                            let OutputIntTimes = FindStartHourMinute(PeriodInt: PeriodInt, Schedual: CurrentDayProperty.Value)
                                            let StartDate = GetDate(Hour: OutputIntTimes.0, Minute: OutputIntTimes.1, Time: Time)
                                            let EndDate = GetDate(Hour: OutputIntTimes.2, Minute: OutputIntTimes.3, Time: Time)
                                            let EventColor = GetEventColor(MonthInt: monthInt!, DayInt: DayInt!, Class: o)
                                            CurrentEvents.append(EventType(Name: o.Name, StartTime: StartDate, EndTime: EndDate, EventColor: EventColor))
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } catch {
            print("Error")
        }
    }
    func GetEventColor(MonthInt: Int, DayInt: Int, Class: CalendarCourseType) -> Color {
        var ColorResult = Color.white
        print(Class)
        for x in Class.Assignments{
            if x.AssignmentDuringClass{
                if x.SelectedMonth! == MonthInt{
                    if x.SelectedDay! == DayInt{
                        if x.AssignmentEnum == 0{
                            return Color.purple
                        } else {
                            if x.AssignmentEnum == 1{
                                return Color.red
                            } else {
                                if x.AssignmentEnum == 2{
                                    return Color.yellow
                                } else {
                                    if x.AssignmentEnum == 3{
                                        return Color.orange
                                    } else {
                                        if x.AssignmentEnum == 4{
                                            return Color.blue
                                        } else {
                                            if x.AssignmentEnum == 5{
                                                return Color.green
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return ColorResult
    }
    func computeNewDate(from fromDate: Date, to toDate: Date) -> Double  {
        let delta = toDate - fromDate
        
        let deltaInt = Int(delta)
        let deltaHours = deltaInt / 3600
        let deltaRemaining = deltaInt % 3600
        let deltaMinutes = deltaRemaining / 60
        
        let NewHourHeight = Height / 24
        let NewHeight = Height - NewHourHeight
        let HourWidth = NewHeight / 24
        let MinutieWidth = NewHeight / 1440
        
        print("This is delta \(delta)")
        print("This is delta hours \(deltaHours)")
        print("This is delta minute \(deltaMinutes)")
        
        let ReturnOffset = (Double(HourWidth) * Double(deltaHours)) + (Double(MinutieWidth) * Double(deltaMinutes))
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
    func GetStudentSchedual() {
        if WindowMode.TimesRecieved == false{
            var CurrentIndex: Int = 0
            for x in WindowMode.SelectedCourses{
                CurrentIndex += 1
                let db = FirebaseFirestore.Firestore.firestore()
        
                let docRef = db.collection("Grade\(x.Grade)Courses").document(x.Name).collection("Sections").document("\(x.Section)-\(x.Year)")
                
                docRef.getDocument { (document, error) in
                    guard error == nil else {
                        print("error", error ?? "")
                        return
                    }

                    if let document = document, document.exists {
                        let data = document.data()
                        if let data = data {
                            let Semester = data["Semester"] as? Int
                            guard let DayA = data["DayA"] as? Int else{
                                return
                            }
                            guard let DayB = data["DayB"] as? Int else {
                                return
                            }
                            guard let DayC = data["DayC"] as? Int else {
                                return
                            }
                            guard let DayD = data["DayD"] as? Int else {
                                return
                            }
                            let NoClass = data["NoClass"] as! NSArray as? [String]
                            let Year = data["School Year"] as? Int ?? 2020
                            var NoClassesOutArray: [NoClassType] = []
                            if NoClass != nil{
                                for l in NoClass!{
                                    let Output = l.split(separator: "-")
                                    NoClassesOutArray.append(NoClassType(Day: Int(Output[0])!, Month: Int(Output[1])!, Year: Int(Output[2])!))
                                }
                            }
                            GetAssignments(Grade: x.Grade, Name: x.Name, Section: x.Section, Year: x.Year){ assignmentIN in
                                CalendarClasses.append(CalendarCourseType(Name: x.Name, Semester: Semester!, DayA: DayA, DayB: DayB, DayC: DayC, DayD: DayD, NoClass: NoClassesOutArray, Year: Year, Assignments: assignmentIN))
                                if CurrentIndex == WindowMode.SelectedCourses.count{
                                    FindDateProperty(Time: SelectedDay)
                                    print("This is date propertry \(CurrentEvents)")
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    func GetAssignments(Grade: Int, Name:String, Section:Int, Year: Int?, completetion: @escaping ([AssignmentTypeQuiz]) -> ()) {
        var YearVar = Year
        let db = Firestore.firestore()
        
        var docRef = db.collection("Info")
        if Section == 0{
            docRef = db.collection("Grade\(Grade)Courses").document("\(Name)").collection("Sections").document("\(Section)").collection("Assignment")
        } else {
            docRef = db.collection("Grade\(Grade)Courses").document("\(Name)").collection("Sections").document("\(Section)-\(Year!)").collection("Assignment")
        }
        
        var AssignmentTypeArray: [AssignmentTypeQuiz] = []
        
        if Year == nil{
            YearVar = 0
        }
        
        docRef.getDocuments() { (querySnapshot, error) in
            if let error = error {
                print("Error getting documents: \(error)")
            } else {
                for document in querySnapshot!.documents {
                    let data = document.data()
                    print(data)
                     guard let AssignmentTitle = data["Title"] as? String else {
                         return
                     }
                     guard let AssignmnetDescription = data["Description"] as? String else {
                         print("Description")
                         return
                     }
                     guard let AssignmentEnum = data["AssignmentType"] as? Int else {
                         print("Type")
                         return
                     }
                    guard let AssignmentDuringClass = data["AssignmentDuringClass"] as? Bool else {
                        print("During Class")
                        return
                    }
                    let documentID = document.documentID
                    if AssignmentDuringClass{
                        guard let AssignmentMonth = data["Month"] as? Int else {
                            return
                        }
                        guard let AssignmentDay = data["Day"] as? Int else {
                            return
                        }
                        AssignmentTypeArray.append(AssignmentTypeQuiz(Title: AssignmentTitle, Description: AssignmnetDescription, DueDate: nil, AssignmentEnum: AssignmentEnum, DocumentRef: documentID, Class: CourseSelectedType(Name: Name, Section: Section, Year: YearVar!, Grade: Grade), AssignmentDuringClass: AssignmentDuringClass, SelectedMonth: AssignmentMonth, SelectedDay: AssignmentDay))
                    } else {
                        guard let AssignmentDueDateTime = data["DueDate"] as? Timestamp else {
                            return
                        }
                        let AssignmentDueDate = AssignmentDueDateTime.dateValue()
                        AssignmentTypeArray.append(AssignmentTypeQuiz(Title: AssignmentTitle, Description: AssignmnetDescription, DueDate: AssignmentDueDate, AssignmentEnum: AssignmentEnum, DocumentRef: documentID, Class: CourseSelectedType(Name: Name, Section: Section, Year: YearVar!, Grade: Grade), AssignmentDuringClass: AssignmentDuringClass, SelectedMonth: nil, SelectedDay: nil))
                    }
                }
                completetion(AssignmentTypeArray)
            }
        }
    }
}

extension Date {

    static func - (lhs: Date, rhs: Date) -> TimeInterval {
        return lhs.timeIntervalSinceReferenceDate - rhs.timeIntervalSinceReferenceDate
    }

}
