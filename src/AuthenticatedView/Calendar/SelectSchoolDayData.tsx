import { View, Text, Pressable, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { loadingStateEnum, semesters } from '../../types'
import create_UUID from '../../Functions/Ultility/CreateUUID'
import { getGraphEvents, getTimetable } from '../../Functions/calendar/calendarFunctionsGraph'
import { useDispatch, useSelector } from 'react-redux'
import store, { RootState } from '../../Redux/store'
import { orgWideGroupID } from '../../PaulyConfig'
import { dressCodeData } from '../../Functions/initializePauly/initializePaulyData'
import { addEventSlice } from '../../Redux/reducers/addEventReducer'

enum pickSchoolDayMode {
  schoolYear,
  schoolDay,
  schedule,
  dressCode,
  semester,
  dressCodeIncentives
}

export default function SelectSchoolDayData({width, height}:{width: number, height: number}) {
  const [schoolDayMode, setSchoolDayMode] = useState<pickSchoolDayMode>(pickSchoolDayMode.schoolYear)
  const [timetableState, setTimetableState] = useState<loadingStateEnum>(loadingStateEnum.notStarted)
  const [timetable, setTimetable] = useState<timetableType | undefined>(undefined)
  const {selectedSchoolDayData, selectedSchoolYear, selectedTimetable} = useSelector((state: RootState) => state.addEvent)
  const dispatch = useDispatch()

  async function loadData(id: string) {
    setTimetableState(loadingStateEnum.loading)
    const result = await getTimetable(id)
    if (result.result === loadingStateEnum.success && result.timetable !== undefined) {
      setTimetable(result.timetable)
      setTimetableState(loadingStateEnum.success)
    } else {
      setTimetableState(loadingStateEnum.failed)
    }
  }

  useEffect(() => {
    if (selectedSchoolYear !== undefined && timetable === undefined){
      console.log("loading Data", selectedSchoolYear)
      if (selectedSchoolYear.paulyEventData !== undefined) {
        loadData(selectedSchoolYear.paulyEventData)
      } else {
        console.log("failed  on this thing")
      }
    } else {
      console.log("This is a no go", selectedSchoolYear !== undefined, timetable === undefined)
    }
  }, [schoolDayMode, selectedSchoolYear])

  return (
    <View style={{width: width, height: height}}>
      { (schoolDayMode === pickSchoolDayMode.schoolYear) ?
        <SchoolYearsSelect onSelect={() => setSchoolDayMode(pickSchoolDayMode.schoolDay)}/>:null
      }
      { (schoolDayMode === pickSchoolDayMode.schoolDay) ?
        <SchoolDaySelect width={width} height={height} timetable={timetable} loadingState={timetableState} onSelect={() => {setSchoolDayMode(pickSchoolDayMode.schedule)}} onBack={() => {setSchoolDayMode(pickSchoolDayMode.schoolYear)}}/>:null
      }
      { (schoolDayMode === pickSchoolDayMode.schedule && timetable !== undefined && selectedSchoolDayData !== undefined) ?
        <ScheduleSelect schedules={timetable.schedules} onSelect={(e) => {
          dispatch(addEventSlice.actions.setSelectedSchoolDayData({
            schoolDay: selectedSchoolDayData.schoolDay,
            schedule: e,
            dressCode: selectedSchoolDayData.dressCode,
            semester: selectedSchoolDayData.semester
          })); setSchoolDayMode(pickSchoolDayMode.dressCode)
        }} onBack={() => {setSchoolDayMode(pickSchoolDayMode.schoolDay)}}/>:null
      }
      { (schoolDayMode === pickSchoolDayMode.dressCode && timetable!== undefined && selectedSchoolDayData !== undefined) ?
        <DressCodeSelect dressCodeData={timetable.dressCode.dressCodeData} onSelect={(e) => {
          dispatch(addEventSlice.actions.setSelectedSchoolDayData({
            schoolDay: selectedSchoolDayData.schoolDay,
            schedule: selectedSchoolDayData.schedule,
            dressCode: e,
            semester: selectedSchoolDayData.semester
          })); setSchoolDayMode(pickSchoolDayMode.semester)
        }} onBack={() => {setSchoolDayMode(pickSchoolDayMode.schedule)}}/>:null
      }
      { (schoolDayMode === pickSchoolDayMode.semester && selectedSchoolDayData !== undefined) ?
        <View>
          <Pressable onPress={() => {setSchoolDayMode(pickSchoolDayMode.dressCode)}}>
            <Text>Back</Text>
          </Pressable>
          <Pressable onPress={() => {
            dispatch(addEventSlice.actions.setSelectedSchoolDayData({
              schoolDay: selectedSchoolDayData.schoolDay,
              schedule: selectedSchoolDayData.schedule,
              dressCode: selectedSchoolDayData.dressCode,
              semester: semesters.semesterOne
            })); setSchoolDayMode(pickSchoolDayMode.dressCodeIncentives)
          }}>
            <Text>Semester One</Text>
          </Pressable>
          <Pressable onPress={() => {
            dispatch(addEventSlice.actions.setSelectedSchoolDayData({
              schoolDay: selectedSchoolDayData.schoolDay,
              schedule: selectedSchoolDayData.schedule,
              dressCode: selectedSchoolDayData.dressCode,
              semester: semesters.semesterTwo
            })); setSchoolDayMode(pickSchoolDayMode.dressCodeIncentives)
          }}>
            <Text>Semester Two</Text>
          </Pressable>
        </View>:null
      }
      { (schoolDayMode === pickSchoolDayMode.dressCodeIncentives && timetable !== undefined && selectedSchoolDayData !== undefined) ?
        <DressCodeIncentivesSelect dressCodeIncentivesData={timetable.dressCode.dressCodeIncentives} onSelect={(e) => {
          dispatch(addEventSlice.actions.setSelectedSchoolDayData({
            schoolDay: selectedSchoolDayData.schoolDay,
            schedule: selectedSchoolDayData.schedule,
            dressCode: selectedSchoolDayData.dressCode,
            semester: selectedSchoolDayData.semester,
            dressCodeIncentive: e
          }))
        }} onBack={() => {setSchoolDayMode(pickSchoolDayMode.semester)}}/>:null
      }
    </View>
  )
}

function SchoolYearsSelect({onSelect}:{onSelect: () => void}) {
  const [loadingState, setLoadingState] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const [currentEventsSchoolYear, setCurrentEventsSchoolYear] = useState<eventType[]>([])
  const dispatch = useDispatch()

  async function getData() {
    const result = await getGraphEvents(`https://graph.microsoft.com/v1.0/groups/${orgWideGroupID}/calendar/events?$expand=singleValueExtendedProperties($filter=id%20eq%20'${store.getState().paulyList.eventTypeExtensionId}'%20or%20id%20eq%20'${store.getState().paulyList.eventDataExtensionId}')&$filter=singleValueExtendedProperties/Any(ep:%20ep/id%20eq%20'${store.getState().paulyList.eventTypeExtensionId}'%20and%20ep/value%20eq%20'schoolYear')`)
    if (result.result === loadingStateEnum.success && result.events !== undefined) {
      var outputEvents: eventType[] = result.events
      var url: string = (result.nextLink !== undefined) ? result.nextLink:""
      var notFound: boolean = (result.nextLink !== undefined) ? true:false
      while (notFound) {
        const furtherResult = await getGraphEvents(url)
        if (furtherResult.result === loadingStateEnum.success && furtherResult.events !== undefined) {
          outputEvents = [...outputEvents, ...furtherResult.events]
          url = (furtherResult.nextLink !== undefined) ? furtherResult.nextLink:""
          notFound = (furtherResult.nextLink !== undefined) ? true:false
        } else {
          notFound = false
        }
      }
      setCurrentEventsSchoolYear(outputEvents)
      setLoadingState(loadingStateEnum.success)
    } else {
      setLoadingState(loadingStateEnum.failed)
    }
  }
  useEffect(() => {
    getData()
  }, [])

  return (
    <View>
      <ScrollView>
      { (loadingState === loadingStateEnum.loading) ?
        <Text>Loading</Text>:
        <View>
          { (loadingState === loadingStateEnum.success) ?
            <View>
              { currentEventsSchoolYear.map((event) => (
                <Pressable key={"School_Year_" + create_UUID()} onPress={() => {dispatch(addEventSlice.actions.setSelectedSchoolYear(event)); onSelect()}}>
                  <View>
                    <Text style={{margin: 10}}>{event.name}</Text>
                  </View>
                </Pressable>
              ))}
            </View>:
            <Text>Failed</Text>
          }
        </View>
      }
      </ScrollView>
    </View>
  )
}

function SchoolDaySelect({width, height, timetable, loadingState, onSelect, onBack}:{width: number, height: number, timetable: timetableType | undefined, loadingState: loadingStateEnum,  onSelect: () => void, onBack: () => void}) {
  const dispatch = useDispatch()
  return (
    <View>
      <Pressable onPress={() => {onBack()}}>
        <Text>Back</Text>
      </Pressable>
      <ScrollView style={{width: width, height: height}}>
      { (loadingState === loadingStateEnum.loading) ?
        <Text>Loading</Text>:
        <>
          {(loadingState === loadingStateEnum.success && timetable !== undefined) ?
            <>
              {timetable.days.map((day) => (
                <Pressable key={"Day_"+day.id} onPress={() => {onSelect(); dispatch(addEventSlice.actions.setSelectedSchoolDayData({
                  schoolDay: day,
                  schedule: {
                    properName: '',
                    descriptiveName: '',
                    periods: [],
                    id: '',
                    color: ''
                  },
                  dressCode: {
                    name: '',
                    description: '',
                    id: ''
                  },
                  semester: semesters.semesterOne
                }))}}>
                  <View>
                    <Text>{day.name}</Text>
                  </View>
                </Pressable>
              ))}
            </>:<Text>Failed</Text>
          }
        </>
      }
      </ScrollView>
    </View>
  )
}

function ScheduleSelect({schedules, onSelect}:{schedules: scheduleType[], onSelect: (item: scheduleType) => void, onBack: () => void}) {
  return (
    <View>
      {schedules.map((schedule) => (
        <Pressable key={"Schedule_"+schedule.id} onPress={() => {onSelect(schedule)}}>
          <View>
            <Text>{schedule.properName}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  )
}

function DressCodeSelect({dressCodeData, onSelect, onBack}:{dressCodeData: dressCodeDataType[], onSelect: (item: dressCodeDataType) => void, onBack: () => void}) {
  return (
    <View>
      <Pressable onPress={() => {onBack()}}>
        <Text>Back</Text>
      </Pressable>
      {dressCodeData.map((data) => (
        <Pressable onPress={() => {onSelect(data)}}>
          <Text>{data.name}</Text>
        </Pressable>
      ))}
    </View>
  )
}

function DressCodeIncentivesSelect({dressCodeIncentivesData}:{dressCodeIncentivesData: dressCodeIncentiveType[], onSelect: (item: dressCodeIncentiveType) => void, onBack: () => void}) {
  return (
    <View>
      {dressCodeIncentivesData.map((incentive) => (
        <View>
          <Text>{incentive.name}</Text>
        </View>
      ))}
      <Text>None</Text>
    </View>
  )
}