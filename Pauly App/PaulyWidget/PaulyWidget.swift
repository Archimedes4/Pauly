//
//  PaulyWidget.swift
//  PaulyWidget
//
//  Created by Andrew Mainella on 2023-04-05.
//

import WidgetKit
import SwiftUI
import Intents
import FirebaseAuth
import FirebaseFirestore

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

enum APIResult{
    case NotLoggedIn
    case Failure
    case Success
    case NoClasses
    case NoSchool
    case ExamDay
}

struct Provider: IntentTimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), configuration: ConfigurationIntent(), StartString: "Pauly Widget", Reuslt: .Failure, SchoolDay: "", Schedual: "", DayOfWeek: "")
    }

    func getSnapshot(for configuration: ConfigurationIntent, in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date(), configuration: configuration, StartString: "Error", Reuslt: .Failure, SchoolDay: "", Schedual: "", DayOfWeek: "")
        completion(entry)
    }

    func getTimeline(for configuration: ConfigurationIntent, in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        print("Starting Timeline")
        GetStartTime { (Result, Succes, SchoolDay, Schdual, DayOfWeek) in
            var NewDate = Date.now
            
            let HourInt = Calendar.current.dateComponents([.hour], from: NewDate).hour
            
            if HourInt! >= 15{
                if HourInt! >= 16{
                    let YearInt = Calendar.current.dateComponents([.year], from: NewDate).year
                    let MonthInt = Calendar.current.dateComponents([.month], from: NewDate).month
                    let DayInt = Calendar.current.dateComponents([.day], from: NewDate).day
                    var dateComponent = DateComponents()
                    dateComponent.year = YearInt
                    dateComponent.month = MonthInt
                    dateComponent.day = DayInt! + 1
                    dateComponent.hour = 0
                    dateComponent.minute = 0
                    let ThreeThirtyToday = Calendar.current.date(from: dateComponent)
                    let timeline = Timeline(entries: [SimpleEntry(date: Date.now, configuration: configuration, StartString: Result, Reuslt: Succes, SchoolDay: SchoolDay, Schedual: Schdual, DayOfWeek: DayOfWeek)], policy: .after(ThreeThirtyToday!))
                    completion(timeline)
                } else {
                    let minuteInt = Calendar.current.dateComponents([.minute], from: NewDate).minute
                    if minuteInt! >= 30{
                        let YearInt = Calendar.current.dateComponents([.year], from: NewDate).year
                        let MonthInt = Calendar.current.dateComponents([.month], from: NewDate).month
                        let DayInt = Calendar.current.dateComponents([.day], from: NewDate).day
                        var dateComponent = DateComponents()
                        dateComponent.year = YearInt
                        dateComponent.month = MonthInt
                        dateComponent.day = DayInt! + 1
                        dateComponent.hour = 0
                        dateComponent.minute = 0
                        let ThreeThirtyToday = Calendar.current.date(from: dateComponent)
                        let timeline = Timeline(entries: [SimpleEntry(date: Date.now, configuration: configuration, StartString: Result, Reuslt: Succes, SchoolDay: SchoolDay, Schedual: Schdual, DayOfWeek: DayOfWeek)], policy: .after(ThreeThirtyToday!))
                        completion(timeline)
                    }
                }
            } else {
                var components = DateComponents()
                components.hour = 3
                components.minute = 30
                let ThreeThirtyToday = Calendar.current.date(from: components)
                let timeline = Timeline(entries: [SimpleEntry(date: Date.now, configuration: configuration, StartString: Result, Reuslt: Succes, SchoolDay: SchoolDay, Schedual: Schdual, DayOfWeek: DayOfWeek)], policy: .after(ThreeThirtyToday!))
                completion(timeline)
            }
        }
    }
    func GivenStartIntGetTimeSchedualOne(StartTimeInt: Int) -> String{
        if StartTimeInt == 1{
            return "8:30"
        } else {
            if StartTimeInt == 2{
                return "9:35"
            } else {
                if StartTimeInt == 3{
                    return "11:00"
                } else {
                    if StartTimeInt == 4{
                        return "1:00"
                    } else {
                        if StartTimeInt == 5{
                            return "2:05"
                        }
                    }
                }
            }
        }
        return "An Error has Occured"
    }
    func GivenStartIntGetTimeSchedualDismissal(StartTimeInt: Int) -> String{
        if StartTimeInt == 1{
            return "8:30"
        } else {
            if StartTimeInt == 2{
                return "9:30"
            } else {
                if StartTimeInt == 3{
                    return "10:40"
                } else {
                    if StartTimeInt == 4{
                        return "12:30"
                    } else {
                        if StartTimeInt == 5{
                            return "1:30"
                        }
                    }
                }
            }
        }
        return "An Error has Occured"
    }
    func GivenStartIntGetTimeSchedualLate(StartTimeInt: Int) -> String{
        if StartTimeInt == 1{
            return "9:30"
        } else {
            if StartTimeInt == 2{
                return "10:30"
            } else {
                if StartTimeInt == 3{
                    return "12:20"
                } else {
                    if StartTimeInt == 4{
                        return "1:20"
                    } else {
                        if StartTimeInt == 5{
                            return "2:20"
                        }
                    }
                }
            }
        }
        return "An Error has Occured"
    }
    func GetStartTime(completion: @escaping (String, APIResult, String, String, String)->()){
        guard let _ = Auth.auth().currentUser else {
            print("No Logged In")
            completion("Your Not Logged In", .NotLoggedIn, "", "", "")
            return
        }

        var NewDate = Date.now
        
        let HourInt = Calendar.current.dateComponents([.hour], from: NewDate).hour
        
        if HourInt! >= 15{
            if HourInt! >= 16{
                var dateComponent = DateComponents()
                dateComponent.day = 1
                NewDate = Calendar.current.date(byAdding: dateComponent, to: NewDate)!
            } else {
                let minuteInt = Calendar.current.dateComponents([.minute], from: NewDate).minute
                if minuteInt! >= 30{
                    var dateComponent = DateComponents()
                    dateComponent.day = 1
                    NewDate = Calendar.current.date(byAdding: dateComponent, to: NewDate)!
                }
            }
        }
        
        let index = Calendar.current.component(.weekday, from: NewDate)
        
        if index == 1{
            var dateComponent = DateComponents()
            dateComponent.day = 1
            NewDate = Calendar.current.date(byAdding: dateComponent, to: NewDate)!
        }
        if index == 7{
            var dateComponent = DateComponents()
            dateComponent.day = 2
            NewDate = Calendar.current.date(byAdding: dateComponent, to: NewDate)!
        }

        let DayInt = Calendar.current.dateComponents([.day], from: NewDate).day
        let monthInt = Calendar.current.dateComponents([.month], from: NewDate).month
        let YearInt = Calendar.current.dateComponents([.year], from: NewDate).year
        
        CheckIfSchoolDay(YearInt: YearInt!, MonthInt: monthInt!, DayInt: DayInt!){ DayResult in
            if DayResult{
                let diffs = Calendar.current.dateComponents([.day], from: Date.now, to: NewDate)
                var DayOfWeekVar: String = "Today"
                if diffs.day! >= 1{
                    let index = Calendar.current.component(.weekday, from: NewDate)
                    if index == 1{
                        completion("An error has occurred", .Failure, "", "", "")
                    } else if index == 2 {
                        DayOfWeekVar = "Monday"
                    } else if index == 3{
                        DayOfWeekVar = "Tuesday"
                    } else if index == 4{
                        DayOfWeekVar = "Wensday"
                    } else if index == 5{
                        DayOfWeekVar = "Thursday"
                    } else if index == 6{
                        DayOfWeekVar = "Friday"
                    } else {
                        completion("An error has occurred", .Failure, "", "", "")
                    }
                } else {
                    if Calendar.current.isDateInTomorrow(NewDate){
                        DayOfWeekVar = "Tomorrow"
                    }
                }
                GetStartTimePerDay(DayInt: DayInt!, MonthInt: monthInt!, YeatInt: YearInt!){ (Result, Succes, SchoolDay, Schdual, DayOfWeek) in
                    completion(Result, Succes, SchoolDay, Schdual, DayOfWeekVar)
                }
            } else {
                var dateComponent = DateComponents()
                dateComponent.day = 1
                NewDate = Calendar.current.date(byAdding: dateComponent, to: NewDate)!
                let index = Calendar.current.component(.weekday, from: NewDate)
                
                if index == 1{
                    var dateComponent = DateComponents()
                    dateComponent.day = 1
                    NewDate = Calendar.current.date(byAdding: dateComponent, to: NewDate)!
                }
                if index == 7{
                    var dateComponent = DateComponents()
                    dateComponent.day = 2
                    NewDate = Calendar.current.date(byAdding: dateComponent, to: NewDate)!
                }

                let DayIntNew = Calendar.current.dateComponents([.day], from: NewDate).day
                let monthIntNew = Calendar.current.dateComponents([.month], from: NewDate).month
                let YearIntNew = Calendar.current.dateComponents([.year], from: NewDate).year
                CheckIfSchoolDay(YearInt: YearIntNew!, MonthInt: monthIntNew!, DayInt: DayIntNew!){ DayResult in
                    if DayResult{
                        let diffs = Calendar.current.dateComponents([.day], from: Date.now, to: NewDate)
                        var DayOfWeekVar: String = "Today"
                        if diffs.day! >= 2{
                            let index = Calendar.current.component(.weekday, from: NewDate)
                            if index == 1{
                                completion("An error has occurred", .Failure, "", "", "")
                            } else if index == 2 {
                                DayOfWeekVar = "Monday"
                            } else if index == 3{
                                DayOfWeekVar = "Tuesday"
                            } else if index == 4{
                                DayOfWeekVar = "Wensday"
                            } else if index == 5{
                                DayOfWeekVar = "Thursday"
                            } else if index == 6{
                                DayOfWeekVar = "Friday"
                            } else {
                                completion("An error has occurred", .Failure, "", "", "")
                            }
                        } else {
                            if diffs.day! == 1{
                                DayOfWeekVar = "Tomorrow"
                            }
                        }
                        GetStartTimePerDay(DayInt: DayInt!, MonthInt: monthInt!, YeatInt: YearInt!){ (Result, Succes, SchoolDay, Schdual, DayOfWeek) in
                            completion(Result, Succes, SchoolDay, Schdual, DayOfWeekVar)
                        }
                    } else {
                        completion("Holiday", .Success, "", "Holiday", "")
                    }
                }
            }
        }
    }
    
    func CheckIfSchoolDay(YearInt: Int, MonthInt: Int, DayInt: Int, Completion: @escaping (Bool) -> ()) {
        let db = Firestore.firestore()
        
        let docRef = db.collection("Calendar").document("\(YearInt)").collection("\(MonthInt)").document("\(DayInt)")
        
        docRef.getDocument { (document, error) in
            guard error == nil else {
                print("error", error ?? "")
                return
            }
            
            if let document = document, document.exists {
                let data = document.data()
                if let data = data{
                    let value = data["value"] as? Int
                    if value == nil{
                        Completion(true)
                    } else {
                        if value == 1 || value == 2{
                            Completion(false)
                        } else {
                            Completion(true)
                        }
                    }
                }
            }
        }
    }
    
    func GetStartTimePerDay(DayInt: Int, MonthInt: Int, YeatInt: Int, completion: @escaping (String, APIResult, String, String, String) -> ()){
        let db = Firestore.firestore()

        
        guard let Useruid = Auth.auth().currentUser?.uid else {
            print("No Logged In")
            completion("Your Not Logged In", .NotLoggedIn, "", "", "")
            return
        }
        
        let UserCoursesRef = db.collection("Users").document(Useruid)
        
        UserCoursesRef.getDocument { (document, error) in
            guard error == nil else {
                print("error", error ?? "")
                return
            }
            if let document = document, document.exists {
                let data = document.data()
                if let data = data {
                    
                    guard let Classes = data["Classes"] as? NSArray as? [String] else {
                        completion("You Don't have any classes", .NoClasses, "", "", "")
                        return
                    }
                    guard let Grade = data["Grade"] as? Int else {
                        completion("An error has occured. Pauly can't find which grade your in.", .Failure, "", "", "")
                        return
                    }
                    var CalendarClasses: [CalendarCourseType] = []
                    
                    var Index: Int = 0
                    for x in Classes{
                        let ClassArray = x.split(separator: "-")
                        
                        let docRef = db.collection("Grade\(ClassArray[0])Courses").document("\(ClassArray[1])").collection("Sections").document("\(ClassArray[2])-\(ClassArray[3])")
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
                                    CalendarClasses.append(CalendarCourseType(Name: "\(ClassArray[0])", Semester: Semester!, DayA: DayA!, DayB: DayB!, DayC: DayC!, DayD: DayD!, NoClass: NoClassesOutArray, Year: Year))
                                    Index += 1
                                    if Index == Classes.count {
                                        
                                        let docRef = db.collection("Calendar").document("\(YeatInt)").collection("\(MonthInt)").document("\(DayInt)")
                                        
                                        docRef.getDocument { (document, error) in
                                             guard error == nil else {
                                                 print("error", error ?? "")
                                                 return
                                             }

                                             if let document = document, document.exists {
                                                 let data = document.data()
                                                 if let data = data {
                                                     let value = data["value"] as? Int
                                                     if let value {
                                                         if value == 1{
                                                             completion("No School", .NoSchool, "", "", "")
                                                             return
                                                         } else {
                                                             if value == 2{
                                                                 completion("No School", .NoSchool, "", "", "")
                                                                 return
                                                             } else {
                                                                 if value == 3 || value == 4{
                                                                     var OutValue: String = ""
                                                                     if value == 3{
                                                                         OutValue = "Early Dismissal"
                                                                     } else {
                                                                         OutValue = "PM Assembly"
                                                                     }
                                                                     guard let SchoolDay = data["SchoolDay"] as? String else {
                                                                         completion("An error has occurred", .Failure, "", "", "")
                                                                         return
                                                                     }
                                                                     if SchoolDay == "A"{
                                                                         let StartTimeInt = CalendarClasses.max(by: { (a, b) -> Bool in
                                                                             return a.DayA > b.DayA
                                                                         })
                                                                         completion(self.GivenStartIntGetTimeSchedualDismissal(StartTimeInt: StartTimeInt!.DayA), .Success, "A", OutValue, "")
                                                                     } else {
                                                                         if SchoolDay == "B"{
                                                                             let StartTimeInt = CalendarClasses.max(by: { (a, b) -> Bool in
                                                                                 return a.DayB > b.DayB
                                                                             })
                                                                             completion(self.GivenStartIntGetTimeSchedualDismissal(StartTimeInt: StartTimeInt!.DayB), .Success, "B", OutValue, "")
                                                                         } else {
                                                                             if SchoolDay == "C"{
                                                                                 let StartTimeInt = CalendarClasses.max(by: { (a, b) -> Bool in
                                                                                     return a.DayC > b.DayC
                                                                                 })
                                                                                 completion(self.GivenStartIntGetTimeSchedualDismissal(StartTimeInt: StartTimeInt!.DayC), .Success, "C", OutValue, "")
                                                                             } else {
                                                                                 if SchoolDay == "D"{
                                                                                     let StartTimeInt = CalendarClasses.max(by: { (a, b) -> Bool in
                                                                                         return a.DayD > b.DayD
                                                                                     })
                                                                                     completion(self.GivenStartIntGetTimeSchedualDismissal(StartTimeInt: StartTimeInt!.DayD), .Success, "D", OutValue, "")
                                                                                 }
                                                                             }
                                                                         }
                                                                     }
                                                                 } else {
                                                                     if value == 5{
                                                                         guard let SchoolDay = data["SchoolDay"] as? String else {
                                                                             completion("An error has occurred", .Failure, "", "", "")
                                                                             return
                                                                         }
                                                                         if SchoolDay == "A"{
                                                                             let StartTimeInt = CalendarClasses.max(by: { (a, b) -> Bool in
                                                                                 return a.DayA > b.DayA
                                                                             })
                                                                             completion(GivenStartIntGetTimeSchedualLate(StartTimeInt: StartTimeInt!.DayA), .Success, "A", "Late Start", "")
                                                                         } else {
                                                                             if SchoolDay == "B"{
                                                                                 let StartTimeInt = CalendarClasses.max(by: { (a, b) -> Bool in
                                                                                     return a.DayB > b.DayB
                                                                                 })
                                                                                 completion(GivenStartIntGetTimeSchedualLate(StartTimeInt: StartTimeInt!.DayB), .Success, "B", "Late Start", "")
                                                                             } else {
                                                                                 if SchoolDay == "C"{
                                                                                     let StartTimeInt = CalendarClasses.max(by: { (a, b) -> Bool in
                                                                                         return a.DayC > b.DayC
                                                                                     })
                                                                                     completion(GivenStartIntGetTimeSchedualLate(StartTimeInt: StartTimeInt!.DayC), .Success, "C", "Late Start", "")
                                                                                 } else {
                                                                                     if SchoolDay == "D"{
                                                                                         let StartTimeInt = CalendarClasses.max(by: { (a, b) -> Bool in
                                                                                             return a.DayD > b.DayD
                                                                                         })
                                                                                         completion(GivenStartIntGetTimeSchedualLate(StartTimeInt: StartTimeInt!.DayD), .Success, "D", "Late Start", "")
                                                                                     }
                                                                                 }
                                                                             }
                                                                         }
                                                                     } else {
                                                                         if value == 6{
                                                                             guard let SchoolDay = data["SchoolDay"] as? String else {
                                                                                 completion("An error has occurred", .Failure, "", "", "")
                                                                                 return
                                                                             }
                                                                             completion("8:30", .Success, SchoolDay, "\(value)", "")
                                                                             return
                                                                         } else {
                                                                             if value == 7{
                                                                                 completion("Exams", .ExamDay, "", "\(value)", "")
                                                                                 return
                                                                             }
                                                                         }
                                                                     }
                                                                 }
                                                             }
                                                         }
                                                     } else {
                                                         guard let SchoolDay = data["SchoolDay"] as? String else {
                                                             completion("An error has occurred", .Failure, "", "Schedual One", "")
                                                             return
                                                         }
                                                         if SchoolDay == "A"{
                                                             let StartTimeInt = CalendarClasses.max(by: { (a, b) -> Bool in
                                                                 return a.DayA > b.DayA
                                                             })
                                                             completion(GivenStartIntGetTimeSchedualOne(StartTimeInt: StartTimeInt!.DayA), .Success, "A", "Schedual One", "")
                                                         } else {
                                                             if SchoolDay == "B"{
                                                                 let StartTimeInt = CalendarClasses.max(by: { (a, b) -> Bool in
                                                                     return a.DayB > b.DayB
                                                                 })
                                                                 completion(GivenStartIntGetTimeSchedualOne(StartTimeInt: StartTimeInt!.DayB), .Success, "B", "Schedual One", "")
                                                             } else {
                                                                 if SchoolDay == "C"{
                                                                     let StartTimeInt = CalendarClasses.max(by: { (a, b) -> Bool in
                                                                         return a.DayC > b.DayC
                                                                     })
                                                                     completion(GivenStartIntGetTimeSchedualOne(StartTimeInt: StartTimeInt!.DayC), .Success, "C", "Schedual One", "")
                                                                 } else {
                                                                     if SchoolDay == "D"{
                                                                         let StartTimeInt = CalendarClasses.max(by: { (a, b) -> Bool in
                                                                             return a.DayD > b.DayD
                                                                         })
                                                                         completion(GivenStartIntGetTimeSchedualOne(StartTimeInt: StartTimeInt!.DayD), .Success, "D", "Schedual One", "")
                                                                     }
                                                                 }
                                                             }
                                                         }
                                                     }
                                                 }
                                             } else {
                                                 completion("No School Today", .NoSchool, "", "", "")
                                             }
                                         }
                                    }
                                }
                            }//mark
                                    }
                                }
                            }
            }
        }
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let configuration: ConfigurationIntent
    let StartString: String
    let Reuslt: APIResult
    let SchoolDay: String
    let Schedual: String
    let DayOfWeek: String
}

