import { useContext, useEffect, useState } from "react";
import { accessTokenContent } from "../../../App";
import callMsGraph from "../../Functions/microsoftAssets";
import DatePicker from "../../UI/DateTimePicker/DatePicker";
import { Pressable, View, Text, Switch, TextInput, Button } from "react-native";
import Dropdown from "../../UI/Dropdown";
import SelectTimetable from "./SelectTimetable";
import { CalendarIcon } from "../../UI/Icons/Icons";
import TimePicker from "../../UI/DateTimePicker/TimePicker";
import { orgWideGroupID, siteID } from "../../PaulyConfig";
import { getOrgWideEvents } from "../../Functions/calendarFunctions";
import { useSelector } from "react-redux";
import store, { RootState } from "../../Redux/store";

enum reocurringType {
    daily,
    weekly,
    monthly,
    yearly
}

enum loadingStateEnum {
  loading,
  success,
  failed
}

export default function AddEvent({setIsShowingAddDate, width, height}:{setIsShowingAddDate: (item: boolean) => void, width: number, height: number}) {
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
    const [selectedSchoolYear, setSelectedSchoolYear] = useState<eventType | undefined>(undefined)
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
      const result = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/groups/" + orgWideGroupID + "/calendar/events", "POST", true, JSON.stringify(data))
      console.log(result)
      if (result.ok){
        const dataOut = await result.json()
        console.log(dataOut)
        if (isSchoolYear) {
          const patchData = {
            //Be wear this extension name could change
            "ext9u07b055_paulyEvents": {
              "eventType":"schoolYear",
              "eventData":selectedTimetable.id
            }
          }
          const patchResult = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/groups/" + orgWideGroupID + "/events/" + dataOut["id"], "PATCH", false, JSON.stringify(patchData))
          const patchOut = await patchResult.json()
          const getResult = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/groups/" + orgWideGroupID + "/events/" + dataOut["id"] + "?$select=ext9u07b055_paulyEvents", "GET", true)
          console.log("OUTPUT", patchOut)
          const getOut = await getResult.json()
          console.log("OUTPUT GET", getOut)
        }
      } else {
        const dataOut = await result.json()
        console.log(dataOut)
      }
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
              <View style={{width: 100, height: 100}}>
                { (selectedSchoolYear === undefined) ?
                  <SchoolYearsSelect width={100} height={100} onSelect={(e) => {setSelectedSchoolYear(e)}}/>:
                  <SchoolDaySelect width={100} height={100} timetableId={selectedSchoolYear.schoolYearData} />
                }
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
                <Text>Selected Timetable: {(selectedTimetable) ? selectedTimetable.name:"Unselected"}</Text>
                <SelectTimetable governmentMode={false} onSelect={(e) => {setSelectedTimetable(e)}}/>
                
              </View>:null
            }
            <Pressable onPress={() => {
              setIsShowingAddDate(false); 
              createEvent()
            }}>
              <Text style={{zIndex: -1}}>Create</Text>
            </Pressable>
          </View>
        }
      </View>
    )
}

function getEvent(input: string): eventType {
  return JSON.parse(input)
}

function SchoolDaySelect({width, height, timetableId}:{width: number, height: number, timetableId: string}) {
  const microsoftAccessToken = useContext(accessTokenContent);
  const [loadingState, setLoadingState] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const [schoolDays, setSchoolDays] =  useState<string[]>([])
  async function getSchedule(id: string) {
    const result = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists/b2250d2c-0301-4605-87fe-0b65ccf635e9/items?expand=fields&$filter=fields/scheduleId%20eq%20'" + id +"'")//TO DO fix site id
    if (result.ok) {
      console.log(result)
      const data = await result.json()
      console.log(data)
    } else {
      const data = await result.json()
      console.log(data)
      setLoadingState(loadingStateEnum.failed)
    }
  }
  async function getTimetable() {
    const result = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists/72367e66-6d0f-4beb-8b91-bb6e9be9b433/items?expand=fields&$filter=fields/timetableId%20eq%20'" + timetableId +"'")//TO DO fix site id
    if (result.ok) {
      console.log(result)
      const data = await result.json()
      console.log(data)
      if (data["value"].length !== undefined){
        if (data["value"].length === 1) {
          try {
            setSchoolDays(JSON.parse(data["value"][0]["fields"]["timetableDataDays"]))
            const scheduleData: string[] = JSON.parse(data["value"][0]["fields"]["timetableDataSchedules"])
            for (var index = 0; index < scheduleData.length; index++) {
              getSchedule(scheduleData[index])
            }
            setLoadingState(loadingStateEnum.success)
          } catch (e) {
            console.log("Failure", e)
            setLoadingState(loadingStateEnum.failed)
          }
        } else {
          setLoadingState(loadingStateEnum.failed)
        }
      } else {
        setLoadingState(loadingStateEnum.failed)
      }
    } else {
      const data = await result.json()
      console.log(data)
      setLoadingState(loadingStateEnum.failed)
    }
  }
  useEffect(() => {
    getTimetable()
  }, [])
  return (
    <View>
      { (loadingState === loadingStateEnum.loading) ?
        <Text>Loading</Text>:
        <View>
          {(loadingState === loadingStateEnum.success) ?
            <View>
              {schoolDays.map((day) => (
                <View>
                  <Text>{day}</Text>
                </View>
              ))
              }
            </View>:<Text>Failed</Text>
          }
        </View>
      }
    </View>
  )
}

function SchoolYearsSelect({width, height, onSelect}:{width: number, height: number, onSelect: (item: eventType) => void}) {
    const microsoftAccessToken = useContext(accessTokenContent);
    const fullStore = useSelector((state: RootState) => state)
    useEffect(() => {console.log("This is calendar event reducer", fullStore)}, [fullStore.calendarEvents])
    useEffect(() => {getOrgWideEvents(microsoftAccessToken.accessToken, true, undefined, "https://graph.microsoft.com/v1.0/groups/" + orgWideGroupID + "/calendar/events?$select=ext9u07b055_paulyEvents,id,start,end,subject")}, [])
    return (
    <View style={{width: width, height: height, overflow: "scroll"}}>
        { fullStore.calendarEvents.map((event) => (
          <Pressable onPress={() => {onSelect(getEvent(event))}}>
            <View>
              <Text>{getEvent(event).name}</Text>
            </View>
          </Pressable>
        ))}
    </View>
    )
}