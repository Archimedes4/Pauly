import { View, Text, Pressable, ScrollView, useWindowDimensions } from 'react-native'
import React, { useCallback, useEffect } from 'react'
import { findFirstDayinMonth } from '../../Functions/calendar/calendarFunctions';
import create_UUID from '../../Functions/Ultility/CreateUUID';
import DayView from "./DayView"
import Week from './Week';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import AddEvent from './AddEvent';
import CalendarTypePicker from '../../UI/CalendarTypePicker';
import { AddIcon, ChevronLeft, ChevronRight } from '../../UI/Icons/Icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../Redux/store';
import { selectedDateSlice } from '../../Redux/reducers/selectedDateReducer';
import { Colors, calendarMode, loadingStateEnum } from '../../types';
import getEvents from '../../Functions/calendar/getEvents';
import { safeAreaColorsSlice } from '../../Redux/reducers/safeAreaColorsReducer';
import BackButton from '../../UI/BackButton';
import { addEventSlice } from '../../Redux/reducers/addEventReducer';
import { monthDataSlice } from '../../Redux/reducers/monthDataReducer'
import { getClasses } from '../../Functions/classesFunctions';

const monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];

export default function Calendar() {
  const {width, height, currentBreakPoint} = useSelector((state: RootState) => state.dimentions)
  const {selectedCalendarMode, isShowingAddDate} = useSelector((state: RootState) => state.addEvent)
  const selectedDate = useSelector((state: RootState) => state.selectedDate)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(safeAreaColorsSlice.actions.setSafeAreaColors({top: Colors.darkGray, bottom: Colors.white}))
  }, [])


  //This is the main (only) process that updates the events
  //In the month view month data is calculate but the events come from this hook and the month view is a decendant of this view.
  useEffect(() => {
    getEvents()
    getClasses()
  }, [selectedDate])


  //Fonts
  const [fontsLoaded] = useFonts({
    'BukhariScript': require('../../../assets/fonts/BukhariScript.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View>
      <View style={{height: height * 0.1, backgroundColor: Colors.darkGray}}>
        { (currentBreakPoint >= 1) ?
          null:<BackButton to='/' style={{zIndex: 100}}/>
        } 
        <TopView width={width} height={height * 0.1} />
      </View> 
      <View style={{height: height * 0.9}}>
      { (selectedCalendarMode === calendarMode.month) ?
        <View style={{width: width, alignContent: "center", alignItems: "center", justifyContent: "center", backgroundColor: Colors.white}}>
          <MonthViewMain width={width * 0.9} height={height * 0.9} />
        </View>:null
      }
      { (selectedCalendarMode === calendarMode.week) ?
        <Week width={width * 1.0} height={height * 0.9} />:null
      }
      { (selectedCalendarMode === calendarMode.day) ?
        <View style={{width: width, height: height * 0.9, alignItems: "center", alignContent: "center", justifyContent: "center", backgroundColor: Colors.white}}>
          <DayView width={width * 0.9} height={height * 0.9} />
        </View>:null
      }
      </View>
      { isShowingAddDate ?
        <View style={{zIndex: 2, position: "absolute", left: width * 0.05 + (((width >= 576) ? (width * 0.3):0)/2), top: height * 0.1}}>
          <AddEvent width={width * 0.9 - ((width >= 576) ? (width * 0.3):0)} height={height * 0.8} />
        </View>:null
      }
    </View>
  )
}

function MonthViewMain({width, height}:{width: number, height: number}) {
  const monthData = useSelector((state: RootState) => state.monthData)
  const selectedDate: string =  useSelector((state: RootState) => state.selectedDate)
  return (
    <>
      { (width <= 519) ?
        <ScrollView style={{backgroundColor: Colors.white, height: height, width: width}}>
          <MonthView width={width} height={height * 0.8} /> 
          { (new Date(selectedDate).getDate() <= monthData.length) ?
            <>
              {monthData[new Date(selectedDate).getDate() - 1].events.map((event) => (
                <View>
                  <Text>{event.name}</Text>
                </View>
              ))}
            </>:null
          }
        </ScrollView>:
         <View style={{backgroundColor: Colors.white, height: height, width: width}}>
          <MonthView width={width} height={height} />
        </View>
      }
    </>
  )
}

function MonthView({width, height}:{width: number, height: number}) {
  //const [monthData, setMonthData] = useState<monthDataType[]>([])
  const daysInWeek: String[] = ["Sat", "Mon", "Tue", "Wen", "Thu", "Fri", "Sun"]
  const currentEvents = useSelector((state: RootState) => state.currentEvents)
  const selectedDate: string =  useSelector((state: RootState) => state.selectedDate)
  const monthData = useSelector((state: RootState) => state.monthData)
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
        var events: eventType[] = [] //The result events of that day
        
        //Check is the current date
        const checkStart: Date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), (index - firstDayWeek + 1), 0, 0)
        const checkEnd: Date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), (index - firstDayWeek + 2), 0, 0)
        for (var indexEvent = 0; indexEvent < currentEvents.length; indexEvent++) {
          const event: eventType = currentEvents[indexEvent] //Event to be checked
         
          const startTimeDate = new Date(event.startTime) //String to date
          const endTimeDate = new Date(event.endTime)//String to date

          //First check if starts before date and ends after or on day
          if (startTimeDate <= checkStart && endTimeDate > checkStart) {
            events.push(event)
          } else if (startTimeDate > checkStart && startTimeDate < checkEnd) {
            //Second check if starts on day
            events.push(event)
          }
        }
        monthDataResult.push({showing: true, dayData: (index - firstDayWeek + 1), id: create_UUID(), events: events})
      } else {
        monthDataResult.push({showing: false, dayData: 0, id: create_UUID(), events: []})
      }
    }
    dispatch(monthDataSlice.actions.setMonthData(monthDataResult))
  }

  useEffect(() => {
    getMonthData(new Date(selectedDate))
  }, [selectedDate, currentEvents])

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <View style={{height: height/8, width: width, justifyContent: "center", alignContent: "center"}}>
        <View style={{flexDirection: "row"}}>
          <View style={{width: width * 0.6, flexDirection: "row", marginRight: "auto"}}>
            <Text numberOfLines={1} adjustsFontSizeToFit style={{fontSize: 30}}>{new Date(selectedDate).toLocaleString("en-us", { month: "long" })} {new Date(selectedDate).getFullYear()}</Text>
          </View>
          <View>
            {(new Date(selectedDate).getFullYear() !== new Date().getFullYear() || new Date(selectedDate).getMonth() != new Date().getMonth()) ?
              <View style={{width: width * 0.2}}>
                <Pressable onPress={() => {
                  dispatch(selectedDateSlice.actions.setCurrentEventsLastCalled(new Date().toISOString()))
                }}>
                  <Text style={{color: "black", fontSize: 12/fontScale}}>Today</Text>
                </Pressable>
              </View>:<View style={{width: width * 0.2}}></View>
            }
          </View>
          {/*This is left chevron*/}
          <Pressable onPress={() => {
            const d = new Date();
            d.setFullYear((new Date(selectedDate).getMonth() === 1) ? new Date(selectedDate).getFullYear() - 1:new Date(selectedDate).getFullYear(), (new Date(selectedDate).getMonth() === 1) ? 12:new Date(selectedDate).getMonth() - 1, new Date(selectedDate).getDay());
            dispatch(selectedDateSlice.actions.setCurrentEventsLastCalled(d.toISOString()))
          }} style={{marginTop: "auto", marginBottom: "auto"}}>
            <ChevronLeft width={14} height={14}/>
          </Pressable>
          {/*This is right chevron*/}
          <Pressable onPress={() => {
            const d = new Date();
            d.setFullYear((new Date(selectedDate).getMonth() === 12) ? new Date(selectedDate).getFullYear() + 1:new Date(selectedDate).getFullYear(), (new Date(selectedDate).getMonth() === 12) ? 1:new Date(selectedDate).getMonth() + 1, new Date(selectedDate).getDay());
            dispatch(selectedDateSlice.actions.setCurrentEventsLastCalled(d.toISOString()))
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
        { Array.from(Array(7).keys()).map((valueRow) => (
            <View key={`Row_${valueRow}_${create_UUID()}`} style={{flexDirection: "row"}}>
              { monthData.map((value, id) => (
                <>
                  {(id >= valueRow * 7 && id <= valueRow * 7 + 6) ?
                    <>
                      { value.showing ?
                        <Pressable onPress={() => {
                          const d = new Date();
                          d.setFullYear(new Date(selectedDate).getFullYear(), new Date(selectedDate).getMonth(), value.dayData);
                          dispatch(selectedDateSlice.actions.setCurrentEventsLastCalled(d.toISOString()))
                        }} key={`CalendarButton_${value.id}_${create_UUID()}`}>
                          <CalendarCardView width={width / 7} height={height / 8} value={value} calendarWidth={width}/>
                        </Pressable>:
                        <View key={`CalendarSpacer_${create_UUID()}`}>
                          <CalendarCardView width={width / 7} height={height / 8} value={value} calendarWidth={width}/>
                        </View>
                      }
                    </>:null
                  }
                </>
              ))}
            </View>
          ))}
      </View>
    </>
  )
}

