import { View, Text, Dimensions, Pressable, TextInput, Switch, ScrollView, useWindowDimensions } from 'react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-native'
import { findFirstDayinMonth } from '../../Functions/Calendar/calendarFunctions';
import create_UUID from '../../Functions/Ultility/CreateUUID';
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
import getEvents from '../../Functions/Calendar/getEvents';
import { safeAreaColorsSlice } from '../../Redux/reducers/safeAreaColorsReducer';

enum calendarMode {
  month,
  week,
  day
}
declare global {
  type monthDataType = {
    id: string,
    showing: boolean,
    dayData: number,
    events: eventType[]
  }
  type paulyEventTypes = "schoolDay" | "schoolYear"
  type eventType = {
    id: string
    name: string
    startTime: Date
    endTime: Date
    eventColor: string
    microsoftEvent: boolean
    paulyEventType?: paulyEventTypes
    paulyEventData?: string
    microsoftReference?: string
  }
}

const monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];

export default function Calendar() {
  const {width, height, currentBreakPoint} = useSelector((state: RootState) => state.dimentions)
  const [selectedCalendarMode, setSelectedCalendarMode] = useState<calendarMode>(calendarMode.month)
  const [isShowingAddDate, setIsShowingAddDate] = useState<boolean>(false)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [selectedEvent, setSelectedEvent] = useState<eventType | undefined>(undefined)
  const selectedDate = useSelector((state: RootState) => state.selectedDate)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(safeAreaColorsSlice.actions.setSafeAreaColors({top: "#444444", bottom: "white"}))
  }, [])

  const [fontsLoaded] = useFonts({
    'BukhariScript': require('../../../assets/fonts/BukhariScript.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    getEvents()
  }, [selectedDate])

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View>
      <View style={{height: height * 0.1, backgroundColor: '#444444'}}>
        <View style={{flexDirection: "row"}}>
          { (currentBreakPoint >= 1) ?
            null:<Link to="/">
              <View style={{flexDirection: "row"}}>
                <ChevronLeft width={14} height={14}/>
                <Text>Back</Text>
              </View>
            </Link>
          } 
        </View>
        <View style={{flexDirection: "row", alignItems: "center", height: height * 0.1}}>
          <Text style={{fontFamily: "BukhariScript", fontSize: Math.sqrt(((width * 0.4)*(height * 0.1))/8), color: "white", marginLeft: width * 0.05, marginRight: (width * 0.00316227766017) * (width * 0.0316227766017)}}>Calendar</Text>
          <CalendarTypePicker setSelectedCalendarMode={setSelectedCalendarMode} selectedIndex={selectedCalendarMode} width={width * 0.5} height={height * 0.05}/>
          <Pressable onPress={() => {setIsShowingAddDate(true); setIsEditing(false); setSelectedEvent(undefined)}} style={{height: height * 0.05, width: height * 0.05, alignItems: "center", alignContent: "center", justifyContent: "center", borderRadius: 50, backgroundColor: "#7d7d7d", shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 1, marginLeft: width * 0.005}}>
            <AddIcon width={height * 0.03} height={height * 0.03}/>
          </Pressable>
        </View>
      </View> 
      <View style={{height: height * 0.9}}>
      { (selectedCalendarMode === calendarMode.month) ?
        <View style={{width: width, alignContent: "center", alignItems: "center", justifyContent: "center", backgroundColor: "white"}}>
          <MonthViewMain width={width * 0.9} height={height * 0.9} setAddDate={setIsShowingAddDate} setIsEditing={setIsEditing} setSelectedEvent={setSelectedEvent}/>
        </View>:null
      }
      { (selectedCalendarMode === calendarMode.week) ?
        <Week width={width * 1.0} height={height * 0.9} />:null
      }
      { (selectedCalendarMode === calendarMode.day) ?
        <View style={{width: width, height: height * 0.9, alignItems: "center", alignContent: "center", justifyContent: "center", backgroundColor: "white"}}>
          <DayView width={width * 0.9} height={height * 0.9} />
        </View>:null
      }
      </View>
      { isShowingAddDate ?
        <View style={{zIndex: 2, position: "absolute", left: width * 0.05 + (((width >= 576) ? (width * 0.3):0)/2), top: height * 0.1}}>
          <AddEvent setIsShowingAddDate={setIsShowingAddDate} width={width * 0.9 - ((width >= 576) ? (width * 0.3):0)} height={height * 0.8} editing={isEditing} editData={selectedEvent} />
        </View>:null
      }
    </View>
  )
}

