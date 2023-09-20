import { View, Text, Pressable } from 'react-native'
import React, { useState } from 'react'
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from "expo-auth-session"
import { clientId, orgWideGroupID, tenantId } from '../../PaulyConfig';
import store, { RootState } from '../../Redux/store';
import { authenticationApiTokenSlice } from '../../Redux/reducers/authenticationApiToken';
import { useSelector } from 'react-redux';
import { commissionTypeEnum, loadingStateEnum, locationStateEnum } from '../../types';
import ProgressView from '../../UI/ProgressView';
import getUsersLocation from '../../Functions/getLocation';

async function claimCommissionPost(commissionId: string, imageShare?: string, location?: locationCoords): Promise<loadingStateEnum> {
  if (store.getState().authenticationApiToken !== "") {
    var outResult: string = ""
    if (location) {
      outResult += `&latCoordinate=${location.latCoordinate}&lngCoordinate=${location.lngCoordinate}` 
    }
    if (imageShare) {
      outResult += `&imageShare=${imageShare}`
    }
    const bearer = `Bearer ${store.getState().authenticationApiToken}`
    const result = await fetch(`http://localhost:7071/api/SubmitCommission?orgWideGroupId=${orgWideGroupID}&commissionId=${commissionId}` + outResult, {
      headers: {
        "Authorization":bearer
      }
    })
    if (result.ok){
      return loadingStateEnum.success
    } else {
      return loadingStateEnum.failed
    }
  } else {
    return new Promise<loadingStateEnum>((resolve) => {
      const timeoutId = setTimeout(() => {
        resolve(loadingStateEnum.failed)
      }, 10000)
      store.subscribe(async () => {
        if (store.getState().authenticationApiToken !== "") {
          clearTimeout(timeoutId)
          const result = await claimCommissionPost(commissionId)
          resolve(result)
        }
      })
    })
  }
}

export default function CommissionClaim({commission}:{commission: commissionType}) {
  const authenticationApiToken = useSelector((state: RootState) => state.authenticationApiToken)
  const [claimCommissionState, setClaimCommissionState] = useState<loadingStateEnum>(loadingStateEnum.notStarted)
  const {width} = useSelector((state: RootState) => state.dimentions)
  const [location, setLocation] = useState<undefined | locationCoords>(undefined)
  const [locationState, setLocationState] = useState<locationStateEnum>(locationStateEnum.notStarted)

  async function claimCommission() {
    setClaimCommissionState(loadingStateEnum.loading)
    if (authenticationApiToken === "") {
      await getAuthToken()
    }
    if (commission.value === commissionTypeEnum.ImageLocation || commission.value === commissionTypeEnum.Location) {
      const locationResult = await getUsersLocation(commission)
      if (locationResult.result === locationStateEnum.success && locationResult.data !== undefined) {
        const result = await claimCommissionPost(commission.commissionId, undefined, (commission.value === commissionTypeEnum.ImageLocation || commission.value === commissionTypeEnum.Location) ? locationResult.data:undefined)
        setClaimCommissionState(result)
      } else {
        setClaimCommissionState(loadingStateEnum.failed)
      }
    } else {
      setClaimCommissionState(loadingStateEnum.failed)
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
          setClaimCommissionState(loadingStateEnum.failed)
        } else {
          const data = await result.json()
          store.dispatch(authenticationApiTokenSlice.actions.setAuthenticationApiToken(data["access_token"]))
        }
      }
    });
  }

  return (
    <Pressable onPress={() => {claimCommission()}} style={{marginLeft: "auto", marginRight: "auto", backgroundColor: "#ededed", width: width * 0.7, borderRadius: 15, alignItems: "center", alignContent: "center", justifyContent: "center"}}>
      { (claimCommissionState === loadingStateEnum.loading) ?
        <View style={{margin: 10}}>
          <ProgressView width={24} height={24}/>
        </View>:
        <Text style={{margin: 10, fontWeight: "bold"}}>CLAIM COMMISSION</Text>   
      }
    </Pressable>
  )
}