import { useCallback, useContext, useEffect, useState } from "react";
import { Pressable, View, Text, Switch, TextInput, Button } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import store, { RootState } from "../../Redux/store";
import { currentEventsSchoolYearSlice } from "../../Redux/reducers/currentEventSchoolYearReducer";
import { currentEventsSlice } from "../../Redux/reducers/currentEventReducer";
import { orgWideGroupID } from "../../PaulyConfig";
import DatePicker from "../../UI/DateTimePicker/DatePicker";
import Dropdown from "../../UI/Dropdown";
import { CalendarIcon, CloseIcon } from "../../UI/Icons/Icons";
import TimePicker from "../../UI/DateTimePicker/TimePicker";
import callMsGraph from "../../Functions/microsoftAssets";
import { getEventFromJSON } from "../../Functions/calendarFunctions";
import { getGraphEvents, getTimetable } from "../../Functions/calendarFunctionsGraph";
import SelectTimetable from "./SelectTimetable";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { loadingStateEnum } from "../../types";

enum reocurringType {
    daily,
    weekly,
    monthly,
    yearly
}

interface schoolDayDataInteface {
  schoolDay: schoolDayType
  schedule: scheduleType
}

enum paulyEventType {
  regular,
  schoolDay,
  schoolYear,
  dressCode,
  studentCouncil
}

