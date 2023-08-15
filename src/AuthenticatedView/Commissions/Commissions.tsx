import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Dimensions, Text, View } from 'react-native'
import { Link } from 'react-router-native';
import callMsGraph from '../../Functions/microsoftAssets';
import { siteID } from '../../PaulyConfig';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useMsal } from '@azure/msal-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../Redux/store';

enum CommissionMode{
  Before,
  Current,
  Upcoming
}

export default function Commissions() {
  const {commissionListId} = useSelector((state: RootState) => state.paulyList)
  const {currentBreakPoint} = useSelector((state: RootState) => state.dimentions)
  const [currentCommissions, setCurrentCommissions] = useState<commissionType[]>([])

  async function getCommissions(){
    const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists/" + commissionListId + "/items?expand=fields")//TO DO list id
    if (result.ok) {
      const data = await result.json()
      console.log(data)
      if (data["value"] !== null && data["value"] !== undefined){
        var resultCommissions: commissionType[] = []
        for (let index = 0; index < data["value"].length; index++) {
          resultCommissions.push({
            title: data["value"][index]["fields"]["Title"],
            startDate: new Date(data["value"][index]["fields"]["StartDate"]),
            endDate:  new Date(data["value"][index]["fields"]["EndDate"]),
            points:  data["value"][index]["fields"]["Points"] as number,
            proximity: data["value"][index]["fields"]["Proximity"] as number,
            commissionId: data["value"][index]["fields"]["CommissionID"] as string,
            hidden: data["value"][index]["fields"]["Hidden"]
          })
        }
        setCurrentCommissions(resultCommissions)
      }
    }
  }
  useEffect(() => {
    getCommissions()
  }, [])

  const [fontsLoaded] = useFonts({
    'BukhariScript': require('../../../assets/fonts/BukhariScript.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }
  
  return (
    <View>
      { (currentBreakPoint === 0) ?
        <Link to="/profile/">
          <Text>Back</Text>
        </Link>:null
      }
      <Text>Commissions</Text>
      { currentCommissions.map((item: commissionType) => (
        <Link to={"/commissions/" + item.commissionId}>
          <View key={item.commissionId}>
            <Text>{item.title}</Text>
          </View>
        </Link>
      ))}
    </View>
  )
}
