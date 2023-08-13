import { View, Text, Pressable } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { accessTokenContent } from '../../../App';
import { siteID } from '../../PaulyConfig';
import callMsGraph from '../../Functions/microsoftAssets';
import { Link } from 'react-router-native';
import { useMsal } from '@azure/msal-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../Redux/store';
import { loadingStateEnum } from '../../types';

declare global {
    type timetableStringType = {
      name: string,
      id: string,
      schedules: string[],
      days: string[]
    }
    type timetableType = {
      name: string,
      id: string,
      schedules: scheduleType[],
      days: schoolDayType[]
    }
}  

export default function SelectTimetable({governmentMode, onSelect}:{governmentMode: boolean, onSelect?: (item: timetableStringType) => void}) {
  const pageData = useContext(accessTokenContent);
  const { instance, accounts } = useMsal();
  const {timetablesListId} = useSelector((state: RootState) => state.paulyList)
  const [loadingState, setLoadingState] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const [loadedTimetables, setLoadedTimetables] = useState<timetableStringType[]>([])
  async function getTimetables() {
    const result = await callMsGraph(pageData.accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists/" + timetablesListId + "/items?expand=fields", instance, accounts)
    if (result.ok){
      const dataResult = await result.json()
      if (dataResult["value"].length !== undefined && dataResult["value"].length !== null){
        var newLoadedTimetables: timetableStringType[] = []
        for (let index = 0; index < dataResult["value"].length; index++) {
          try {
            newLoadedTimetables.push({
              name: dataResult["value"][index]["fields"]["timetableName"],
              id: dataResult["value"][index]["fields"]["timetableId"],
              schedules: JSON.parse(dataResult["value"][index]["fields"]["timetableDataSchedules"]),
              days: JSON.parse(dataResult["value"][index]["fields"]["timetableDataDays"])
            })
          } catch (e) {
            console.log("Error", e)
            //TO DO unimportant but this shouldn't be able to happen if this doesn't work most likly invalid data has somehow gotten into the schedule data column of the schedule list
          }
        }
        setLoadedTimetables(newLoadedTimetables)
        setLoadingState(loadingStateEnum.success)
      }
    } else {
      setLoadingState(loadingStateEnum.failed)
    }
  }
  useEffect(() => {
    getTimetables()
  }, [])
  return (
    <View>
      { (loadingState === loadingStateEnum.loading) ?
        <Text>Loading</Text>:null
      }
      { (loadingState === loadingStateEnum.success) ?
        <View>
          { loadedTimetables.map((timetables) => (
            <>
                { governmentMode ?
                    <Link to={"/profile/government/calendar/timetable/edit/" + timetables.id}>
                        <View>
                            <Text>{timetables.name}</Text>
                        </View>
                    </Link>:
                    <Pressable onPress={() => {onSelect(timetables)}}>
                        <View>
                            <Text>{timetables.name}</Text>
                        </View>
                    </Pressable>
                }
            </>
          ))
          }
        </View>:null
      }
      { (loadingState === loadingStateEnum.failed) ?
        <Text>Failure</Text>:null
      }
    </View>
  )
}