export default function AddEvent({setIsShowingAddDate, width, height, editing, editData}:{setIsShowingAddDate: (item: boolean) => void, width: number, height: number, editing: boolean, editData?: eventType}) {
    const selectedDate = useSelector((state: RootState) => state.selectedDate)
    const currentEvents = useSelector((state: RootState) => state.currentEvents)
    const {eventExtensionId} = useSelector((state: RootState) => state.paulyList)
    const dispatch = useDispatch()

    //Calendar
    const [eventName, setEventName] = useState<string>(editing ? editData.name:"")
    const [isPickingStartDate, setIsPickingStartDate] = useState<boolean>(false)
    const [isPickingEndDate, setIsPickingEndDate] = useState<boolean>(false)
    const [startDate, setStartDate] = useState<Date>((editing) ? editData.startTime:new Date(JSON.parse(selectedDate)))
    const [endDate, setEndDate] = useState<Date>((editing) ? editData.endTime:new Date(JSON.parse(selectedDate)))
    const [allDay, setAllDay] = useState<boolean>(false)

    //Recurring
    const [recurringEvent, setRecurringEvent] = useState<boolean>(false)
    const [selectedReocurringType, setSelectedReocurringType] = useState<reocurringType>(reocurringType.daily)

    //School Day
    const [isSchoolDay, setIsSchoolDay] = useState<boolean>(false)
    const [selectedSchoolYear, setSelectedSchoolYear] = useState<eventType | undefined>(undefined)
    const [selectedSchoolDayData, setSelectedSchoolDayData] = useState<schoolDayDataInteface | undefined>(undefined)

    //School Year
    const [isSchoolYear, setIsSchoolYear] = useState<boolean>(false)
    const [selectedTimetable, setSelectedTimetable] = useState<timetableStringType | undefined>(undefined)

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
      if (isSchoolDay) {
        if (selectedSchoolDayData === undefined) return
        data["start"]["dateTime"] = startDate.toISOString().replace(/.\d+Z$/g, "Z").split(/[T ]/i, 1)[0] + "T00:00:00.0000000"
        var newEndDate = startDate
        newEndDate.setDate(startDate.getDate() + 1)
        data["end"]["dateTime"] = newEndDate.toISOString().replace(/.\d+Z$/g, "Z").split(/[T ]/i, 1)[0] + "T00:00:00.0000000"
        data["isAllDay"] = true
        data["subject"] = selectedSchoolDayData.schoolDay.name + " " + selectedSchoolDayData.schedule.properName
      } else if (allDay) {
        data["start"]["dateTime"] = startDate.toISOString().replace(/.\d+Z$/g, "Z").split(/[T ]/i, 1)[0] + "T00:00:00.0000000"
        data["end"]["dateTime"] = endDate.toISOString().replace(/.\d+Z$/g, "Z").split(/[T ]/i, 1)[0] + "T00:00:00.0000000"
        data["isAllDay"] = true
      }
      if (recurringEvent) {
      }
      const result = await callMsGraph("https://graph.microsoft.com/v1.0/groups/" + orgWideGroupID + "/calendar/events", "POST", true, JSON.stringify(data))
      if (result.ok){
        const dataOut = await result.json()
        if (isSchoolYear) {
          const patchData = {
            eventExtensionId: {
              "eventType":"schoolYear",
              "eventData":selectedTimetable.id
            }
          }
          const patchResult = await callMsGraph("https://graph.microsoft.com/v1.0/groups/" + orgWideGroupID + "/events/" + dataOut["id"], "PATCH", false, JSON.stringify(patchData))
          const patchOut = await patchResult.json()
        } else if (isSchoolDay && selectedSchoolDayData !== undefined) {
          const patchData = {
            eventExtensionId: {
              "eventType":"schoolDay",
              "eventData":JSON.stringify(selectedSchoolDayData)
            }
          }
          const patchResult = await callMsGraph("https://graph.microsoft.com/v1.0/groups/" + orgWideGroupID + "/events/" + dataOut["id"], "PATCH", false, JSON.stringify(patchData))
          const patchOut = await patchResult.json()
        }
      } else {
        const dataOut = await result.json()
        console.log(dataOut)
      }
    }

    async function deleteEvent() {
      if (editData !== undefined && editData.microsoftEvent && editData.microsoftReference !== undefined){
        console.log(editData.microsoftReference)
        const deleteEvent = await callMsGraph(editData.microsoftReference, "DELETE")
        if (deleteEvent.ok){
          var currentEvents = []
          for (var index = 0; index < currentEvents.length; index++){
            var result = getEventFromJSON(currentEvents[index])
            if (result.id !== editData.id){
              currentEvents.push(result)
            }
          }
          var outputEvents: string[] = []
          for (var index = 0; index < currentEvents.length; index++){
            outputEvents.push(JSON.stringify(currentEvents[index]))
          }
          console.log(currentEvents)
          dispatch(currentEventsSlice.actions.setCurrentEvents(outputEvents))
          setIsShowingAddDate(false)
        } else {
          //TO DO throw error
        }
      }
    }

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
      <View style={{backgroundColor: "white", width: width, height: height, borderRadius: 5, borderWidth: 5}}>
        { (isPickingStartDate || isPickingEndDate) ?
          <DatePicker selectedDate={isPickingStartDate ? startDate:endDate} onSetSelectedDate={(e) => {if (isPickingStartDate) {setStartDate(e); setIsPickingStartDate(false)} else {setEndDate(e);setIsPickingEndDate(false)}}} width={width} height={height} onCancel={() => {setIsPickingEndDate(false); setIsPickingStartDate(false)}} allowedDatesRange={(isSchoolDay) ? {startDate: selectedSchoolYear.startTime, endDate: selectedSchoolYear.endTime}:undefined}/>:
          <View>
            <Pressable onPress={() => {setIsShowingAddDate(false)}}>
              <CloseIcon width={10} height={10}/>
            </Pressable>
            <Text style={{fontFamily: "BukhariScript"}}>Add Event</Text>
            { isSchoolDay ?
              null:
              <View>
                <TextInput
                  value={eventName}
                  onChangeText={setEventName}
                  placeholder="Event Name"
                  style={{width: width * 0.8, height: height * 0.05, borderBottomColor: '#000000', borderBottomWidth: 1, marginLeft: width * 0.01}}
                />
                <View style={{flexDirection: "row"}}>
                  <Text>All Day</Text>
                  <Switch
                    trackColor={{false: '#767577', true: '#81b0ff'}}
                    thumbColor={allDay ? '#f5dd4b' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={setAllDay}
                    value={allDay}
                  />
                </View>
              </View>
            }
            <Text>{(isSchoolDay) ? "":"Start "}Date</Text>
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
            { isSchoolDay ?
              null:
              <View>
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
              </View>
            }
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
            <View style={{flexDirection: "row"}}>
              <Text>School Day:</Text>
              <Switch
                trackColor={{false: '#767577', true: '#81b0ff'}}
                thumbColor={isSchoolDay ? '#f5dd4b' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={(e) => {setIsSchoolDay(e); setIsSchoolYear(false); setAllDay(true)}}
                value={isSchoolDay}
              />
            </View>
            <View style={{flexDirection: "row"}}>
              <Text>School Year:</Text>
              <Switch
                trackColor={{false: '#767577', true: '#81b0ff'}}
                thumbColor={isSchoolYear ? '#f5dd4b' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={(e) => {setIsSchoolDay(false); setIsSchoolYear(e); setAllDay(true)}}
                value={isSchoolYear}
              />
            </View>
            { isSchoolDay ?
              <View style={{width: 100, height: 100}}>
                <Text>Selected School Year:</Text>
                { (selectedSchoolYear === undefined) ?
                  <SchoolYearsSelect width={100} height={100} onSelect={(e) => {setSelectedSchoolYear(e)}}/>:
                  <SchoolDaySelect width={100} height={100} timetableId={selectedSchoolYear.paulyEventData} onSelect={(day, schedule) => {setSelectedSchoolDayData({schoolDay: day, schedule: schedule})}}/>
                }
              </View>:null
            }
            { isSchoolYear ?
              <View>
                <Text>Selected Timetable: {(selectedTimetable) ? selectedTimetable.name:"Unselected"}</Text>
                <SelectTimetable governmentMode={false} onSelect={(e) => {setSelectedTimetable(e)}}/>
              </View>:null
            }
            <Pressable onPress={() => {
              setIsShowingAddDate(false); 
              createEvent()
            }} style={{width: 100, height: 50, backgroundColor: "#00a4db", alignContent: "center", alignItems: "center", justifyContent: "center", borderRadius: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 2}}>
              <Text style={{zIndex: -1}}>{editing ? "Save":"Create"}</Text>
            </Pressable>
            { editing ? 
              <Pressable onPress={() => {
                setIsShowingAddDate(false); 
                deleteEvent()
              }} style={{width: 100, height: 50, backgroundColor: "#00a4db", alignContent: "center", alignItems: "center", justifyContent: "center", borderRadius: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 2}}>
                <Text style={{zIndex: -1}}>Delete</Text>
              </Pressable>:null
            }
          </View>
        }
      </View>
    )
}

function SchoolDaySelect({width, height, timetableId, onSelect}:{width: number, height: number, timetableId: string, onSelect: (selectedSchoolDay: schoolDayType, selectedSchedule: scheduleType) => void}) {
  const [loadingState, setLoadingState] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const [schoolDays, setSchoolDays] =  useState<schoolDayType[]>([])
  const [schedules, setSchedules] = useState<scheduleType[]>([])
  const [isPickingSchoolDay, setIsPickingSchoolDay] = useState<boolean>(true)
  const [selectedSchoolDay, setSelectedSchoolDay] = useState<schoolDayType | undefined>(undefined)
  async function loadData() {
    const result = await getTimetable(timetableId)
    if (result.result === loadingStateEnum.success && result.timetable !== undefined) {
      setSchoolDays(result.timetable.days)
      setSchedules(result.timetable.schedules)
      setLoadingState(loadingStateEnum.success)
    } else {
      setLoadingState(loadingStateEnum.failed)
    }
  }
  useEffect(() => {
    loadData()
  }, [])
  return (
    <View>
      { (loadingState === loadingStateEnum.loading) ?
        <Text>Loading</Text>:
        <View>
          {(loadingState === loadingStateEnum.success) ?
            <View>
              { isPickingSchoolDay ? 
                <View>
                  {schoolDays.map((day) => (
                    <Pressable onPress={() => {setIsPickingSchoolDay(false); setSelectedSchoolDay(day)}}>
                      <View>
                        <Text>{day.name}</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>:
                <View>
                  {schedules.map((schedule) => (
                    <Pressable onPress={() => {onSelect(selectedSchoolDay, schedule)}}>
                      <View>
                        <Text>{schedule.properName}</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              }
            </View>:<Text>Failed</Text>
          }
        </View>
      }
    </View>
  )
}

function SchoolYearsSelect({width, height, onSelect}:{width: number, height: number, onSelect: (item: eventType) => void}) {
  const fullStore = useSelector((state: RootState) => state)
  const dispatch = useDispatch()
  const [loadingState, setLoadingState] = useState<loadingStateEnum>(loadingStateEnum.loading)
  async function getData() {
    const result = await getGraphEvents(true, "https://graph.microsoft.com/v1.0/groups/" + orgWideGroupID + "/calendar/events?$select=ext9u07b055_paulyEvents,id,start,end,subject")
    if (result.result === loadingStateEnum.success) {
      setLoadingState(loadingStateEnum.success)
      var outputEvents: eventType[] = result.events
      var url: string = (result.nextLink !== undefined) ? result.nextLink:""
      var notFound: boolean = (result.nextLink !== undefined) ? true:false
      while (notFound) {
        const furtherResult = await getGraphEvents(true, url)
        if (furtherResult.result === loadingStateEnum.success) {
          outputEvents = [...outputEvents, ...furtherResult.events]
          url = (furtherResult.nextLink !== undefined) ? furtherResult.nextLink:""
          notFound = (furtherResult.nextLink !== undefined) ? true:false
        } else {
          notFound = false
        }
      }
      var outputEventsString: string[] = []
      for (var index = 0; index < outputEvents.length; index++) {
        outputEventsString.push(JSON.stringify(outputEvents[index]))
      }
      dispatch(currentEventsSchoolYearSlice.actions.setCurrentEventsSchoolYear(outputEventsString))
    } else {
      setLoadingState(loadingStateEnum.failed)
    }
  }
  useEffect(() => {
    getData()
  }, [])

  return (
    <View style={{width: width, height: height, overflow: "scroll"}}>
      { (loadingState === loadingStateEnum.loading) ?
        <Text>Loading</Text>:
        <View>
          { (loadingState === loadingStateEnum.success) ?
            <View>
              { fullStore.currentEventsSchoolYear.map((event) => (
                <Pressable onPress={() => {onSelect(getEventFromJSON(event)); console.log("Event", getEventFromJSON(event))}}>
                  <View>
                    <Text>{getEventFromJSON(event).name}</Text>
                  </View>
                </Pressable>
              ))}
            </View>:
            <Text>Failed</Text>
          }
        </View>
      }
    </View>
  )
}