import { View, Text, TextInput, Button, Pressable } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import callMsGraph from '../../../../../Functions/microsoftAssets'
import { accessTokenContent } from '../../../../../../App';
import { siteID } from '../../../../../PaulyConfig';
import create_UUID from '../../../../../Functions/CreateUUID';
import { Link } from 'react-router-native';
import { DownIcon, UpIcon } from '../../../../../UI/Icons/Icons';
import { useMsal } from '@azure/msal-react';

enum loadingStateEnum {
  loading,
  success,
  failed
}

declare global {
  type schoolDayType = {
    name: string,
    id: string,
    order: number     
  }
}

export default function GovernmentTimetableCreate() {
    const microsoftAccessToken = useContext(accessTokenContent);
    const { instance, accounts } = useMsal();
    const [timetableName, setTimetableName] = useState<string>("")
    const [loadingState, setLoadingState] = useState<loadingStateEnum>(loadingStateEnum.loading)
    const [selectedSchedules, setSelectedSchedules] = useState<scheduleType[]>([])
    const [loadedSchedules, setLoadedSchedules] = useState<scheduleType[]>([])
    const [schoolDays, setSchoolDays] = useState<schoolDayType[]>([])
    const [newSchoolDayName, setNewSchoolDayName] = useState<string>("")
    async function createTimetable() {
      var scheduals = []
      for (var index = 0; index < selectedSchedules.length; index++) {
        scheduals.push(selectedSchedules[index].id)
      }
      const data = {
        "fields": {
          "Title":timetableName,
          "timetableName":timetableName,
          "timetableId":create_UUID(),
          "timetableDataSchedules":JSON.stringify(scheduals),
          "timetableDataDays":JSON.stringify(schoolDays)
        }
      }
      const result = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists/72367e66-6d0f-4beb-8b91-bb6e9be9b433/items?expand=fields", instance, accounts, "POST", false, JSON.stringify(data))//TO DO fix site id
    }
    async function getSchedules() {
      const result = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists/b2250d2c-0301-4605-87fe-0b65ccf635e9/items?expand=fields", instance, accounts)
      if (result.ok){
        const dataResult = await result.json()
        if (dataResult["value"].length !== undefined && dataResult["value"].length !== null){
          var newLoadedSchedules: scheduleType[] = []
          for (let index = 0; index < dataResult["value"].length; index++) {
            try {
              const scheduleData = JSON.parse(dataResult["value"][index]["fields"]["scheduleData"]) as periodType[]
              console.log(scheduleData)
              newLoadedSchedules.push({
                name: dataResult["value"][index]["fields"]["name"],
                id: dataResult["value"][index]["fields"]["scheduleId"],
                periods: scheduleData
              })
            } catch {
              //TO DO unimportant but this shouldn't be able to happen if this doesn't work most likly invalid data has somehow gotten into the schedule data column of the schedule list
            }
          }
          setLoadedSchedules(newLoadedSchedules)
          setLoadingState(loadingStateEnum.success)
        }
      } else {
        setLoadingState(loadingStateEnum.failed)
      }
    }
    useEffect(() => {
      getSchedules()
    }, [])
  return (
    <View>
      <Link to="/profile/government/calendar/timetable/">
        <Text>Back</Text>
      </Link>
      <Text>Create Timetable</Text>
      <TextInput value={timetableName} onChangeText={(e) => {setTimetableName(e)}}/>
      <Text>Scheduals</Text>
      <Text>Selected Schedules</Text>
      {selectedSchedules.map((item) => (
        <View>
          <Text>{item.name}</Text>
        </View>
      ))}
      <Text>Other Schedules</Text>
      {loadedSchedules.map((item, index) => (
        <Pressable onPress={() => {setSelectedSchedules([...selectedSchedules, item]); const newLoadedSchedules = loadedSchedules.splice(index, index); setLoadedSchedules([...newLoadedSchedules])}}>
          <View>
            <Text>{item.name}</Text>
          </View>
        </Pressable>
      ))}
      <Text>School Days</Text>
      {schoolDays.map((item, index) => (
        <View style={{flexDirection: "row"}}>
          <Text>{item.name}</Text>
          {(item.order !== 0) ? 
          <Pressable onPress={() => {
            var newSchoolDays = schoolDays
            newSchoolDays[index].order = newSchoolDays[index].order - 1
            newSchoolDays[index - 1].order = newSchoolDays[index - 1].order + 1
            const saveCurrent = newSchoolDays[index]
            newSchoolDays[index] = newSchoolDays[index - 1]
            newSchoolDays[index - 1] = saveCurrent
            setSchoolDays(newSchoolDays)
          }}>
            <UpIcon width={10} height={10}/>
          </Pressable>:null}
          {((item.order + 1) < schoolDays.length) ? 
          <Pressable onPress={() => {
            var newSchoolDays = schoolDays
            newSchoolDays[index].order = newSchoolDays[index].order + 1
            newSchoolDays[index + 1].order = newSchoolDays[index + 1].order - 1
            const saveCurrent = newSchoolDays[index]
            newSchoolDays[index] = newSchoolDays[index + 1]
            newSchoolDays[index + 1] = saveCurrent
            setSchoolDays(newSchoolDays)
          }}>
            <DownIcon width={10} height={10} />
          </Pressable>:null}
          <Pressable onPress={() => {
            var newSchoolDays = schoolDays
            newSchoolDays.splice(index, 1)
            setSchoolDays(newSchoolDays)
          }}>
            <Text>X</Text>
          </Pressable>
        </View>
      ))}
      <TextInput value={newSchoolDayName} onChangeText={setNewSchoolDayName}/>
      <Button title='Add' onPress={() => {
        if (newSchoolDayName !== ""){
          setSchoolDays([...schoolDays, {name: newSchoolDayName, id: create_UUID(), order: (schoolDays.length === 0) ? 0:schoolDays[schoolDays.length - 1].order + 1}]); setNewSchoolDayName("")
        }
      }} />
      <Button title="Create Timetable" onPress={() => {createTimetable()}}/>
    </View>
  )
}