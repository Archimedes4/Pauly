import { View, Text, TextInput, Button, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import TimePicker from '../../../../../UI/DateTimePicker/TimePicker'
import { useNavigate } from 'react-router-native'
import callMsGraph from '../../../../../Functions/Ultility/microsoftAssets'
import create_UUID from '../../../../../Functions/Ultility/CreateUUID'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../../Redux/store'
import { loadingStateEnum } from '../../../../../types'
import { WarningIcon } from '../../../../../UI/Icons/Icons'

function isValidHexaCode(input: string) {
  // Define the regular expression pattern for a valid hexadecimal color code
  // It matches either a 6-character or 3-character code, preceded by a #
  var hexaPattern = /^#(?:[0-9a-fA-F]{3,4}){1,2}$/;

  // Test the input against the pattern using the test() method
  return hexaPattern.test(input);
}

//NOTE: period length cannot be longer than 20
export default function GovernmentSchedule() {
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  const {scheduleListId, siteId} = useSelector((state: RootState) => state.paulyList)
  const [newPeriodHourStart, setNewPeriodHourStart] = useState<number>(12)
  const [newPeriodMinuteStart, setNewPeriodMinuteStart] = useState<number>(0)
  const [newPeriodHourEnd, setNewPeriodHourEnd] = useState<number>(12)
  const [newPeriodMinuteEnd, setNewPeriodMinuteEnd] = useState<number>(0)
  const [scheduleProperName, setScheduleProperName] = useState<string>("")
  const [scheduleDescriptiveName, setScheduleDescriptiveName] = useState<string>("")
  const [newPeriods, setNewPeriods] = useState<periodType[]>([])
  const [createScheduleLoadingState, setCreateScheduleLoadingState] = useState<loadingStateEnum>(loadingStateEnum.notStarted)
  const [color, setColor] = useState<string>("")
  const navigate = useNavigate()
  async function submitSchedule() {
    setCreateScheduleLoadingState(loadingStateEnum.loading)
    const data = {
      "fields": {
        "Title":scheduleProperName,
        "scheduleId":create_UUID(),
        "scheduleProperName":scheduleProperName,
        "scheduleDescriptiveName":scheduleDescriptiveName,
        "scheduleColor":color,
        "scheduleData":JSON.stringify(newPeriods)
      }
    }
    const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + siteId + "/lists/" + scheduleListId + "/items", "POST", false, JSON.stringify(data))
    if (result.ok){
      setCreateScheduleLoadingState(loadingStateEnum.success)
    } else {
      setCreateScheduleLoadingState(loadingStateEnum.failed)
    }
  }
  useEffect(() => {console.log("This", newPeriods)}, [newPeriods])
  return (
    <View style={{width: width, height: height, backgroundColor: "white"}}>
      <Pressable onPress={() => {navigate("/profile/government/calendar")}}>
        <Text>Back</Text>
      </Pressable>
      <View style={{width: width, alignContent: "center", alignItems: "center", justifyContent: "center"}}>
        <Text>Create Schedule</Text>
      </View>
      <View style={{height: height * 0.3}}>
        <View style={{flexDirection: "row"}}>
          <Text>Proper Name:</Text>
          <TextInput style={{width: width}} value={scheduleProperName} onChangeText={setScheduleProperName} placeholder='Proper Name ex. Schedule One'/>
        </View>
        <View style={{flexDirection: "row"}}>
          <Text>Descriptive Name:</Text>
          <TextInput style={{width: width}} value={scheduleDescriptiveName} onChangeText={setScheduleDescriptiveName} placeholder='Descriptive Name ex. Regular Schedule'/>
        </View>
        <View style={{margin: 5, borderRadius: 5, backgroundColor: "#FF6700"}}>
          <View style={{margin: 10, flexDirection: "row"}}>
            <WarningIcon width={14} height={14} />
            <Text>Keep descriptive name short as it is used in the calendar widget</Text>
          </View>
        </View>
      </View>
      <Text>New Periods</Text>
      <View style={{height: height * 0.5}}>
      {newPeriods.map((period) => (
        <PeriodBlock period={period} newPeriods={newPeriods} onSetNewPeriods={(out) => {
          setNewPeriods([...out])
        }}/>
      ))}
      </View>
      <Text>Color</Text>
      <View style={{flexDirection: "row"}}>
        { (!isValidHexaCode(color)) ?
          <WarningIcon width={12} height={12} outlineColor='red'/>:null
        }
        <TextInput value={color} onChangeText={(text) => {setColor(text)}}/>
      </View>
      <TimePicker selectedHourMilitary={newPeriodHourStart} selectedMinuteMilitary={newPeriodMinuteStart} onSetSelectedHourMilitary={setNewPeriodHourStart} onSetSelectedMinuteMilitary={setNewPeriodMinuteStart}/>
      <TimePicker selectedHourMilitary={newPeriodHourEnd} selectedMinuteMilitary={newPeriodMinuteEnd} onSetSelectedHourMilitary={setNewPeriodHourEnd} onSetSelectedMinuteMilitary={setNewPeriodMinuteEnd}/>
      { (newPeriods.length < 20) ?
        <Button title="Add Period" onPress={() => {setNewPeriods([...newPeriods, {startHour: newPeriodHourStart, startMinute: newPeriodMinuteStart, endHour: newPeriodHourEnd, endMinute: newPeriodMinuteEnd, id: create_UUID()}])}}/>:null
      }
      <Pressable onPress={() => {
        if (createScheduleLoadingState === loadingStateEnum.notStarted && isValidHexaCode(color)) {
          submitSchedule()
        }
      }} disabled={!isValidHexaCode}>
        <Text>{(!isValidHexaCode(color)) ? "Cannot Start":(createScheduleLoadingState === loadingStateEnum.notStarted) ? "Create Schedule":(createScheduleLoadingState === loadingStateEnum.loading) ? "Loading":(createScheduleLoadingState === loadingStateEnum.success) ? "Success":"Failed"}</Text>
      </Pressable>
    </View>
  )
}

function PeriodBlock({period, newPeriods, onSetNewPeriods}:{period: periodType, newPeriods: periodType[], onSetNewPeriods: (item: periodType[]) => void}) {
  function deleteItem(period: periodType) {
    var newNewPeriodsArray: periodType[] = newPeriods
    if (newNewPeriodsArray.length === 1){
      newNewPeriodsArray.pop()
      onSetNewPeriods(newNewPeriodsArray)
    } else {
      const indexToRemove = newNewPeriodsArray.findIndex((e) => {return e.id === period.id})
      if (indexToRemove !== -1) {
        newNewPeriodsArray.splice(indexToRemove, indexToRemove)
      } else {
        //TO DO something went wrong this should not be possible though
      }
      onSetNewPeriods(newNewPeriodsArray)
    }
  }
  return (
    <View key={period.id}>
      <Text>{period.startHour}:{period.startMinute}</Text>
      <Text>{period.endHour}:{period.endMinute}</Text>
      <Button title='remove' onPress={() => {
        deleteItem(period)
      }}/>
    </View>
  )
}