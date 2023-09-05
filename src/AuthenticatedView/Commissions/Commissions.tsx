import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import { Link } from 'react-router-native';
import callMsGraph from '../../Functions/Ultility/microsoftAssets';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../Redux/store';
import { statusBarColorSlice } from '../../Redux/reducers/statusBarColorReducer';

enum CommissionMode{
  Before,
  Current,
  Upcoming
}

export default function Commissions() {
  const {height, width} = useSelector((state: RootState) => state.dimentions)
  const {commissionListId, siteId} = useSelector((state: RootState) => state.paulyList)
  const {currentBreakPoint} = useSelector((state: RootState) => state.dimentions)
  const [currentCommissions, setCurrentCommissions] = useState<commissionType[]>([])
  const dispatch = useDispatch()

  async function getCommissions(){
    const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + siteId + "/lists/" + commissionListId + "/items?expand=fields")//TO DO list id
    if (result.ok) {
      const data = await result.json()
      console.log(data)
      if (data["value"] !== null && data["value"] !== undefined){
        var resultCommissions: commissionType[] = []
        for (let index = 0; index < data["value"].length; index++) {
          resultCommissions.push({
            title: data["value"][index]["fields"]["Title"],
            startDate: new Date(data["value"][index]["fields"]["startDate"]),
            endDate:  new Date(data["value"][index]["fields"]["endDate"]),
            points:  data["value"][index]["fields"]["points"] as number,
            proximity: data["value"][index]["fields"]["proximity"] as number,
            commissionId: data["value"][index]["fields"]["commissionID"] as string,
            hidden: data["value"][index]["fields"]["hidden"]
          })
        }
        setCurrentCommissions(resultCommissions)
      }
    }
  }
  useEffect(() => {
    dispatch(statusBarColorSlice.actions.setStatusBarColor("#444444"))
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
    <View style={{width: width, height: height, backgroundColor: "white"}}>
      <View style={{width: width, height: height * 0.1, backgroundColor: '#444444'}}>
        { (currentBreakPoint === 0) ?
          <Link to="/">
            <View>
              <Text>Back</Text>
            </View>
          </Link>:null
        }
        <Text style={{fontFamily: 'BukhariScript'}}>Commissions</Text>
      </View>
      <View>
        { currentCommissions.map((item: commissionType) => (
          <Link to={"/commissions/" + item.commissionId} key={"Link_" + item.commissionId}>
            <View key={item.commissionId} style={{borderRadius: 15, borderColor: "Black", borderWidth: 10, shadowColor: "black", shadowOffset: {width: 1, height: 1}, shadowRadius: 5}}>
              <Text>{item.title}</Text>
              <Text>{item.commissionId}</Text>
            </View>
          </Link>
        ))}
      </View>
    </View>
  )
}
