import { ScaledSize, Platform } from 'react-native'
import React, { useEffect } from 'react'
import Login from '../src/login'
import AuthenticatedView from '../src/AuthenticatedView/AuthenticatedViewMain'
import { clientId, scopes, tenantId } from '../src/PaulyConfig'
import { useDispatch, useSelector } from 'react-redux'
import { authenticationTokenSlice } from '../src/Redux/reducers/authenticationTokenReducer'
import store, { RootState } from '../src/Redux/store'
import getPaulyLists from '../src/Functions/Ultility/getPaulyLists'
import getUserProfile from '../src/Functions/Ultility/getUserProfile'
import * as WebBrowser from 'expo-web-browser';
import { Prompt, exchangeCodeAsync, makeRedirectUri, refreshAsync, useAuthRequest, useAutoDiscovery } from 'expo-auth-session';
import { validateGovernmentMode } from '../src/Functions/handleGovernmentLogin'
import { authenticationRefreshTokenSlice } from '../src/Redux/reducers/authenticationRefreshTokenReducer'

if (Platform.OS === "web") {
  WebBrowser.maybeCompleteAuthSession();
}

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
      prompt: Prompt.SelectAccount
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
        const result = await refreshAsync({
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