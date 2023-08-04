import { View, Text, Dimensions, Pressable, TextInput, Switch } from 'react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
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
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import TimePicker from '../../UI/DateTimePicker/TimePicker';
import { orgWideGroupID } from '../../PaulyConfig';
import CalendarIcon from '../../UI/Icons/CalendarIcon';
import Dropdown from '../../UI/Dropdown';
import SelectTimetable from './SelectTimetable';

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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date)
  const [fontsLoaded] = useFonts({
    'BukhariScript': require('../../../assets/fonts/BukhariScript.ttf'),
  });
  const [events, setEvents] = useState()

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  async function getCalendars(){
    const result = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/me/calendars", "GET", true)
    console.log(result)
    const data = await result.json()
    console.log(data)
  }

  async function getOrgWideEvents() {
    const result = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/groups/" + orgWideGroupID + "/calendar/events")
    const data = await result.json()
    console.log("ORg Data", data)
  }

  useEffect(() => {
    getCalendars()
    getOrgWideEvents()
  }, [])

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View>
      <View style={{height: microsoftAccessToken.dimensions.window.height * 0.1, backgroundColor: '#444444'}}>
        <View style={{flexDirection: "row"}}>
          { (microsoftAccessToken.dimensions.window.width > 576) ?
            null:<Link to="/">
              <View style={{flexDirection: "row"}}>
                <ChevronLeft />
                <Text>Back</Text>
              </View>
            </Link>
          } 
          <Text style={{fontFamily: "BukhariScript"}}>Calendar</Text>
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
      <View style={{height: microsoftAccessToken.dimensions.window.height * 0.9}}>
      { (selectedCalendarMode === calendarMode.month) ?
        <MonthViewMain width={microsoftAccessToken.dimensions.window.width * 0.8} height={microsoftAccessToken.dimensions.window.height * 0.9} selectedDate={selectedDate} setSelectedDate={setSelectedDate}/>: null
      }
      { (selectedCalendarMode === calendarMode.week) ?
        <Week width={microsoftAccessToken.dimensions.window.width * 0.8} height={microsoftAccessToken.dimensions.window.height * 0.9}/>:null
      }
      { (selectedCalendarMode === calendarMode.day) ?
        <DayView width={microsoftAccessToken.dimensions.window.width * 0.8} height={microsoftAccessToken.dimensions.window.height * 0.9} selectedDate={selectedDate} currentEvents={events} />:null
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

enum reocurringType {
  daily,
  weekly,
  monthly,
  yearly
}

function AddEvent({setIsShowingAddDate, width, height}:{setIsShowingAddDate: (item: boolean) => void, width: number, height: number}) {
  const microsoftAccessToken = useContext(accessTokenContent);
  const [eventName, setEventName] = useState<string>("")
  const [isPickingStartDate, setIsPickingStartDate] = useState<boolean>(false)
  const [isPickingEndDate, setIsPickingEndDate] = useState<boolean>(false)
  const [startDate, setStartDate] = useState<Date>(new Date)
  const [endDate, setEndDate] = useState<Date>(new Date)
  const [allDay, setAllDay] = useState<boolean>(false)
  const [recurringEvent, setRecurringEvent] = useState<boolean>(false)
  const [selectedReocurringType, setSelectedReocurringType] = useState<reocurringType>(reocurringType.daily)
  const [isSchoolDay, setIsSchoolDay] = useState<boolean>(false)
  const [isSchoolYear, setIsSchoolYear] = useState<boolean>(false)
  const [selectedTimetable, setSelectedTimetable] = useState<timetableType | undefined>(undefined)
  async function createEvent() {
    var data = {
      "subject": eventName,
      "start": {
        "dateTime": startDate.toISOString().replace(/.\d+Z$/g, "Z"),
        "timeZone": "Central America Standard Time"
      },
      "end": {
        "dateTime": endDate.toISOString().replace(/.\d+Z$/g, "Z"),
        "timeZone": "Central America Standard Time"
      }
    }
    if (allDay) {
      data["start"]["dateTime"] = startDate.toISOString().replace(/.\d+Z$/g, "Z").split(/[T ]/i, 1)[0] + "T00:00:00.0000000"
      data["end"]["dateTime"] = endDate.toISOString().replace(/.\d+Z$/g, "Z").split(/[T ]/i, 1)[0] + "T00:00:00.0000000"
      data["isAllDay"] = true
    }
    if (recurringEvent) {

    }
    const result = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/groups/" + orgWideGroupID + "/calendar/events", "POST", false, JSON.stringify(data))
    console.log(result)
    const dataOut = await result.json()
    console.log(dataOut)
  }
  return (
    <View style={{backgroundColor: "white", width: width, height: height}}>
      { (isPickingStartDate || isPickingEndDate) ?
        <DatePicker selectedDate={isPickingStartDate ? startDate:endDate} onSetSelectedDate={(e) => {if (isPickingStartDate) {setStartDate(e); setIsPickingStartDate(false)} else {setEndDate(e);setIsPickingEndDate(false)}}} width={width} height={height} onCancel={() => {setIsPickingEndDate(false); setIsPickingStartDate(false)}}/>:
        <View>
          <Pressable onPress={() => {setIsShowingAddDate(false)}}>
            <Text>X</Text>
          </Pressable>
          <Text>Add Event</Text>
          <Text>Event Name:</Text>
          <TextInput
            value={eventName}
            onChangeText={setEventName}
          />
          <Switch
            trackColor={{false: '#767577', true: '#81b0ff'}}
            thumbColor={allDay ? '#f5dd4b' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={setAllDay}
            value={allDay}
          />
          <Text>Start Date</Text>
          <View style={{flexDirection: "row"}}>
            <Pressable onPress={() => {setIsPickingStartDate(true)}}>
              <View style={{flexDirection: "row"}}>
                <Text>{startDate.toLocaleString("en-us", { month: "long" })} {startDate.getDate()} {startDate.getFullYear()}</Text>
                <CalendarIcon width={14} height={14}/>
              </View>
            </Pressable>
            { allDay ?
              null:<TimePicker selectedHourMilitary={startDate.getHours()} selectedMinuteMilitary={startDate.getMinutes()} onSetSelectedHourMilitary={(e) => {var newDate = startDate; newDate.setHours(e); setStartDate(newDate)}} onSetSelectedMinuteMilitary={(e) => {var newDate = startDate; newDate.setMinutes(e); setStartDate(newDate)}} dimentions={{hourHeight: 12, hourWidth: width/12, minuteHeight: 12, minuteWidth: width/12, timeHeight: 12, timeWidth: width/18}}/>
            }
          </View>
          <Text>End Date</Text>
          <View style={{flexDirection: "row"}}>
            <Pressable onPress={() => {setIsPickingEndDate(true)}} style={{margin: 5}}>
              <View style={{flexDirection: "row"}}>
                <Text>{endDate.toLocaleString("en-us", { month: "long" })} {endDate.getDate()} {endDate.getFullYear()}</Text>
                <CalendarIcon width={14} height={14}/>
              </View>
            </Pressable>
            { allDay ?
              null:<TimePicker selectedHourMilitary={endDate.getHours()} selectedMinuteMilitary={endDate.getMinutes()} onSetSelectedHourMilitary={(e) => {var newDate = endDate; newDate.setHours(e); setEndDate(newDate)}} onSetSelectedMinuteMilitary={(e) => {var newDate = endDate; newDate.setMinutes(e); setEndDate(newDate)}} dimentions={{hourHeight: 12, hourWidth: width/12, minuteHeight: 12, minuteWidth: width/12, timeHeight: 12, timeWidth: width/18}}/>
            }
          </View>
          <Text>Reocurring Event</Text>
          <Switch
            trackColor={{false: '#767577', true: '#81b0ff'}}
            thumbColor={recurringEvent ? '#f5dd4b' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={setRecurringEvent}
            value={recurringEvent}
          />
          { recurringEvent ?
            <View style={{zIndex: 100}}>
              <Dropdown onSetSelectedIndex={(item) => {
                if (item >= 0 && item <= 3){
                  setSelectedReocurringType(item)
                } 
              }} selectedIndex={selectedReocurringType} style={{height: height * 0.04}} expandedStyle={{height: height * 0.12, backgroundColor: "white"}}>
                <View>
                  <Text>Daily</Text>
                </View>
                <View>
                  <Text>Weekly</Text>
                </View>
                <View>
                  <Text>Monthly</Text>
                </View>
                <View>
                  <Text>Yearly</Text>
                </View>
              </Dropdown>
            </View>:null
          }
          <Text>School Day</Text>
          <Switch
            trackColor={{false: '#767577', true: '#81b0ff'}}
            thumbColor={isSchoolDay ? '#f5dd4b' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={(e) => {setIsSchoolDay(e); setIsSchoolYear(false); setAllDay(true)}}
            value={isSchoolDay}
          />
          { isSchoolDay ?
            <View>
              
            </View>:null
          }
          <Switch
            trackColor={{false: '#767577', true: '#81b0ff'}}
            thumbColor={isSchoolYear ? '#f5dd4b' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={(e) => {setIsSchoolDay(!e); setIsSchoolYear(e); setAllDay(true)}}
            value={isSchoolYear}
          />
          { isSchoolYear ?
            <View>
              <SelectTimetable governmentMode={false} onSelect={(e) => {setSelectedTimetable(e)}}/>
            </View>:null
          }
          <Pressable onPress={() => {setIsShowingAddDate(false); createEvent()}}>
            <Text style={{zIndex: -1}}>Create</Text>
          </Pressable>
        </View>
      }
    </View>
  )
}

function MonthViewMain({width, height, selectedDate, setSelectedDate}:{width: number, height: number, selectedDate: Date, setSelectedDate: (item: Date) => void}) {
  const [monthData, setMonthData] = useState<monthDataType[]>([])
  const daysInWeek: String[] = ["Sat", "Mon", "Tue", "Wen", "Thu", "Fri", "Sun"]
  
  function getMonthData(selectedDate: Date) {
    //Check if this month
    var lastDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
    const firstDayWeek = findFirstDayinMonth(selectedDate)
    var monthDataResult: monthDataType[] = []
    for (let index = 0; index < 42; index++) {
      if (index >= firstDayWeek && (index - firstDayWeek) < (lastDay.getDate())){
        //In the current month
        monthDataResult.push({showing: true, dayData: "" + (index - firstDayWeek + 1), id: create_UUID()})
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
          <Text>{selectedDate.getFullYear()}</Text>{/*leading, white*/}
        </View>
        <View style={{flexDirection: "row"}}>
          <View style={{width: width * 0.2}}>
            <Text>{selectedDate.toLocaleString("en-us", { month: "long" })}</Text>{/*leading, title, white*/}
          </View>
          <View>
            {(selectedDate.getFullYear() != new Date().getFullYear() || selectedDate.getMonth() != new Date().getMonth()) ?
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
                      <Pressable onPress={() => {}} key={value.id}>
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