struct PaulyWidgetEntryView : View {
    var entry: Provider.Entry
    @Environment(\.colorScheme) var colorScheme
    var body: some View {
        switch entry.Reuslt{
        case .ExamDay:
            ZStack{
                ContainerRelativeShape()
                    .fill(Color.marron)
                Text("Exams")
                    .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
            }
        case .NotLoggedIn:
            ZStack{
                ContainerRelativeShape()
                    .fill(Color.marron)
                Text("Please Login")
                    .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
            }
        case .NoSchool:
            ZStack{
                ContainerRelativeShape()
                    .fill(Color.marron)
                Text("No School Today")
                    .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
            }
        case .Failure:
            ZStack{
                ContainerRelativeShape()
                    .fill(Color.marron)
                Text(entry.StartString)
                    .font(Font.custom("Futura", size: 32, relativeTo: .largeTitle))
                    .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
            }
        case .NoClasses:
            ZStack{
                ContainerRelativeShape()
                    .fill(Color.marron)
                Text("You aren't in any Classes")
                    .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
            }
        case .Success:
            GeometryReader{ geo in
                ZStack{
                    ContainerRelativeShape()
                        .fill(Color.marron)
                    VStack{
                        Text(entry.DayOfWeek)
                            .foregroundColor(.white)
                            .font(Font.custom("Futura", size: 30, relativeTo: .title))
                            .frame(height: geo.size.height * 0.2)
                            .padding(.top)
                        HStack{
                            Spacer()
                            Text(entry.Schedual)
                                .foregroundColor(.white)
                                .font(Font.custom("Futura", size: 20, relativeTo: .title))
                            Spacer()
                        }.padding([.top, .bottom])
                        .frame(height: geo.size.height * 0.2)
                        .background(Color.cutomGray)
                        HStack(alignment: .top){
                            Text(entry.SchoolDay)
                                .font(Font.custom("Futura Bold", size: 50, relativeTo: .largeTitle))
                                .foregroundColor(.white)
                                .padding(.bottom)
                                .padding(.leading, 1)
                            if entry.StartString.count == 4{
                                Text(entry.StartString)
                                    .font(Font.custom("Futura", size: 48, relativeTo: .largeTitle))
                                    .foregroundColor(.white)
                                    .padding(.bottom)
                            } else {
                                Text(entry.StartString)
                                    .font(Font.custom("Futura", size: 38, relativeTo: .largeTitle))
                                    .foregroundColor(.white)
                                    .padding(.bottom)
                                    .offset(y: geo.size.height * 0.045)
                            }
                        }.offset(y: -geo.size.height * 0.125)
                    }.background(Color.marron)
                }
            }
        }
    }
}

struct PaulyWidget: Widget {
    let kind: String = "PaulyWidget"
    
    var body: some WidgetConfiguration {
        IntentConfiguration(kind: kind, intent: ConfigurationIntent.self, provider: Provider()) { entry in
            PaulyWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Pauly Start")
        .description("Pauly. Gives the time when the school day starts.")
        .supportedFamilies([.systemSmall])
    }
}

//struct PaulyWidget_Previews: PreviewProvider {
//    static var previews: some View {
//        PaulyWidgetEntryView(entry: SimpleEntry(date: Date(), configuration: ConfigurationIntent()))
//            .previewContext(WidgetPreviewContext(family: .systemSmall))
//    }
//}

extension Color {
    static let marron = Color("Marron")
    static let cutomGray = Color("CustomGray")
}
