import { View, Text, TextInput, Button, Pressable } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import callMsGraph from '../../../../../Functions/microsoftAssets'
import { accessTokenContent } from '../../../../../../App';
import { siteID } from '../../../../../PaulyConfig';
import create_UUID from '../../../../../Functions/CreateUUID';

enum loadingStateEnum {
  loading,
  success,
  failed
}

export default function GovernmentTimetableCreate() {
    const microsoftAccessToken = useContext(accessTokenContent);
    const [timetableName, setTimetableName] = useState<string>("")
    const [loadingState, setLoadingState] = useState<loadingStateEnum>(loadingStateEnum.loading)
    const [selectedSchedules, setSelectedSchedules] = useState<scheduleType[]>([])
    const [loadedSchedules, setLoadedSchedules] = useState<scheduleType[]>([])
    const [schoolDays, setSchoolDays] = useState<string[]>([])
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
          "timetableDataSchedules":scheduals.toString(),
          "timetableDataDays":schoolDays.toString()
        }
      }
      const result = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists/72367e66-6d0f-4beb-8b91-bb6e9be9b433/items?expand=fields", "POST", false, JSON.stringify(data))//TO DO fix site id
    }
    async function getSchedules() {
      const result = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists/b2250d2c-0301-4605-87fe-0b65ccf635e9/items?expand=fields")
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
      <Text>GovernmentTimetableCreate</Text>
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
      {schoolDays.map((item) => (
        <View>
          <Text>{item}</Text>
        </View>
      ))}
      <TextInput value={newSchoolDayName} onChangeText={setNewSchoolDayName} />
      <Button title='Add' onPress={() => {setSchoolDays([...schoolDays, newSchoolDayName]); setNewSchoolDayName("")}} />
      <Button title="Create Timetable" onPress={() => {createTimetable()}}/>
    </View>
  )
}