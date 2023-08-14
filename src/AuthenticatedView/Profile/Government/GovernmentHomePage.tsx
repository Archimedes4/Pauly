import { View, Text, Pressable, TextInput, Button } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { accessTokenContent } from '../../../../App';
import callMsGraph from '../../../Functions/microsoftAssets';
import { Link } from 'react-router-native';
import MicrosoftFilePicker from '../../../UI/microsoftFilePicker';
import { siteID } from '../../../PaulyConfig';
import { useMsal } from '@azure/msal-react';
import { RootState } from '../../../Redux/store';
import { useSelector } from 'react-redux';
import getCurrentPaulyData from '../../../Functions/getCurrentPaulyData';
import { loadingStateEnum } from '../../../types';

export default function GovernmentHomePage() {
    const pageData = useContext(accessTokenContent);

    const {paulyDataListId} = useSelector((state: RootState) => state.paulyList)

    //Loading States
    const [loadContentLoadingState, setLoadContentLoadingState] = useState<loadingStateEnum>(loadingStateEnum.loading)

    //New Data 
    const [newMessageText, setNewMessageText] = useState("")
    const [newAnimationSpeed, setNewAnnimationSpeed] = useState(0)
    const [selectedPowerpoint, setSelectedPowerpoint] = useState<microsoftFileType | undefined>(undefined)

    async function loadCurrentPaultData() {
        const result = await getCurrentPaulyData()
        if (result.result === loadingStateEnum.success && result.data !== undefined) {
            console.log("This went well", result)
            setNewAnnimationSpeed(result.data.animationSpeed)
            setNewMessageText(result.data.message)
            setLoadContentLoadingState(loadingStateEnum.success)
        } else {
            setLoadContentLoadingState(loadingStateEnum.failed)
        }
    }
    async function updatePaulyData(key: string, data: string){
        const dataOut = {
            key:data
        }
        const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists/" + paulyDataListId + "/items/1/fields", "PATCH", false, JSON.stringify(dataOut))//TO DO fix list ids
        if (result.ok){ 
            const data = await result.json()
        } else {
            //TO DO handle error
        }
    }
    useEffect(() => {
        loadCurrentPaultData()
    }, [])

    return (
        <View>
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
            <MicrosoftFilePicker height={pageData.dimensions.window.height * 0.6} width={pageData.dimensions.window.width} onSelectedFile={(selectedFile) => {
                setSelectedPowerpoint(selectedFile)
            }}/>
            <Button title='Save Changes' onPress={() => {
                updatePaulyData("powerpointId", selectedPowerpoint.id)
            }}/>
        </View>
    )
}