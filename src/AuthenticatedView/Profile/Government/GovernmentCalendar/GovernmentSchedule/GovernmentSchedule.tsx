import { View, Text } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import callMsGraph from '../../../../../Functions/microsoftAssets';
import { Link } from 'react-router-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../../Redux/store';
import { loadingStateEnum } from '../../../../../types';

export default function GovernmentSchedule() {
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  const {scheduleListId, siteId} = useSelector((state: RootState) => state.paulyList)
  const [loadingState, setLoadingState] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const [loadedSchedules, setLoadedSchedules] = useState<scheduleType[]>([])
  async function getSchedules() {
    const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + siteId + "/lists/" + scheduleListId +"/items?expand=fields")
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
              periods: scheduleData
            })
          } catch {
            setLoadingState(loadingStateEnum.failed)
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
    <View style={{width: width, height: height, backgroundColor: "white"}}>
      <Link to="/">
        <Text>Back</Text>
      </Link>
      <Text>Schedules</Text>
      { (loadingState === loadingStateEnum.loading) ?
        <Text>Loading</Text>:null
      }
      { (loadingState === loadingStateEnum.success) ?
        <View>
          { loadedSchedules.map((schedule) => (
            <Link to={"/profile/government/calendar/schedule/edit/" + schedule.id} key={schedule.id}>
              <View>
                <Text>{schedule.properName}</Text>
              </View>
            </Link>
          ))
          }
        </View>:null
      }
      { (loadingState === loadingStateEnum.failed) ?
        <Text>Failure</Text>:null
      }
      <Link to="/profile/government/calendar/schedule/create">
        <Text>Create New</Text>
      </Link>
    </View>
  )
}