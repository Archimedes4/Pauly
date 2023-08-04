import { View, Text } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { accessTokenContent } from '../../../../../../App';
import { siteID } from '../../../../../PaulyConfig';
import callMsGraph from '../../../../../Functions/microsoftAssets';
import { Link } from 'react-router-native';

enum loadingStateEnum {
  loading,
  success,
  failed
}

declare global {
  type timetableType = {
    name: string,
    id: string,
    schedules: string[],
    days: string[]
  }
}

export default function GovernmentTimetable() {
  const microsoftAccessToken = useContext(accessTokenContent);
  const [loadingState, setLoadingState] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const [loadedTimetables, setLoadedTimetables] = useState<timetableType[]>([])
  async function getTimetables() {
    const result = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists/" + "72367e66-6d0f-4beb-8b91-bb6e9be9b433" + "/items?expand=fields")
    if (result.ok){
      const dataResult = await result.json()
      if (dataResult["value"].length !== undefined && dataResult["value"].length !== null){
        var newLoadedTimetables: timetableType[] = []
        for (let index = 0; index < dataResult["value"].length; index++) {
          try {
            const scheduleData = JSON.parse(dataResult["value"][index]["fields"]["scheduleData"]) as periodType[]
            console.log(scheduleData)
            newLoadedTimetables.push({
              name: dataResult["value"][index]["fields"]["timetableName"],
              id: dataResult["value"][index]["fields"]["timetableId"],
              schedules: JSON.parse(dataResult["value"][index]["fields"]["timetableDataSchedules"]),
              days: JSON.parse(dataResult["value"][index]["fields"]["timetableDataDays"])
            })
          } catch {
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
      <Link to="/profile/government/calendar/">
        <Text>Back</Text>
      </Link>
      <Text>Government Timetable</Text>
      { (loadingState === loadingStateEnum.loading) ?
        <Text>Loading</Text>:null
      }
      { (loadingState === loadingStateEnum.success) ?
        <View>
          { loadedTimetables.map((timetables) => (
            <Link to={"/profile/government/calendar/timetable/edit/" + timetables.id}>
              <View>
                <Text>{timetables.name}</Text>
              </View>
            </Link>
          ))
          }
        </View>:null
      }
      { (loadingState === loadingStateEnum.failed) ?
        <Text>Failure</Text>:null
      }
      <Link to="/profile/government/calendar/timetable/create">
        <Text>Create New</Text>
      </Link>
    </View>
  )
}