//
//  DayView.tsx
//  Pauly
//
//  Created by Andrew Mainella on 2023-07-21.
//
import { useEffect, useRef, useState } from "react"
import {View, ScrollView, useColorScheme, Text} from "react-native"
import { getEventFromJSON, isDateToday } from "../../Functions/Calendar/calendarFunctions"
import { useSelector } from "react-redux"
import { RootState } from "../../Redux/store"
import create_UUID from "../../Functions/Ultility/CreateUUID"
import React from "react"

declare global {
  type calendarCourseType = {
    name: String
    semester: number
    dayA: number
    dayB: number
    dayC: number
    dayD: number
    noClass: noClassType[]
    year: number
    assignments: assignmentTypeQuiz[]
  }
  type noClassType = {
    day: number
    Month: number
    Year: number
  }
  type assignmentTypeQuiz = {
    id: string
    title: string
    description: string
    assignmentEnum: number
    documentRef: string
    assignmentDuringClass: boolean
    selectedMonth?: number
    selectedDay?: number
    dueDate?: Date
  }
}

export default function DayView({width, height}:{width: number, height: number}) {
  const colorScheme = useColorScheme();
  const fullStore = useSelector((state: RootState) => state)
  const [heightOffsetTop, setHeightOffsetTop] = useState<number>(0)
  const [currentMinuteInt, setCurrentMinuteInt] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<string>("12:00")
  const [isShowingTime, setIsShowingTime] = useState<boolean>(true)
  const [hourLength, setHourLength] = useState<number>(0)
  const hoursText: string[] = ["12AM", "1AM", "2AM", "3AM", "4AM", "5AM", "6AM", "7AM", "8AM", "9AM", "10AM", "11AM", "12PM", "1PM", "2PM", "3PM", "4PM", "5PM", "6PM", "7PM", "8PM", "9PM","10PM", "11PM"]
  const mainScrollRef = useRef<ScrollView>(null)

  function setCurrentTimeFunction(hour: number, minuite: number){
    if (minuite.toString().length == 1) {
      if (hour == 12) {
        setCurrentTime("12:0"+minuite.toString())
      } else {
        setCurrentTime((hour % 12).toString() + ":0" + minuite.toString())
      }
    } else {
      if (hour == 12) {
        setCurrentTime("12:"+minuite)
      } else {
        setCurrentTime((hour % 12).toString() + ":" + minuite.toString())
      }
    }
  }

  function loadCalendarContent() {
    //GetStudentSchedule()
    const currentDate = new Date
    const resultHeightTopOffset = findTimeOffset(currentDate, height)
    setHeightOffsetTop(resultHeightTopOffset)
    const minuiteInt: number = currentDate.getMinutes()
    setCurrentMinuteInt(minuiteInt)
    const hourInt = currentDate.getHours()
    setCurrentTimeFunction(hourInt, minuiteInt)
    mainScrollRef.current?.scrollTo({ x: 0, y: resultHeightTopOffset, animated: false});
    console.log("This", resultHeightTopOffset)
    // if (heightOffsetTop >= height){
    //     setScrollPosition(height)
    //     mainScrollRef.current?.scrollTo({ x: 0, y: height, animated: true });
    // } else {
    //     setScrollPosition(heightOffsetTop)
    // }
  }

  //https://stackoverflow.com/questions/65049812/how-to-call-a-function-every-minute-in-a-react-component
  //Upadtes every second
  useEffect(() => {
    const interval = setInterval(() => {
      updateOnTimeChange()
    }, 1000);

    return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
  }, [])
  function updateOnTimeChange() {
    let minuiteInt = new Date().getMinutes()
    if (currentMinuteInt != minuiteInt!) {
      setCurrentMinuteInt(minuiteInt)
      
      let hourInt = new Date().getHours()
      if (minuiteInt.toString().length == 1){
        setCurrentTimeFunction(hourInt, minuiteInt)
      } else {
        setCurrentTimeFunction(hourInt, minuiteInt)
      }
      setHeightOffsetTop(findTimeOffset(new Date, height))
    }
  }

  useEffect(() => {
    setHourLength(height * 0.1)
    loadCalendarContent()
  }, [])

  // useEffect(() => {
  //     findDateProperty(selectedDay)
  // }, [selectedDay])

  return (
    <ScrollView style={{height: height, width: width, backgroundColor: "white"}} ref={mainScrollRef}>
        <View>
            <View>
              { isShowingTime ?
                <View>
                  {hoursText.map((value) => (
                    <View key={value+"_"+create_UUID()} style={{flexDirection: "row", height: hourLength}}>
                      { (calculateIfShowing(value, new Date(JSON.parse(fullStore.selectedDate)))) ?
                        <View><Text style={{color: (colorScheme == "dark") ? "white":"black"}}>{value}</Text></View>:null
                      }
                      <View style={{backgroundColor: "black", width: width * 0.9, height: 6, position: "absolute", right: 0, borderRadius: 25}} />
                    </View>
                  ))}
                </View>:null
              }
            </View>
            <>
              {fullStore.currentEvents.map((event) => (
                <EventBlock event={getEventFromJSON(event)} width={width} height={height} />
              ))}
            </>
            { (new Date(JSON.parse(fullStore.selectedDate)).getDate() === new Date().getDate() && new Date(JSON.parse(fullStore.selectedDate)).getMonth() === new Date().getMonth() && new Date(JSON.parse(fullStore.selectedDate)).getFullYear() === new Date().getFullYear()) ?
              <View style={{position: "absolute", top: heightOffsetTop, height: height * 0.005, width: width, flexDirection: "row", alignItems: "center"}}>
                <Text style={{color: "red", zIndex: 2}}>{currentTime}</Text>
                <View style={{backgroundColor: "red", width: width * 0.914, height: 6, position: "absolute", right: 0}}/>                       
              </View>:null
            }   
        </View>
    </ScrollView>
  )
}

