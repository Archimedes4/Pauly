import { SafeAreaView, ScaledSize} from 'react-native'
import React, { useEffect, useState } from 'react'
import Login from '../src/login'
import AuthenticatedViewMain from '../src/AuthenticatedView/AuthenticatedViewMain'
import { clientId, tenantId } from '../src/PaulyConfig'
import { useDispatch } from 'react-redux'
import getPaulyLists from '../src/Functions/Ultility/getPaulyLists'
import getUserProfile from '../src/Functions/getUserProfile'
import { authenticationTokenSlice } from '../src/Redux/reducers/authenticationTokenReducer'
import { EventType, LogLevel, PublicClientApplication } from '@azure/msal-browser'
import { AuthenticatedTemplate, MsalProvider, UnauthenticatedTemplate, useMsal } from '@azure/msal-react'

const pca = new PublicClientApplication({
  auth: {
    clientId: clientId,
    authority: `https://login.microsoftonline.com/${tenantId}/`,
    redirectUri: "http://localhost:19006/"//TO DO change prod
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);   // when fails this message appears: "[Thu, 15 Apr 2021 07:06:24 GMT] :  : @azure/msal-browser@2.13.0 : Info - Emitting event: msal:loginFailure"
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
        }
      },
    },
  }
});

const scopes = ["User.Read", "User.ReadBasic.All", "Sites.Read.All", "Sites.Manage.All", "ChannelMessage.Read.All", "Chat.ReadWrite", "Calendars.ReadWrite", "Team.ReadBasic.All", "Group.ReadWrite.All", "Tasks.ReadWrite", "Channel.ReadBasic.All", "Application.ReadWrite.All"]

export default function AppMain({dimensions}:{dimensions: {window: ScaledSize; screen: ScaledSize}}) {
  async function signOut() {
    // Same as `pca.removeAccount` with the exception that, if called on iOS with the `signoutFromBrowser` option set to true, it will additionally remove the account from the system browser
    // Remove all tokens from the cache for this application for the provided account
    pca.logoutPopup()
  }

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

  async function getAuthToken() {
    // Account selection logic is app dependent. Adjust as needed for different use cases.
    // Set active acccount on page load
    console.log("Running auth")
    const accounts = instance.getAllAccounts();
    if (accounts.length > 0) {
      instance.setActiveAccount(accounts[0]);
      const result = await instance.acquireTokenSilent({
        scopes: scopes
      })
      dispatch(authenticationTokenSlice.actions.setAuthenticationToken(result.accessToken))
      getPaulyLists(result.accessToken)
      getUserProfile(result.accessToken)
    }

    instance.addEventCallback((event: any) => {
      // set active account after redirect
      if (event.eventType === EventType.LOGIN_SUCCESS && event.payload.account) {
        const account = event.payload.account;
        instance.setActiveAccount(account);
      }
    });

    // handle auth redired/do all initial setup for msal
    instance.handleRedirectPromise().then(authResult=>{
      // Check if user signed in 
      const account = instance.getActiveAccount();
      if(!account){
        // redirect anonymous user to login page 
        instance.loginRedirect({
          scopes: scopes
        });
      } else {
        if (authResult !== undefined && authResult !== null) {
          dispatch(authenticationTokenSlice.actions.setAuthenticationToken(authResult.accessToken))
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
    getAuthToken()
  }, [])

  return (
    <>
      <AuthenticatedTemplate>
        <AuthenticatedViewMain dimensions={dimensions} width={dimensions.window.width}/>
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <Login onGetAuthToken={() => {getAuthToken()}} width={dimensions.window.width}/>
      </UnauthenticatedTemplate>
    </>
  )
}