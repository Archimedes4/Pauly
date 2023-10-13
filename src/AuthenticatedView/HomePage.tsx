import { useEffect, useCallback } from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import MonthView from './MonthView';
import { useNavigate } from 'react-router-native';
import ScrollingTextAnimation from '../UI/ScrollingTextAnimation';
import { useDispatch, useSelector } from 'react-redux';
import store, { RootState } from '../Redux/store';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { BookIcon, MedalIcon, PersonIcon } from '../UI/Icons/Icons';
import { safeAreaColorsSlice } from '../Redux/reducers/safeAreaColorsReducer';
import getCurrentPaulyData from '../Functions/homepage/getCurrentPaulyData';
import { Colors, loadingStateEnum } from '../types';
import ProgressView from '../UI/ProgressView';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomePage() {
  const navigate = useNavigate()
  const {siteId} = useSelector((state: RootState) => state.paulyList)
  const authenticationToken = useSelector((state: RootState) => state.authenticationToken)
  const {message, paulyDataState} = useSelector((state: RootState) => state.paulyData)
  const {height, width, currentBreakPoint} = useSelector((state: RootState) => state.dimentions)
  const dispatch = useDispatch()
  const insets = useSafeAreaInsets();

  async function loadData() {
    await getCurrentPaulyData()
  }

  useEffect(() => {
    dispatch(safeAreaColorsSlice.actions.setSafeAreaColors({top: "#793033", bottom: "#793033"}))
  }, [])

  useEffect(() => {
    if (store.getState().authenticationToken !== "" && store.getState().paulyList.siteId !== ""){
      loadData()
    }
  }, [authenticationToken, siteId])

  useEffect(() => {
    if (currentBreakPoint > 0){
      navigate("/notifications")
    }
  }, [currentBreakPoint])

  // Font
  const [fontsLoaded] = useFonts({
    'BukhariScript': require('../../assets/fonts/BukhariScript.ttf'),
    'GochiHand': require('../../assets/fonts/GochiHand-Regular.ttf')
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
      <View style={{backgroundColor: "#793033", overflow: "hidden"}}>
        <Pressable style={{width: width * 1.0, height: height * 0.08}} onPress={() => {navigate("/notifications")}}>
          { (paulyDataState === loadingStateEnum.loading) ?
            <View style={{width: width * 1.0, height: height * 0.08, alignContent: "center", alignItems: "center", justifyContent: "center"}}>
              <ProgressView width={(width < (height * 0.08)) ? width * 0.1:height * 0.07} height={(width < (height * 0.08)) ? width * 0.1:height * 0.07}/>
            </View>:
            <>
              { (paulyDataState === loadingStateEnum.success) ?
                <>
                  { (message !== "") ?
                    <ScrollingTextAnimation width={width * 1.0} height={height * 0.08} text={message}/>:null
                  }
                </>:
                <Text>Failed</Text>
              }
            </>
          }
        </Pressable>
        <Pressable onPress={() => {navigate("/calendar")}} style={{width: width * 0.999, height: height * 0.42}}>
          <View>
            <View style={{width: width * 1.0, height: height * 0.05, alignItems: "center", alignContent: "center", justifyContent: "center", borderTopColor: "black", borderTopWidth: 2, borderBottomColor: "black", borderBottomWidth: 2}}>
              <Text style={{margin: "auto", color: Colors.white}}>Calendar</Text>
            </View>
            <MonthView width={width * 1.0} height={height * 0.37}/>
          </View>
        </Pressable>
        <View style={{flexDirection: 'row', width: width * 1.0, height: height * 0.25}}>
          <Pressable onPress={() => {navigate("/commissions")}}>
            <View style={{borderColor: "black", borderWidth: 2}}>
              <View style={{backgroundColor: "#793033", width: width * 0.5, height: height * 0.25, borderTopWidth: 1, borderTopColor: "black", zIndex: 1}} />
              <MedalIcon width={width * 0.5} height={height * 0.23} style={{position: "absolute", top: height * 0.01, zIndex: 2}}/>
            </View>
          </Pressable>
          <Pressable onPress={() => {navigate("/sports")}}>
            <View style={{borderColor: "black", borderWidth: 2}}>
              <View style={{backgroundColor: "#793033", width: width * 0.5, height: height * 0.25, borderTopWidth: 1, borderTopColor: "black", zIndex: 1}} />
              <Image source={require("../../assets/images/Football.png")} resizeMode='contain' width={width * 0.3} height={height * 0.25} style={{zIndex: 2, height: height * 0.25, width: width * 0.5, position: "absolute", aspectRatio: "1/1"}} />
            </View>
          </Pressable>
        </View>
        <View style={{flexDirection: 'row', width: width * 1.0, height: height * 0.25}}>
          <Pressable onPress={() => {navigate("/resources")}}>
            <View style={{borderColor: "black", borderWidth: 2}}>
              <View style={{backgroundColor: "#793033", width: width * 0.5, height: height * 0.25, borderTopWidth: 1, borderTopColor: "black", zIndex: 1}} />
              <BookIcon width={width * 0.5} height={height * 0.25} style={{position: "absolute", zIndex: 2}}/>
            </View>
          </Pressable>
          <Pressable onPress={() => {navigate("/profile")}}>
            <View style={{borderColor: "black", borderWidth: 2}}>
              <View style={{backgroundColor: "#793033", width: width * 0.5, height: height * 0.25, borderTopWidth: 1, borderTopColor: "black"}} />
              <PersonIcon width={width * 0.5} height={height * 0.25} style={{position: "absolute", zIndex: 2}}/>
            </View>
          </Pressable>
        </View>
      </View>
      <View style={{position: "absolute", backgroundColor: "black", width: 4, left: width/2 + 2, bottom: -insets.bottom, height: insets.bottom}}/>
    </>
  )
}