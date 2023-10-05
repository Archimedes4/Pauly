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
import callMsGraph from '../../Functions/Ultility/microsoftAssets';
import create_UUID from '../../Functions/Ultility/CreateUUID';

async function b64toBlob(b64Data: string, contentType='', sliceSize=512): Promise<Blob| undefined> {
  const result = await fetch(b64Data)
  if (result.ok) {
    return await result.blob()
  } else {
    return undefined
  }
}

async function addImage(commissionId: string, base64: string): Promise<{result: loadingStateEnum, data?: string}> {
  const fileBlob = await b64toBlob(base64)
  if (fileBlob !== undefined) {
    const types: any = {
      "image/bmp":".bmp",
      "image/gif":".gif",
      "image/jpeg":".jpg",
      "image/png":".png",
      "image/webp":".webp"
    }
    if (types[fileBlob.type] !== undefined) {
      const rootIdResult = await callMsGraph("https://graph.microsoft.com/v1.0/me/drive/root?$select=id")
      if (rootIdResult.ok) {
        const rootIdData = await rootIdResult.json()
        const imageUUID = create_UUID()
        const resumableSessionData = {
          "item": {
            "@microsoft.graph.conflictBehavior": "rename",
            "name": `Pauly_Image_${imageUUID}_Submission${(types[fileBlob.type])}`
          },
          "deferCommit": true
        }
        const resumableSessionResult = await callMsGraph(`https://graph.microsoft.com/v1.0/me/drive/items/${rootIdData["id"]}:/Pauly_Image_${imageUUID}_Submission${(types[fileBlob.type])}:/createUploadSession`, "POST", undefined, JSON.stringify(resumableSessionData))
        if (resumableSessionResult.ok) {
          const resumableSessionResultData = await resumableSessionResult.json()
          var uploadUrl: string = resumableSessionResultData["uploadUrl"]
          if (resumableSessionResultData["nextExpectedRanges"].length === 1) {
            var nextExpectedRange: string = resumableSessionResultData["nextExpectedRanges"][0]
            var remaining: number = fileBlob.size
            var uploaded: number = 0
            if (nextExpectedRange === `${uploaded}-`) {
              while (remaining > 0) { //TO DO Check that this works
                const uploadBlob = fileBlob.slice(uploaded, (remaining >= 5242880) ? 5242880:remaining)
                uploaded += (remaining >= 5242880) ? 5242880:remaining

                const uploadResult = await fetch(uploadUrl, {
                  headers: {
                    "Content-Length": uploadBlob.size.toString(),
                    "Content-Range": `bytes ${uploaded - ((remaining >= 5242880) ? 5242880:remaining)}-${(remaining >= 5242880) ? uploaded:uploaded - 1}/${fileBlob.size}`
                  },
                  method: "PUT",
                  body: uploadBlob
                })
                remaining -= (remaining >= 5242880) ? 5242880:remaining
                if (uploadResult.ok) {
                  
                } else {
                  return {result: loadingStateEnum.failed}
                }
              }
              const uploadCompleteResult = await fetch(uploadUrl, {
                headers: {
                  "Content-Length":"0"
                },
                method: "POST"
              })
              if (uploadCompleteResult.ok) {
                const uploadCompleteResultData = await uploadCompleteResult.json()
                const createLinkMainData = {
                  "type": "view",
                  "scope": "organization"
                }
                const createLinkResult = await callMsGraph(`https://graph.microsoft.com/v1.0/me/drive/items/${uploadCompleteResultData["id"]}/createLink`, "POST", false, JSON.stringify(createLinkMainData))
                if (createLinkResult.ok){
                  const createLinkData = await createLinkResult.json()
                  return {result: loadingStateEnum.success, data: createLinkData["shareId"]}
                } else {
                  return {result: loadingStateEnum.failed}
                }
              } else {
                return {result: loadingStateEnum.failed}
              }
            } else {
              return {result: loadingStateEnum.failed}
            }
          } else {
            return {result: loadingStateEnum.failed}
          }
        } else {
          return {result: loadingStateEnum.failed}
        } 
      } else {
        return {result: loadingStateEnum.failed}
      }
    } else {
      return {result: loadingStateEnum.failed}
    }
  } else {
    return {result: loadingStateEnum.failed}
  }
}

async function claimCommissionPost(auth: string, commissionId: string, imageShare?: string, location?: locationCoords): Promise<loadingStateEnum> {
  var outResult: string = ""
  if (location) {
    outResult += `&latCoordinate=${location.latCoordinate}&lngCoordinate=${location.lngCoordinate}` 
  }
  if (imageShare) {
    outResult += `&imageShare=${imageShare}`
  }
  const bearer = `Bearer ${auth}`
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
}

export default function CommissionClaim({commission, imageData}:{commission: commissionType, imageData? :string}) {
  const [claimCommissionState, setClaimCommissionState] = useState<loadingStateEnum>(loadingStateEnum.notStarted)
  const {width} = useSelector((state: RootState) => state.dimentions)
  const [location, setLocation] = useState<undefined | locationCoords>(undefined)
  const [locationState, setLocationState] = useState<locationStateEnum>(locationStateEnum.notStarted)
  const {instance} = useMsal()

  async function claimCommission() {
    setClaimCommissionState(loadingStateEnum.loading)
    const apiResult = await instance.acquireTokenSilent({
      scopes: [`api://${clientId}/api/Test`]
    })
    var outImageUrl: string = ""
    if ((commission.value === commissionTypeEnum.Image || commission.value === commissionTypeEnum.ImageLocation) && imageData !== undefined) {
      const outImage = await addImage(commission.commissionId, imageData)
      if (outImage.result === loadingStateEnum.success && outImage.data !== undefined) {
        outImageUrl = outImage.data
      } else {
        setClaimCommissionState(loadingStateEnum.failed)
        return
      }
    }
    if (commission.value === commissionTypeEnum.ImageLocation || commission.value === commissionTypeEnum.Location) {
      const locationResult = await getUsersLocation(commission)
      if (locationResult.result === locationStateEnum.success && locationResult.data !== undefined) {
        const result = await claimCommissionPost(apiResult.accessToken, commission.commissionId, (outImageUrl !== "") ? outImageUrl:undefined, locationResult.data)
        setClaimCommissionState(result)
      } else {
        setClaimCommissionState(loadingStateEnum.failed)
      }
    } else {
      const result = await claimCommissionPost(apiResult.accessToken, commission.commissionId, (outImageUrl !== "") ? outImageUrl:undefined, undefined)
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