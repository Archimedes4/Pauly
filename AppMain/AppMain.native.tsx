import { View, Text, SafeAreaView, ScaledSize, Linking } from 'react-native'
import React, { useEffect, useState } from 'react'
import Login from '../src/login'
import AuthenticatedView from '../src/AuthenticatedView/AuthenticatedViewMain'
import { clientId, tenantId } from '../src/PaulyConfig'
import { useDispatch, useSelector } from 'react-redux'
import { authenticationTokenSlice } from '../src/Redux/reducers/authenticationTokenReducer'
import store, { RootState } from '../src/Redux/store'
import { AccountInfo, PublicClientApplication } from '@azure/msal-node'
import getPaulyLists from '../src/Functions/Ultility/getPaulyLists'
import getUserProfile from '../src/Functions/getUserProfile'


const pca = new PublicClientApplication({
  auth: {
    clientId: clientId,
    authority: `https://login.microsoftonline.com/${tenantId}/`
  }
})

const scopes = ["User.Read", "User.ReadBasic.All", "Sites.Read.All", "Sites.Manage.All", "ChannelMessage.Read.All", "Chat.ReadWrite", "Calendars.ReadWrite", "Team.ReadBasic.All", "Group.ReadWrite.All", "Tasks.ReadWrite", "Channel.ReadBasic.All", "Application.ReadWrite.All"]

export default function AppMain({expandedMode, setExpandedMode, dimensions}:{expandedMode: boolean, setExpandedMode: (item: boolean) => void, dimensions: {window: ScaledSize; screen: ScaledSize}}) {
  const [account, setAccount] = useState<undefined | AccountInfo>(undefined)
  const authenticationToken = useSelector((state: RootState) => state.authenticationToken)
  const dispatch = useDispatch()
  
  //Authentication
  async function authInit() {
    try {
      const accounts: AccountInfo[] = await pca.getAllAccounts()
      if (accounts.length >= 1) {
        const authtokenResult = await pca.acquireTokenSilent({
          account: account[0],
          scopes: scopes,
          authority: `https://login.microsoftonline.com/${tenantId}/`
        })
        dispatch(authenticationTokenSlice.actions.setAuthenticationToken(authtokenResult.accessToken))
        getPaulyLists(authtokenResult.accessToken)
        getUserProfile(authtokenResult.accessToken)
        setAccount(account[0])
      }
    } catch (error) {
      console.error('Error initializing the pca, check your config.', error);
    }
  }

  useEffect(() => {
    authInit()
  }, [])

  async function getAuthToken() {
    const openBrowser = async (url) => {
      await Linking.openURL(url);
    };
    const result = await pca.acquireTokenInteractive({
      openBrowser
    })
    
    store.dispatch(authenticationTokenSlice.actions.setAuthenticationToken(result.accessToken))
    getPaulyLists(result.accessToken)
    getUserProfile(result.accessToken)
  }

  async function signOut() {
    // Same as `pca.removeAccount` with the exception that, if called on iOS with the `signoutFromBrowser` option set to true, it will additionally remove the account from the system browser
    // Remove all tokens from the cache for this application for the provided account
    pca.signOut({
      account
    })
    pca.clearCache()
  }

  return (
    <SafeAreaView style={{width: dimensions.window.width, height: dimensions.window.height, zIndex: 2, position: "absolute", left: 0, top: 0}}>
      { (authenticationToken !== '') ?
        <View>
          <AuthenticatedView dimensions={dimensions} width={dimensions.window.width} expandedMode={expandedMode} setExpandedMode={setExpandedMode}/>
        </View>:
        <Login onGetAuthToken={() => {getAuthToken()}} width={dimensions.window.width}/>
      }
    </SafeAreaView>
  )
}