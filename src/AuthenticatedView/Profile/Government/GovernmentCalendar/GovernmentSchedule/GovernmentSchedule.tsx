import { View, Text, Pressable, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import callMsGraph from '../../../../../Functions/Ultility/microsoftAssets';
import { Link, useNavigate } from 'react-router-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../../Redux/store';
import { Colors, loadingStateEnum } from '../../../../../types';
import { FlatList } from 'react-native-gesture-handler';
import ProgressView from '../../../../../UI/ProgressView';
import { he } from 'react-native-paper-dates';

export default function GovernmentSchedule() {
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  const {scheduleListId, siteId} = useSelector((state: RootState) => state.paulyList)
  const [loadingState, setLoadingState] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const [loadedSchedules, setLoadedSchedules] = useState<scheduleType[]>([])
  const navigate = useNavigate()
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
              periods: scheduleData,
              color: dataResult["value"][index]["fields"]["scheduleColor"]
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
    <ScrollView style={{width: width, height: height, backgroundColor: Colors.white}}>
      <View style={{height: height * 0.1}}>
        <Pressable onPress={() => navigate("/profile/government/calendar")}>
          <Text>Back</Text>
        </Pressable>
        <View style={{alignContent: "center", alignItems: "center", justifyContent: "center"}}>
          <Text>Schedules</Text>
        </View>
      </View>
      { (loadingState === loadingStateEnum.loading) ?
        <View style={{width: width, height: height * 0.8, alignContent: "center", alignItems: "center", justifyContent: "center"}}>
          <ProgressView width={15} height={15}/>
          <Text>Loading</Text>
        </View>:null
      }
      { (loadingState === loadingStateEnum.success) ?
        <View style={{height: height * 0.8}}>
          { (loadedSchedules.length >= 1) ?
            <FlatList 
              data={loadedSchedules} 
              renderItem={(schedule) => (
                <Pressable style={{backgroundColor: "#FFFFFF", shadowColor: "black", shadowOffset: {width: 1, height: 1}, shadowOpacity: 1, shadowRadius: 5, margin: 10, marginBottom: 0, borderRadius: 15}} onPress={() => navigate(`/profile/government/calendar/schedule/${schedule.item.id}`)} key={schedule.item.id}>
                  <Text style={{margin: 10}}>{schedule.item.properName}</Text>
                </Pressable>
              )}
            />:<Text>No Schedule</Text>
          }
        </View>:null
      }
      { (loadingState === loadingStateEnum.failed) ?
        <Text>Failure</Text>:null
      }
      <Pressable onPress={() => navigate("/profile/government/calendar/schedule/create")} style={{backgroundColor: "#FFFFFF", shadowColor: "black", shadowOffset: {width: 1, height: 1}, shadowOpacity: 1, shadowRadius: 5, borderRadius: 15, marginLeft: 5, marginRight: 5}}>
        <Text style={{margin: 10}}>Create New</Text>
      </Pressable>
    </ScrollView>
  )
}