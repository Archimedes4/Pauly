import { View, Text, Pressable } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { accessTokenContent } from '../../../App';
import { siteID } from '../../PaulyConfig';
import callMsGraph from '../../Functions/microsoftAssets';
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

export default function SelectTimetable({governmentMode, onSelect}:{governmentMode: boolean, onSelect?: (item: timetableType) => void}) {
  const microsoftAccessToken = useContext(accessTokenContent);
  const [loadingState, setLoadingState] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const [loadedTimetables, setLoadedTimetables] = useState<timetableType[]>([])
  async function getTimetables() {
    const result = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists/" + "72367e66-6d0f-4beb-8b91-bb6e9be9b433" + "/items?expand=fields")
    if (result.ok){
      const dataResult = await result.json()
      console.log(dataResult, "Thi")
      if (dataResult["value"].length !== undefined && dataResult["value"].length !== null){
        var newLoadedTimetables: timetableType[] = []
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
        console.log(newLoadedTimetables)
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