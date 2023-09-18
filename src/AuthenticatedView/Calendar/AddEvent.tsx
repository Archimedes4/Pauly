import { useCallback, useContext, useEffect, useState } from "react";
import { Pressable, View, Text, Switch, TextInput, Button } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import store, { RootState } from "../../Redux/store";
import { currentEventsSlice } from "../../Redux/reducers/currentEventReducer";
import DatePicker from "../../UI/DateTimePicker/DatePicker";
import Dropdown from "../../UI/Dropdown";
import { CalendarIcon, CloseIcon } from "../../UI/Icons/Icons";
import TimePicker from "../../UI/DateTimePicker/TimePicker";
import callMsGraph from "../../Functions/Ultility/microsoftAssets";
import { getEventFromJSON } from "../../Functions/Calendar/calendarFunctions";
import SelectTimetable from "./SelectTimetable";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { loadingStateEnum, paulyEventType} from "../../types";
import PickerWrapper from "../../UI/Pickers/Picker";
import create_UUID from "../../Functions/Ultility/CreateUUID";
import SelectSchoolDayData from "./SelectSchoolDayData";
import updateEvent from "../../Functions/updateEvent";
import { addEventSlice } from "../../Redux/reducers/addEventReducer";

export default function AddEvent({setIsShowingAddDate, width, height, editing, editData}:{setIsShowingAddDate: (item: boolean) => void, width: number, height: number, editing: boolean, editData?: eventType}) {
  const selectedDate = useSelector((state: RootState) => state.selectedDate)
  const currentEvents = useSelector((state: RootState) => state.currentEvents)
  const {selectedEventType, isPickingStartDate, isPickingEndDate, eventName, allDay, createEventState, recurringEvent, selectedRecurringType, startDate, endDate} = useSelector((state: RootState) => state.addEvent)
  const dispatch = useDispatch()
  
  useEffect(() => {
    if (selectedEventType === paulyEventType.schoolDay || selectedEventType === paulyEventType.schoolYear){
      dispatch(addEventSlice.actions.setAllDay(true))
    }
  }, [selectedEventType])

  async function deleteEvent() {
    if (editData !== undefined && editData.microsoftEvent && editData.microsoftReference !== undefined){
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

  const [selectedSchoolYear, setSelectedSchoolYear] = useState<eventType | undefined>(undefined)

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
        <DatePicker 
          selectedDate={isPickingStartDate ? (new Date(startDate)):new Date(endDate)} 
          onSetSelectedDate={(e) => {
            if (isPickingStartDate) {
              dispatch(addEventSlice.actions.setStartDate(e)); dispatch(addEventSlice.actions.setIsPickingStartDate(false))
            } else {dispatch(addEventSlice.actions.setEndDate(e)); dispatch(addEventSlice.actions.setIsPickingEndDate(false))}}} 
          width={width} height={height} onCancel={() => {dispatch(addEventSlice.actions.setIsPickingStartDate(false)); dispatch(addEventSlice.actions.setIsPickingEndDate(false))}} 
          allowedDatesRange={(selectedEventType === paulyEventType.schoolDay) ? {startDate: selectedSchoolYear.startTime, endDate: selectedSchoolYear.endTime}:undefined}/>:
        <View>
          <Pressable onPress={() => {setIsShowingAddDate(false)}}>
            <CloseIcon width={10} height={10}/>
          </Pressable>
          <Text style={{fontFamily: "BukhariScript"}}>Add Event</Text>
          <DateAndTimeSection width={width} height={height}/>
          <Text>Reocurring Event</Text>
          <Switch
            trackColor={{false: '#767577', true: '#81b0ff'}}
            thumbColor={recurringEvent ? '#f5dd4b' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={(e) => {
              dispatch(addEventSlice.actions.setRecurringEvent(e))
            }}
            value={recurringEvent}
          />
          { recurringEvent ?
            <View style={{zIndex: 100}}>
              <Dropdown onSetSelectedIndex={(item) => {
                if (item >= 0 && item <= 3){
                  dispatch(addEventSlice.actions.setSelectedRecurringType(item))
                } 
              }} selectedIndex={selectedRecurringType} style={{height: height * 0.04}} expandedStyle={{height: height * 0.12, backgroundColor: "white"}}>
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
          <GovernmentCalendarOptions width={width} height={height}/>
          <Pressable onPress={() => {
            dispatch(addEventSlice.actions.setCreateEventState(loadingStateEnum.loading))
            updateEvent()
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

function GovernmentCalendarOptions({width, height}:{width: number, height: number}) {
  // const [selectedTimetable, setSelectedTimetable] = useState<timetableStringType | undefined>(undefined)
  // const [selectedSchoolDayData, setSelectedSchoolDayData] = useState<schoolDayDataType>({
  //   schoolDay: undefined,
  //   schedule: undefined,
  //   dressCode: undefined,
  //   semester: undefined,
  //   dressCodeIncentive: undefined
  // })
  const {selectedEventType, selectedTimetable, selectedSchoolDayData, selectedSchoolYear} = useSelector((state: RootState) => state.addEvent)
  //const [selectedSchoolYear, setSelectedSchoolYear] = useState<eventType | undefined>(undefined)
  const dispatch = useDispatch()
  return (
    <>
      <PickerWrapper selectedIndex={selectedEventType} onSetSelectedIndex={(e) => {dispatch(addEventSlice.actions.setSelectedEventType(e))}} width={width} height={height * 0.05}>
        <Text>Regular</Text>
        <Text>School Day </Text>
        <Text>School Year</Text>
        <Text>Student Council</Text>
      </PickerWrapper>
      { (selectedEventType === paulyEventType.schoolDay) ?
        <View style={{width: 100, height: 100}}>
          <Text>Selected School Year:</Text>
          <SelectSchoolDayData width={100} height={100} selectedSchoolYear={selectedSchoolYear} setSelectedSchoolYear={(e) => {dispatch(addEventSlice.actions.setSelectedSchoolYear(e))}} selectedSchoolDayData={selectedSchoolDayData} setSelectedSchoolDayData={(e) => {dispatch(addEventSlice.actions.setSelectedSchoolDayData(e))}} />
        </View>:null
      }
      { (selectedEventType === paulyEventType.schoolYear) ?
        <View>
          <Text>Selected Timetable: {(selectedTimetable) ? selectedTimetable.name:"Unselected"}</Text>
          <SelectTimetable governmentMode={false} onSelect={(e) => {dispatch(addEventSlice.actions.setSelectedTimetable(e))}}/>
        </View>:null
      }
    </>
  )
}

function DateAndTimeSection({width, height}:{width: number, height: number}) {
  const {selectedEventType, eventName, allDay, startDate, endDate} = useSelector((state: RootState) => state.addEvent)
  const dispatch = useDispatch()
  return (
    <View>
      { (selectedEventType === paulyEventType.schoolDay) ?
        null:
        <View>
          <TextInput
            value={eventName}
            onChangeText={(e) => {dispatch(addEventSlice.actions.setEventName(e))}}
            placeholder="Event Name"
            style={{width: width * 0.8, height: height * 0.05, borderBottomColor: '#000000', borderBottomWidth: 1, marginLeft: width * 0.01}}
          />
          <View style={{flexDirection: "row"}}>
            <Text>All Day</Text>
            <Switch
              trackColor={{false: '#767577', true: '#81b0ff'}}
              thumbColor={allDay ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={(e) => {dispatch(addEventSlice.actions.setAllDay(e))}}
              value={allDay}
            />
          </View>
        </View>
      }
      <Text>{(selectedEventType === paulyEventType.schoolDay) ? "":"Start "}Date</Text>
      <View style={{flexDirection: "row"}}>
        <Pressable onPress={() => {dispatch(addEventSlice.actions.setIsPickingStartDate(true))}}>
          <View style={{flexDirection: "row"}}>
            <Text>{new Date(startDate).toLocaleString("en-us", { month: "long" })} {new Date(startDate).getDate()} {new Date(startDate).getFullYear()}</Text>
            <CalendarIcon width={14} height={14}/>
          </View>
        </Pressable>
        { allDay ?
          null:<TimePicker selectedHourMilitary={new Date(startDate).getHours()} selectedMinuteMilitary={new Date(startDate).getMinutes()} onSetSelectedHourMilitary={(e) => {var newDate = new Date(startDate); newDate.setHours(e); dispatch(addEventSlice.actions.setStartDate(newDate))}} onSetSelectedMinuteMilitary={(e) => {
            var newDate = new Date(startDate); newDate.setMinutes(e); dispatch(addEventSlice.actions.setStartDate(newDate))}} dimentions={{hourHeight: 12, hourWidth: width/12, minuteHeight: 12, minuteWidth: width/12, timeHeight: 12, timeWidth: width/18}}/>
        }
      </View>
      { (selectedEventType === paulyEventType.schoolDay) ?
        null:
        <View>
          <Text>End Date</Text>
          <View style={{flexDirection: "row"}}>
            <Pressable onPress={() => {dispatch(addEventSlice.actions.setIsPickingEndDate(true))}} style={{margin: 5}}>
              <View style={{flexDirection: "row"}}>
                <Text>{new Date(endDate).toLocaleString("en-us", { month: "long" })} {new Date(endDate).getDate()} {new Date(endDate).getFullYear()}</Text>
                <CalendarIcon width={14} height={14}/>
              </View>
            </Pressable>
            { allDay ?
              null:<TimePicker selectedHourMilitary={new Date(endDate).getHours()} selectedMinuteMilitary={new Date(endDate).getMinutes()} onSetSelectedHourMilitary={(e) => {var newDate = new Date(endDate); newDate.setHours(e); dispatch(addEventSlice.actions.setEndDate(newDate))}} onSetSelectedMinuteMilitary={(e) => {var newDate = new Date(endDate); newDate.setMinutes(e); dispatch(addEventSlice.actions.setEndDate(newDate))}} dimentions={{hourHeight: 12, hourWidth: width/12, minuteHeight: 12, minuteWidth: width/12, timeHeight: 12, timeWidth: width/18}}/>
            }
          </View>
        </View>
      }
    </View>
  )
}