function MonthViewMain({width, height, setAddDate, setIsEditing, setSelectedEvent}:{width: number, height: number, setAddDate: (addDate: boolean) => void, setIsEditing: (isEditing: boolean) => void, setSelectedEvent: (selectedEvent: eventType) => void}) {
  return (
    <>
      { (width <= 519) ?
        <ScrollView style={{backgroundColor: "white", height: height, width: width}}>
          <MonthView width={width} height={height} setAddDate={setAddDate} setIsEditing={setIsEditing} setSelectedEvent={setSelectedEvent}/>
        </ScrollView>:
         <View style={{backgroundColor: "white", height: height, width: width}}>
          <MonthView width={width} height={height} setAddDate={setAddDate} setIsEditing={setIsEditing} setSelectedEvent={setSelectedEvent}/>
        </View>
      }
    </>
  )
}

function MonthView({width, height, setAddDate, setIsEditing, setSelectedEvent}:{width: number, height: number, setAddDate: (addDate: boolean) => void, setIsEditing: (isEditing: boolean) => void, setSelectedEvent: (selectedEvent: eventType) => void}) {
  const [monthData, setMonthData] = useState<monthDataType[]>([])
  const daysInWeek: String[] = ["Sat", "Mon", "Tue", "Wen", "Thu", "Fri", "Sun"]
  const currentEvents = useSelector((state: RootState) => state.currentEvents)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const selectedDateRedux: string =  useSelector((state: RootState) => state.selectedDate)
  const {fontScale} = useWindowDimensions();

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
        for (var indexEvent = 0; indexEvent < currentEvents.length; indexEvent++) {
          const event: eventType = currentEvents[indexEvent]
          const startTimeDate = new Date(event.startTime)
          const endTimeDate = new Date(event.endTime)
          if (check >= startTimeDate && check <= endTimeDate) {
            //Event is on the date
            if (check.getTime() !== event.endTime.getTime()) {
              events.push(event)
            }
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
    setSelectedDate(new Date(JSON.parse(selectedDateRedux)))
  }, [selectedDateRedux])

  useEffect(() => {
    getMonthData(selectedDate)
  }, [selectedDate, currentEvents])

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <View style={{height: height/8, width: width, justifyContent: "center", alignItems: "center", alignContent: "center"}}>
        <View style={{flexDirection: "row"}}>
          <View style={{width: width * 0.6, flexDirection: "row"}}>
            <Text numberOfLines={1} adjustsFontSizeToFit style={{fontSize: 30}}>{selectedDate.toLocaleString("en-us", { month: "long" })} {selectedDate.getFullYear()}</Text>
          </View>
          <View>
            {(selectedDate.getFullYear() !== new Date().getFullYear() || selectedDate.getMonth() != new Date().getMonth()) ?
              <View style={{width: width * 0.2}}>
                <Pressable onPress={() => {
                  dispatch(selectedDateSlice.actions.setCurrentEventsLastCalled(JSON.stringify(new Date())))
                }}>
                  <Text style={{color: "black", fontSize: 12/fontScale}}>Today</Text>
                </Pressable>
              </View>:<View style={{width: width * 0.2}}></View>
            }
          </View>
          {/*This is left chevron*/}
          <Pressable onPress={() => {
            const d = new Date();
            d.setFullYear((selectedDate.getMonth() === 1) ? selectedDate.getFullYear() - 1:selectedDate.getFullYear(), (selectedDate.getMonth() === 1) ? 12:selectedDate.getMonth() - 1, selectedDate.getDay());
            dispatch(selectedDateSlice.actions.setCurrentEventsLastCalled(JSON.stringify(d)))
          }} style={{marginTop: "auto", marginBottom: "auto"}}>
            <ChevronLeft width={14} height={14}/>
          </Pressable>
          {/*This is right chevron*/}
          <Pressable onPress={() => {
            const d = new Date();
            d.setFullYear((selectedDate.getMonth() === 12) ? selectedDate.getFullYear() + 1:selectedDate.getFullYear(), (selectedDate.getMonth() === 12) ? 1:selectedDate.getMonth() + 1, selectedDate.getDay());
            dispatch(selectedDateSlice.actions.setCurrentEventsLastCalled(JSON.stringify(d)))
          }} style={{marginTop: "auto", marginBottom: "auto"}}>
            <ChevronRight width={14} height={14}/>
          </Pressable>
        </View>
      </View>
      <View style={{width: width}}>
        <View style={{flexDirection: "row"}}>
          {daysInWeek.map((DOW) => (
            <View key={create_UUID()} style={{width: width/7, height: height/8, alignItems: "center", alignContent: "center", justifyContent: "center"}}>
              <Text style={{color: "black"}}>{DOW}</Text>
            </View>
          ))}
        </View>
          <View>
            { Array.from(Array(7).keys()).map((valueRow) => (
              <View key={"Row_"+valueRow+"_"+create_UUID()} style={{flexDirection: "row"}}>
                { monthData.map((value, id) => (
                  <View key={value.id}>
                    {(id >= valueRow * 7 && id <= valueRow * 7 + 6) ?
                      <View>
                        { value.showing ?
                          <Pressable onPress={() => {
                            const d = new Date();
                            d.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), value.dayData);
                            dispatch(selectedDateSlice.actions.setCurrentEventsLastCalled(JSON.stringify(d)))
                          }} key={value.id}>
                            <CalendarCardView width={width / 7} height={height / 8} value={value} setIsEditing={setIsEditing} setSelectedEvent={setSelectedEvent} setAddDate={setAddDate} calendarWidth={width}/>
                          </Pressable>:
                          <View key={value.id}><CalendarCardView width={width / 7} height={height / 8} value={value} setIsEditing={setIsEditing} setSelectedEvent={setSelectedEvent} setAddDate={setAddDate} calendarWidth={width}/></View>
                        }
                      </View>:null
                    }
                  </View>
                ))}
              </View>
            ))}
          </View>
      </View>
      { (width <= 519) ?
        <ScrollView>
          { ((selectedDate.getDate() - 1) <= monthData.length) ?
            <>
              {monthData[selectedDate.getDate() - 1].events.map((event) => (
                <View>
                  <Text>{event.name}</Text>
                </View>
              ))}
            </>:null
          }
        </ScrollView>:null
      }
    </>
  )
}

