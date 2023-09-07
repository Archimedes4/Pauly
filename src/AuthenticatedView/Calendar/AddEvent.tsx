import { useCallback, useContext, useEffect, useState } from "react";
import { Pressable, View, Text, Switch, TextInput, Button } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import store, { RootState } from "../../Redux/store";
import { currentEventsSlice } from "../../Redux/reducers/currentEventReducer";
import { orgWideGroupID } from "../../PaulyConfig";
import DatePicker from "../../UI/DateTimePicker/DatePicker";
import Dropdown from "../../UI/Dropdown";
import { CalendarIcon, CloseIcon } from "../../UI/Icons/Icons";
import TimePicker from "../../UI/DateTimePicker/TimePicker";
import callMsGraph from "../../Functions/Ultility/microsoftAssets";
import { getEventFromJSON } from "../../Functions/Calendar/calendarFunctions";
import { getGraphEvents, getTimetable } from "../../Functions/Calendar/calendarFunctionsGraph";
import SelectTimetable from "./SelectTimetable";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { loadingStateEnum } from "../../types";
import PickerWrapper from "../../UI/Pickers/Picker";
import create_UUID from "../../Functions/Ultility/CreateUUID";
import SelectSchoolDayData from "./SelectSchoolDayData";

enum reocurringType {
  daily,
  weekly,
  monthly,
  yearly
}

declare global {
  type schoolDayDataCompressedType = {
    schoolDayId: string,
    scheduleId: string,
    dressCodeId: string,
    dressCodeIncentiveId: string,
    schoolYearEventId: string
  }
  type schoolDayDataType = {
    schoolDay: schoolDayType,
    schedule: scheduleType,
    dressCode: dressCodeDataType,
    dressCodeIncentive?: dressCodeIncentiveType
  }
}

enum paulyEventType {
  regular,
  schoolDay,
  schoolYear,
  studentCouncil
}

