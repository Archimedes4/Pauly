import { View, Text, Dimensions, Pressable, TextInput } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-native'
import NavBarComponent from '../../UI/NavComponent'
import callMsGraph from '../../Functions/microsoftAssets';
import { accessTokenContent } from '../../../App';
import {Svg, Path, Circle} from 'react-native-svg';
import { findFirstDayinMonth, getDaysInMonth } from '../../Functions/calendarFunctions';
import create_UUID from '../../Functions/CreateUUID';
import ChevronLeft from '../../UI/ChevronLeft';
import ChevronRight from '../../UI/ChevronRight';
import DayView from "./DayView"
import Week from './Week';
import DatePicker from '../../UI/DateTimePicker/DatePicker';

const windowDimensions = Dimensions.get('window');
const screenDimensions = Dimensions.get('screen');

enum calendarMode {
  day,
  week,
  month
}
declare global {
  type monthDataType = {
    id: string
    showing: boolean
    dayData: String
  }
}

const monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];

export default function Calendar({governmentMode}:{governmentMode: boolean}) {
  const microsoftAccessToken = useContext(accessTokenContent);
  const [selectedCalendarMode, setSelectedCalendarMode] = useState<calendarMode>(calendarMode.month)
  const [isShowingAddDate, setIsShowingAddDate] = useState<boolean>(false)
  const [dimensions, setDimensions] = useState({
    window: windowDimensions,
    screen: screenDimensions,
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date)

  useEffect(() => {
      const subscription = Dimensions.addEventListener(
        'change',
        ({window, screen}) => {
          setDimensions({window, screen});
        },
      );
      return () => subscription?.remove();
  });

  async function getCalendars(){
    const result = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/me/calendars")
    console.log(result)
    const data = await result.json()
    console.log(data)
  }

  useEffect(() => {
    getCalendars()
  }, [])

  return (
    <View>
      <View style={{height: dimensions.window.height * 0.1, backgroundColor: '#444444'}}>
        <View style={{flexDirection: "row"}}>
          { (dimensions.window.width > 576) ?
            null:<Link to="/">
              <View style={{flexDirection: "row"}}>
                <ChevronLeft />
                <Text>Back</Text>
              </View>
            </Link>
          } 
          <Text>Calendar</Text>
        </View>
        <View style={{flexDirection: "row"}}>
          <Pressable onPress={() => {
            setSelectedCalendarMode(calendarMode.month)
          }}>
            <Text>Month</Text>
          </Pressable>
          <Pressable onPress={() => {
            setSelectedCalendarMode(calendarMode.week)
          }}>
            <Text>Week</Text>
          </Pressable>
          <Pressable onPress={() => {
            setSelectedCalendarMode(calendarMode.day)
          }}>
            <Text>Day</Text>
          </Pressable>
        </View>
        <Pressable onPress={() => {
          setIsShowingAddDate(true)
        }}>
          <Text>+</Text>
        </Pressable>
      </View> 
      <View style={{height: dimensions.window.height * 0.9}}>
      { (selectedCalendarMode === calendarMode.month) ?
        <MonthViewMain width={microsoftAccessToken.dimensions.window.width * 0.8} height={dimensions.window.height * 0.9} selectedDate={selectedDate} setSelectedDate={setSelectedDate}/>: null
      }
      { (selectedCalendarMode === calendarMode.week) ?
        <Week width={microsoftAccessToken.dimensions.window.width * 0.8} height={dimensions.window.height * 0.9}/>:null
      }
      { (selectedCalendarMode === calendarMode.day) ?
        <DayView width={microsoftAccessToken.dimensions.window.width * 0.8} height={dimensions.window.height * 0.9} selectedDate={selectedDate} />:null
      }
      </View>
      { isShowingAddDate ?
        <View style={{zIndex: 2, position: "absolute", left: microsoftAccessToken.dimensions.window.width * 0.2, top: microsoftAccessToken.dimensions.window.height * 0.1}}>
          <AddEvent setIsShowingAddDate={setIsShowingAddDate} width={microsoftAccessToken.dimensions.window.width * 0.6} height={microsoftAccessToken.dimensions.window.height * 0.8}/>
        </View>:null
      }
    </View>
  )
}

function AddEvent({setIsShowingAddDate, width, height}:{setIsShowingAddDate: (item: boolean) => void, width: number, height: number}) {
  const [eventName, setEventName] = useState("")
  const [isPickingStartDate, setIsPickingStartDate] = useState<boolean>(false)
  const [isPickingEndDate, setIsPickingEndDate] = useState<boolean>(false)
  const [startDate, setStartDate] = useState<Date>(new Date)
  const [endDate, setEndDate] = useState<Date>(new Date)
  return (
    <View style={{backgroundColor: "white", width: width, height: height}}>
      { (isPickingStartDate || isPickingEndDate) ?
        <DatePicker selectedDate={isPickingStartDate ? startDate:endDate} onSetSelectedDate={(e) => {if (isPickingStartDate) {setStartDate(e); setIsPickingStartDate(false)} else {setEndDate(e);setIsPickingEndDate(false)}}} width={width} height={height}/>:
        <View>
          <Text>Add Event</Text>
          <Text>Event Name:</Text>
          <TextInput
            value={eventName}
            onChangeText={setEventName}
          />
          <Text>Start Date</Text>
          <Text>{startDate.toISOString()}</Text>
          <Pressable onPress={() => {setIsPickingStartDate(true)}}>
            <Text>Pick Start Date</Text>
          </Pressable>
          <Text>End Date</Text>
          <Text>{endDate.toISOString()}</Text>
          <Pressable onPress={() => {setIsPickingEndDate(true)}}>
            <Text>Pick End Date</Text>
          </Pressable>
          <Pressable onPress={() => {setIsShowingAddDate(false)}}>
            <Text>Create</Text>
          </Pressable>
        </View>
      }
    </View>
  )
}

function MonthViewMain({width, height, selectedDate, setSelectedDate}:{width: number, height: number, selectedDate: Date, setSelectedDate: (item: Date) => void}) {
  const [year, setYear] = useState<number>(2020)
  const [month, setMonth] = useState<string>("January")
  const [startDate, setStartDate] = useState<number>(0)
  const nowDay = new Date().getDay()
  const nowMonth = new Date().getMonth()
  const nowYear = new Date().getFullYear()
  const [monthData, setMonthData] = useState<monthDataType[]>([])
  const daysInWeek: String[] = ["Sat", "Mon", "Tue", "Wen", "Thu", "Fri", "Sun"]
  
  function getMonthData(selectedDate: Date) {
    setYear(selectedDate.getFullYear())
    setStartDate(findFirstDayinMonth(selectedDate))
    setMonth(monthNames[selectedDate.getMonth()])
    const numberOfDaysInMonth = getDaysInMonth(selectedDate)
    var daySelected = 0
    if (startDate >= 1) {
      daySelected = (numberOfDaysInMonth + startDate)
    } else {
      daySelected = (numberOfDaysInMonth + startDate - 1)
    }
    var monthDataResult: monthDataType[] = []
    for (let index = 0; index < 42; index++) {
      console.log("Day Selected", daySelected, "StartDate", startDate, "Number of days in month", numberOfDaysInMonth, "First Condition:", (index >= (startDate - 1)), "Second Condition", (index <= (daySelected - 2)))
      if (index >= (startDate - 1) && index <= (daySelected - 2)) {
        monthDataResult.push({showing: true, dayData: "" + (index - startDate + 2), id: create_UUID()})
      } else {
        monthDataResult.push({showing: false, dayData: "", id: create_UUID()})
      }
    }
    console.log("this is month data", monthDataResult)
    setMonthData(monthDataResult)
  }

  useEffect(() => {
    getMonthData(selectedDate)
  }, [selectedDate])

  return (
    <View style={{backgroundColor: "#793033"}}>
      <View style={{height: height/8, width: width}}>
        <View>
          <Text>{year.toString()}</Text>{/*leading, white*/}
        </View>
        <View style={{flexDirection: "row"}}>
          <View style={{width: width * 0.2}}>
            <Text>{month}</Text>{/*leading, title, white*/}
          </View>
          <View>
            {(year != nowYear || selectedDate.getMonth() != nowMonth) ?
              <View style={{width: width * 0.2}}>
                <Pressable onPress={() => {setSelectedDate(new Date)}}>
                  <Text style={{color: "white"}}>Today</Text>
                </Pressable>
              </View>:<View style={{width: width * 0.2}}></View>
            }
          </View>
          {/*This is left chevron*/}
          <Pressable onPress={() => {
            const d = new Date();
            d.setFullYear((selectedDate.getMonth() === 1) ? selectedDate.getFullYear() - 1:selectedDate.getFullYear(), (selectedDate.getMonth() === 1) ? 12:selectedDate.getMonth() - 1, selectedDate.getDay());
            setSelectedDate(d)
          }} >
            <ChevronLeft />
          </Pressable>
          {/*This is right chevron*/}
          <Pressable onPress={() => {
            const d = new Date();
            d.setFullYear((selectedDate.getMonth() === 12) ? selectedDate.getFullYear() + 1:selectedDate.getFullYear(), (selectedDate.getMonth() === 12) ? 1:selectedDate.getMonth() + 1, selectedDate.getDay());
            setSelectedDate(d)
          }}>
            <ChevronRight />
          </Pressable>
        </View>
      </View>
      <View style={{width: width}}>
        <View style={{flexDirection: "row"}}>
          {daysInWeek.map((DOW) => (
            <View style={{width: width/7, height: height/8}}>
              <Text style={{color: "white"}}>{DOW}</Text>
            </View>
          ))}
        </View>
          <View>
            { Array.from(Array(7).keys()).map((valueRow) => (
              <View style={{flexDirection: "row"}}>
                { monthData.map((value, id) => (
                  <View>
                    { (id >= valueRow * 7 && id <= valueRow * 7 + 6) ?
                      <Pressable onPress={() => {}}>
                        <CalendarCardView width={width/7} height={height/8} value={value}/>
                      </Pressable>: null
                    }
                  </View>
                ))}
              </View>
            ))}
          </View>
      </View>
    </View>
  )
}

function CalendarCardView({value, width, height}:{value: monthDataType, width: number, height: number}) {
  const nowDay = new Date().getDay()
  const nowMonth = new Date().getMonth()
  const nowYear = new Date().getFullYear()
  const currentMonth = monthNames[nowMonth]
  return(
    <View>
      { (value.showing) ?
        <View style={{width: width, height: height}}>
          <Text style={{color: "white"}}>{value.dayData}</Text>
        </View>:<View style={{width: width, height: height}}></View>
      }
    </View>
  )
}
//     Rectangle()
//         .fill(Color.marron)
//         .frame(width: geo.width * 0.14285714285714, height: geo.width * 0.14285714285714)
//     if value.Showing{
//         if Int(value.DayData) == Day{
//             RadialGradient(
//                 gradient: Gradient(colors: [.customGray, .marron]),
//                       center: .center,
//                       startRadius: 10,
//                       endRadius: 25
//                   )
//             .opacity(0.75)
//         } else {
//             if NowYear == Year && NowMonth == CurrentMonth && NowDay == Int(value.DayData){
//                 RadialGradient(
//                           gradient: Gradient(colors: [.gray, .marron]),
//                           center: .center,
//                           startRadius: 10,
//                           endRadius: 25
//                       )
//                 .opacity(0.75)
//             }
//         }
//     }
// }


                  //   if value.Showing{
                  //     // Specify date components
                  //     var dateComponents = DateComponents()
                  //     let CurrentYear = Calendar.current.dateComponents([.year], from: SelectedDate).year
                  //     let CurrentMonth = Calendar.current.dateComponents([.month], from: SelectedDate).month
                  //     dateComponents.year = CurrentYear
                  //     dateComponents.month = CurrentMonth
                  //     dateComponents.day = Int(value.DayData)
                  //     dateComponents.timeZone = TimeZone(abbreviation: "CDT") // Japan Standard Time
                  //     dateComponents.hour = 0
                  //     dateComponents.minute = 0

                  //     // Create date from components
                  //     let userCalendar = Calendar(identifier: .gregorian) // since the components above (like year 1980) are for Gregorian
                  //     SelectedDate = userCalendar.date(from: dateComponents)!
                  // }

// function WeekView(){
//   // @EnvironmentObject var WindowMode: SelectedWindowMode
//   // @Binding var CalendarClasses: [CalendarCourseType]
//   // @Binding var SelectedDates: [DateProperty]
//   @State var CurrentEvents: EventType[]] = []
//   const [selectedDay, setSelectedDay] = useState<Date>(Date())
//   @State var Days: [Date] = []
//   const modes: String[] = ["Schedule", "Events"]
//   @State var SelectedMode: String = "Schedule"
//   @State var SelectedDate: Int = 0
//   useEffect(() => {

//   }, [selectedDay])
//   let monthInt = Calendar.current.dateComponents([.day], from: Date())
//   let CurrentDay = Calendar.current.dateComponents([.day], from: WeekDay)
//   return (
//     <View>
//               <View>
//                   Spacer()
//                   Button(){
//                       SelectedDay = Calendar.current.date(byAdding: .day, value: -7, to: SelectedDay)!
//                       Days = GetDates(CurrentDate: SelectedDay)
//                   } label: {
//                       Image(systemName: "chevron.left")
//                   }
//                   Text(SelectedDay, format: .dateTime.month().year())
//                   Button(){
//                       SelectedDay = Calendar.current.date(byAdding: .day, value: 7, to: SelectedDay)!
//                       Days = GetDates(CurrentDate: SelectedDay)
//                   } label: {
//                       Image(systemName: "chevron.forward")
//                   }
//                   if SelectedDay.formatted(date: .numeric, time: .omitted) != Date.now.formatted(date: .numeric, time: .omitted){
//                       Button(){
//                           SelectedDay = Date.now
//                           Days = GetDates(CurrentDate: SelectedDay)
//                       } label: {
//                           Text("Today")
//                       }
//                   }
//                   Spacer()
//               </View>
//               <View>
//                 {Days.map((weekDay) => (
//                   <View>
//                     <Pressable onPress={() => {
//                       SelectedDate = CurrentDay.day ?? 100
//                       SelectedDay = WeekDay
//                     }}>
//                       <View>
//                         <Svg style={{zIndex: 0}}>
//                           <Circle />
//                         </Svg>
//                         <Text style={{zIndex: 1}}>{weekDay.toLocaleString()}</Text>
//                       </View>
//                     </Pressable>
//                   </View>
//                 ))

//                 }
//                   ForEach(Days, id: \.self){ WeekDay in

//                       if CurrentDay == monthInt {
//                           Button{
//                               SelectedDate = CurrentDay.day ?? 100
//                               SelectedDay = WeekDay
//                           } label: {
//                               ZStack{
//                                   Circle()
//                                       .strokeBorder(SelectedDate == (CurrentDay.day ?? 100) ? Color.blue:Color.clear, lineWidth: 2.0)
//                                       .background(Circle().fill(.red))
//                                       .frame(width: geo.size.width * 0.1, height: geo.size.height * 0.1)
//                                   Text(WeekDay, format: .dateTime.day())
//                                       .foregroundColor(.black)
//                               }.onAppear(){
//                                   SelectedDate = monthInt.day ?? 0
//                               }
//                           }
//                       } else {
//                           Button{
//                               SelectedDate = CurrentDay.day ?? 100
//                               SelectedDay = WeekDay
//                           } label: {
//                               ZStack{
//                                   Circle()
//                                       .strokeBorder(SelectedDate == (CurrentDay.day ?? 100) ? Color.blue:Color.clear, lineWidth: 2.0)
//                                       .background(Circle().fill(.gray))
//                                       .frame(width: geo.size.width * 0.1, height: geo.size.height * 0.1)
//                                   Text(WeekDay, format: .dateTime.day())
//                                       .foregroundColor(.black)
//                               }
//                           }
//                       }
//                   }
//               </View>
//               Picker("", selection: $SelectedMode){
//                   ForEach(Modes, id: \.self){
//                       Text($0)
//                   }
//               }.pickerStyle(.segmented)
//               Spacer()
//               if SelectedMode == "Schedule"{
//                   DayView(CalendarClasses: $CalendarClasses, SelectedDates: $SelectedDates, SelectedDay: $SelectedDay)
//                     .environmentObject(WindowMode)
//               } else {
//                   if SelectedMode == "Events"{
//                       CalendarEventsView(SelectedDay: $SelectedDay)
//                           .environmentObject(WindowMode)
//                   }
//               }
//     </View>
//   )
// }

// function getWeekdayDates(CurrentDate: Date): Date[] {
//   let weekday = Calendar.current.component(.weekday, from: CurrentDate)
//   var result: [Date] = []
//   for x in 0..<weekday{
//       result.append(Calendar.current.date(byAdding: .day, value: -x, to: CurrentDate)!)
//   }
//   for x in (weekday..<7).enumerated(){
//       result.append(Calendar.current.date(byAdding: .day, value: (x.offset + 1), to: CurrentDate)!)
//   }
//   result.sort()
//   return result
// }