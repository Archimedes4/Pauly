import { View, Text, Dimensions, Pressable, TextInput, Switch } from 'react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-native'
import callMsGraph from '../../Functions/microsoftAssets';
import { accessTokenContent } from '../../../App';
import { findFirstDayinMonth, getEventFromJSON } from '../../Functions/calendarFunctions';
import { getGraphEvents } from '../../Functions/calendarFunctionsGraph';
import create_UUID from '../../Functions/CreateUUID';
import DayView from "./DayView"
import Week from './Week';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { orgWideGroupID } from '../../PaulyConfig';
import AddEvent from './AddEvent';
import CalendarTypePicker from '../../UI/CalendarTypePicker';
import { AddIcon, ChevronLeft, ChevronRight } from '../../UI/Icons/Icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../Redux/store';
import { selectedDateSlice } from '../../Redux/reducers/selectedDateReducer';
import { currentEventsSlice } from '../../Redux/reducers/currentEventReducer';
import { useMsal } from '@azure/msal-react';
import { loadingStateEnum } from '../../types';

const windowDimensions = Dimensions.get('window');
const screenDimensions = Dimensions.get('screen');

enum calendarMode {
  month,
  week,
  day
}
declare global {
  type monthDataType = {
    id: string
    showing: boolean
    dayData: number,
    events: eventType[]
  }
  type eventType = {
    id: string
    name: string
    startTime: Date
    endTime: Date
    eventColor: string
    microsoftEvent: boolean
    schoolYearData?: string
    microsoftReference?: string
  }
}

const monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];

