import { View, Text, TextInput, Button, Pressable, ScrollView } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import callMsGraph from '../../../../../Functions/Ultility/microsoftAssets'
import create_UUID from '../../../../../Functions/Ultility/CreateUUID';
import { Link } from 'react-router-native';
import { DownIcon, UpIcon, WarningIcon } from '../../../../../UI/Icons/Icons';
import { Colors, loadingStateEnum } from '../../../../../types';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../../Redux/store';
import getDressCodeData from '../../../../../Functions/homepage/getDressCodeData';
import ListItem from '../../../../../UI/ListItem';

//TO DO longest amount of school days is 20 make sure this is enforced
export default function GovernmentTimetableEdit() {
  const {timetablesListId, scheduleListId, siteId} = useSelector((state: RootState) => state.paulyList)
  const {width, height} = useSelector((state: RootState) => state.dimentions)

  const [isEditing, setIsEditing] = useState<boolean>(false)

  //Loading States
  const [scheduleState, setScheduleState] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const [dressCodeState, setDressCodeState] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const [createTimetableLoadingState, setCreateTimetableLoadingState] = useState<loadingStateEnum>(loadingStateEnum.notStarted)

  //New Table Data
  const [timetableName, setTimetableName] = useState<string>("")
  const [selectedSchedules, setSelectedSchedules] = useState<scheduleType[]>([])
  const [dressCodes, setDressCodes] = useState<dressCodeType[]>([])
  const [selectedDressCode, setSelectedDressCode] = useState<dressCodeType | undefined>(undefined)
  const [loadedSchedules, setLoadedSchedules] = useState<scheduleType[]>([])
  const [schoolDays, setSchoolDays] = useState<schoolDayType[]>([])
  const [selectedDefaultSchedule, setSelectedDefaultSchedule] = useState<scheduleType | undefined>(undefined)
  async function createTimetable() {
    if (selectedDefaultSchedule !== undefined && selectedDressCode !== undefined){
      //Check to make sure all have the same number of periods 
      for (var index = 0; index < selectedSchedules.length; index++){
        if (selectedSchedules[index].periods.length !== selectedDefaultSchedule.periods.length){
          setCreateTimetableLoadingState(loadingStateEnum.failed)
          return
        }
      }

      //Create Timetable
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
          "timetableDefaultScheduleId":selectedDefaultSchedule.id,
          "timetableDressCodeId":selectedDressCode.id
        }
      }
      const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + siteId + "/lists/" + timetablesListId +"/items?expand=fields", "POST", false, JSON.stringify(data))//TO DO fix site id
      if (result.ok){
        setCreateTimetableLoadingState(loadingStateEnum.success)
      } else {
        setCreateTimetableLoadingState(loadingStateEnum.failed)
      }
    }
  }
  async function getSchedules() {
    const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + siteId + "/lists/" + scheduleListId + "/items?expand=fields")
    if (result.ok){
      const dataResult = await result.json()
      if (dataResult["value"].length !== undefined && dataResult["value"].length !== null){
        var newLoadedSchedules: scheduleType[] = []
        for (let index = 0; index < dataResult["value"].length; index++) {
          try {
            const scheduleData = JSON.parse(dataResult["value"][index]["fields"]["scheduleData"]) as periodType[]
            newLoadedSchedules.push({
              properName: dataResult["value"][index]["fields"]["scheduleProperName"],
              descriptiveName: dataResult["value"][index]["fields"]["scheduleDescriptiveName"],
              id: dataResult["value"][index]["fields"]["scheduleId"],
              periods: scheduleData,
              color: dataResult["value"][0]["fields"]["scheduleColor"]
            })
          } catch {
            //TO DO unimportant but this shouldn't be able to happen if this doesn't work most likly invalid data has somehow gotten into the schedule data column of the schedule list
          }
        }
        setLoadedSchedules(newLoadedSchedules)
        setScheduleState(loadingStateEnum.success)
      }
    } else {
      setScheduleState(loadingStateEnum.failed)
    }
  }
  async function getDressCodes() {
    const result = await getDressCodeData()
    setDressCodeState(result.result)
    if (result.result === loadingStateEnum.success && result.data !== undefined) {
      setDressCodes(result.data)
    }
  }

  useEffect(() => {
    getSchedules()
    getDressCodes()
  }, [])
  return (
    <View style={{height: height, width: width, overflow: "scroll", backgroundColor: Colors.white}}>
      <Link to="/profile/government/calendar/timetable/">
        <Text>Back</Text>
      </Link>
      <Text>Create Timetable</Text>
      <View style={{backgroundColor: "#FF6700", borderRadius: 15, margin: 5}}>
        <View style={{margin: 10}}>
          <Text>Warning: because of the way that timetables work some properties cannot be edited.</Text>
          <Text>The dress code you pick cannot change</Text>
          <Text>Schedules can be added but they have to have the same number of periods</Text>
          <Text>The number of days in a schedule cannot go up or down only the order and the name can be changed</Text>
        </View>
      </View>
      <View>
        <TextInput value={timetableName} onChangeText={(e) => {setTimetableName(e)}} placeholder='Timetable Name'/>
      </View>
      <Text>Scheduals</Text>
      <Text>Selected Schedules</Text>
      <ScrollView style={{height: height * 0.4}}>
        {selectedSchedules.map((item) => (
          <View style={{height: height * 0.05}} key={"SelectedSchedule_" + item.id}>
            <Text>{item.properName}</Text>
            { (selectedDefaultSchedule?.id !== item.id) ?
            <Pressable style={{backgroundColor: "blue", height: height * 0.02}}>
              <Text>Select As Default</Text>
            </Pressable>:null
            }
          </View>
        ))}
      </ScrollView>
      <View style={{alignItems: "center"}}>
        <Text>Other Schedules</Text>
      </View>
      <ScrollView style={{height: height * 0.4}}>
        { (scheduleState === loadingStateEnum.loading) ?
          <Text>Loading</Text>:null
        }
        { (scheduleState === loadingStateEnum.failed) ?
          <Text>Failed</Text>:null
        }
        { (scheduleState === loadingStateEnum.success) ?
          <View>
            {loadedSchedules.map((item, index) => (
              <>
              { (selectedSchedules.length === 0) ?
                <Pressable onPress={() => {setSelectedSchedules([...selectedSchedules, item]); const newLoadedSchedules = loadedSchedules.splice(index, index); setLoadedSchedules([...newLoadedSchedules]); if (selectedDefaultSchedule === undefined) {setSelectedDefaultSchedule(item)}}} key={"OtherSchedule_" + item.id}>
                  <View>
                    <Text>{item.properName}</Text>
                  </View>
                </Pressable>:
                <>
                  { (loadedSchedules[0].periods.length === item.periods.length) ?
                    <Pressable onPress={() => {setSelectedSchedules([...selectedSchedules, item]); const newLoadedSchedules = loadedSchedules.splice(index, index); setLoadedSchedules([...newLoadedSchedules]); if (selectedDefaultSchedule === undefined) {setSelectedDefaultSchedule(item)}}} key={"OtherSchedule_" + item.id}>
                      <Text>{item.properName}</Text>
                    </Pressable>:null
                  }
                </>
              }
              </>
            ))}
          </View>:null
        }
      </ScrollView>
      <SchoolDays height={height} schoolDays={schoolDays} setSchoolDays={setSchoolDays} />
      <Text>Dress Codes</Text>
      <View>
        { (dressCodeState === loadingStateEnum.loading) ?
          <Text>Loading</Text>:
          <View>
            { (dressCodeState === loadingStateEnum.success) ?
              <View>
                { dressCodes.map((dressCode) => (
                  <ListItem title={dressCode.name} width={width * 0.8} onPress={() => {setSelectedDressCode(dressCode)}} style={{backgroundColor: (selectedDressCode?.id === dressCode.id) ? "blue":Colors.white}}/>
                ))}
              </View>:<Text>Failed</Text>
            }
          </View>
        }
      </View>
      <Button title={(createTimetableLoadingState === loadingStateEnum.notStarted) ? "Create Timetable":(createTimetableLoadingState === loadingStateEnum.loading) ? "Loading":(createTimetableLoadingState === loadingStateEnum.success) ? "Success":"Failed"} onPress={() => {if (createTimetableLoadingState === loadingStateEnum.notStarted) {createTimetable()}}}/>
    </View>
  )
}