function EventBlock({event, width, height}:{event: eventType, width: number, height: number}) {
  const EventHeight = computeEventHeight(event.startTime, event.endTime, height)
  const Offset = findTimeOffset(event.startTime, height)
  return (
    <View style={{width: width * 0.8, height: EventHeight, top: Offset, position: "absolute", marginLeft: width * 0.2, backgroundColor: event.eventColor, opacity: 0.6}}>
      <Text>{event.name}</Text>
      <Text>{event.startTime.toISOString()} to {event.endTime.toISOString()}</Text>
    </View>
  )
}

function calculateIfShowing(value: String, Time: Date): boolean { //TO DO shorten
  if (isDateToday(Time)) {
    const hourInt = Time.getHours()
    const minuiteInt = Time.getMinutes()
    if (minuiteInt + 15 >= 60){
      var resepctiveTime: string = "" + (hourInt > 12) ? (hourInt - 12).toString():hourInt.toString()
      resepctiveTime += (hourInt > 12) ? "PM":"AM"
      if (resepctiveTime === value){
        return false
      } else {
        return true
      }
    } else if (minuiteInt - 15 <= 0) {
      var resepctiveTime: string = "" + (hourInt > 12) ? (hourInt - 12).toString():hourInt.toString()
      resepctiveTime += (hourInt > 12) ? "PM":"AM"
      if (resepctiveTime === value){
        return false
      } else {
        return true
      }
    } else {
      return true
    }
  } else {
    return true
  }
}

function findTimeOffset(time: Date, height: number): number {
    let hourWidth = height * 0.1
    let minutieWidth = (height * 0.1)/60
    let hourInt = time.getHours() 
    let minuiteInt = time.getMinutes()
    var returnOffset = (hourWidth * hourInt) + (minutieWidth * minuiteInt)
    // + (hourWidth/2)
    return returnOffset
}

function FindPeriod(classCourse: calendarCourseType, day: string): number{
    var PeriodInt = 0
    if (day == "A") {
        PeriodInt = classCourse.dayA
    } else {
        if (day == "B") {
            PeriodInt = classCourse.dayB
        } else {
            if (day == "C"){
                PeriodInt = classCourse.dayC
            } else {
                if (day == "D") {
                    PeriodInt = classCourse.dayD
                }
            }
        }
    }
    return PeriodInt
}

//Ryan was here April 13, 2023
//Andrew was here April 13, 2023

