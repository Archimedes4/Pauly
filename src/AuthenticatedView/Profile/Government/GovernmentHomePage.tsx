import { View, Text, Pressable, TextInput, Button } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import callMsGraph from '../../../Functions/Ultility/microsoftAssets';
import { Link } from 'react-router-native';
import MicrosoftFilePicker from '../../../UI/microsoftFilePicker';
import { useMsal } from '@azure/msal-react';
import { RootState } from '../../../Redux/store';
import { useSelector } from 'react-redux';
import getCurrentPaulyData from '../../../Functions/Homepage/getCurrentPaulyData';
import { loadingStateEnum } from '../../../types';

export default function GovernmentHomePage() {
    const {paulyDataListId, siteId} = useSelector((state: RootState) => state.paulyList)
    const {width, height} = useSelector((state: RootState) => state.dimentions)

    //Loading States
    const [loadContentLoadingState, setLoadContentLoadingState] = useState<loadingStateEnum>(loadingStateEnum.loading)

    //New Data 
    const [newMessageText, setNewMessageText] = useState("")
    const [newAnimationSpeed, setNewAnnimationSpeed] = useState(0)
    const [selectedPowerpoint, setSelectedPowerpoint] = useState<microsoftFileType | undefined>(undefined)

    async function loadCurrentPaultData() {
        const result = await getCurrentPaulyData(siteId)
        if (result.result === loadingStateEnum.success && result.data !== undefined) {
            console.log("This went well", result)
            setNewAnnimationSpeed(result.data.animationSpeed)
            setNewMessageText(result.data.message)
            setLoadContentLoadingState(loadingStateEnum.success)
        } else {
            setLoadContentLoadingState(loadingStateEnum.failed)
        }
    }
    async function createShareId(item: microsoftFileType): Promise<string | undefined> {
        const data = {
            "type": "view",
            "scope": "organization"
        }
        const result = await callMsGraph(item.callPath + "/createLink", "POST", false, JSON.stringify(data))
        if (result.ok){
            const data = await result.json()
            return data["shareId"]
        } else {
            return undefined
        }
    }
    async function updatePaulyData(key: string, data: string){
        var dataOut = {}
        dataOut[key] = data
        const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + siteId + "/lists/" + paulyDataListId + "/items/1/fields", "PATCH", false, JSON.stringify(dataOut))//TO DO fix list ids
        if (result.ok){ 
            const data = await result.json()
        } else {
            const data = await result.json()
            console.log(data)
            //TO DO handle error
        }
    }
    useEffect(() => {
        loadCurrentPaultData()
    }, [])

    return (
        <View style={{width: width, height: height, backgroundColor: "white"}}>
            <Link to="/profile/government/">
                <Text>Back</Text>
            </Link>
            <Text>Home Page</Text>
            <View>
                <TextInput value={newMessageText} onChangeText={setNewMessageText}/>
                <Pressable onPress={() => {updatePaulyData("message", newMessageText)}}>
                    <Text>Update Text</Text>
                </Pressable>
            </View>
            <Text>Select Powerpoint: {selectedPowerpoint?.name}</Text>
            <MicrosoftFilePicker height={height * 0.6} width={width} onSelectedFile={(selectedFile) => {
                setSelectedPowerpoint(selectedFile)
            }}/>
            <Pressable onPress={async () => {
                const shareId = await createShareId(selectedPowerpoint)
                updatePaulyData("powerpointId", shareId)
            }}>
                <Text>Save Changes</Text>
            </Pressable>
        </View>
    )
}