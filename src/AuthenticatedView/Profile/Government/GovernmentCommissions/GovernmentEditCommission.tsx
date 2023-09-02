import { View, Text, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import callMsGraph from '../../../../Functions/microsoftAssets'
import { Link, useParams } from 'react-router-native'
import { RootState } from '../../../../Redux/store'
import { useSelector } from 'react-redux'
import { commissionTypeEnum, loadingStateEnum } from '../../../../types'

export default function GovernmentEditCommission() {
    const {commissionListId, siteId} = useSelector((state: RootState) => state.paulyList)
    const {height, width} = useSelector((state: RootState) => state.dimentions)
    const [commissionItemId, setCommissionItemId] = useState<string>("")

    const [getCommissionResult, setGetCommissionResult] = useState<loadingStateEnum>(loadingStateEnum.loading)
    const [deleteCommissionResult, setDeleteCommissionResult] = useState<loadingStateEnum>(loadingStateEnum.notStarted)
    const [commissionValue, setCommissionValue] = useState<commissionTypeEnum>(commissionTypeEnum.Issued)

    const {id} = useParams()
    async function getCommission() {
        console.log(id)
        const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + siteId + "/lists/" + commissionListId + `/items?expand=fields&$filter=fields/commissionID%20eq%20'${id}'`)
        if (result.ok) {
            const data = await result.json()
            console.log(data)
            if (data["value"].length !== 1){

            }
            setCommissionItemId(data["value"][0]["id"])
            const commissionData = data["value"][0]["fields"]
            setCommissionValue(commissionData["value"])
            
        } else {
            setGetCommissionResult(loadingStateEnum.failed)
        }
    }
    async function deleteCommission() {
        if (commissionItemId === "" || deleteCommissionResult === loadingStateEnum.loading || deleteCommissionResult === loadingStateEnum.success) {return}
        setDeleteCommissionResult(loadingStateEnum.loading)
        const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + siteId + "/lists/" + commissionListId + "/items/" + commissionItemId, "DELETE")
        if (result.ok) {
            const deleteList = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + siteId + `/lists/${id}`, "DELETE")
            if (deleteList.ok){
                setDeleteCommissionResult(loadingStateEnum.success)
            } else {
                setDeleteCommissionResult(loadingStateEnum.failed)
            }
        } else {
            setDeleteCommissionResult(loadingStateEnum.failed)
        }
    }
    useEffect(() => {
        getCommission()
    }, [])
  return (
    <View style={{width: width, height: height, backgroundColor: "white"}}>
        <Link to="/profile/government/commissions">
            <Text>Back</Text>
        </Link>
        <Text>Edit Commission</Text>
        <View>
            { (commissionValue === commissionTypeEnum.QRCode) ?
                <View>
                    <View></View>
                </View>:null
            }
        </View>
        <Pressable onPress={() => {deleteCommission()}}>
            <Text>{(deleteCommissionResult === loadingStateEnum.notStarted) ? "Delete Commission":(deleteCommissionResult === loadingStateEnum.loading) ? "Loading":(deleteCommissionResult === loadingStateEnum.success) ? "Deleted Commission":"Failed to Delete Commission"}</Text>
        </Pressable>
    </View>
  )
}