export default function AddEvent({setIsShowingAddDate, width, height, editing, editData}:{setIsShowingAddDate: (item: boolean) => void, width: number, height: number, editing: boolean, editData?: eventType}) {
    const selectedDate = useSelector((state: RootState) => state.selectedDate)
    const currentEvents = useSelector((state: RootState) => state.currentEvents)
    const dispatch = useDispatch()

    const [createEventState, setCreateEventState] = useState<loadingStateEnum>(loadingStateEnum.notStarted)

    //Calendar
    const [eventName, setEventName] = useState<string>(editing ? editData.name:"")
    const [isPickingStartDate, setIsPickingStartDate] = useState<boolean>(false)
    const [isPickingEndDate, setIsPickingEndDate] = useState<boolean>(false)
    const [startDate, setStartDate] = useState<Date>((editing) ? editData.startTime:new Date(JSON.parse(selectedDate)))
    const [endDate, setEndDate] = useState<Date>((editing) ? editData.endTime:new Date(JSON.parse(selectedDate)))
    const [allDay, setAllDay] = useState<boolean>(false)
    const [selectedEventType, setSelectedEventType] = useState<paulyEventType>(paulyEventType.regular)

    //Recurring
    const [recurringEvent, setRecurringEvent] = useState<boolean>(false)
    const [selectedReocurringType, setSelectedReocurringType] = useState<reocurringType>(reocurringType.daily)

    //School Day
    const [selectedSchoolYear, setSelectedSchoolYear] = useState<eventType | undefined>(undefined)
    const [selectedSchoolDayData, setSelectedSchoolDayData] = useState<schoolDayDataType>({
      schoolDay: undefined,
      schedule: undefined,
      dressCode: undefined,
      dressCodeIncentive: undefined
    })

    //School Year
    const [selectedTimetable, setSelectedTimetable] = useState<timetableStringType | undefined>(undefined)

    useEffect(() => {
      if (selectedEventType === paulyEventType.schoolDay || selectedEventType === paulyEventType.schoolYear){
        setAllDay(true)
      }
    }, [selectedEventType])

    async function createEvent() {
      setCreateEventState(loadingStateEnum.loading)
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
      if (selectedEventType === paulyEventType.schoolDay) {
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
      if (selectedEventType === paulyEventType.schoolYear) {

        data["singleValueExtendedProperties"] = [
          {
            "id":store.getState().paulyList.eventTypeExtensionId,
            "value":"schoolYear"
          },
          {
            "id":store.getState().paulyList.eventDataExtensionId,
            "value":selectedTimetable.id
          }
        ]
        //data["singleValueExtendedProperties"]["id"] = "String {66f5a359-4659-4830-9070-00040ec6ac6e} Name eventType"schoolYear
        // patchData[eventExtensionId]["eventData"] = selectedTimetable.id
        // const patchResult = await callMsGraph("https://graph.microsoft.com/v1.0/groups/" + orgWideGroupID + "/events/" + dataOut["id"], "PATCH", false, JSON.stringify(patchData))
        // if (!patchResult.ok){
        //   setCreateEventState(loadingStateEnum.failed)
        //   return
        // }
      } else if (selectedEventType === paulyEventType.schoolDay && selectedSchoolDayData !== undefined) {
        const selectedSchoolDayDataCompressed: schoolDayDataCompressedType = {
          schoolDayId: selectedSchoolDayData.schoolDay.id,
          scheduleId: selectedSchoolDayData.schedule.id,
          dressCodeId: selectedSchoolDayData.dressCode.id,
          dressCodeIncentiveId: selectedSchoolDayData.dressCodeIncentive?.id,
          schoolYearEventId: selectedSchoolYear.id
        }
        data["singleValueExtendedProperties"] = [
          {
            "id":`String {${create_UUID()}} Name eventType`,
            "value":"schoolDay"
          },
          {
            "id":`String {${create_UUID()}} Name eventData`,
            "value":JSON.stringify(selectedSchoolDayDataCompressed)
          }
        ]
        // var patchDataDay = {}
        // patchDataDay[eventExtensionId] = {}
        // patchDataDay[eventExtensionId]["eventType"] = "schoolDay"
        // patchDataDay[eventExtensionId]["eventData"] = JSON.stringify(selectedSchoolDayDataCompressed)
        // const patchResult = await callMsGraph("https://graph.microsoft.com/v1.0/groups/" + orgWideGroupID + "/events/" + dataOut["id"], "PATCH", false, JSON.stringify(patchDataDay))
        // if (patchResult.ok){
        //   setCreateEventState(loadingStateEnum.success)
        // } else {
        //   setCreateEventState(loadingStateEnum.failed)
        //   return
        // }
      }
      if (recurringEvent) {
      }
      const result = await callMsGraph("https://graph.microsoft.com/v1.0/groups/" + orgWideGroupID + "/calendar/events", "POST", true, JSON.stringify(data))
      if (result.ok){
        const dataOut = await result.json()
        console.log(dataOut)
        setCreateEventState(loadingStateEnum.success)
        const resultEvent: eventType = {
          id: data["id"],
          name: dataOut["subject"],
          startTime: new Date(dataOut["start"]["dateTime"]),
          endTime: new Date(dataOut["end"]["dateTime"]),
          eventColor: "white",
          paulyEventType: (selectedEventType === paulyEventType.schoolDay) ? "schoolDay":(selectedEventType === paulyEventType.schoolYear) ? "schoolYear":undefined,
          paulyEventData: (selectedEventType === paulyEventType.schoolDay) ? JSON.stringify(selectedSchoolDayData):(selectedEventType === paulyEventType.schoolYear) ? selectedTimetable.id:undefined,
          microsoftEvent: true,
          microsoftReference: ""
        }
        dispatch(currentEventsSlice.actions.pushEvent(JSON.stringify(resultEvent)))
      } else {
        setCreateEventState(loadingStateEnum.failed)
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
          <DatePicker selectedDate={isPickingStartDate ? startDate:endDate} onSetSelectedDate={(e) => {if (isPickingStartDate) {setStartDate(e); setIsPickingStartDate(false)} else {setEndDate(e);setIsPickingEndDate(false)}}} width={width} height={height} onCancel={() => {setIsPickingEndDate(false); setIsPickingStartDate(false)}} allowedDatesRange={(selectedEventType === paulyEventType.schoolDay) ? {startDate: selectedSchoolYear.startTime, endDate: selectedSchoolYear.endTime}:undefined}/>:
          <View>
            <Pressable onPress={() => {setIsShowingAddDate(false)}}>
              <CloseIcon width={10} height={10}/>
            </Pressable>
            <Text style={{fontFamily: "BukhariScript"}}>Add Event</Text>
            { (selectedEventType === paulyEventType.schoolDay) ?
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
            <Text>{(selectedEventType === paulyEventType.schoolDay) ? "":"Start "}Date</Text>
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
            { (selectedEventType === paulyEventType.schoolDay) ?
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
            <PickerWrapper selectedIndex={selectedEventType} onSetSelectedIndex={setSelectedEventType} width={width} height={height * 0.05}>
              <Text>Regular</Text>
              <Text>School Day </Text>
              <Text>School Year</Text>
              <Text>Student Council</Text>
            </PickerWrapper>
            { (selectedEventType === paulyEventType.schoolDay) ?
              <View style={{width: 100, height: 100}}>
                <Text>Selected School Year:</Text>
                <SelectSchoolDayData width={100} height={100} selectedSchoolYear={selectedSchoolYear} setSelectedSchoolYear={setSelectedSchoolYear} selectedSchoolDayData={selectedSchoolDayData} setSelectedSchoolDayData={setSelectedSchoolDayData} />
              </View>:null
            }
            { (selectedEventType === paulyEventType.schoolYear) ?
              <View>
                <Text>Selected Timetable: {(selectedTimetable) ? selectedTimetable.name:"Unselected"}</Text>
                <SelectTimetable governmentMode={false} onSelect={(e) => {setSelectedTimetable(e)}}/>
              </View>:null
            }
            <Pressable onPress={() => {
              createEvent()
            }} style={{width: 100, height: 50, backgroundColor: "#00a4db", alignContent: "center", alignItems: "center", justifyContent: "center", borderRadius: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 2}}>
              <Text style={{zIndex: -1}}>{editing ? "Save":(createEventState === loadingStateEnum.notStarted) ? "Create":(createEventState === loadingStateEnum.loading) ? "Loading":(createEventState === loadingStateEnum.success) ? "Success":"Failed"}</Text>
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