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
        SimpleEntry(date: Date(), configuration: ConfigurationIntent(), StartString: "Pauly Widget", Reuslt: .Failure)
    }

    func getSnapshot(for configuration: ConfigurationIntent, in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date(), configuration: configuration, StartString: "Error", Reuslt: .Failure)
        completion(entry)
    }

    func getTimeline(for configuration: ConfigurationIntent, in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {

        let date = Date()
        let nextUpdate = Calendar.current.date(byAdding: .day, value: 1, to: date)
        
        // Generate a timeline consisting of five entries an hour apart, starting from the current date.
        let currentDate = Date()
        
        print("Timeline")
        GetStartTime { (Result, Succes) in
            print("This is result \(Result)")
//            for hourOffset in 0 ..< 5 {
//                let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
//                let entry = SimpleEntry(date: entryDate, configuration: configuration, StartString: Time)
//                entries.append(entry)
//            }
            
            let timeline = Timeline(entries: [SimpleEntry(date: Date.now, configuration: configuration, StartString: Result, Reuslt: Succes)], policy: .after(nextUpdate!))
            print("Complete")
            completion(timeline)
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
                    return "10:55"
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
    func GetStartTime(completion: @escaping (String, APIResult)->()){
        guard let _ = Auth.auth().currentUser else {
            print("No Logged In")
            completion("Your Not Logged In", .NotLoggedIn)
            return
        }
        
        let Nowdate = Date.now
        let nextUpdate = Calendar.current.date(byAdding: .day, value: 4, to: Nowdate)!
        var NewDate = nextUpdate
        
        let HourInt = Calendar.current.dateComponents([.hour], from: NewDate).hour
        if HourInt! >= 15{
            let minuteInt = Calendar.current.dateComponents([.minute], from: NewDate).minute
            if minuteInt! >= 30{
                let currentDate = Date()
                var dateComponent = DateComponents()
                dateComponent.day = 1
                NewDate = Calendar.current.date(byAdding: dateComponent, to: currentDate)!
            }
        }
        
        let YearInt = Calendar.current.dateComponents([.year], from: NewDate).year
        let monthInt = Calendar.current.dateComponents([.month], from: NewDate).month
        let DayInt = Calendar.current.dateComponents([.day], from: NewDate).day
        
        let db = Firestore.firestore()

        
        guard let Useruid = Auth.auth().currentUser?.uid else {
            print("No Logged In")
            completion("Your Not Logged In", .NotLoggedIn)
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
                        completion("You Don't have any classes", .NoClasses)
                        return
                    }
                    guard let Grade = data["Grade"] as? Int else {
                        completion("An error has occured. Pauly can't find which grade your in.", .Failure)
                        return
                    }
                    var CalendarClasses: [CalendarCourseType] = []
                    
                    var Index: Int = 0
                    for x in Classes{
                        let ClassArray = x.split(separator: "-")
                        
                        print(ClassArray)
                        
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
                                        let docRef = db.collection("Calendar").document("\(YearInt!)").collection("\(monthInt!)").document("\(DayInt!)")
                                        
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
                                                             completion("No School", .NoSchool)
                                                             return
                                                         } else {
                                                             if value == 2{
                                                                 completion("No School", .NoSchool)
                                                                 return
                                                             } else {
                                                                 if value == 3 || value == 4{
                                                                     guard let SchoolDay = data["SchoolDay"] as? String else {
                                                                         completion("An error has occurred", .Failure)
                                                                         return
                                                                     }
                                                                     if SchoolDay == "A"{
                                                                         let StartTimeInt = CalendarClasses.max(by: { (a, b) -> Bool in
                                                                             return a.DayA < b.DayA
                                                                         })
                                                                         completion(GivenStartIntGetTimeSchedualDismissal(StartTimeInt: StartTimeInt!.DayA), .Success)
                                                                     } else {
                                                                         if SchoolDay == "B"{
                                                                             let StartTimeInt = CalendarClasses.max(by: { (a, b) -> Bool in
                                                                                 return a.DayB < b.DayB
                                                                             })
                                                                             completion(GivenStartIntGetTimeSchedualDismissal(StartTimeInt: StartTimeInt!.DayB), .Success)
                                                                         } else {
                                                                             if SchoolDay == "C"{
                                                                                 let StartTimeInt = CalendarClasses.max(by: { (a, b) -> Bool in
                                                                                     return a.DayC < b.DayC
                                                                                 })
                                                                                 completion(GivenStartIntGetTimeSchedualDismissal(StartTimeInt: StartTimeInt!.DayC), .Success)
                                                                             } else {
                                                                                 if SchoolDay == "D"{
                                                                                     let StartTimeInt = CalendarClasses.max(by: { (a, b) -> Bool in
                                                                                         return a.DayD < b.DayD
                                                                                     })
                                                                                     completion(GivenStartIntGetTimeSchedualDismissal(StartTimeInt: StartTimeInt!.DayD), .Success)
                                                                                 }
                                                                             }
                                                                         }
                                                                     }
                                                                 } else {
                                                                     if value == 5{
                                                                         guard let SchoolDay = data["SchoolDay"] as? String else {
                                                                             completion("An error has occurred", .Failure)
                                                                             return
                                                                         }
                                                                         if SchoolDay == "A"{
                                                                             let StartTimeInt = CalendarClasses.max(by: { (a, b) -> Bool in
                                                                                 return a.DayA < b.DayA
                                                                             })
                                                                             completion(GivenStartIntGetTimeSchedualLate(StartTimeInt: StartTimeInt!.DayA), .Success)
                                                                         } else {
                                                                             if SchoolDay == "B"{
                                                                                 let StartTimeInt = CalendarClasses.max(by: { (a, b) -> Bool in
                                                                                     return a.DayB < b.DayB
                                                                                 })
                                                                                 completion(GivenStartIntGetTimeSchedualLate(StartTimeInt: StartTimeInt!.DayB), .Success)
                                                                             } else {
                                                                                 if SchoolDay == "C"{
                                                                                     let StartTimeInt = CalendarClasses.max(by: { (a, b) -> Bool in
                                                                                         return a.DayC < b.DayC
                                                                                     })
                                                                                     completion(GivenStartIntGetTimeSchedualLate(StartTimeInt: StartTimeInt!.DayC), .Success)
                                                                                 } else {
                                                                                     if SchoolDay == "D"{
                                                                                         let StartTimeInt = CalendarClasses.max(by: { (a, b) -> Bool in
                                                                                             return a.DayD < b.DayD
                                                                                         })
                                                                                         completion(GivenStartIntGetTimeSchedualLate(StartTimeInt: StartTimeInt!.DayD), .Success)
                                                                                     }
                                                                                 }
                                                                             }
                                                                         }
                                                                     } else {
                                                                         if value == 6{
                                                                             completion("8:30", .Success)
                                                                             return
                                                                         } else {
                                                                             if value == 7{
                                                                                 completion("Exams", .ExamDay)
                                                                                 return
                                                                             }
                                                                         }
                                                                     }
                                                                 }
                                                             }
                                                         }
                                                     } else {
                                                         guard let SchoolDay = data["SchoolDay"] as? String else {
                                                             completion("An error has occurred", .Failure)
                                                             return
                                                         }
                                                         if SchoolDay == "A"{
                                                             let StartTimeInt = CalendarClasses.max(by: { (a, b) -> Bool in
                                                                 return a.DayA < b.DayA
                                                             })
                                                             completion(GivenStartIntGetTimeSchedualOne(StartTimeInt: StartTimeInt!.DayA), .Success)
                                                         } else {
                                                             if SchoolDay == "B"{
                                                                 let StartTimeInt = CalendarClasses.max(by: { (a, b) -> Bool in
                                                                     return a.DayB < b.DayB
                                                                 })
                                                                 completion(GivenStartIntGetTimeSchedualOne(StartTimeInt: StartTimeInt!.DayB), .Success)
                                                             } else {
                                                                 if SchoolDay == "C"{
                                                                     let StartTimeInt = CalendarClasses.max(by: { (a, b) -> Bool in
                                                                         return a.DayC < b.DayC
                                                                     })
                                                                     completion(GivenStartIntGetTimeSchedualOne(StartTimeInt: StartTimeInt!.DayC), .Success)
                                                                 } else {
                                                                     if SchoolDay == "D"{
                                                                         let StartTimeInt = CalendarClasses.max(by: { (a, b) -> Bool in
                                                                             return a.DayD < b.DayD
                                                                         })
                                                                         completion(GivenStartIntGetTimeSchedualOne(StartTimeInt: StartTimeInt!.DayD), .Success)
                                                                     }
                                                                 }
                                                             }
                                                         }
                                                     }
                                                 }
                                             } else {
                                                 completion("No School Today", .NoSchool)
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
                    .fill(Color.blue)
                Text("Please Login")
                    .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
                    .onAppear(){
                        print("Here")
                        print(entry)
                    }
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
            ZStack{
                ContainerRelativeShape()
                    .fill(Color.marron)
                Text(entry.StartString)
                    .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
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
}
