import React, { useCallback, useContext, useEffect, useState } from 'react'
import { FlatList, Pressable, ScrollView, Text, View, Image } from 'react-native'
import { Link, useNavigate } from 'react-router-native';
import callMsGraph from '../../Functions/Ultility/microsoftAssets';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../Redux/store';
import { safeAreaColorsSlice } from '../../Redux/reducers/safeAreaColorsReducer';
import getPoints from '../../Functions/commissions/getPoints';
import getCommissions from '../../Functions/commissions/getCommissions';
import { loadingStateEnum } from '../../types';
import CommissionsView from './CommissionsView';
import ProgressView from '../../UI/ProgressView';
import BackButton from '../../UI/BackButton';
import { commissionsSlice } from '../../Redux/reducers/commissionsReducer';
import create_UUID from '../../Functions/Ultility/CreateUUID';

enum CommissionMode{
  Before,
  Current,
  Upcoming
}

export default function Commissions() {
  const {height, width} = useSelector((state: RootState) => state.dimentions)
  const {siteId} = useSelector((state: RootState) => state.paulyList)
  const {currentBreakPoint} = useSelector((state: RootState) => state.dimentions)
  const {commissionNextLink} = useSelector((state: RootState) => state.commissions)
  const {currentCommissions, selectedCommission, commissionsState, points} = useSelector((state: RootState) => state.commissions)

  const [isHoverPicker, setIsHoverPicker] = useState<boolean>(false)

  const dispatch = useDispatch()
  const navigate = useNavigate();

  //Loading States

  async function loadData() {
    const pointResult = await getPoints()
    if (pointResult.result === loadingStateEnum.success && pointResult.data !== undefined) {
      dispatch(commissionsSlice.actions.setPoints(pointResult.data))
      const commissionsResult = await getCommissions()
      if (commissionsResult.result === loadingStateEnum.success, commissionsResult.data !== undefined) {
        dispatch(commissionsSlice.actions.setCurrentCommissions(commissionsResult.data))
      }
      dispatch(commissionsSlice.actions.setCommissionNextLink(commissionsResult.nextLink))
      dispatch(commissionsSlice.actions.setCommissionsState(commissionsResult.result))
    } else {
      dispatch(commissionsSlice.actions.setCommissionsState(pointResult.result))
    }
    //TO DO pagination
  }

  async function loadCommissionData(startDate?: {date: Date, filter: "ge"|"le"}, endDate?: {date: Date, filter: "ge"|"le"}, claimed?: boolean, nextLink?: string) {
    dispatch(commissionsSlice.actions.setCommissionsState(loadingStateEnum.loading))
    const result = await getCommissions(nextLink, startDate, endDate, claimed)
    if (result.result === loadingStateEnum.success && result.data !== undefined) {
      dispatch(commissionsSlice.actions.setCurrentCommissions(result.data))
    }
    dispatch(commissionsSlice.actions.setCommissionsState(result.result))
    dispatch(commissionsSlice.actions.setCommissionNextLink(result.nextLink))
  }

  useEffect(() => {
    dispatch(safeAreaColorsSlice.actions.setSafeAreaColors({top: "#444444", bottom: "white"}))
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
          { (currentBreakPoint <= 0) ?
            <BackButton to='/'/>:null
          }
          <Text style={{fontFamily: 'BukhariScript', fontSize:  25}}>Commissions</Text>
        </View>
        <View style={{height: (isHoverPicker) ? height * 0.8:height * 0.85}}>
          { (commissionsState === loadingStateEnum.loading) ?
            <View style={{width: width, height: height * 0.9, alignContent: "center", alignItems: "center", justifyContent: "center"}}>
              <ProgressView width={(width < height) ? width * 0.1:height*0.1} height={(width < height) ? width * 0.1:height*0.1} />
              <Text>Loading</Text>
            </View>:
            <View>
              { (commissionsState === loadingStateEnum.success) ?
                <FlatList
                  style={{height: height * 0.9}} 
                  data={[undefined, ...currentCommissions]}
                  renderItem={({item, index}) =>
                    <>
                      { (index === 0) ?
                        <View style={{flexDirection: "row", margin: 10, backgroundColor: "#793033", borderRadius: 15, shadowOffset: { width: 2, height: 3 }}}>
                          <View style={{margin: 10, flexDirection: "row"}}> 
                            <Image source={require("../../../assets/images/PaulyLogo.png")} resizeMode='contain' style={{width: 50, height:  50}} />
                            <Text style={{fontSize: 45, color: "white", fontFamily: 'BukhariScript', width: 100, paddingLeft: 10}}>{points}</Text>
                          </View>
                        </View>:
                        <>
                          { (item !== undefined) ?
                            <Pressable onPress={() => {dispatch(commissionsSlice.actions.setSelectedCommission(item.commissionId))}} key={"Link_" + item.commissionId} style={{backgroundColor: "transparent"}}>
                              <View key={item.commissionId} style={{borderRadius: 15, marginLeft: width * 0.025, elevation: 2, marginRight: width * 0.025, marginTop: height * 0.02, backgroundColor: "#FFFFFF", shadowColor: "black", shadowOffset: {width: 1, height: 1}, shadowOpacity: 1, shadowRadius: 5}}>
                                <View style={{margin: 10}}>
                                  <Text>{item.title}</Text>
                                  { (item.timed && item.startDate !== undefined) ?
                                    <Text>{new Date(item.startDate).toLocaleDateString("en-US", {month: "long", day: "numeric", minute: "numeric"})}</Text>:null
                                  }
                                </View>
                              </View>
                            </Pressable>:null
                          }
                        </>
                      }
                    </>
                  }
                  keyExtractor={item => item?.commissionId + "_" + create_UUID()}
                  onEndReachedThreshold={1}
                  onEndReached={() => {
                    if (commissionNextLink !== undefined) {
                      loadCommissionData(undefined, undefined, undefined, commissionNextLink)
                    }
                  }}
                  initialNumToRender={currentCommissions.length}
                />:
                <View>
                  <Text>Failed</Text>
                </View>
              }
            </View>
          }
        </View>
        <Pressable style={{height: (isHoverPicker) ? height * 0.1:height * 0.05}} onHoverIn={() => {setIsHoverPicker(true)}} onHoverOut={() => {setIsHoverPicker(false)}}>
          <ScrollView horizontal={true} style={{height: (isHoverPicker) ? height * 0.1:height * 0.05, width: width, backgroundColor: "white"}} showsHorizontalScrollIndicator={false}>
            <PickerPiece text='All' onPress={() => {loadCommissionData()}} isHoverPicker={isHoverPicker} setIsHoverPicker={setIsHoverPicker}/>
            <PickerPiece text='Current' onPress={() => {loadCommissionData({date: new Date(), filter: "ge"}, {date: new Date(), filter: "le"})}} isHoverPicker={isHoverPicker} setIsHoverPicker={setIsHoverPicker}/>
            <PickerPiece text='Past' onPress={() => {loadCommissionData({date: new Date(), filter: "le"}, {date: new Date(), filter: "le"})}} isHoverPicker={isHoverPicker} setIsHoverPicker={setIsHoverPicker}/>
            <PickerPiece text='Claimed' onPress={() => {loadCommissionData(undefined, undefined, true)}} isHoverPicker={isHoverPicker} setIsHoverPicker={setIsHoverPicker}/>
            <PickerPiece text='Future' onPress={() => {loadCommissionData(undefined, {date: new Date(), filter: "ge"})}} isHoverPicker={isHoverPicker} setIsHoverPicker={setIsHoverPicker}/>
          </ScrollView>
        </Pressable>
      </View>
      <View style={{position: "absolute", zIndex: 2, top: height * 0.1, left: width * 0.05}}>
        { (selectedCommission !== "") ?
          <CommissionsView id={selectedCommission} onClose={() => dispatch(commissionsSlice.actions.setSelectedCommission(""))}/>:null
        }
      </View>
    </>
  )
}

function PickerPiece({text, isHoverPicker, setIsHoverPicker, onPress}:{text: string, onPress: () => void, isHoverPicker: boolean, setIsHoverPicker: (item: boolean) => void}) {
  const {height, width, currentBreakPoint} = useSelector((state: RootState) => state.dimentions)
  const [isSelected, setIsSelected] = useState<boolean>(false)
  return (
    <Pressable onPress={() => {onPress()}} onHoverIn={() => {setIsHoverPicker(true); setIsSelected(true)}} onHoverOut={() => setIsSelected(false)} style={{height: (isHoverPicker) ? height * 0.1:height * 0.05, width: (isSelected) ?  ((currentBreakPoint >= 2) ? (width*0.3):width * 0.6):((currentBreakPoint >= 2) ? (width*0.2):width * 0.4), alignContent: "center", alignItems: "center", justifyContent: "center"}}>
      <View style={{height: (isHoverPicker) ? height * 0.06:height * 0.03, width: (isSelected) ? ((currentBreakPoint >= 2) ? (width*0.28):width * 0.46):((currentBreakPoint >= 2) ? (width*0.18):width * 0.36), marginLeft: (currentBreakPoint >= 2) ? (width*0.01):width*0.02, marginRight: (currentBreakPoint >= 2) ? (width*0.01):width*0.02, backgroundColor: "#444444", borderRadius: 15, alignContent: "center", alignItems: "center", justifyContent: "center"}}>
        <Text style={{color: "white"}}>{text}</Text>
      </View>
    </Pressable>
  )
}