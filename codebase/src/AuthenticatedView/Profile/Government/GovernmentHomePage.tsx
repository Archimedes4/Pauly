import { View, Text, Pressable, TextInput } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { accessTokenContent } from '../../../App';
import callMsGraph from '../../../Functions/microsoftAssets';
import { Link } from 'react-router-native';
import MicrosoftFilePicker from '../../../UI/microsoftFilePicker';

export default function GovernmentHomePage() {
    const microsoftAccessToken = useContext(accessTokenContent);
    const [newMessageText, setNewMessageText] = useState("")
    const [newAnimationSpeed, setNewAnnimationSpeed] = useState(0)
    async function updateText(){
        const data = {
            "Message":newMessageText
        }
        const result = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/8td1tk.sharepoint.com,b2ef509e-4511-48c3-b607-a8c2cddc0e35,091feb8c-a978-4e3f-a60f-ecdc319b2304/lists/eb90cf62-9f67-4d08-b0ce-78846ae4fb52/items/1/fields", "PATCH", JSON.stringify(data))//TO DO fix list ids
        if (result.ok){
            const data = await result.json()
            console.log(data)
        } else {

        }
    }
    async function updateAnimationSpeed() {
        const data = {
            "AnimationSpeed":newAnimationSpeed
        }
        const result = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/8td1tk.sharepoint.com,b2ef509e-4511-48c3-b607-a8c2cddc0e35,091feb8c-a978-4e3f-a60f-ecdc319b2304/lists/eb90cf62-9f67-4d08-b0ce-78846ae4fb52/items/1fields", "PATCH", JSON.stringify(data)) //TO DO fix id
        console.log(result)
        const resultData = await result.json()
        console.log(resultData)
    }
    async function getCurrentTextAndAnimationSpeed() {
        const result = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/8td1tk.sharepoint.com,b2ef509e-4511-48c3-b607-a8c2cddc0e35,091feb8c-a978-4e3f-a60f-ecdc319b2304/lists/eb90cf62-9f67-4d08-b0ce-78846ae4fb52/items/1/fields")//TO DO fix list ids
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
            <Text>Government Home Page</Text>
            <TextInput value={newMessageText} onChangeText={setNewMessageText}/>
            <Pressable onPress={() => {updateText()}}>
                <Text>Update Text</Text>
            </Pressable>
            <Text>Select Powerpoint</Text>
            <MicrosoftFilePicker onSetIsShowingUpload={function (item: boolean): void {
                throw new Error('Function not implemented.');
            } } onSetIsShowingMicrosoftUpload={function (item: boolean): void {
                throw new Error('Function not implemented.');
            } } onSelectedFile={function (item: microsoftFileType): void {
                throw new Error('Function not implemented.');
            } } />
        </View>
    )
}