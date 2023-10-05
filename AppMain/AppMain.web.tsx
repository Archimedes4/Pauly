import { SafeAreaView, ScaledSize} from 'react-native'
import React, { useEffect, useState } from 'react'
import Login from '../src/login'
import AuthenticatedViewMain from '../src/AuthenticatedView/AuthenticatedViewMain'
import { clientId, tenantId } from '../src/PaulyConfig'
import { useDispatch } from 'react-redux'
import getPaulyLists from '../src/Functions/Ultility/getPaulyLists'
import getUserProfile from '../src/Functions/Ultility/getUserProfile'
import { authenticationTokenSlice } from '../src/Redux/reducers/authenticationTokenReducer'
import { EventType, LogLevel, PublicClientApplication } from '@azure/msal-browser'
import { AuthenticatedTemplate, MsalProvider, UnauthenticatedTemplate, useMsal } from '@azure/msal-react'
import { isGovernmentModeSlice } from '../src/Redux/reducers/isGovernmentModeReducer'
import { authenticationApiTokenSlice } from '../src/Redux/reducers/authenticationApiToken'
import { checkIfGovernmentMode, getWantGovernment, setWantGovernment, validateGovernmentMode } from '../src/Functions/handleGovernmentLogin'
import store from '../src/Redux/store'

const pca = new PublicClientApplication({
  auth: {
    clientId: clientId,
    authority: `https://login.microsoftonline.com/${tenantId}/`,
    redirectUri: "http://localhost:19006/auth"//TO DO change prod
  }
});

const scopes = ["User.Read", "User.ReadBasic.All", "Sites.Read.All", "Sites.Manage.All", "ChannelMessage.Read.All", "Chat.ReadWrite", "Calendars.ReadWrite", "Team.ReadBasic.All", "Group.ReadWrite.All", "Tasks.ReadWrite", "Channel.ReadBasic.All", "Application.ReadWrite.All"]

export default function AppMain({dimensions}:{dimensions: {window: ScaledSize; screen: ScaledSize}}) {
  return (
    <MsalProvider instance={pca}>
      <SafeAreaView style={{width: dimensions.window.width, height: dimensions.window.height, zIndex: 2, position: "absolute", left: 0, top: 0}}>
        <AuthDeep dimensions={dimensions} />
      </SafeAreaView>
    </MsalProvider>
  )
}

function AuthDeep({dimensions}:{dimensions: {window: ScaledSize; screen: ScaledSize}}) {
  const { instance } = useMsal();
  const dispatch = useDispatch()

  async function getAuthToken(userInitated: boolean, government?: boolean) {
    // Account selection logic is app dependent. Adjust as needed for different use cases.
    // Set active acccount on page load
    if (government !== undefined) {
      setWantGovernment(government)
    }

    const accounts = instance.getAllAccounts();
    if (accounts.length > 0) {
      instance.setActiveAccount(accounts[0]);
      const result = await instance.acquireTokenSilent({
        scopes: scopes
      })
      dispatch(authenticationTokenSlice.actions.setAuthenticationToken(result.accessToken))
      getPaulyLists(result.accessToken)
      getUserProfile(result.accessToken)
      if (await getWantGovernment()) {
        checkIfGovernmentMode()
      }
    }

    instance.addEventCallback((event: any) => {
      // set active account after redirect
      if (event.eventType === EventType.LOGIN_SUCCESS && event.payload.account) {
        const account = event.payload.account;
        instance.setActiveAccount(account);
      }
    });

    // handle auth redired/do all initial setup for msal
    instance.handleRedirectPromise().then(async authResult=>{
      // Check if user signed in 
      const account = instance.getActiveAccount();
      if(!account && userInitated){
        // redirect anonymous user to login page 
        instance.loginRedirect({
          scopes: scopes
        });
      } else if (account) {
        if (authResult !== undefined && authResult !== null) {
          dispatch(authenticationTokenSlice.actions.setAuthenticationToken(authResult.accessToken))
          if (await getWantGovernment()) {
            validateGovernmentMode()
          }
          getPaulyLists(authResult.accessToken)
          getUserProfile(authResult.accessToken)
          
        }
      }
    }).catch(err=>{
      // TODO: Handle errors
      console.log(err);
    });
  }

  useEffect(() => {
    getAuthToken(false)
  }, [])

  return (
    <SafeAreaView style={{width: dimensions.window.width, height: dimensions.window.height, zIndex: 2, position: "absolute", left: 0, top: 0}}>
      <AuthenticatedTemplate>
        <AuthenticatedViewMain dimensions={dimensions} width={dimensions.window.width}/>
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <Login onGetAuthToken={() => {getAuthToken(true, false)}} onGetGovernmentAuthToken={() => {getAuthToken(true, true)}} width={dimensions.window.width}/>
      </UnauthenticatedTemplate>
    </SafeAreaView>
  )
}