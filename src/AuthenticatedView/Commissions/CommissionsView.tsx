import { View, Text, Button, Pressable } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import callMsGraph from '../../Functions/Ultility/microsoftAssets'
import { useParams } from 'react-router-native';
import * as Location from 'expo-location';
import { RootState } from '../../Redux/store';
import { useSelector } from 'react-redux';
import { loadingStateEnum } from '../../types';
import CommissionClaim from './CommissionClaim';

export default function CommissionsView({id}:{id: string}) {
  const {commissionListId, siteId} = useSelector((state: RootState) => state.paulyList)
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  const [commissionData, setCommissionData] = useState<commissionType | undefined>(undefined)
  const [getCommissionLoadingState, setGetCommissionLoadingState] = useState<loadingStateEnum>(loadingStateEnum.loading)
  async function getCommissionInformation() {
    console.log("This is the id", id)
    const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + siteId + "/lists/" + commissionListId + "/items?expand=fields&filter=fields/commissionID%20eq%20'"+ id +"'")
    if (result.ok){
      const data = await result.json()
      if (data["value"].length === 1){
        //TO DO This might not be safe
        setCommissionData({
          title: data["value"][0]["fields"]["Title"],
          startDate: new Date(data["value"][0]["fields"]["StartDate"]),
          endDate: new Date(data["value"][0]["fields"]["EndDate"]),
          points: data["value"][0]["fields"]["Points"],
          hidden: data["value"][0]["fields"]["Hidden"],
          commissionId: data["value"][0]["fields"]["CommissionID"],
          proximity: data["value"][0]["fields"]["Proximity"],
          coordinateLat: data["value"][0]["fields"]["CoordinateLat"],
          coordinateLng: data["value"][0]["fields"]["CoordinateLng"]
        })
      } else {
        setGetCommissionLoadingState(loadingStateEnum.failed)
      }
    } else {
      const data = await result.json()
      console.log(data)
      setGetCommissionLoadingState(loadingStateEnum.failed)
    }
  }
  async function getUsersLocation(){
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied')
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
  }

  useEffect(() => {getCommissionInformation()}, [id])
  return (
    <View style={{width: width * 0.8, height: height * 0.8, backgroundColor: "white", shadowColor: "black", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 10}}>
      <Text>Commission</Text>
      { (commissionData === undefined) ?
        <View>
          <Text>Loading</Text>
        </View>:
        <View>
          <Text>{commissionData.title}</Text>
        </View>
      }
      <CommissionClaim commissionId={id} />
    </View>
  )
}