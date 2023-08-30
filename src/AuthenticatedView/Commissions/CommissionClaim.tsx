import { View, Text, Pressable } from 'react-native'
import React from 'react'
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from "expo-auth-session"

import { clientId, orgWideGroupID, tenantId } from '../../PaulyConfig';
import store, { RootState } from '../../Redux/store';
import { authenticationApiTokenSlice } from '../../Redux/reducers/authenticationApiToken';
import { useSelector } from 'react-redux';

export default function CommissionClaim() {
    const authenticationApiToken = useSelector((state: RootState) => state.authenticationApiToken)
    const bearer = `Bearer ${authenticationApiToken}`
    async function claimCommission() {
        const body = {
            orgWideGroupId: orgWideGroupID,
            commissionId: ""
        }
        const result = await fetch("http://localhost:7071/api/SubmitCommission", {
            headers: {
                "Authorization":bearer
            }
        })
        console.log("This is result", result)
        if (result.ok){
            const data = await result.json()
            
        } else {

        }
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
          extraParams: {scope: "api://6f1e349a-7320-4452-9f32-7e6633fe465b/api/Test", responceMode: "query"},
          scopes: [],
          redirectUri,
          responseType: "code"
        },
        discovery,
      );
    
      async function getAuthToken() {
        promptAsync().then((codeResponse) => {
          if (request && codeResponse?.type === 'success' && discovery) {
            console.log(request)
            console.log(codeResponse.params.code)
            AuthSession.exchangeCodeAsync(
              {
                clientId,
                code: codeResponse.params.code,
                extraParams: request.codeVerifier
                  ? { code_verifier: request.codeVerifier }
                  : undefined,
                redirectUri,
              },
              discovery,
            ).then((response) => {
                console.log(response)
                store.dispatch(authenticationApiTokenSlice.actions.setAuthenticationApiToken(response.accessToken))
            }).catch((e) => {console.log(e)})
          }
        });
    }
  return (
    <View>
      <Text>CommissionClaim</Text>
      <Pressable onPress={() => {getAuthToken()}}>
        <Text>Get Auth Token</Text>
      </Pressable>
      <Pressable onPress={() => {claimCommission()}}>
        <Text>Claim Commission</Text>
      </Pressable>
    </View>
  )
}

// https://login.microsoftonline.com/8ca607b2-50f9-456f-97ef-fde0d5fbdb62/oauth2/v2.0/authorize?
// code_challenge=CPlngyOUWf7zpYETPg6xkRqye19CTD113ySmy7BzOHw
// &scope=api%3A%2F%2F6f1e349a-7320-4452-9f32-7e6633fe465b%2Fapi%2FTest
// &code_challenge_method=S256
// &redirect_uri=http%3A%2F%2Flocalhost%3A19006%2Fauth
// &client_id=6f1e349a-7320-4452-9f32-7e6633fe465b
// &response_type=code
// &state=9ZkNBPmq9N