//
//  CalendarEventsView.swift
//  Pauly
//
//  Created by Andrew Mainella on 2023-04-18.
//

import SwiftUI
import FirebaseFirestore

struct CalendarEventsView: View{
    @EnvironmentObject var WindowMode: SelectedWindowMode
    @State var CurrentEvents: [EventType] = []
    @State var CalendarClasses: [CalendarCourseType] = []
    @Binding var SelectedDay: Date
    @State var PageLoading: Bool = true
    var body: some View{
        VStack{
            if PageLoading{
                Spacer()
                ProgressView()
                    .onAppear(){
                        print(CurrentEvents)
                        GetStudentSchedual()
                    }
                Spacer()
            } else {
                ScrollView{
                    VStack{
                        ForEach(CurrentEvents, id: \.id){ event in
                            VStack{
                                HStack{
                                    Text("\(event.Name)")
                                        .foregroundColor(.black)
                                    Spacer()
                                }
                                HStack{
                                    Text("\(event.StartTime, style: .time) to \(event.EndTime, style: .time)")
                                        .foregroundColor(.black)
                                    Spacer()
                                }
                            }
                            .padding()
                            .background(
                                RoundedRectangle(cornerRadius: 15)
                                    .fill(Color.white)
                                    .shadow(color: .gray, radius: 2, x: 0, y: 2)
                            )
                            .padding()
                        }
                    }
                    .onChange(of: SelectedDay){ value in
                        CurrentEvents = []
                        CalendarClasses = []
                        GetStudentSchedual()
                    }
                }
            }
        }
    }
//    func GetResult(SelectedEvent: EventType) -> Bool {
//        let CurrentDay = Calendar.current.dateComponents([.day], from: SelectedDay).day
//        let EventDay = Calendar.current.dateComponents([.day], from: SelectedEvent.StartTime).day
//        if CurrentDay == EventDay{
//            return true
//        } else {
//            return false
//        }
//    }
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
                                    PageLoading = false
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
