import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { Link, useNavigate } from 'react-router-native';
import callMsGraph from '../../Functions/Ultility/microsoftAssets';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../Redux/store';
import { statusBarColorSlice } from '../../Redux/reducers/statusBarColorReducer';
import getPoints from '../../Functions/commissions/getPoints';
import getCommissions from '../../Functions/commissions/getCommissions';
import { loadingStateEnum } from '../../types';
import CommissionsView from './CommissionsView';
import ProgressView from '../../UI/ProgressView';

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
  const [selectedCommission, setSelectedCommission] = useState<string>("")
  const [points, setPoints] = useState<number>(0)
  const dispatch = useDispatch()
  const navigate = useNavigate();

  //Loading States
  const [commissionState, setCommissionState] = useState<loadingStateEnum>(loadingStateEnum.loading)

  async function loadData() {
    const pointResult = await getPoints()
    console.log(pointResult)
    const commissionsResult = await getCommissions()
    if (commissionsResult.result === loadingStateEnum.success, commissionsResult.data !== undefined) {
      setCurrentCommissions(commissionsResult.data)
    }
    setCommissionState(commissionsResult.result)
    //TO DO pagination
  }

  useEffect(() => {
    dispatch(statusBarColorSlice.actions.setStatusBarColor("#444444"))
  }, [])

  useEffect(() => {
    if (siteId !== "") {
      loadData()
    }
  }, [siteId])

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
    <>
      <View style={{width: width, height: height, backgroundColor: "white"}}>
        <View style={{width: width, height: height * 0.1, backgroundColor: '#444444', alignContent: "center", alignItems: "center", justifyContent: "center"}}>
          { (currentBreakPoint === 0) ?
            <Link to="/">
              <View>
                <Text>Back</Text>
              </View>
            </Link>:null
          }
          <Text style={{fontFamily: 'BukhariScript', fontSize:  25}}>Commissions</Text>
        </View>
        <View style={{height: height * 0.9}}>
          { (commissionState === loadingStateEnum.loading) ?
            <View style={{width: width, height: height * 0.9, alignContent: "center", alignItems: "center", justifyContent: "center"}}>
              <ProgressView width={(width < height) ? width * 0.1:height*0.1} height={(width < height) ? width * 0.1:height*0.1} />
              <Text>Loading</Text>
            </View>:
            <View>
              { (commissionState === loadingStateEnum.success) ?
                <ScrollView style={{height: height * 0.9}}>
                  { currentCommissions.map((item: commissionType) => (
                    <Pressable onPress={() => {setSelectedCommission(item.commissionId)}} key={"Link_" + item.commissionId}>
                      <View key={item.commissionId} style={{borderRadius: 15, shadowColor: "black", shadowOffset: {width: 1, height: 1}, shadowRadius: 5, margin: width * 0.05}}>
                        <View style={{margin: 10}}>
                          <Text>{item.title}</Text>
                        </View>
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>:
                <View>
                  <Text>Failed</Text>
                </View>
              }
            </View>
          }
        </View>
      </View>
      <View style={{position: "absolute", zIndex: 2, top: height * 0.1, left: width * 0.1}}>
        { (selectedCommission !== "") ?
          <CommissionsView id={selectedCommission} onClose={() => setSelectedCommission("")}/>:null
        }
      </View>
    </>
  )
}
