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

struct Provider: IntentTimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), configuration: ConfigurationIntent(), StartString: "Nope")
    }

    func getSnapshot(for configuration: ConfigurationIntent, in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date(), configuration: configuration, StartString: "Nope")
        completion(entry)
    }

    func getTimeline(for configuration: ConfigurationIntent, in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {

        let date = Date()
        let nextUpdate = Calendar.current.date(byAdding: .day, value: 1, to: date)
        
        // Generate a timeline consisting of five entries an hour apart, starting from the current date.
        let currentDate = Date()
        
        GetStartTime { Time in
            
//            for hourOffset in 0 ..< 5 {
//                let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
//                let entry = SimpleEntry(date: entryDate, configuration: configuration, StartString: Time)
//                entries.append(entry)
//            }
            
            let timeline = Timeline(entries: [SimpleEntry(date: Date.now, configuration: configuration, StartString: Time)], policy: .after(nextUpdate!))
            
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
    func GetStartTime(completion: @escaping (String)->()){
        guard let _ = Auth.auth().currentUser else {
            completion("Your Not Logged In")
            return
        }
        
        let YearInt = Calendar.current.dateComponents([.year], from: Date.now).year
        let monthInt = Calendar.current.dateComponents([.month], from: Date.now).month
        let DayInt = Calendar.current.dateComponents([.day], from: Date.now).day
        
        let db = Firestore.firestore()

        let docRef = db.collection("Calendar").document("\(YearInt!)").collection("\(monthInt!)").document("\(DayInt!)")
        
        docRef.getDocument { (document, error) in
             guard error == nil else {
                 print("error", error ?? "")
                 return
             }

             if let document = document, document.exists {
                 let data = document.data()
                 if let data = data {
                     
                     guard let Useruid = Auth.auth().currentUser?.uid else {
                         completion("Your Not Logged In")
                         return
                     }
                     
                     let UserCoursesRef = db.collection("Users").document(Useruid)
                     
                     docRef.getDocument { (document, error) in
                         guard error == nil else {
                             print("error", error ?? "")
                             return
                         }
                         if let document = document, document.exists {
                             let data = document.data()
                             if let data = data {
                                 guard let Classes = data["Classes"] as? NSArray as? [String] else {
                                     completion("You Don't have any classes")
                                     return
                                 }
                                 guard let Grade = data["Grade"] as? Int else {
                                     completion("An error has occured. Pauly can't find which grade your in.")
                                     return
                                 }
                                 var CalendarClasses: [CalendarCourseType] = []
                                 
                                 for x in Classes{
                                     Task{
                                         let db = FirebaseFirestore.Firestore.firestore()
                                 
                                         let ClassArray = x.split(separator: "-")
                                         
                                         let docRef = db.collection("Grade\(Grade)").document("\(ClassArray[0])").collection("Sections").document("\(ClassArray[1])-\(ClassArray[2])")
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
                                                 }
                                             }
                                         }
                                         
                                         let docRefClass = db.collection("Calendar").document("\(YearInt!)").collection("\(monthInt!)").document("\(DayInt!)")
                                         
                                         let value = data["value"] as? Int
                                         if let value {
                                             if value == 1{
                                                 completion("No School")
                                                 return
                                             } else {
                                                 if value == 2{
                                                     completion("No School")
                                                     return
                                                 } else {
                                                     if value == 3 || value == 4{
                                                         guard let SchoolDay = data["SchoolDay"] as? String else {
                                                             completion("An error has occurred")
                                                             return
                                                         }
                                                         if SchoolDay == "A"{
                                                             let StartTimeInt = CalendarClasses.max(by: { (a, b) -> Bool in
                                                                 return a.DayA < b.DayA
                                                             })
                                                             completion(GivenStartIntGetTimeSchedualDismissal(StartTimeInt: StartTimeInt!.DayA))
                                                         } else {
                                                             if SchoolDay == "B"{
                                                                 let StartTimeInt = CalendarClasses.max(by: { (a, b) -> Bool in
                                                                     return a.DayB < b.DayB
                                                                 })
                                                                 completion(GivenStartIntGetTimeSchedualDismissal(StartTimeInt: StartTimeInt!.DayB))
                                                             } else {
                                                                 if SchoolDay == "C"{
                                                                     let StartTimeInt = CalendarClasses.max(by: { (a, b) -> Bool in
                                                                         return a.DayC < b.DayC
                                                                     })
                                                                     completion(GivenStartIntGetTimeSchedualDismissal(StartTimeInt: StartTimeInt!.DayC))
                                                                 } else {
                                                                     if SchoolDay == "D"{
                                                                         let StartTimeInt = CalendarClasses.max(by: { (a, b) -> Bool in
                                                                             return a.DayD < b.DayD
                                                                         })
                                                                         completion(GivenStartIntGetTimeSchedualDismissal(StartTimeInt: StartTimeInt!.DayD))
                                                                     }
                                                                 }
                                                             }
                                                         }
                                                     } else {
                                                         if value == 5{
                                                             guard let SchoolDay = data["SchoolDay"] as? String else {
                                                                 completion("An error has occurred")
                                                                 return
                                                             }
                                                             if SchoolDay == "A"{
                                                                 let StartTimeInt = CalendarClasses.max(by: { (a, b) -> Bool in
                                                                     return a.DayA < b.DayA
                                                                 })
                                                                 completion(GivenStartIntGetTimeSchedualLate(StartTimeInt: StartTimeInt!.DayA))
                                                             } else {
                                                                 if SchoolDay == "B"{
                                                                     let StartTimeInt = CalendarClasses.max(by: { (a, b) -> Bool in
                                                                         return a.DayB < b.DayB
                                                                     })
                                                                     completion(GivenStartIntGetTimeSchedualLate(StartTimeInt: StartTimeInt!.DayB))
                                                                 } else {
                                                                     if SchoolDay == "C"{
                                                                         let StartTimeInt = CalendarClasses.max(by: { (a, b) -> Bool in
                                                                             return a.DayC < b.DayC
                                                                         })
                                                                         completion(GivenStartIntGetTimeSchedualLate(StartTimeInt: StartTimeInt!.DayC))
                                                                     } else {
                                                                         if SchoolDay == "D"{
                                                                             let StartTimeInt = CalendarClasses.max(by: { (a, b) -> Bool in
                                                                                 return a.DayD < b.DayD
                                                                             })
                                                                             completion(GivenStartIntGetTimeSchedualLate(StartTimeInt: StartTimeInt!.DayD))
                                                                         }
                                                                     }
                                                                 }
                                                             }
                                                         } else {
                                                             if value == 6{
                                                                 completion("8:30")
                                                                 return
                                                             } else {
                                                                 if value == 7{
                                                                     completion("Exams")
                                                                     return
                                                                 }
                                                             }
                                                         }
                                                     }
                                                 }
                                             }
                                         } else {
                                             guard let SchoolDay = data["SchoolDay"] as? String else {
                                                 completion("An error has occurred")
                                                 return
                                             }
                                             if SchoolDay == "A"{
                                                 let StartTimeInt = CalendarClasses.max(by: { (a, b) -> Bool in
                                                     return a.DayA < b.DayA
                                                 })
                                                 completion(GivenStartIntGetTimeSchedualOne(StartTimeInt: StartTimeInt!.DayA))
                                             } else {
                                                 if SchoolDay == "B"{
                                                     let StartTimeInt = CalendarClasses.max(by: { (a, b) -> Bool in
                                                         return a.DayB < b.DayB
                                                     })
                                                     completion(GivenStartIntGetTimeSchedualOne(StartTimeInt: StartTimeInt!.DayB))
                                                 } else {
                                                     if SchoolDay == "C"{
                                                         let StartTimeInt = CalendarClasses.max(by: { (a, b) -> Bool in
                                                             return a.DayC < b.DayC
                                                         })
                                                         completion(GivenStartIntGetTimeSchedualOne(StartTimeInt: StartTimeInt!.DayC))
                                                     } else {
                                                         if SchoolDay == "D"{
                                                             let StartTimeInt = CalendarClasses.max(by: { (a, b) -> Bool in
                                                                 return a.DayD < b.DayD
                                                             })
                                                             completion(GivenStartIntGetTimeSchedualOne(StartTimeInt: StartTimeInt!.DayD))
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
                 }
             } else {
                 completion("No School Today")
             }
         }
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let configuration: ConfigurationIntent
    let StartString: String
}

struct PaulyWidgetEntryView : View {
    var entry: Provider.Entry

    var body: some View {
        ZStack{
            ContainerRelativeShape()
                .fill(.gray)
            VStack{
                Text("Start")
                Text(entry.StartString)
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
