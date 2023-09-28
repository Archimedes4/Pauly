//
//  DayView.tsx
//  Pauly
//
//  Created by Andrew Mainella on 2023-07-21.
//
import { useEffect, useRef, useState } from "react"
import {View, ScrollView, useColorScheme, Text} from "react-native"
import { isDateToday } from "../../Functions/Calendar/calendarFunctions"
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
  const currentEvents = useSelector((state: RootState) => state.currentEvents)
  const selectedDate = useSelector((state: RootState) => state.selectedDate)
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
                    { (calculateIfShowing(value, new Date(JSON.parse(selectedDate)))) ?
                      <View><Text style={{color: (colorScheme == "dark") ? "white":"black"}}>{value}</Text></View>:null
                    }
                    <View style={{backgroundColor: "black", width: width * 0.9, height: 6, position: "absolute", right: 0, borderRadius: 25}} />
                  </View>
                ))}
              </View>:null
            }
          </View>
          <>
            {currentEvents.map((event) => (
              <EventBlock event={event} width={width} height={height} />
            ))}
          </>
          { (new Date(JSON.parse(selectedDate)).getDate() === new Date().getDate() && new Date(JSON.parse(selectedDate)).getMonth() === new Date().getMonth() && new Date(JSON.parse(selectedDate)).getFullYear() === new Date().getFullYear()) ?
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
  const EventHeight = computeEventHeight(new Date(event.startTime), new Date(event.endTime), height)
  const Offset = findTimeOffset(new Date(event.startTime), height)
  return (
    <View style={{width: width * 0.9, height: EventHeight, top: Offset, position: "absolute", right: 0, backgroundColor: event.eventColor, opacity: 0.3}}>
      <Text>{event.name}</Text>
      <Text>{new Date(event.startTime).toISOString()} to {new Date(event.endTime).toISOString()}</Text>
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

//Ryan was here April 13, 2023
//Andrew was here April 13, 2023

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
