import { View, Text, ScaledSize, Linking, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import Login from '../src/login'
import AuthenticatedView from '../src/AuthenticatedView/AuthenticatedViewMain'
import { clientId, tenantId } from '../src/PaulyConfig'
import { useDispatch, useSelector } from 'react-redux'
import { authenticationTokenSlice } from '../src/Redux/reducers/authenticationTokenReducer'
import store, { RootState } from '../src/Redux/store'
import getPaulyLists from '../src/Functions/Ultility/getPaulyLists'
import getUserProfile from '../src/Functions/getUserProfile'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';


import * as WebBrowser from 'expo-web-browser';
import {
  AuthRequest,
  Prompt,
  ResponseType,
  exchangeCodeAsync,
  makeRedirectUri,
  useAuthRequest,
  useAutoDiscovery,
} from 'expo-auth-session';
import { StatusBar } from 'expo-status-bar'

if (Platform.OS === "web") {
  WebBrowser.maybeCompleteAuthSession();
}

const scopes = ["User.Read", "User.ReadBasic.All", "Sites.Read.All", "Sites.Manage.All", "ChannelMessage.Read.All", "Chat.ReadWrite", "Calendars.ReadWrite", "Team.ReadBasic.All", "Group.ReadWrite.All", "Tasks.ReadWrite", "Channel.ReadBasic.All", "Application.ReadWrite.All"]

export default function AppMain({dimensions}:{dimensions: {window: ScaledSize; screen: ScaledSize}}) {
  const authenticationToken = useSelector((state: RootState) => state.authenticationToken)
  const dispatch = useDispatch()
  const insets = useSafeAreaInsets();

  const discovery = useAutoDiscovery(
    `https://login.microsoftonline.com/${tenantId}/v2.0`,
  );
  const redirectUri = makeRedirectUri({
    scheme: "Pauly",
    path: 'auth',
  });

  const authRequest = new AuthRequest({
    clientId: clientId,
    redirectUri: redirectUri,
    scopes: scopes,
    prompt: Prompt.SelectAccount,
    responseType: ResponseType.Token
  })

  async function getAuthToken() {
    if (discovery !== null){
      authRequest.promptAsync(discovery).then(async (res) => {
        if (authRequest && res?.type === 'success' && discovery) {
          if (res.authentication !== null) {
            console.log("Done", res)
            dispatch(authenticationTokenSlice.actions.setAuthenticationToken(res.authentication.accessToken))
            getPaulyLists(res.authentication.accessToken)
            getUserProfile(res.authentication.accessToken)
          } else {
            console.log(res)
          }
      }})
    }
  }


  return (
    <>
      { (authenticationToken !== '') ?  
        <AuthenticatedView dimensions={dimensions} width={dimensions.window.width}/>:
        <Login onGetAuthToken={() => {getAuthToken()}} width={dimensions.window.width}/>
      }
    </>
  )
}