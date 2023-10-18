import { View, Text, Button, Pressable, Platform, Image } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-native'
import { useMsal } from "@azure/msal-react";
import { tenantId } from '../../PaulyConfig';
import { GearIcon, GovernmentIcon, PersonIcon, StudentSearchIcon } from '../../UI/Icons/Icons';
import BackButton from '../../UI/BackButton';
import { DiscoveryDocument, revokeAsync, useAutoDiscovery } from 'expo-auth-session';
import store, { RootState } from '../../Redux/store';
import { authenticationTokenSlice } from '../../Redux/reducers/authenticationTokenReducer';
import { useDispatch, useSelector } from 'react-redux';
import { AccountInfo, IPublicClientApplication } from '@azure/msal-browser';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Colors, loadingStateEnum } from '../../types';
import { safeAreaColorsSlice } from '../../Redux/reducers/safeAreaColorsReducer';

export default function Settings() {
  const {height, width, currentBreakPoint} = useSelector((state: RootState) => state.dimentions)
  const isGovernmentMode = useSelector((state: RootState) => state.isGovernmentMode)
  const {uri, displayName} = useSelector((state: RootState) => state.microsoftProfileData)
  const [imageLoadState, setImageLoadState] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const discovery = useAutoDiscovery(
    `https://login.microsoftonline.com/${tenantId}/v2.0`,
  );
  const { instance } = useMsal()
  
  function signOut() {
    if (Platform.OS === "web") {
      const account = instance.getActiveAccount()
      if (account !== null) {
        signOutWeb(instance, account)
      } else {
        signOutWeb(instance)
      }
    } else {
      if (discovery !== null) {
        signOutNative(discovery)
      }
    }
  }

  useEffect(() => {
    dispatch(safeAreaColorsSlice.actions.setSafeAreaColors({top: Colors.maroon, bottom: Colors.maroon}))
  }, [])

  useEffect(() => {
    if (currentBreakPoint >= 1) {
      navigate("/")
    }
  }, [currentBreakPoint])
  
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
      <BackButton to='/'/>
      <View style={{alignContent: "center", justifyContent: "center", alignItems: "center", height: height * 0.2, marginTop: height * 0.025, marginBottom: height * 0.02}}>
        <GearIcon width={(width < height) ? width * 0.3:height*0.2} height={(width < height) ? width * 0.3:height*0.2} style={{position: "absolute", left: width * 0.2}}/>
        <Text style={{fontFamily: 'BukhariScript', fontSize: 45, color: Colors.white}}>Settings</Text>
      </View>
      <View style={{width: width, alignContent: "center", justifyContent: 'center', alignItems: "center"}}>
        { (uri !== "" && imageLoadState !== loadingStateEnum.failed) ?
          <Image source={{uri: uri}} onError={(e) => {setImageLoadState(loadingStateEnum.failed); console.log(e.nativeEvent.error)}} style={{width: width * 0.3, height: width * 0.3, borderRadius: width * 0.25}}/>:
          <PersonIcon width={width * 0.4} height={width * 0.4}/>
        }
        <Text style={{color: Colors.white, fontWeight: "bold", fontSize: 24, marginTop: height * 0.05}}>{displayName}</Text>
      </View>
      <Pressable onPress={() => {signOut()}} style={{width: width * 0.8, height: height * 0.08, borderRadius: 15, shadowColor: "black", shadowOffset: { width: 2, height: 4 }, shadowOpacity: 0.8, shadowRadius: 10, marginLeft: "auto", marginRight: "auto", flexDirection: "row", backgroundColor: Colors.white, alignItems: "center", alignContent: "center", justifyContent: "center", marginTop: height * 0.05}}>
        <Text style={{fontWeight: "bold"}}>SIGN OUT</Text>
      </Pressable>
      <Pressable onPress={() => {navigate("/students")}} style={{width: width * 0.8, height: height * 0.08, borderRadius: 15, shadowColor: "black", shadowOffset: { width: 2, height: 4 }, shadowOpacity: 0.8, shadowRadius: 10, marginLeft: "auto", marginRight: "auto", flexDirection: "row", backgroundColor: Colors.white, alignItems: "center", marginTop: height * 0.05}}>
          <StudentSearchIcon width={(width * 0.8 < height * 0.08) ? width * 0.2:height*0.06} height={(width * 0.8 < height * 0.08) ? width * 0.2:height*0.06} style={{marginLeft: width * 0.025}}/>
          <Text>Students</Text>
        </Pressable>
      { isGovernmentMode ?
        <Pressable onPress={() => {navigate("/profile/government")}} style={{width: width * 0.8, height: height * 0.08, borderRadius: 15, shadowColor: "black", shadowOffset: { width: 2, height: 4 }, shadowOpacity: 0.8, shadowRadius: 10, marginLeft: "auto", marginRight: "auto", flexDirection: "row", backgroundColor: Colors.white, alignItems: "center", marginTop: height * 0.05}}>
          <GovernmentIcon width={(width * 0.8 < height * 0.08) ? width * 0.2:height*0.06} height={(width * 0.8 < height * 0.08) ? width * 0.2:height*0.06} style={{marginLeft: width * 0.025}}/>
          <Text>Government</Text>
        </Pressable>:null
      }
    </View>
  )
}

function signOutNative(discovery: DiscoveryDocument) {
  revokeAsync({token: store.getState().authenticationToken}, discovery)
  store.dispatch(authenticationTokenSlice.actions.setAuthenticationToken(""))

}

function signOutWeb(instance: IPublicClientApplication, account?: AccountInfo) {
  store.dispatch(authenticationTokenSlice.actions.setAuthenticationToken(""))
  instance.logoutPopup({
    account: account
  })
}