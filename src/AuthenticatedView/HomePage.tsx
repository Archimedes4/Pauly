import { useEffect, useState, useContext, useCallback } from 'react';
import { Dimensions, View, Text, Image, Pressable } from 'react-native';
import MonthView from './MonthView';
import { Link, Navigate, useNavigate } from 'react-router-native';
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react';
import callMsGraph from '../Functions/Ultility/microsoftAssets';
import ScrollingTextAnimation from '../UI/ScrollingTextAnimation';
import { useDispatch, useSelector } from 'react-redux';
import store, { RootState } from '../Redux/store';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { BookIcon, MedalIcon, PersonIcon } from '../UI/Icons/Icons';
import { statusBarColorSlice } from '../Redux/reducers/statusBarColorReducer';
import getCurrentPaulyData from '../Functions/Homepage/getCurrentPaulyData';
import { loadingStateEnum } from '../types';
import ProgressView from '../UI/ProgressView';
import React from 'react';
declare global {
  type DateProperty = {
    Date: number
    ColorName?: string
    SchoolDay?: string
    Value?: number
  }
}

export default function HomePage() {
  const navigate = useNavigate()
  const {siteId} = useSelector((state: RootState) => state.paulyList)
  const authenticationToken = useSelector((state: RootState) => state.authenticationToken)
  const {message} = useSelector((state: RootState) => state.paulyData)
  const {height, width, currentBreakPoint} = useSelector((state: RootState) => state.dimentions)
  const [animationSpeed, setAnnimationSpeed] = useState(0)
  const [dataState, setDataState] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const dispatch = useDispatch()

  async function loadData() {
    const result = await getCurrentPaulyData(siteId)
    setDataState(result)
  }

  useEffect(() => {
    dispatch(statusBarColorSlice.actions.setStatusBarColor("#793033"))
  }, [])

  useEffect(() => {
    if (store.getState().authenticationToken !== "" || store.getState().paulyList.siteId !== ""){
      loadData()
    }
  }, [authenticationToken])

  useEffect(() => {
    if (currentBreakPoint > 0){
      navigate("/notifications")
    }
  }, [currentBreakPoint])

  // Font
  const [fontsLoaded] = useFonts({
    'BukhariScript': require('../../assets/fonts/BukhariScript.ttf'),
    'Gochi Hand': require('../../assets/fonts/GochiHand-Regular.ttf')
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
    <View style={{backgroundColor: "#793033", overflow: "hidden"}}>
      <Pressable style={{width: width * 1.0, height: height * 0.08}} onPress={() => {navigate("/notifications")}}>
        { (dataState === loadingStateEnum.loading) ?
          <View style={{width: width * 1.0, height: height * 0.08, alignContent: "center", alignItems: "center", justifyContent: "center"}}>
            <ProgressView width={(width < (height * 0.08)) ? width * 0.1:height * 0.07} height={(width < (height * 0.08)) ? width * 0.1:height * 0.07}/>
          </View>:
          <>
            { (dataState === loadingStateEnum.success) ?
              <>
                { (message !== "") ?
                  <ScrollingTextAnimation width={width * 1.0} height={height * 0.08}>
                    <View>
                      <Text numberOfLines={1} style={{fontSize: height * 0.07, height: height * 0.07}}>{message}</Text>
                    </View>
                  </ScrollingTextAnimation>:null
                }
              </>:
              <Text>Failed</Text>
            }
          </>
        }
      </Pressable>
      <Link style={{width: width * 0.999, height: height * 0.42}} to="/calendar">
        <View>
          <View style={{width: width * 1.0, height: height * 0.05, alignItems: "center", alignContent: "center", justifyContent: "center"}}>
            <Text style={{margin: "auto"}}>Calendar</Text>
          </View>
          <MonthView width={width * 1.0} height={height * 0.37}/>
        </View>
      </Link>
      <View style={{flexDirection: 'row', width: width * 1.0, height: height * 0.25}}>
        <Link to={'/commissions'}>
          <View style={{borderColor: "black", borderWidth: 2}}>
            <View style={{backgroundColor: "#793033", width: width * 0.5, height: height * 0.25, borderTopWidth: 1, borderTopColor: "black", zIndex: 1}} />
            <MedalIcon width={width * 0.5} height={height * 0.25} style={{position: "absolute", zIndex: 2}}/>
          </View>
        </Link>
        <Link to={'/sports'}>
          <View style={{borderColor: "black", borderWidth: 2}}>
            <View style={{backgroundColor: "#793033", width: width * 0.5, height: height * 0.25, borderTopWidth: 1, borderTopColor: "black", zIndex: 1}} />
            <Image source={require("../../assets/images/Football.png")} resizeMode='contain' width={width * 0.3} height={height * 0.25} style={{zIndex: 2, height: height * 0.25, width: width * 0.5, position: "absolute", aspectRatio: "1/1"}} />
          </View>
        </Link>
      </View>
      <View style={{flexDirection: 'row', width: width * 1.0, height: height * 0.25}}>
        <Link to={'/resources'}>
          <View style={{borderColor: "black", borderWidth: 2}}>
            <View style={{backgroundColor: "#793033", width: width * 0.5, height: height * 0.25, borderTopWidth: 1, borderTopColor: "black", zIndex: 1}} />
            <BookIcon width={width * 0.5} height={height * 0.25} style={{position: "absolute", zIndex: 2}}/>
          </View>
        </Link >
        <Link to={'/profile'}>
          <View style={{borderColor: "black", borderWidth: 2}}>
            <View style={{backgroundColor: "#793033", width: width * 0.5, height: height * 0.25, borderTopWidth: 1, borderTopColor: "black"}} />
            <PersonIcon width={width * 0.5} height={height * 0.25} style={{position: "absolute", zIndex: 2}}/>
          </View>
        </Link>
      </View>
    </View>
  )
}