function SchoolDays({height, schoolDays, setSchoolDays}:{height: number, schoolDays: schoolDayType[], setSchoolDays: (item: schoolDayType[]) => void}) {
  return (
    <View>
      <Text>School Days</Text>
      <ScrollView style={{height: height * 0.2}}>
        {schoolDays.map((item, index) => (
          <SchoolDayItem item={item} index={index} schoolDays={schoolDays} setSchoolDays={setSchoolDays}/>
        ))}
      </ScrollView>
      <Button title='Add' onPress={() => {
        setSchoolDays([...schoolDays, {name: "", shorthand: "", id: create_UUID(), order: (schoolDays.length === 0) ? 0:schoolDays[schoolDays.length - 1].order + 1}])
      }} />
    </View>
  )
}

function SchoolDayItem({item, index, schoolDays, setSchoolDays}:{item: schoolDayType, index: number, schoolDays: schoolDayType[], setSchoolDays: (item: schoolDayType[]) => void}) {
  const [selected, setSelected] = useState<boolean>(false)
  return (
    <Pressable style={{flexDirection: "row"}} onHoverIn={() => {setSelected(true)}} onHoverOut={() => {setSelected(false)}}>
      <View style={{margin: 10, flexDirection: "row"}}>
        <View style={{marginRight: "auto"}}>
          <View style={{flexDirection: "row"}}>
            { (item.name === "") ?
              <WarningIcon width={14} height={14} outlineColor='red'/>:null
            }
            <Text>Name: </Text>
            { selected ?
              <TextInput value={item.name} onChangeText={(e) => {
                var newSchoolDays = schoolDays
                newSchoolDays[index].name = e
                setSchoolDays([...newSchoolDays])
              }}/>:<Text>{item.name}</Text>
            }
          </View>
          <View style={{flexDirection: "row"}}>
            { (item.shorthand === "") ?
              <WarningIcon width={14} height={14} outlineColor='red'/>:null
            }
            <Text>Shorthand: </Text>
            { selected ?
              <TextInput maxLength={1} value={item.shorthand} onChangeText={(e) => {
                var newSchoolDays = schoolDays
                newSchoolDays[index].shorthand = e
                setSchoolDays([...newSchoolDays])
              }}/>:<Text>{item.shorthand}</Text>
            }
          </View>
        </View>
        <View>
          {(item.order !== 0) ? 
          <Pressable onPress={() => {
            var newSchoolDays = schoolDays
            newSchoolDays[index].order = newSchoolDays[index].order - 1
            newSchoolDays[index - 1].order = newSchoolDays[index - 1].order + 1
            const saveCurrent = newSchoolDays[index]
            newSchoolDays[index] = newSchoolDays[index - 1]
            newSchoolDays[index - 1] = saveCurrent
            setSchoolDays([...newSchoolDays])
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
            setSchoolDays([...newSchoolDays])
          }}>
            <DownIcon width={10} height={10} />
          </Pressable>:null}
          <Pressable onPress={() => {
            var newSchoolDays = schoolDays
            newSchoolDays.splice(index, 1)
            setSchoolDays([...newSchoolDays])
          }}>
            <Text>X</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  )
}