function getEventColor(monthInt: number, dayInt: number, Class: calendarCourseType): string {
    var colorResult = "white"
    for(let index = 0; index < Class.assignments.length; index++) {
        const x = Class.assignments[index]
        if (x.assignmentDuringClass) {
            if (x.selectedMonth! == monthInt) {
                if (x.selectedDay! == dayInt) {
                    if (x.assignmentEnum == 0) {
                        return "purple"
                    } else if (x.assignmentEnum == 1) {
                        return "red"
                    } else if (x.assignmentEnum == 2) {
                        return "yellow"
                    } else if (x.assignmentEnum == 3) {
                        return "orange"
                    } else if (x.assignmentEnum == 4) {
                        return "blue"
                    } else {
                         return "green"
                    }
                }
            }
        }
    }
    return colorResult
}

function computeEventHeight(fromDate: Date, toDate: Date, height: number): number {
  var delta = toDate.getTime() - fromDate.getTime()
  if (delta >= 86400000) {
    delta = 86400000
  }

  let deltaHours = delta/3600000
  let deltaRemaining = delta % 3600000
  let deltaMinutes = deltaRemaining / 60
  
  const HourHeight = height * 0.1
  const MinuteHeight = (height * 0.1)/60

  let ReturnOffset = (HourHeight * deltaHours) + (MinuteHeight * deltaMinutes)
  return ReturnOffset
}

function findOffsetEvent(time: Date, height: number): number{
    let hourWidth = height * 0.1
    let minutieWidth = (height * 0.1) / 60
    
    let HourInt = time.getHours()
    let MinuiteInt = time.getMinutes()
    let ReturnOffset = (hourWidth * HourInt) + (minutieWidth * MinuiteInt!) + (hourWidth / 2)
    return ReturnOffset
}


//TO DO LATER

// function GetAssignments(Grade: Int, Name:String, Section:Int, Year: Int?, completetion: @escaping ([AssignmentTypeQuiz]) -> ()) {
//     var YearVar = Year
//     let db = Firestore.firestore()
    
//     var docRef = db.collection("Info")
//     if Section == 0{
//         docRef = db.collection("Grade\(Grade)Courses").document("\(Name)").collection("Sections").document("\(Section)").collection("Assignment")
//     } else {
//         docRef = db.collection("Grade\(Grade)Courses").document("\(Name)").collection("Sections").document("\(Section)-\(Year!)").collection("Assignment")
//     }
    
//     var AssignmentTypeArray: [AssignmentTypeQuiz] = []
    
//     if Year == nil{
//         YearVar = 0
//     }
    
//     docRef.getDocuments() { (querySnapshot, error) in
//         if let error = error {
//             print("Error getting documents: \(error)")
//         } else {
//             for document in querySnapshot!.documents {
//                 let data = document.data()
//                 print(data)
//                  guard let AssignmentTitle = data["Title"] as? String else {
//                      return
//                  }
//                  guard let AssignmnetDescription = data["Description"] as? String else {
//                      print("Description")
//                      return
//                  }
//                  guard let AssignmentEnum = data["AssignmentType"] as? Int else {
//                      print("Type")
//                      return
//                  }
//                 guard let AssignmentDuringClass = data["AssignmentDuringClass"] as? Bool else {
//                     print("During Class")
//                     return
//                 }
//                 let documentID = document.documentID
//                 if AssignmentDuringClass{
//                     guard let AssignmentMonth = data["Month"] as? Int else {
//                         return
//                     }
//                     guard let AssignmentDay = data["Day"] as? Int else {
//                         return
//                     }
//                     AssignmentTypeArray.append(AssignmentTypeQuiz(Title: AssignmentTitle, Description: AssignmnetDescription, DueDate: nil, AssignmentEnum: AssignmentEnum, DocumentRef: documentID, Class: CourseSelectedType(Name: Name, Section: Section, Year: YearVar!, Grade: Grade), AssignmentDuringClass: AssignmentDuringClass, SelectedMonth: AssignmentMonth, SelectedDay: AssignmentDay))
//                 } else {
//                     guard let AssignmentDueDateTime = data["DueDate"] as? Timestamp else {
//                         return
//                     }
//                     let AssignmentDueDate = AssignmentDueDateTime.dateValue()
//                     AssignmentTypeArray.append(AssignmentTypeQuiz(Title: AssignmentTitle, Description: AssignmnetDescription, DueDate: AssignmentDueDate, AssignmentEnum: AssignmentEnum, DocumentRef: documentID, Class: CourseSelectedType(Name: Name, Section: Section, Year: YearVar!, Grade: Grade), AssignmentDuringClass: AssignmentDuringClass, SelectedMonth: nil, SelectedDay: nil))
//                 }
//             }
//             completetion(AssignmentTypeArray)
//         }
//     }
// }


