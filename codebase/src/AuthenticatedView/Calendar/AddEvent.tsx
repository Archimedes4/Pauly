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
import { getOrgWideEvents, getTimetable } from "../../Functions/calendarFunctions";
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

interface schoolDayDataInteface {
  schoolDay: string
  schedule: scheduleType
}

export default function AddEvent({setIsShowingAddDate, width, height, selectedDate}:{setIsShowingAddDate: (item: boolean) => void, width: number, height: number, selectedDate: Date}) {
    const microsoftAccessToken = useContext(accessTokenContent);

    //Calendar
    const [eventName, setEventName] = useState<string>("")
    const [isPickingStartDate, setIsPickingStartDate] = useState<boolean>(false)
    const [isPickingEndDate, setIsPickingEndDate] = useState<boolean>(false)
    const [startDate, setStartDate] = useState<Date>(selectedDate)
    const [endDate, setEndDate] = useState<Date>(selectedDate)
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
        data["subject"] = selectedSchoolDayData.schoolDay + " " + selectedSchoolDayData.schedule.name
      } else if (allDay) {
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
          console.log("OUTPUT", patchOut)
        } else if (isSchoolDay && selectedSchoolDayData !== undefined) {
          const patchData = {
            //Be wear this extension name could change
            "ext9u07b055_paulyEvents": {
              "eventType":"schoolDay",
              "eventData":JSON.stringify(selectedSchoolDayData)
            }
          }
          const patchResult = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/groups/" + orgWideGroupID + "/events/" + dataOut["id"], "PATCH", false, JSON.stringify(patchData))
          const patchOut = await patchResult.json()
          console.log("OUTPUT", patchOut)
        }
      } else {
        const dataOut = await result.json()
        console.log(dataOut)
      }
    }
    return (
      <View style={{backgroundColor: "white", width: width, height: height}}>
        { (isPickingStartDate || isPickingEndDate) ?
          <DatePicker selectedDate={isPickingStartDate ? startDate:endDate} onSetSelectedDate={(e) => {if (isPickingStartDate) {setStartDate(e); setIsPickingStartDate(false)} else {setEndDate(e);setIsPickingEndDate(false)}}} width={width} height={height} onCancel={() => {setIsPickingEndDate(false); setIsPickingStartDate(false)}} allowedDatesRange={(isSchoolDay) ? {startDate: selectedSchoolYear.startTime, endDate: selectedSchoolYear.endTime}:undefined}/>:
          <View>
            <Pressable onPress={() => {setIsShowingAddDate(false)}}>
              <Text>X</Text>
            </Pressable>
            <Text>Add Event</Text>
            { isSchoolDay ?
              null:
              <View>
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
                { (selectedSchoolYear === undefined) ?
                  <SchoolYearsSelect width={100} height={100} onSelect={(e) => {setSelectedSchoolYear(e)}}/>:
                  <SchoolDaySelect width={100} height={100} timetableId={selectedSchoolYear.schoolYearData} onSelect={(day, schedule) => {setSelectedSchoolDayData({schoolDay: day, schedule: schedule})}}/>
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
            }}>
              <Text style={{zIndex: -1}}>Create</Text>
            </Pressable>
          </View>
        }
      </View>
    )
}

function SchoolDaySelect({width, height, timetableId, onSelect}:{width: number, height: number, timetableId: string, onSelect: (selectedSchoolDay: string, selectedSchedule: scheduleType) => void}) {
  const microsoftAccessToken = useContext(accessTokenContent);
  const [loadingState, setLoadingState] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const [schoolDays, setSchoolDays] =  useState<string[]>([])
  const [schedules, setSchedules] = useState<scheduleType[]>([])
  const [isPickingSchoolDay, setIsPickingSchoolDay] = useState<boolean>(true)
  const [selectedSchoolDay, setSelectedSchoolDay] = useState<string | undefined>(undefined)
  async function loadData() {
    const result = await getTimetable(microsoftAccessToken.accessToken, timetableId)
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
                        <Text>{day}</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>:
                <View>
                  {schedules.map((schedule) => (
                    <Pressable onPress={() => {onSelect(selectedSchoolDay, schedule)}}>
                      <View>
                        <Text>{schedule.name}</Text>
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
  function getEvent(input: string): eventType {
    var result = JSON.parse(input)
    result["endTime"] = new Date(result["endTime"])
    result["startTime"] = new Date(result["startTime"])
    return result
  }
  const microsoftAccessToken = useContext(accessTokenContent);
  const fullStore = useSelector((state: RootState) => state)
  useEffect(() => {
    getOrgWideEvents(microsoftAccessToken.accessToken, true, undefined, "https://graph.microsoft.com/v1.0/groups/" + orgWideGroupID + "/calendar/events?$select=ext9u07b055_paulyEvents,id,start,end,subject")
  }, [])

  return (
    <View style={{width: width, height: height, overflow: "scroll"}}>
        { fullStore.calendarEventsSchoolYear.map((event) => (
          <Pressable onPress={() => {onSelect(getEvent(event)); console.log("Event", getEvent(event))}}>
            <View>
              <Text>{getEvent(event).name}</Text>
            </View>
          </Pressable>
        ))}
    </View>
  )
}