export default function Calendar({governmentMode}:{governmentMode: boolean}) {
  const microsoftAccessToken = useContext(accessTokenContent);
  const { instance, accounts } = useMsal();
  const [selectedCalendarMode, setSelectedCalendarMode] = useState<calendarMode>(calendarMode.month)
  const [isShowingAddDate, setIsShowingAddDate] = useState<boolean>(false)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [selectedEvent, setSelectedEvent] = useState<eventType | undefined>(undefined)
  const fullStore = useSelector((state: RootState) => state)
  const dispatch = useDispatch()
  
  const [fontsLoaded] = useFonts({
    'BukhariScript': require('../../../assets/fonts/BukhariScript.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  async function getEvents() {
    const selectedDate = new Date(JSON.parse(fullStore.selectedDate))
    const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
    //PersonalCalendar
    var outputEvents: eventType[] = []
    const personalCalendarResult = await getGraphEvents(microsoftAccessToken.accessToken, false, instance, accounts, "https://graph.microsoft.com/v1.0/me/calendarView?startDateTime=" + startDate.toISOString() +"&endDateTime=" + endDate.toISOString(), "https://graph.microsoft.com/v1.0/me/events/")
    if (personalCalendarResult.result === loadingStateEnum.success){
      outputEvents = personalCalendarResult.events
      //This code is pulled from add events School Years Select
      var url: string = (personalCalendarResult.nextLink !== undefined) ? personalCalendarResult.nextLink:""
      var notFound: boolean = (personalCalendarResult.nextLink !== undefined) ? true:false
      while (notFound) {
        const furtherResult = await getGraphEvents(microsoftAccessToken.accessToken, false, instance, accounts, url, "https://graph.microsoft.com/v1.0/me/events/")
        if (furtherResult.result === loadingStateEnum.success) {
          outputEvents = [...outputEvents, ...furtherResult.events]
          url = (furtherResult.nextLink !== undefined) ? furtherResult.nextLink:""
          notFound = (furtherResult.nextLink !== undefined) ? true:false
        } else {
          notFound = false
        }
      }
    }
    //OrgWideEvents
    const orgEventsResult = await getGraphEvents(microsoftAccessToken.accessToken, false, instance, accounts, "https://graph.microsoft.com/v1.0/groups/" + orgWideGroupID + "/calendar/events?$filter=start/dateTime%20ge%20'" + startDate.toISOString() + "'%20and%20end/dateTime%20le%20'" + endDate.toISOString() + "'", "https://graph.microsoft.com/v1.0/groups/" + orgWideGroupID + "/calendar/events/")
    if (orgEventsResult.result === loadingStateEnum.success) {
      outputEvents = [...outputEvents, ...orgEventsResult.events]
      //This code is pulled from add events School Years Select
      var url: string = (orgEventsResult.nextLink !== undefined) ? orgEventsResult.nextLink:""
      var notFound: boolean = (orgEventsResult.nextLink !== undefined) ? true:false
      while (notFound) {
        const furtherResult = await getGraphEvents(microsoftAccessToken.accessToken, false, instance, accounts, url, "https://graph.microsoft.com/v1.0/groups/" + orgWideGroupID + "/calendar/events/")
        console.log(furtherResult)
        if (furtherResult.result === loadingStateEnum.success) {
          outputEvents = [...outputEvents, ...furtherResult.events]
          url = (furtherResult.nextLink !== undefined) ? furtherResult.nextLink:""
          notFound = (furtherResult.nextLink !== undefined) ? true:false
        } else {
          notFound = false
        }
      }
    }
    var outputEventsString: string[] = []
    for (var index = 0; index < outputEvents.length; index++) {
      outputEventsString.push(JSON.stringify(outputEvents[index]))
    }
    dispatch(currentEventsSlice.actions.setCurrentEvents(outputEventsString))
  }

  useEffect(() => {
    getEvents()
  }, [fullStore.selectedDate])

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View>
      <View style={{height: microsoftAccessToken.dimensions.window.height * 0.1, backgroundColor: '#444444'}}>
        <View style={{flexDirection: "row"}}>
          { (microsoftAccessToken.currentBreakPointMode >= 1) ?
            null:<Link to="/">
              <View style={{flexDirection: "row"}}>
                <ChevronLeft width={14} height={14}/>
                <Text>Back</Text>
              </View>
            </Link>
          } 
        </View>
        <View style={{flexDirection: "row", alignItems: "center", height: microsoftAccessToken.dimensions.window.height * 0.1}}>
          <Text style={{fontFamily: "BukhariScript", fontSize: Math.sqrt(((microsoftAccessToken.dimensions.window.width * 0.4)*(microsoftAccessToken.dimensions.window.height * 0.1))/8), color: "white", marginLeft: microsoftAccessToken.dimensions.window.width * 0.05, marginRight: (microsoftAccessToken.dimensions.window.width * 0.00316227766017) * (microsoftAccessToken.dimensions.window.width * 0.0316227766017)}}>Calendar</Text>
          <CalendarTypePicker setSelectedCalendarMode={setSelectedCalendarMode} selectedIndex={selectedCalendarMode} width={microsoftAccessToken.dimensions.window.width * 0.5} height={microsoftAccessToken.dimensions.window.height * 0.05}/>
          <Pressable onPress={() => {setIsShowingAddDate(true); setIsEditing(false); setSelectedEvent(undefined)}} style={{height: microsoftAccessToken.dimensions.window.height * 0.05, width: microsoftAccessToken.dimensions.window.height * 0.05, alignItems: "center", alignContent: "center", justifyContent: "center", borderRadius: 50, backgroundColor: "#7d7d7d", shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 1, marginLeft: microsoftAccessToken.dimensions.window.width * 0.005}}>
            <AddIcon width={microsoftAccessToken.dimensions.window.height * 0.03} height={microsoftAccessToken.dimensions.window.height * 0.03}/>
          </Pressable>
        </View>
      </View> 
      <View style={{height: microsoftAccessToken.dimensions.window.height * 0.9}}>
      { (selectedCalendarMode === calendarMode.month) ?
        <MonthViewMain width={microsoftAccessToken.dimensions.window.width * 0.8} height={microsoftAccessToken.dimensions.window.height * 0.9} setAddDate={setIsShowingAddDate} setIsEditing={setIsEditing} setSelectedEvent={setSelectedEvent}/>: null
      }
      { (selectedCalendarMode === calendarMode.week) ?
        <Week width={microsoftAccessToken.dimensions.window.width * 1.0} height={microsoftAccessToken.dimensions.window.height * 0.9} />:null
      }
      { (selectedCalendarMode === calendarMode.day) ?
        <DayView width={microsoftAccessToken.dimensions.window.width * 0.9} height={microsoftAccessToken.dimensions.window.height * 0.9} />:null
      }
      </View>
      { isShowingAddDate ?
        <View style={{zIndex: 2, position: "absolute", left: microsoftAccessToken.dimensions.window.width * 0.2, top: microsoftAccessToken.dimensions.window.height * 0.1}}>
          <AddEvent setIsShowingAddDate={setIsShowingAddDate} width={microsoftAccessToken.dimensions.window.width * 0.6} height={microsoftAccessToken.dimensions.window.height * 0.8} editing={isEditing} editData={selectedEvent} />
        </View>:null
      }
    </View>
  )
}

function MonthViewMain({width, height, setAddDate, setIsEditing, setSelectedEvent}:{width: number, height: number, setAddDate: (addDate: boolean) => void, setIsEditing: (isEditing: boolean) => void, setSelectedEvent: (selectedEvent: eventType) => void}) {
  const [monthData, setMonthData] = useState<monthDataType[]>([])
  const daysInWeek: String[] = ["Sat", "Mon", "Tue", "Wen", "Thu", "Fri", "Sun"]
  const fullStore = useSelector((state: RootState) => state)
  const dispatch = useDispatch()
  const [fontsLoaded] = useFonts({
    'BukhariScript': require('../../../assets/fonts/BukhariScript.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  function getMonthData(selectedDate: Date) {
    //Check if this month
    var lastDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
    const firstDayWeek = findFirstDayinMonth(selectedDate)
    var monthDataResult: monthDataType[] = []
    for (let index = 0; index < 42; index++) {
      if (index >= firstDayWeek && (index - firstDayWeek) < (lastDay.getDate())){
        //In the current month
        var events: eventType[] = []
        const check: Date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), (index - firstDayWeek + 1))
        for (var indexEvent = 0; indexEvent < fullStore.currentEvents.length; indexEvent++) {
          const event: eventType = getEventFromJSON(fullStore.currentEvents[indexEvent])
          const startTimeDate = new Date(event.startTime.getFullYear(), event.startTime.getMonth(), event.startTime.getDate())
          const endTimeDate = new Date(event.endTime.getFullYear(), event.endTime.getMonth(), event.endTime.getDate())
          if (check >= startTimeDate && check <= endTimeDate) {
            //Event is on the date
            events.push(event)
          }
        }
        monthDataResult.push({showing: true, dayData: (index - firstDayWeek + 1), id: create_UUID(), events: events})
      } else {
        monthDataResult.push({showing: false, dayData: 0, id: create_UUID(), events: []})
      }
    }
    setMonthData(monthDataResult)
  }

  useEffect(() => {
    getMonthData(new Date(JSON.parse(fullStore.selectedDate)))
  }, [fullStore.selectedDate, fullStore.currentEvents])

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{backgroundColor: "white"}}>
      <View style={{height: height/8, width: width}}>
        <View style={{flexDirection: "row"}}>
          <View style={{width: width * 0.2, flexDirection: "row"}}>
            <Text style={{}}>{new Date(JSON.parse(fullStore.selectedDate)).toLocaleString("en-us", { month: "long" })}</Text><Text> {new Date(JSON.parse(fullStore.selectedDate)).getFullYear()}</Text>{/*leading, title, white*/}
          </View>
          <View>
            {(new Date(JSON.parse(fullStore.selectedDate)).getFullYear() != new Date().getFullYear() || new Date(JSON.parse(fullStore.selectedDate)).getMonth() != new Date().getMonth()) ?
              <View style={{width: width * 0.2}}>
                <Pressable onPress={() => {
                  dispatch(selectedDateSlice.actions.setCurrentEventsLastCalled(JSON.stringify(new Date())))
                }}>
                  <Text style={{color: "black"}}>Today</Text>
                </Pressable>
              </View>:<View style={{width: width * 0.2}}></View>
            }
          </View>
          {/*This is left chevron*/}
          <Pressable onPress={() => {
            const d = new Date();
            d.setFullYear((new Date(JSON.parse(fullStore.selectedDate)).getMonth() === 1) ? new Date(JSON.parse(fullStore.selectedDate)).getFullYear() - 1:new Date(JSON.parse(fullStore.selectedDate)).getFullYear(), (new Date(JSON.parse(fullStore.selectedDate)).getMonth() === 1) ? 12:new Date(JSON.parse(fullStore.selectedDate)).getMonth() - 1, new Date(JSON.parse(fullStore.selectedDate)).getDay());
            dispatch(selectedDateSlice.actions.setCurrentEventsLastCalled(JSON.stringify(d)))
          }} >
            <ChevronLeft width={14} height={14}/>
          </Pressable>
          {/*This is right chevron*/}
          <Pressable onPress={() => {
            const d = new Date();
            d.setFullYear((new Date(JSON.parse(fullStore.selectedDate)).getMonth() === 12) ? new Date(JSON.parse(fullStore.selectedDate)).getFullYear() + 1:new Date(JSON.parse(fullStore.selectedDate)).getFullYear(), (new Date(JSON.parse(fullStore.selectedDate)).getMonth() === 12) ? 1:new Date(JSON.parse(fullStore.selectedDate)).getMonth() + 1, new Date(JSON.parse(fullStore.selectedDate)).getDay());
            dispatch(selectedDateSlice.actions.setCurrentEventsLastCalled(JSON.stringify(d)))
          }}>
            <ChevronRight width={14} height={14}/>
          </Pressable>
        </View>
      </View>
      <View style={{width: width}}>
        <View style={{flexDirection: "row"}}>
          {daysInWeek.map((DOW) => (
            <View key={create_UUID()} style={{width: width/7, height: height/8}}>
              <Text style={{color: "black"}}>{DOW}</Text>
            </View>
          ))}
        </View>
          <View>
            { Array.from(Array(7).keys()).map((valueRow) => (
              <View key={"Row_"+valueRow+"_"+create_UUID()} style={{flexDirection: "row"}}>
                { monthData.map((value, id) => (
                  <View key={value.id}>
                    { (id >= valueRow * 7 && id <= valueRow * 7 + 6) ?
                      <View>
                        { value.showing ?
                          <Pressable onPress={() => {
                            const d = new Date();
                            d.setFullYear(new Date(JSON.parse(fullStore.selectedDate)).getFullYear(), new Date(JSON.parse(fullStore.selectedDate)).getMonth(), value.dayData);
                            dispatch(selectedDateSlice.actions.setCurrentEventsLastCalled(JSON.stringify(d)))
                          }} key={value.id}>
                            <CalendarCardView width={width / 7} height={height / 8} value={value} setIsEditing={setIsEditing} setSelectedEvent={setSelectedEvent}  setAddDate={setAddDate}/>
                          </Pressable>:<View key={value.id}><CalendarCardView width={width / 7} height={height / 8} value={value} setIsEditing={setIsEditing} setSelectedEvent={setSelectedEvent} setAddDate={setAddDate}/></View>
                        }
                      </View>:null
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

function CalendarCardView({value, width, height, setIsEditing, setSelectedEvent, setAddDate}:{value: monthDataType, width: number, height: number, setIsEditing: (isEditing: boolean) => void, setSelectedEvent: (selectedEvent: eventType) => void, setAddDate: (addDate: boolean) => void}) {
  return(
    <View>
      { (value.showing) ?
        <View style={{width: width, height: height}}>
          <Text style={{color: "black"}}>{value.dayData}</Text>
          <View style={{width: width, height: height * 0.8, overflow: "scroll"}}>
            {value.events.map((event) => (
              <Pressable key={"Calendar_Event_" + event.id} onPress={() => {setIsEditing(true); setSelectedEvent(event); setAddDate(true)}}>
                <Text>{event.name}</Text>
              </Pressable>
            ))}
          </View>
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