function CalendarCardView({value, width, height, setIsEditing, setSelectedEvent, setAddDate, calendarWidth}:{value: monthDataType, width: number, height: number, setIsEditing: (isEditing: boolean) => void, setSelectedEvent: (selectedEvent: eventType) => void, setAddDate: (addDate: boolean) => void, calendarWidth: number}) {
  return(
    <>
      { (calendarWidth <= 519) ?
        <>
          { (value.showing) ?
            <View style={{width: width, height: height, alignContent: "center", alignItems: "center", justifyContent: "center"}}>
              <Text style={{color: "black"}}>{value.dayData}</Text>
              { (value.events.length >= 1) ?
                <View style={{backgroundColor: "black", borderRadius: 50, width: (width < height) ? width* 0.25:height * 0.25, height: (width < height) ? width* 0.25:height * 0.25}}/>:
                <View style={{backgroundColor: "transparent", borderRadius: 50, width: (width < height) ? width* 0.25:height * 0.25, height: (width < height) ? width* 0.25:height * 0.25}}/>
              }
            </View>:
            <View style={{width: width, height: height}}/>
          }
        </>:
        <>
          { (value.showing) ?
            <View style={{width: width, height: height}}>
              <Text style={{color: "black"}}>{value.dayData}</Text>
              <ScrollView style={{width: width, height: height * 0.8}}>
                {value.events.map((event) => (
                  <Pressable key={"Calendar_Event_" + event.id + "_" + create_UUID()} onPress={() => {setIsEditing(true); setSelectedEvent(event); setAddDate(true)}}>
                    <Text style={{fontSize: 10}}>{event.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>:<View style={{width: width, height: height}} />
          }
        </>
      }
    </>
  )
}