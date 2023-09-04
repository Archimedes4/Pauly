import { View, Text, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { loadingStateEnum } from '../../types'
import { currentEventsSchoolYearSlice } from '../../Redux/reducers/currentEventSchoolYearReducer'
import create_UUID from '../../Functions/CreateUUID'
import { getEventFromJSON } from '../../Functions/calendarFunctions'
import { getGraphEvents, getTimetable } from '../../Functions/calendarFunctionsGraph'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../Redux/store'
import { orgWideGroupID } from '../../PaulyConfig'
import getDressCodeData from '../../Functions/getDressCodeData'

enum pickSchoolDayMode {
  schoolYear,
  schoolDay,
  schedule,
  dressCode,
  dressCodeIncentives
}

export default function SelectSchoolDayData({width, height, selectedSchoolYear, setSelectedSchoolYear, selectedSchoolDayData, setSelectedSchoolDayData}:{width: number, height: number, selectedSchoolYear: eventType, setSelectedSchoolYear: (item: eventType) => void, selectedSchoolDayData: schoolDayDataType, setSelectedSchoolDayData: (item: schoolDayDataType) => void}) {
  const [schoolDayMode, setSchoolDayMode] = useState<pickSchoolDayMode>(pickSchoolDayMode.schoolYear)
  const [timetableState, setTimetableState] = useState<loadingStateEnum>(loadingStateEnum.notStarted)
  const [timetable, setTimetable] = useState<timetableType>(undefined)

  async function loadData(id: string) {
    const result = await getTimetable(id)
    if (result.result === loadingStateEnum.success && result.timetable !== undefined) {
      setTimetable(result.timetable)
      setTimetableState(loadingStateEnum.success)
    } else {
      setTimetableState(loadingStateEnum.failed)
    }
  }

  useEffect(() => {
    if (selectedSchoolYear !== undefined){
      loadData(selectedSchoolYear.paulyEventData)
    }
  }, [])

  return (
    <View style={{width: width, height: height}}>
      { (schoolDayMode === pickSchoolDayMode.schoolYear) ?
        <SchoolYearsSelect onSelect={(e) => {setSelectedSchoolYear(e); setSchoolDayMode(pickSchoolDayMode.schoolDay)}} />:null
      }
      { (schoolDayMode === pickSchoolDayMode.schoolDay) ?
        <SchoolDaySelect width={width} height={height} schoolDays={timetable.days} loadingState={timetableState} onSelect={(e) => {
          setSelectedSchoolDayData({
            schoolDay: e,
            schedule: selectedSchoolDayData.schedule,
            dressCode: selectedSchoolDayData.dressCode
          }); setSchoolDayMode(pickSchoolDayMode.schedule)
        }} />:null
      }
      { (schoolDayMode === pickSchoolDayMode.schedule) ?
        <ScheduleSelect schedules={timetable.schedules} onSelect={(e) => {
          setSelectedSchoolDayData({
            schoolDay: selectedSchoolDayData.schoolDay,
            schedule: e,
            dressCode: selectedSchoolDayData.dressCode
          }); setSchoolDayMode(pickSchoolDayMode.dressCode)
        }} />:null
      }
      { (schoolDayMode === pickSchoolDayMode.dressCode) ?
        <DressCodeSelect dressCodeData={timetable.dressCode.dressCodeData} onSelect={(e) => {
          setSelectedSchoolDayData({
            schoolDay: selectedSchoolDayData.schoolDay,
            schedule: selectedSchoolDayData.schedule,
            dressCode: e
          }); setSchoolDayMode(pickSchoolDayMode.dressCodeIncentives)
        }}/>:null
      }
      { (schoolDayMode === pickSchoolDayMode.dressCodeIncentives) ?
        <DressCodeIncentivesSelect />:null
      }
    </View>
  )
}

function SchoolYearsSelect({onSelect}:{onSelect: (item: eventType) => void}) {
    const {eventExtensionId} = useSelector((state: RootState) => state.paulyList)
    const [loadingState, setLoadingState] = useState<loadingStateEnum>(loadingStateEnum.loading)
    const [currentEventsSchoolYear, setCurrentEventsSchoolYear] = useState<eventType[]>([])

    async function getData() {
      const result = await getGraphEvents(true, "https://graph.microsoft.com/v1.0/groups/" + orgWideGroupID + "/calendar/events?$select=" + eventExtensionId + ",id,start,end,subject")
      if (result.result === loadingStateEnum.success) {
        var outputEvents: eventType[] = result.events
        var url: string = (result.nextLink !== undefined) ? result.nextLink:""
        var notFound: boolean = (result.nextLink !== undefined) ? true:false
        while (notFound) {
          const furtherResult = await getGraphEvents(true, url)
          if (furtherResult.result === loadingStateEnum.success) {
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
      <View style={{overflow: "scroll"}}>
        { (loadingState === loadingStateEnum.loading) ?
          <Text>Loading</Text>:
          <View>
            { (loadingState === loadingStateEnum.success) ?
              <View>
                { currentEventsSchoolYear.map((event) => (
                  <Pressable key={"School_Year_" + create_UUID()} onPress={() => {onSelect(event)}}>
                    <View>
                      <Text>{event.name}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>:
              <Text>Failed</Text>
            }
          </View>
        }
      </View>
    )
}

function SchoolDaySelect({width, height, schoolDays, loadingState, onSelect}:{width: number, height: number, schoolDays: schoolDayType[] | undefined, loadingState: loadingStateEnum,  onSelect: (item: schoolDayType) => void}) {
    return (
      <View style={{width: width, height: height}}>
        { (loadingState === loadingStateEnum.loading) ?
          <Text>Loading</Text>:
          <View>
            {(loadingState === loadingStateEnum.success) ?
              <View>
                {schoolDays.map((day) => (
                  <Pressable key={"Day_"+day.id} onPress={() => {onSelect(day)}}>
                    <View>
                      <Text>{day.name}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>:<Text>Failed</Text>
            }
          </View>
        }
      </View>
    )
}

function ScheduleSelect({schedules, onSelect}:{schedules: scheduleType[] | undefined, onSelect: (item: scheduleType) => void}) {
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

function DressCodeSelect({dressCodeData}:{dressCodeData: dressCodeDataType[], onSelect: (item: dressCodeDataType) => void}) {
  return (
    <View>
      <Pressable>
        <Text>Back</Text>
      </Pressable>
      {dressCodeData.map((data) => (
        <Pressable>
          <Text>{data.name}</Text>
        </Pressable>
      ))}
    </View>
  )
}

function DressCodeIncentivesSelect({}:{}) {
  return (
    <View>
      {

      }
      <Text>None</Text>
    </View>
  )
}