import { View, Text, Button } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import callMsGraph from '../../Functions/microsoftAssets'
import { accessTokenContent } from '../../../App';
import { siteID } from '../../PaulyConfig';
import { useParams } from 'react-router-native';
import { useMsal } from '@azure/msal-react';
import * as Location from 'expo-location';
import { RootState } from '../../Redux/store';
import { useSelector } from 'react-redux';

export default function CommissionsView() {
  const pageData = useContext(accessTokenContent);
  const {commissionListId} = useSelector((state: RootState) => state.paulyList)
  const [commissionData, setCommissionData] = useState<commissionType | undefined>(undefined)
  const { id } = useParams()
  async function getCommissionInformation() {
    const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists/" + commissionListId + "/items?expand=fields&filter=fields/CommissionID%20eq%20'"+ id +"'")
    if (result.ok){
      const data = await result.json()
      console.log(data)
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
      //TO DO error occured
      console.log("Error occured")
    }
  }
  async function claimCommission() {
    if (commissionData !== undefined) {
      const userResult = await callMsGraph("https://graph.microsoft.com/v1.0/me")
      if (userResult.ok){
        const userData = await userResult.json()
        const currentTime = new Date
        const data = {
          "fields": {
            "Title":userData["id"],
            "Submitted":currentTime.toDateString(),
            "UserID":userData["id"]
          }
        }
        const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists/" + commissionData.commissionId + "/items", "POST", false, JSON.stringify(data))
        
      }
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
    <View>
      <Text>Commission</Text>
      { (commissionData === undefined) ?
        <View>
          <Text>Loading</Text>
        </View>:
        <View>
          <Text>{commissionData.title}</Text>
        </View>
      }
      <Button title='Claim Commission' onPress={() => {claimCommission}}/>
    </View>
  )
}