import { View, Text, TextInput, Pressable, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import callMsGraph from '../../../../Functions/Ultility/microsoftAssets'
import store, { RootState } from '../../../../Redux/store';
import { useSelector } from 'react-redux';
import { Colors, loadingStateEnum, semesters } from '../../../../types';
import { useNavigate, useParams } from 'react-router-native';
import getSchoolYears from '../../../../Functions/calendar/getSchoolYears';
import SegmentedPicker from '../../../../UI/Pickers/SegmentedPicker';
import { getEvent, getTimetable } from '../../../../Functions/calendar/calendarFunctionsGraph';
import { CloseIcon, WarningIcon } from '../../../../UI/Icons/Icons';
import Dropdown from '../../../../UI/Dropdown';
import { getRoom, getRooms } from '../../../../Functions/classesFunctions';

export default function GovernmentClassesEdit() {
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  const {id} = useParams()
  const navigate = useNavigate();
  
  const [selectedSemester, setSelectedSemester] = useState<semesters>(semesters.semesterOne)

  const [className, setClassName] = useState<string>("")

  //Rooms States
  const [roomSearchText, setRoomSearchText] = useState<string>("")
  const [roomsNextLink, setRoomsNextLink] = useState<string | undefined>(undefined)
  const [rooms, setRooms] = useState<roomType[]>([])
  const [roomsState, setRoomsState] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const [selectedRoom, setSelectedRoom] = useState<roomType | undefined>(undefined)

  //School Years State
  const [schoolYearState, setSchoolYearState] =  useState<loadingStateEnum>(loadingStateEnum.loading)
  const [schoolYearNextLink, setSchoolYearNextLink] = useState<string | undefined>(undefined)
  const [schoolYears, setSchoolYears] = useState<eventType[]>([])
  const [selectedSchoolYear, setSelectedSchoolYear] = useState<eventType | undefined>(undefined)

  const [timetableState, setTimetableState] = useState<loadingStateEnum>(loadingStateEnum.notStarted)
  const [selectedTimetable, setSelectedTimetable] = useState<timetableType | undefined>(undefined)

  const [classState, setClassState] = useState<loadingStateEnum>(loadingStateEnum.notStarted)

  const [updateClassState, setUpdateClassState] = useState<loadingStateEnum>(loadingStateEnum.notStarted)
  const [isShowingClassConfirmMenu, setIsShowingClassConfirmMenu] = useState<boolean>(false)

  const [periods, setPeriods] = useState<number[]>([])

  async function getClass() {
    setClassState(loadingStateEnum.loading)
    const result = await callMsGraph("https://graph.microsoft.com/v1.0/groups/" + id + "?$select=" + store.getState().paulyList.classExtensionId + ",displayName") //TO DO change to class
    if (result.ok) {
      const data = await result.json()
      const extensionData = data[store.getState().paulyList.classExtensionId]
      if (extensionData !== undefined) {
        setClassName(extensionData["className"])
        setSelectedSemester(parseInt(extensionData["semesterId"]))
        setPeriods(JSON.parse(extensionData["periodData"]))
        const eventResult = await getEvent(extensionData["schoolYearEventId"])
        const roomResult = await getRoom(extensionData["roomId"])
        if (eventResult.result === loadingStateEnum.success && roomResult.result === loadingStateEnum.success && eventResult.data !== undefined && roomResult.data !== undefined) {
          setSelectedRoom(roomResult.data)
          setSelectedSchoolYear(eventResult.data)
        } else {
          setClassState(loadingStateEnum.failed)
        }
      } else {
        setClassName(data["displayName"])
      }
      setClassState(loadingStateEnum.success)
    } else {
      setClassState(loadingStateEnum.failed)
    }
  }

  async function loadRooms() {
    //TO DO figure out if there will be performance issuses in continually getting next page
    const result = await getRooms(roomsNextLink, (roomSearchText !== "") ? roomSearchText:undefined)
    if (result.result === loadingStateEnum.success && result.data !== undefined) {
      setRooms(result.data)
    }
    setRoomsState(result.result)
    setRoomsNextLink(result.nextLink)
  }

  async function loadSchoolYears() {
    const result = await getSchoolYears(schoolYearNextLink) 
    if (result.result === loadingStateEnum.success && result.events !== undefined) {
      setSchoolYears(result.events)
    }
    setSchoolYearState(result.result)
    setSchoolYearNextLink(result.nextLink)
  }

  async function loadTimetable() {
    if (selectedSchoolYear !== undefined && selectedSchoolYear.paulyEventData !== undefined){
      setTimetableState(loadingStateEnum.loading)
      const result = await getTimetable(selectedSchoolYear.paulyEventData)
      if (result.result === loadingStateEnum.success && result.timetable !== undefined){
        if (result.timetable.days.length !== periods.length) {
          var newArray = Array.from(Array(result.timetable.days.length))
          newArray.fill(0, 0, newArray.length)
          setPeriods(newArray)
        }
        setSelectedTimetable(result.timetable)
      }
      setTimetableState(result.result)
    }
  }

  useEffect(() => {
    loadTimetable()
  }, [selectedSchoolYear])

  useEffect(() => {
    getClass()
  }, [])

  async function updateClass() {
    if (selectedRoom !== undefined && selectedSchoolYear !== undefined) {
      setUpdateClassState(loadingStateEnum.loading)
      const data = {}
      Object.defineProperty(data, store.getState().paulyList.classExtensionId, {
        value: {
        "className":className,
        "schoolYearEventId": selectedSchoolYear.id,
        "semesterId": selectedSemester.toString(),
        "roomId": selectedRoom.id,
        "periodData": JSON.stringify(periods)
        }
      })
      
      const result = await callMsGraph(`https://graph.microsoft.com/v1.0/groups/${id}`, "PATCH", JSON.stringify(data))
      if (result.ok){
        setUpdateClassState(loadingStateEnum.success)
      } else {
        setUpdateClassState(loadingStateEnum.failed)
      }
    }
  }

  useEffect(() => {
    loadRooms()
  }, [roomSearchText])

  useEffect(() => {
    loadSchoolYears()
  }, [])

  return (
    <>
      <ScrollView style={{width: width, height: height, backgroundColor: Colors.white}}>
        { (classState === loadingStateEnum.loading) ?
          <View>
            <Pressable onPress={() => {
              navigate("/profile/government/classes")
            }}>
              <Text>Back</Text>
            </Pressable>
            <Text>Loading</Text>
          </View>:
          <View>
            { (classState === loadingStateEnum.success) ?
              <View style={{width: width, height: height, backgroundColor: Colors.white}}>
                <Pressable onPress={() => {
                  navigate("/profile/government/classes")
                }}>
                  <Text>Back</Text>
                </Pressable>
                <Text>Add Class Data</Text>
                <View>
                  <Text>Name:</Text>
                  <TextInput value={className} onChangeText={setClassName}/>
                </View>
                <Text>School Years</Text>
                <View style={{height: height * 0.3}}>
                  { (schoolYearState === loadingStateEnum.loading) ?
                    <Text>Loading</Text>:
                    <View>
                      { (schoolYearState === loadingStateEnum.success) ?
                        <ScrollView style={{height: height * 0.3}}>
                          { schoolYears.map((year) => (
                            <Pressable onPress={() => {
                              setSelectedSchoolYear(year)
                            }}>
                              <Text>{year.name}</Text>
                            </Pressable>
                          ))}
                        </ScrollView>:<Text>Failed</Text>
                      }
                    </View>
                  }
                </View>
                <View style={{height: height * 0.3, marginBottom: height * 0.1}}>
                  <Text>Periods</Text>
                  <Text>{periods.toString()}</Text>
                  { (timetableState === loadingStateEnum.notStarted) ?
                    <Text>Please pick a school year</Text>:
                    <View>
                      { (timetableState === loadingStateEnum.loading) ?
                        <Text>Loading</Text>:
                        <View style={{zIndex: 100}}>
                          { (timetableState === loadingStateEnum.success && selectedTimetable?.days.length === periods.length) ?
                            <ScrollView style={{height: height * 0.3, zIndex: 100}}>
                              <>
                                { selectedTimetable.days.map((day, dayIndex) => (
                                  <DayBlock day={day} dayIndex={dayIndex} periods={periods} setPeriods={setPeriods} selectedTimetable={selectedTimetable} />
                                ))}
                              </>
                            </ScrollView>:
                            <Text>Failed</Text>
                          }
                        </View>
                      }
                    </View>
                  }
                </View>
                <SegmentedPicker selectedIndex={selectedSemester} setSelectedIndex={setSelectedSemester} options={["Semester One", "Semester Two"]} width={width * 0.85} height={height * 0.1} />
                <View style={{flexDirection: "row"}}>
                  { (selectedRoom === undefined) ?
                    <WarningIcon width={12} height={12} outlineColor='red'/>:null
                  }
                  <Text>Select Room</Text>
                </View>
                <View style={{height: height * 0.3}}>
                  { (roomsState === loadingStateEnum.loading) ?
                    <Text>Loading</Text>:
                    <View>
                      { (roomsState === loadingStateEnum.success) ?
                        <ScrollView style={{height: height * 0.3}}>
                          { rooms.map((room) => (
                            <Pressable onPress={() => {setSelectedRoom(room)}}>
                              <Text>{room.name}</Text>
                            </Pressable>
                          ))}
                        </ScrollView>:<Text>Failed</Text>
                      }
                    </View>
                  }
                </View>
                <Pressable onPress={() => {setIsShowingClassConfirmMenu(true)}}>
                  <Text>Create Class</Text>
                </Pressable>
              </View>:<Text>Failed</Text>
            }
          </View>
        }
      </ScrollView>
      { isShowingClassConfirmMenu ? 
        <View style={{width: width * 0.8, height: height * 0.8, top: height * 0.1, left: width * 0.1, borderRadius: 15, backgroundColor: Colors.white, position: "absolute", shadowColor: "black", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 10}}>
          <Pressable onPress={() => {setIsShowingClassConfirmMenu(false)}}>
            <CloseIcon width={14} height={14} />
          </Pressable>
          <Text>Create Class</Text>
          <Text>Name: {className}</Text>
          <Text>Room: {selectedRoom?.name}</Text>
          <Text>School Year: {selectedSchoolYear?.name}</Text>
          <Text>Semester: {(selectedSemester === semesters.semesterOne) ? "One":"Two"}</Text>
          <Pressable onPress={() => {updateClass()}}>
            <Text style={{margin: 10}}>{(updateClassState === loadingStateEnum.cannotStart) ? "Cannot Update Class":(updateClassState === loadingStateEnum.notStarted) ? "Update Class":(updateClassState === loadingStateEnum.loading) ? "Loading":(updateClassState === loadingStateEnum.success) ? "Updated Class":"Failed To Update Class"}</Text>
          </Pressable>
        </View>:null
      }
    </>
  )
}

function DayBlock({day, periods, dayIndex, setPeriods, selectedTimetable}:{day: schoolDayType, dayIndex: number, periods: number[], setPeriods: (item: number[]) => void, selectedTimetable: timetableType}) {
  const [selected, setSelected] = useState<boolean>(false)
  return (
    <View key={"Day_"+day.id} style={{flexDirection: "row", margin: 10, zIndex: (selected) ? 200:100}}>
      <Text>{day.name}</Text>
      <View>
        { (selectedTimetable?.schedules.length >= 1 && periods.length >= dayIndex) ?
          <Dropdown selectedIndex={periods[dayIndex]} onSetSelectedIndex={(index) => {
            if (periods.length >= dayIndex) {
              var newPeriods = periods;
              newPeriods[dayIndex] = index;
              setPeriods([...newPeriods]);
            }
          }} expanded={selected} setExpanded={(e) => {setSelected(e)}} style={{ backgroundColor: Colors.white, zIndex: -2}} expandedStyle={{backgroundColor: "blue", zIndex: 101, position: "absolute"}} options={["unchosen", ...Array.from(selectedTimetable.schedules[0].periods).flatMap((_item, index) => ((index + 1).toString()))]} children={''} />
          :<Text>Something went wrong please reload the page.</Text>
        }
      </View>
    </View>
  )
}