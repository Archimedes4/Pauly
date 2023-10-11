import { View, Text, ScaledSize, Linking, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import Login from '../src/login'
import AuthenticatedView from '../src/AuthenticatedView/AuthenticatedViewMain'
import { clientId, tenantId } from '../src/PaulyConfig'
import { useDispatch, useSelector } from 'react-redux'
import { authenticationTokenSlice } from '../src/Redux/reducers/authenticationTokenReducer'
import store, { RootState } from '../src/Redux/store'
import getPaulyLists from '../src/Functions/Ultility/getPaulyLists'
import getUserProfile from '../src/Functions/Ultility/getUserProfile'
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
import * as AuthSession from 'expo-auth-session';
import { StatusBar } from 'expo-status-bar'
import { isGovernmentModeSlice } from '../src/Redux/reducers/isGovernmentModeReducer'
import { validateGovernmentMode } from '../src/Functions/handleGovernmentLogin'
import { authenticationRefreshTokenSlice } from '../src/Redux/reducers/authenticationRefreshTokenReducer'

if (Platform.OS === "web") {
  WebBrowser.maybeCompleteAuthSession();
}

const scopes = ["User.Read", "User.ReadBasic.All", "Sites.Read.All", "Sites.Manage.All", "ChannelMessage.Read.All", "Chat.ReadWrite", "Calendars.ReadWrite", "Team.ReadBasic.All", "Group.ReadWrite.All", "Tasks.ReadWrite", "Channel.ReadBasic.All", "Application.ReadWrite.All", "TeamMember.Read.All"]

export default function AppMain({dimensions}:{dimensions: {window: ScaledSize; screen: ScaledSize}}) {
  const authenticationToken = useSelector((state: RootState) => state.authenticationToken)
  const dispatch = useDispatch()
  const authenticationCall = useSelector((state: RootState) => state.authenticationCall);
  
  const discovery = useAutoDiscovery(
    `https://login.microsoftonline.com/${tenantId}/v2.0`,
  );

  const redirectUri = makeRedirectUri({
    scheme: "Pauly",
    path: 'auth',
  });

  const [authRequest, ,promptAsync] =  useAuthRequest(
    {
      clientId: clientId,
      redirectUri: redirectUri,
      scopes: scopes,
      prompt: Prompt.Consent
    },
    discovery
  )

  async function getAuthToken() {
    if (discovery !== null){
      promptAsync().then(async (res) => {
        if (authRequest && res?.type === 'success' && discovery) {
          exchangeCodeAsync(
            {
              clientId,
              code: res.params.code,
              extraParams: authRequest.codeVerifier
                ? { code_verifier: authRequest.codeVerifier }
                : undefined,
              redirectUri,
              scopes: scopes
            },
            discovery,
          ).then((res) => {
            if (res.refreshToken !== undefined) {
              dispatch(authenticationRefreshTokenSlice.actions.setAuthenticationRefreshToken(res.refreshToken))
            }
            dispatch(authenticationTokenSlice.actions.setAuthenticationToken(res.accessToken))
            getPaulyLists(res.accessToken)
            getUserProfile(res.accessToken)
          })
      }})
    }
  }

  async function getGovernmentAuthToken() {
    if (discovery !== null){
      promptAsync().then(async (res) => {
        if (authRequest && res?.type === 'success' && discovery) {
          exchangeCodeAsync(
            {
              clientId,
              code: res.params.code,
              extraParams: authRequest.codeVerifier
                ? { code_verifier: authRequest.codeVerifier }
                : undefined,
              redirectUri,
              scopes: scopes
            },
            discovery,
          ).then((res) => {
            dispatch(authenticationTokenSlice.actions.setAuthenticationToken(res.accessToken))
            getPaulyLists(res.accessToken)
            getUserProfile(res.accessToken)
            validateGovernmentMode()
          })
      }})
    }
  }

  async function refreshToken() {
    if (discovery !== null) {
      try {
        const result = await AuthSession.refreshAsync({
          refreshToken: store.getState().authenticationRefreshToken,
          clientId: clientId,
          scopes: scopes
        }, discovery)
        dispatch(authenticationTokenSlice.actions.setAuthenticationToken(result.accessToken))
      } catch {
        dispatch(authenticationTokenSlice.actions.setAuthenticationToken(""))
      }
    } else {
      dispatch(authenticationTokenSlice.actions.setAuthenticationToken(""))
    }
  }

  useEffect(() => {
    refreshToken()
  }, [authenticationCall])

  return (
    <>
      { (authenticationToken !== '') ?  
        <AuthenticatedView dimensions={dimensions} width={dimensions.window.width}/>:
        <Login onGetAuthToken={() => {getAuthToken()}} onGetGovernmentAuthToken={() => {getGovernmentAuthToken()}} width={dimensions.window.width}/>
      }
    </>
  )
}