// function getStudentSchedule() {
//     if (WindowMode.TimesRecieved == false) {
//         var CurrentIndex: Int = 0
//         for x in WindowMode.SelectedCourses{
//             CurrentIndex += 1
//             let db = FirebaseFirestore.Firestore.firestore()
    
//             let docRef = db.collection("Grade\(x.Grade)Courses").document(x.Name).collection("Sections").document("\(x.Section)-\(x.Year)")
            
//             docRef.getDocument { (document, error) in
//                 guard error == nil else {
//                     print("error", error ?? "")
//                     return
//                 }

//                 if let document = document, document.exists {
//                     let data = document.data()
//                     if let data = data {
//                         let Semester = data["Semester"] as? Int
//                         guard let DayA = data["DayA"] as? Int else{
//                             return
//                         }
//                         guard let DayB = data["DayB"] as? Int else {
//                             return
//                         }
//                         guard let DayC = data["DayC"] as? Int else {
//                             return
//                         }
//                         guard let DayD = data["DayD"] as? Int else {
//                             return
//                         }
//                         let NoClass = data["NoClass"] as! NSArray as? [String]
//                         let Year = data["School Year"] as? Int ?? 2020
//                         var NoClassesOutArray: [NoClassType] = []
//                         if NoClass != nil{
//                             for l in NoClass!{
//                                 let Output = l.split(separator: "-")
//                                 NoClassesOutArray.append(NoClassType(Day: Int(Output[0])!, Month: Int(Output[1])!, Year: Int(Output[2])!))
//                             }
//                         }
//                         GetAssignments(Grade: x.Grade, Name: x.Name, Section: x.Section, Year: x.Year){ assignmentIN in
//                             CalendarClasses.append(CalendarCourseType(Name: x.Name, Semester: Semester!, DayA: DayA, DayB: DayB, DayC: DayC, DayD: DayD, NoClass: NoClassesOutArray, Year: Year, Assignments: assignmentIN))
//                             if CurrentIndex == WindowMode.SelectedCourses.count{
//                                 FindDateProperty(Time: SelectedDay)
//                                 print("This is date propertry \(CurrentEvents)")
//                             }
//                         }
//                     }
//                 }
//             }
//         }
//     }
// }

// function findDateProperty(time: Date){
//     let YearInt = time.getFullYear()
//     let monthInt = time.getMonth()
//     try {
//         var newSelectedDate: DateProperty[] = []
        
//         let docRef = db.collection("Calendar").document("\(YearInt!)").collection("\(monthInt!)")
//         docRef.getDocuments { (snapshot, error) in
//             guard let snapshot = snapshot, error == nil else {
//              //handle error
//              return
//            }

//            snapshot.documents.forEach({ (documentSnapshot) in
//                 let documentData = documentSnapshot.data()
//                 let day = documentData["Day"] as? Int
//                 if day != nil{
//                     let value = documentData["value"] as? Int
//                     let SchoolDay = documentData["SchoolDay"] as? String
//                     if value != nil{
//                         if value == 1{
//                             NewSelectedDate.append({Date: day!, ColorName: "#ce0909", SchoolDay: SchoolDay, Value: 1})
//                         } else if value == 2{
//                             NewSelectedDate.append({Date: day!, ColorName: "#762e05", SchoolDay: SchoolDay, Value: 2}) 
//                         } else if value == 3{
//                             NewSelectedDate.append({Date: day!, ColorName: "#9309ce", SchoolDay: SchoolDay, Value: 3})
//                         } else if value == 4{
//                             NewSelectedDate.append({Date: day!, ColorName: "#05760e", SchoolDay: SchoolDay, Value: 4})                                     
//                         } else if (value == 5){
//                             NewSelectedDate.append({Date: day!, ColorName: "#f6c72c", SchoolDay: SchoolDay, Value: 5})
//                         } else if value == 6{
//                             NewSelectedDate.append({Date: day!, ColorName: "#2c47f6", SchoolDay: SchoolDay, Value: 6})
//                         } else if value == 7{
//                             NewSelectedDate.append({Date: day!, ColorName: "#f62cce", SchoolDay: SchoolDay, Value: 7})
//                         }
//                     } else {
//                         let SchoolDay = documentData["SchoolDay"] as? String
//                         NewSelectedDate.append({Date: day!, ColorName: nil, SchoolDay: SchoolDay, Value: nil})
//                     }
                   
