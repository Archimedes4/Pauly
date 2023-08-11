import { View, Text } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { accessTokenContent } from '../../../../../../App';
import { siteID } from '../../../../../PaulyConfig';
import callMsGraph from '../../../../../Functions/microsoftAssets';
import { Link } from 'react-router-native';
import { useMsal } from '@azure/msal-react';

enum loadingStateEnum {
  loading,
  success,
  failed
}

export default function GovernmentSchedule() {
  const microsoftAccessToken = useContext(accessTokenContent);
  const { instance, accounts } = useMsal();
  const [loadingState, setLoadingState] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const [loadedSchedules, setLoadedSchedules] = useState<scheduleType[]>([])
  async function getSchedules() {
    const result = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists/b2250d2c-0301-4605-87fe-0b65ccf635e9/items?expand=fields", instance, accounts)
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
      <Link to="/">
        <Text>Back</Text>
      </Link>
      <Text>GovernmentSchedule</Text>
      { (loadingState === loadingStateEnum.loading) ?
        <Text>Loading</Text>:null
      }
      { (loadingState === loadingStateEnum.success) ?
        <View>
          { loadedSchedules.map((schedule) => (
            <Link to={"/profile/government/calendar/schedule/edit/" + schedule.id} key={schedule.id}>
              <View>
                <Text>{schedule.name}</Text>
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