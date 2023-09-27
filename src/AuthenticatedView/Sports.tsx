import { View, Text, Dimensions, Image, ScrollView, Pressable } from 'react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-native'
import { ChevronLeft } from '../UI/Icons/Icons'
import callMsGraph from '../Functions/Ultility/microsoftAssets'
import getFileWithShareID from '../Functions/Ultility/getFileWithShareID'
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useMsal } from '@azure/msal-react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../Redux/store'
import { dataContentTypeOptions, loadingStateEnum } from '../types'
import getSportsContent from '../Functions/getSportsContent'
import { safeAreaColorsSlice } from '../Redux/reducers/safeAreaColorsReducer'
import ProgressView from '../UI/ProgressView'
import { ResizeMode, Video } from 'expo-av';
import BackButton from '../UI/BackButton'

declare global {
  type sportPost = {
    caption: string,
    fileID: string,
    fileType: dataContentTypeOptions
  }
}

export default function Sports() {
  const {width, height, currentBreakPoint} = useSelector((state: RootState) => state.dimentions)
  const {sportsApprovedSubmissionsListId, siteId} = useSelector((state: RootState) => state.paulyList)
  const [sportsPosts, setSportsPosts] = useState<sportPost[]>([])
  const [loadingResult, setLoadingResult] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    dispatch(safeAreaColorsSlice.actions.setSafeAreaColors({top: "#444444", bottom: "white"}))
  }, [])

  async function loadSportsContent() {
    const result = await getSportsContent()
    setLoadingResult(result.result)
    console.log(result)
    if (result.result === loadingStateEnum.success && result.sports !== undefined) {
      setSportsPosts(result.sports)
    }
  }

  useEffect(() => {
    loadSportsContent()
  }, [])

  const [fontsLoaded] = useFonts({
    'BukhariScript': require('../../assets/fonts/BukhariScript.ttf'),
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
    <View style={{height: height, width: width, backgroundColor: "white", overflow: "hidden"}}>
      <View style={{height: height * 0.1, width: width, backgroundColor: '#444444', alignContent: "center", alignItems: "center", justifyContent: "center"}}>
        { (currentBreakPoint <= 0) ?
            <BackButton to='/'/>:null
        }
        <Text style={{fontFamily: "BukhariScript"}}>Sports</Text>
      </View>
      {(loadingResult === loadingStateEnum.loading) ?
        <View style={{width: width, height: height, alignContent: "center", alignItems: "center", justifyContent: "center"}}>
          <ProgressView width={(width < height) ? width * 0.25:height * 0.25} height={(width < height) ? width * 0.5:height * 0.5}/>
          <Text>Loading</Text>
        </View>:
        <> 
          { (loadingResult === loadingStateEnum.success) ?
            <ScrollView style={{height: height * 0.8}}>
              { sportsPosts.map((item) => (
                <View style={{marginTop: height * 0.05}}>
                { (item.fileType === dataContentTypeOptions.image) ?
                  <Image style={{width: width * 0.9, height: height * 0.4, marginLeft: width * 0.05, marginRight: width * 0.05}} source={{uri: item.fileID}}/>:null
                }
                { (item.fileType === dataContentTypeOptions.video) ?
                  <Video useNativeControls source={{uri: item.fileID}} resizeMode={ResizeMode.COVER} style={{width: width * 0.9, height: height * 0.4, alignSelf: 'stretch', marginLeft: width * 0.05, marginRight: width * 0.05}} videoStyle={{width: width * 0.9, height: height * 0.4}}/>:null
                }
                </View>
              ))
              }
            </ScrollView>:
            <View>  
              <Text>Something went wrong</Text>
            </View>
          }
        </>
      }
      <ScrollView>
        
      </ScrollView>
    </View>
  )
}