function CalendarCardView({value, width, height, calendarWidth}:{value: monthDataType, width: number, height: number, calendarWidth: number}) {
  const selectedDate = useSelector((state: RootState) => state.selectedDate)
  const dispatch = useDispatch()
  return(
    <>
      { (calendarWidth <= 519) ?
        <>
          { (value.showing) ?
            <View style={{width: width, height: height, alignContent: "center", alignItems: "center", justifyContent: "center", borderRadius: (value.dayData === new Date(selectedDate).getDate()) ? height/2:0, backgroundColor: (value.dayData === new Date(selectedDate).getDate()) ? "#ededed":Colors.white}}>
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
              <View style={{borderRadius: 50, width: 16, height: 16, backgroundColor: (new Date().getDate() === value.dayData) ? "red":"transparent", alignContent: "center", justifyContent: "center", alignItems: "center"}}>
                <Text style={{color: "black"}}>{value.dayData}</Text>
              </View>
              <ScrollView style={{width: width, height: height * 0.8}}>
                {value.events.map((event) => (
                  <Pressable key={"Calendar_Event_" + event.id + "_" + create_UUID()} onPress={() => {dispatch(addEventSlice.actions.setIsEditing(true)); dispatch(addEventSlice.actions.setIsEditing(true)); dispatch(addEventSlice.actions.setIsShowingAddDate(true)); dispatch(addEventSlice.actions.setSelectedEvent(event))}}>
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

function TopView({width, height}:{width: number, height: number}) {
  const dispatch = useDispatch()
  const {currentBreakPoint} = useSelector((state: RootState) => state.dimentions)
  return (
    <View style={{flexDirection: "row", alignItems: "center", height: height, width: width}}>
      <View style={{width: width * 0.45 - (((width * 0.1) < (height)) ? width * 0.15:(height + width * 0.025)), height: height, alignContent: "center", alignItems: "center", justifyContent: "center"}}>
        <Text adjustsFontSizeToFit={true} numberOfLines={1} style={{fontFamily: "BukhariScript", fontSize: (currentBreakPoint === 0) ? (height * 0.35):(height * 0.7), width: width * 0.4, height: (currentBreakPoint === 0) ? (height * 0.5):(height * 0.9), color: Colors.white, textAlign: "center", verticalAlign: "middle", alignContent: "center", justifyContent: "center", alignItems: "center"}}>Calendar</Text>
      </View>
      <View style={{width: width * 0.55}}>
        <View style={{marginLeft: width * 0.05}}>
          <CalendarTypePicker width={width * 0.5} height={((width * 0.1) < (height * 0.6)) ? width * 0.1:height * 0.6}/>
        </View>
      </View>
      <View style={{width: ((width * 0.1) < (height * 0.6)) ? width * 0.15:height}}>
        <Pressable onPress={() => {dispatch(addEventSlice.actions.setIsShowingAddDate(true)); dispatch(addEventSlice.actions.setIsEditing(false)); dispatch(addEventSlice.actions.setSelectedEvent(undefined))}} style={{
          height: ((width * 0.1) < (height * 0.6)) ? width * 0.1:height * 0.6,
          width: ((width * 0.1) < (height * 0.6)) ? width * 0.1:height * 0.6,
          alignItems: "center", alignContent: "center", justifyContent: "center",
          borderRadius: 50, backgroundColor: "#7d7d7d", shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 1,
          marginLeft: width * 0.025,
          marginRight: width * 0.025
        }}>
          <AddIcon width={((width * 0.1) < (height * 0.6)) ? width * 0.05:height * 0.4} height={((width * 0.1) < (height * 0.6)) ? width * 0.05:height * 0.4}/>
        </Pressable>
      </View>
    </View>  
  )
}