//                 }
//            })
//             CurrentEvents = []
//             let DayInt = Calendar.current.dateComponents([.day], from: Time).day
//             if let CurrentDayProperty = NewSelectedDate.first(where: { $0.Date == DayInt }){
//                 if CurrentDayProperty.SchoolDay != nil{
//                     for o in CalendarClasses{
//                         if o.Year == YearInt{
//                             if monthInt! >= 2 && monthInt! <= 8{
//                                 if o.Semester == 2{
//                                     if o.NoClass.contains(where: { $0.Day == DayInt && $0.Month == monthInt && $0.Year == YearInt }){
//                                         continue
//                                     } else {
//                                         let PeriodInt = FindPeriod(Class: o, Day: CurrentDayProperty.SchoolDay!)
//                                         let OutputIntTimes = FindStartHourMinute(PeriodInt: PeriodInt, Schedule: CurrentDayProperty.Value)
//                                         let StartDate = GetDate(OutputIntTimes.0, OutputIntTimes.1, Time: Time)
//                                         let EndDate = GetDate(OutputIntTimes.2, OutputIntTimes.3, Time: Time)
//                                         let EventColor = GetEventColor(MonthInt: monthInt!, DayInt: DayInt!, Class: o)
//                                         CurrentEvents.append(EventType(Name: o.Name, StartTime: StartDate, EndTime: EndDate, EventColor: EventColor))
//                                     }
//                                 }
//                             } else {
//                                 if o.Semester == 1{
//                                     if o.NoClass.contains(where: { $0.Day != DayInt && $0.Month != monthInt && $0.Year != YearInt }){
//                                         continue
//                                     } else {
//                                         let PeriodInt = FindPeriod(Class: o, Day: CurrentDayProperty.SchoolDay!)
//                                         let OutputIntTimes = FindStartHourMinute(PeriodInt: PeriodInt, Schedule: CurrentDayProperty.Value)
//                                         let StartDate = GetDate(Hour: OutputIntTimes.0, Minute: OutputIntTimes.1, Time: Time)
//                                         let EndDate = GetDate(Hour: OutputIntTimes.2, Minute: OutputIntTimes.3, Time: Time)
//                                         let EventColor = GetEventColor(MonthInt: monthInt!, DayInt: DayInt!, Class: o)
//                                         CurrentEvents.append(EventType(Name: o.Name, StartTime: StartDate, EndTime: EndDate, EventColor: EventColor))
//                                     }
//                                 }
//                             }
//                         }
//                     }
//                 }
//             }
//         }
//     } catch {
//         print("Error")
//     }
// }

// function getDate(hour: number, minute: number, Time: Date): Date {
//     // Specify date components
//     var dateComponents = DateComponents()
//     dateComponents.year =  Calendar.current.dateComponents([.year], from: Time).year
//     dateComponents.month = Calendar.current.dateComponents([.month], from: Time).month
//     dateComponents.day = Calendar.current.dateComponents([.day], from: Time).day
//     dateComponents.timeZone = TimeZone(abbreviation: "CDT")
//     dateComponents.hour = Hour
//     dateComponents.minute = Minute

//     // Create date from components
//     let userCalendar = Calendar(identifier: .gregorian) // since the components above (like year 1980) are for Gregorian
//     let someDateTime = userCalendar.date(from: dateComponents)
//     return someDateTime!
// }