import { View, Text, TextInput, Button, Pressable } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import callMsGraph from '../../../../../Functions/microsoftAssets'
import { accessTokenContent } from '../../../../../../App';
import { siteID } from '../../../../../PaulyConfig';
import create_UUID from '../../../../../Functions/CreateUUID';
import { Link } from 'react-router-native';
import { DownIcon, UpIcon } from '../../../../../UI/Icons/Icons';
import { useMsal } from '@azure/msal-react';
import { loadingStateEnum } from '../../../../../types';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../../Redux/store';
declare global {
  type schoolDayType = {
    name: string,
    id: string,
    order: number     
  }
}

export default function GovernmentTimetableCreate() {
    const pageData = useContext(accessTokenContent);

    const {timetablesListId, scheduleListId} = useSelector((state: RootState) => state.paulyList)

    //Loading States
    const [loadingState, setLoadingState] = useState<loadingStateEnum>(loadingStateEnum.loading)
    const [createTimetableLoadingState, setCreateTimetableLoadingState] = useState<loadingStateEnum>(loadingStateEnum.notStarted)

    //New Table Data
    const [timetableName, setTimetableName] = useState<string>("")
    const [selectedSchedules, setSelectedSchedules] = useState<scheduleType[]>([])
    const [loadedSchedules, setLoadedSchedules] = useState<scheduleType[]>([])
    const [schoolDays, setSchoolDays] = useState<schoolDayType[]>([])
    const [newSchoolDayName, setNewSchoolDayName] = useState<string>("")
    const [selectedDefaultSchedule, setSelectedDefaultSchedule] = useState<scheduleType | undefined>(undefined)
    async function createTimetable() {
      if (selectedDefaultSchedule !== undefined){
        setCreateTimetableLoadingState(loadingStateEnum.loading)
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
            "timetableDataDays":JSON.stringify(schoolDays),
            "timetableDefaultScheduleId":selectedDefaultSchedule.id
          }
        }
        const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists/" + timetablesListId +"/items?expand=fields", "POST", false, JSON.stringify(data))//TO DO fix site id
        if (result.ok){
          setCreateTimetableLoadingState(loadingStateEnum.success)
        } else {
          setCreateTimetableLoadingState(loadingStateEnum.failed)
        }
      }
    }
    async function getSchedules() {
      const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists/" + scheduleListId + "/items?expand=fields")
      if (result.ok){
        const dataResult = await result.json()
        if (dataResult["value"].length !== undefined && dataResult["value"].length !== null){
          var newLoadedSchedules: scheduleType[] = []
          for (let index = 0; index < dataResult["value"].length; index++) {
            try {
              const scheduleData = JSON.parse(dataResult["value"][index]["fields"]["scheduleData"]) as periodType[]
              console.log(scheduleData)
              newLoadedSchedules.push({
                properName: dataResult["value"][index]["fields"]["scheduleProperName"],
                descriptiveName: dataResult["value"][index]["fields"]["scheduleDescriptiveName"],
                id: dataResult["value"][index]["fields"]["scheduleId"],
                periods: scheduleData
              })
            } catch {
              //TO DO unimportant but this shouldn't be able to happen if this doesn't work most likly invalid data has somehow gotten into the schedule data column of the schedule list
            }
          }
          console.log("This is new Loaded Schedules", newLoadedSchedules)
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
    <View style={{height: pageData.dimensions.window.height, width: pageData.dimensions.window.width, overflow: "scroll"}}>
      <Link to="/profile/government/calendar/timetable/">
        <Text>Back</Text>
      </Link>
      <Text>Create Timetable</Text>
      <TextInput value={timetableName} onChangeText={(e) => {setTimetableName(e)}}/>
      <Text>Scheduals</Text>
      <Text>Selected Schedules</Text>
      <View style={{height: pageData.dimensions.window.height * 0.4, overflow: "scroll"}}>
      {selectedSchedules.map((item) => (
        <View style={{height: pageData.dimensions.window.height * 0.05}} key={"SelectedSchedule_" + item.id}>
          <Text>{item.properName}</Text>
          { (selectedDefaultSchedule.id !== item.id) ?
          <Pressable style={{backgroundColor: "blue", height: pageData.dimensions.window.height * 0.02}}>
            <Text>Select As Default</Text>
          </Pressable>:null
          }
        </View>
      ))}
      </View>
      <Text>Other Schedules</Text>
      <View style={{height: pageData.dimensions.window.height * 0.4, overflow: "scroll"}}>
        { (loadingState === loadingStateEnum.loading) ?
          <Text>Loading</Text>:null
        }
        { (loadingState === loadingStateEnum.failed) ?
          <Text>Failed</Text>:null
        }
        { (loadingState === loadingStateEnum.success) ?
          <View>
            {loadedSchedules.map((item, index) => (
              <Pressable onPress={() => {setSelectedSchedules([...selectedSchedules, item]); const newLoadedSchedules = loadedSchedules.splice(index, index); setLoadedSchedules([...newLoadedSchedules]); if (selectedDefaultSchedule === undefined) {setSelectedDefaultSchedule(item)}}} key={"OtherSchedule_" + item.id}>
                <View>
                  <Text>{item.properName}</Text>
                </View>
              </Pressable>
            ))}
          </View>:null
        }
      </View>
      <Text>School Days</Text>
      <View style={{height: pageData.dimensions.window.height * 0.2}}>
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
      </View>
      <TextInput value={newSchoolDayName} onChangeText={setNewSchoolDayName}/>
      <Button title='Add' onPress={() => {
        if (newSchoolDayName !== ""){
          setSchoolDays([...schoolDays, {name: newSchoolDayName, id: create_UUID(), order: (schoolDays.length === 0) ? 0:schoolDays[schoolDays.length - 1].order + 1}]); setNewSchoolDayName("")
        }
      }} />
      <Button title={(createTimetableLoadingState === loadingStateEnum.notStarted) ? "Create Timetable":(createTimetableLoadingState === loadingStateEnum.loading) ? "Loading":(createTimetableLoadingState === loadingStateEnum.success) ? "Success":"Failed"} onPress={() => {if (createTimetableLoadingState === loadingStateEnum.notStarted) {createTimetable()}}}/>
    </View>
  )
}