import { View, Text, Pressable, TextInput } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { accessTokenContent } from '../../../../App';
import callMsGraph from '../../../Functions/microsoftAssets';
import { Link } from 'react-router-native';
import MicrosoftFilePicker from '../../../UI/microsoftFilePicker';
import { siteID } from '../../../PaulyConfig';
import { useMsal } from '@azure/msal-react';
import { RootState } from '../../../Redux/store';
import { useSelector } from 'react-redux';

export default function GovernmentHomePage() {
    const pageData = useContext(accessTokenContent);
    const { instance, accounts } = useMsal();
    const {paulyDataListId} = useSelector((state: RootState) => state.paulyList)
    const [newMessageText, setNewMessageText] = useState("")
    const [newAnimationSpeed, setNewAnnimationSpeed] = useState(0)
    const [selectedPowerpoint, setSelectedPowerpoint] = useState<microsoftFileType | undefined>(undefined)
    async function updateText(){
        const data = {
            "Message":newMessageText
        }
        const result = await callMsGraph(pageData.accessToken, "https://graph.microsoft.com/v1.0/sites/8td1tk.sharepoint.com,b2ef509e-4511-48c3-b607-a8c2cddc0e35,091feb8c-a978-4e3f-a60f-ecdc319b2304/lists/eb90cf62-9f67-4d08-b0ce-78846ae4fb52/items/1/fields", instance, accounts, "PATCH", false, JSON.stringify(data))//TO DO fix list ids
        if (result.ok){
            const data = await result.json()
            console.log(data)
        } else {
            //TO DO handle error
        }
    }
    async function updateAnimationSpeed() {
        const data = {
            "AnimationSpeed":newAnimationSpeed
        }
        const result = await callMsGraph(pageData.accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID +"/lists/eb90cf62-9f67-4d08-b0ce-78846ae4fb52/items/1fields", instance, accounts, "PATCH", false, JSON.stringify(data)) //TO DO fix id
        console.log(result)
        const resultData = await result.json()
        console.log(resultData)
    }
    async function getCurrentTextAndAnimationSpeed() {
        const result = await callMsGraph(pageData.accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists/" + paulyDataListId + "/items/1/fields", instance, accounts)//TO DO fix list ids
        if (result.ok){
            const data: Record<string, any> = await result.json()
            console.log(data)
            if (data.hasOwnProperty("AnimationSpeed") && data.hasOwnProperty("Message")) {
                setNewAnnimationSpeed(data["AnimationSpeed"])
                setNewMessageText(data["Message"])
            } else {
                //TO DO handle error
            }
        } else {

        }
    }
    useEffect(() => {
        getCurrentTextAndAnimationSpeed()
    }, [])
    return (
        <View>
            <Link to="/profile/government/">
                <Text>Back</Text>
            </Link>
            <Text>Home Page</Text>
            <View>
                <TextInput value={newMessageText} onChangeText={setNewMessageText}/>
                <Pressable onPress={() => {updateText()}}>
                    <Text>Update Text</Text>
                </Pressable>
            </View>
            <Text>Select Powerpoint</Text>
            <MicrosoftFilePicker height={pageData.dimensions.window.height * 0.6} width={pageData.dimensions.window.width} onSelectedFile={(selectedFile) => {
                setSelectedPowerpoint(selectedFile)
            }}/>
        </View>
    )
}