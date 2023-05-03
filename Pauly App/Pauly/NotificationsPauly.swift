//
//  NotificationsPauly.swift
//  
//
//  Created by Andrew Mainella on 2023-04-21.
//

import SwiftUI
import FirebaseFirestore
import FirebaseAuth
import UserNotifications

enum APIResult{
    case NotLoggedIn
    case Failure
    case Success
    case NoClasses
    case NoSchool
    case ExamDay
}


struct CalendarCourseTypeNotif{
    let Name: String
    let Semester: Int
    let DayA: Int
    let DayB: Int
    let DayC: Int
    let DayD: Int
    let NoClass: [NoClassType]
    let Year: Int
}



class NotificationsManagerStartDay {
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
                self.GetStartTimePerDay(DayInt: DayInt!, MonthInt: monthInt!, YeatInt: YearInt!){ (Result, Succes, SchoolDay, Schdual, DayOfWeek) in
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
                self.CheckIfSchoolDay(YearInt: YearIntNew!, MonthInt: monthIntNew!, DayInt: DayIntNew!){ DayResult in
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
                        self.GetStartTimePerDay(DayInt: DayInt!, MonthInt: monthInt!, YeatInt: YearInt!){ (Result, Succes, SchoolDay, Schdual, DayOfWeek) in
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
                    var CalendarClasses: [CalendarCourseTypeNotif] = []
                    
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
                                    CalendarClasses.append(CalendarCourseTypeNotif(Name: "\(ClassArray[0])", Semester: Semester!, DayA: DayA!, DayB: DayB!, DayC: DayC!, DayD: DayD!, NoClass: NoClassesOutArray, Year: Year))
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
                                                                             completion(self.GivenStartIntGetTimeSchedualLate(StartTimeInt: StartTimeInt!.DayA), .Success, "A", "Late Start", "")
                                                                         } else {
                                                                             if SchoolDay == "B"{
                                                                                 let StartTimeInt = CalendarClasses.max(by: { (a, b) -> Bool in
                                                                                     return a.DayB > b.DayB
                                                                                 })
                                                                                 completion(self.GivenStartIntGetTimeSchedualLate(StartTimeInt: StartTimeInt!.DayB), .Success, "B", "Late Start", "")
                                                                             } else {
                                                                                 if SchoolDay == "C"{
                                                                                     let StartTimeInt = CalendarClasses.max(by: { (a, b) -> Bool in
                                                                                         return a.DayC > b.DayC
                                                                                     })
                                                                                     completion(self.GivenStartIntGetTimeSchedualLate(StartTimeInt: StartTimeInt!.DayC), .Success, "C", "Late Start", "")
                                                                                 } else {
                                                                                     if SchoolDay == "D"{
                                                                                         let StartTimeInt = CalendarClasses.max(by: { (a, b) -> Bool in
                                                                                             return a.DayD > b.DayD
                                                                                         })
                                                                                         completion(self.GivenStartIntGetTimeSchedualLate(StartTimeInt: StartTimeInt!.DayD), .Success, "D", "Late Start", "")
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
                                                                             completion("8:30", .Success, SchoolDay, "Mass", "")
                                                                             return
                                                                         } else {
                                                                             if value == 7{
                                                                                 completion("Exams", .ExamDay, "", "Exams", "")
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
                                                             completion(self.GivenStartIntGetTimeSchedualOne(StartTimeInt: StartTimeInt!.DayA), .Success, "A", "Schedual One", "")
                                                         } else {
                                                             if SchoolDay == "B"{
                                                                 let StartTimeInt = CalendarClasses.max(by: { (a, b) -> Bool in
                                                                     return a.DayB > b.DayB
                                                                 })
                                                                 completion(self.GivenStartIntGetTimeSchedualOne(StartTimeInt: StartTimeInt!.DayB), .Success, "B", "Schedual One", "")
                                                             } else {
                                                                 if SchoolDay == "C"{
                                                                     let StartTimeInt = CalendarClasses.max(by: { (a, b) -> Bool in
                                                                         return a.DayC > b.DayC
                                                                     })
                                                                     completion(self.GivenStartIntGetTimeSchedualOne(StartTimeInt: StartTimeInt!.DayC), .Success, "C", "Schedual One", "")
                                                                 } else {
                                                                     if SchoolDay == "D"{
                                                                         let StartTimeInt = CalendarClasses.max(by: { (a, b) -> Bool in
                                                                             return a.DayD > b.DayD
                                                                         })
                                                                         completion(self.GivenStartIntGetTimeSchedualOne(StartTimeInt: StartTimeInt!.DayD), .Success, "D", "Schedual One", "")
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
