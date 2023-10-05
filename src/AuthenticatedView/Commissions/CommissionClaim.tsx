import { View, Text, Pressable, Platform } from 'react-native'
import React, { useState } from 'react'
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from "expo-auth-session"
import { clientId, orgWideGroupID, tenantId } from '../../PaulyConfig';
import store, { RootState } from '../../Redux/store';
import { authenticationApiTokenSlice } from '../../Redux/reducers/authenticationApiToken';
import { useSelector } from 'react-redux';
import { commissionTypeEnum, loadingStateEnum, locationStateEnum } from '../../types';
import ProgressView from '../../UI/ProgressView';
import getUsersLocation from '../../Functions/commissions/getLocation';
import { useMsal } from '@azure/msal-react';

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
    try {
      const result = await fetch(`http://localhost:7071/api/SubmitCommission?orgWideGroupId=${orgWideGroupID}&commissionId=${commissionId}${outResult}`, {
        headers: {
          "Authorization":bearer
        }
      })
      if (result.ok){
        return loadingStateEnum.success
      } else {
        return loadingStateEnum.failed
      }
    } catch {
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
  const [claimCommissionState, setClaimCommissionState] = useState<loadingStateEnum>(loadingStateEnum.notStarted)
  const {width} = useSelector((state: RootState) => state.dimentions)
  const [location, setLocation] = useState<undefined | locationCoords>(undefined)
  const [locationState, setLocationState] = useState<locationStateEnum>(locationStateEnum.notStarted)

  async function claimCommission() {
    setClaimCommissionState(loadingStateEnum.loading)
    if (store.getState().authenticationApiToken === "") {
      setClaimCommissionState(loadingStateEnum.failed)
      
    }
    if (commission.value === commissionTypeEnum.ImageLocation || commission.value === commissionTypeEnum.Location) {
      const locationResult = await getUsersLocation(commission)
      if (locationResult.result === locationStateEnum.success && locationResult.data !== undefined) {
        const result = await claimCommissionPost(commission.commissionId, undefined, locationResult.data)
        setClaimCommissionState(result)
      } else {
        setClaimCommissionState(loadingStateEnum.failed)
      }
    } else {
      const result = await claimCommissionPost(commission.commissionId, undefined, undefined)
      setClaimCommissionState(result)
    }
  }

  return (
    <Pressable onPress={() => {claimCommission()}} style={{marginLeft: "auto", marginRight: "auto", backgroundColor: "#ededed", width: width * 0.7, borderRadius: 15, alignItems: "center", alignContent: "center", justifyContent: "center"}}>
      { (claimCommissionState === loadingStateEnum.loading) ?
        <View style={{margin: 10}}>
          <ProgressView width={24} height={24}/>
        </View>:
        <Text style={{margin: 10, fontWeight: "bold"}}>{(claimCommissionState === loadingStateEnum.notStarted) ? "CLAIM COMMISSION":(claimCommissionState === loadingStateEnum.success) ? "SUBMISSION SENT":"FAILED TO SEND SUBMISSION"}</Text>   
      }
    </Pressable>
  )
}