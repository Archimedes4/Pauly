import { useSelector } from "react-redux"
import { RootState } from "../../Redux/store"
import { useState } from "react"
import { commissionTypeEnum, loadingStateEnum, locationStateEnum } from "../../types"
import { useMsal } from "@azure/msal-react"
import { clientId } from "../../PaulyConfig"
import getUsersLocation from "../../Functions/commissions/getLocation"
import { Pressable, View, Text } from "react-native"
import ProgressView from "../../UI/ProgressView"
import React from "react"
import { addImage, claimCommissionPost } from "../../Functions/commissions/claimCommissionsFunctions"

export default function CommissionClaim({commission, imageData}:{commission: commissionType, imageData? :string}) {
  const [claimCommissionState, setClaimCommissionState] = useState<loadingStateEnum>(loadingStateEnum.notStarted)
  const {width} = useSelector((state: RootState) => state.dimentions)
  const {instance} = useMsal()

  async function claimCommission() {
    setClaimCommissionState(loadingStateEnum.loading)
    const apiResult = await instance.acquireTokenSilent({
      scopes: [`api://${clientId}/api/Test`]
    })
    let outImageUrl: string = ""
    if ((commission.value === commissionTypeEnum.Image || commission.value === commissionTypeEnum.ImageLocation) && imageData !== undefined) {
      const outImage = await addImage(imageData)
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