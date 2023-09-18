import { View, Text, Pressable } from 'react-native'
import React from 'react'
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from "expo-auth-session"
import { clientId, orgWideGroupID, tenantId } from '../../PaulyConfig';
import store, { RootState } from '../../Redux/store';
import { authenticationApiTokenSlice } from '../../Redux/reducers/authenticationApiToken';
import { useSelector } from 'react-redux';

async function claimCommissionPost(commissionId: string) {
  if (store.getState().authenticationApiToken !== "") {
    const bearer = `Bearer ${store.getState().authenticationApiToken}`
    const result = await fetch("http://localhost:7071/api/SubmitCommission?orgWideGroupId="+orgWideGroupID+"&commissionId="+commissionId, {
      headers: {
        "Authorization":bearer
      }
    })
    if (result.ok){
      console.log("Success")
    } else {

    }
  } else {
    const timeoutId = setTimeout(() => {
      return
    }, 10000)
    store.subscribe(async () => {
      if (store.getState().authenticationApiToken !== "") {
        clearTimeout(timeoutId)
        const result = await claimCommissionPost(commissionId)
      }
    })
  }
}
export default function CommissionClaim({commissionId}:{commissionId: string}) {
  const authenticationApiToken = useSelector((state: RootState) => state.authenticationApiToken)
  async function claimCommission() {
    if (authenticationApiToken === "") {
      await getAuthToken()
    }
    //TO DO add check to make use authenticationApiToken now exisits and wait for it if not
    claimCommissionPost(commissionId)
    
  }

  const discovery: AuthSession.DiscoveryDocument = {
    authorizationEndpoint: 'https://login.microsoftonline.com/' + tenantId + '/oauth2/v2.0/authorize',
    tokenEndpoint: 'https://login.microsoftonline.com/' + tenantId + '/oauth2/v2.0/token',
    revocationEndpoint: 'https://api.fitbit.com/oauth2/revoke',
  }
  
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "Archimedes4.Pauly",
    path: 'auth',
  });
  
    // Request
  const [request, result, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId,
      //scope: "api://6f1e349a-7320-4452-9f32-7e6633fe465b/api/Test",
      extraParams: {responceMode: "query", grant_type: "authorization_code"},
      scopes: ["api://6f1e349a-7320-4452-9f32-7e6633fe465b/api/Test"],
      redirectUri,
      responseType: "code"
    },
    discovery,
  );
    
  async function getAuthToken() {
    promptAsync().then(async (codeResponse) => {
      if (request && codeResponse?.type === 'success' && discovery) {
        const data: string = "client_id=" + clientId + "&scope=api://" + clientId + "/api/.default&code=" + codeResponse.params.code + "&redirect_uri=" + redirectUri + "&grant_type=authorization_code&code_verifier=" + request.codeVerifier
        const result = await fetch('https://login.microsoftonline.com/' + tenantId + '/oauth2/v2.0/token', {
          method: "POST",
          body: data,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        })
        if (!result.ok) {
          const data = await result.json()
        } else {
          const data = await result.json()
          store.dispatch(authenticationApiTokenSlice.actions.setAuthenticationApiToken(data["access_token"]))
        }
      }
    });
  }

  return (
    <Pressable onPress={() => {claimCommission()}} style={{}}>
      <Text>Claim Commission</Text>
    </Pressable>
  )
}