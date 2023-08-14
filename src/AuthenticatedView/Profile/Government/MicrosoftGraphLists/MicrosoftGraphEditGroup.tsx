import { View, Text, Dimensions, Button, Pressable } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-native'
import callMsGraph from '../../../../Functions/microsoftAssets'
import { accessTokenContent } from '../../../../../App';
import { useMsal } from '@azure/msal-react';
import { siteID } from '../../../../PaulyConfig';
import { CopyIcon } from '../../../../UI/Icons/Icons';
import * as Clipboard from 'expo-clipboard';
import { loadingStateEnum } from '../../../../types';
import store from '../../../../Redux/store';


export default function MicrosoftGraphEditGroup() {
    const pageData = useContext(accessTokenContent);
    const { groupId } = useParams()

    const [isCoppiedToClipboard, setIsCoppiedToClipboard] = useState<boolean>(false)
    const [groupLoadingState, setGroupLoadingState] = useState<loadingStateEnum>(loadingStateEnum.loading)

    async function getListItems() {
        const result = await callMsGraph("https://graph.microsoft.com/v1.0/groups/" + groupId)
        if (result.ok) {
            const data = await result.json()
            console.log(data)
            setGroupLoadingState(loadingStateEnum.success)
        } else {
            setGroupLoadingState(loadingStateEnum.failed)
        }
    }

    async function deleteGroup() {
        const deleteGroupResult = await callMsGraph("https://graph.microsoft.com/v1.0/groups/" + groupId, "DELETE")
        if (deleteGroupResult.ok) {

        } else {
            //TO DO handle 
        }
    }

    useEffect(() => {getListItems()}, [])
    return (
        <View style={{overflow: "hidden"}}>
            <Link to="/profile/government/graph">
                <Text>Back</Text>
            </Link>
            <Text>MicrosoftGraphEditList</Text>
            <View style={{flexDirection: "row"}}>
                <Text>{groupId}</Text>
                { isCoppiedToClipboard ?
                    <Pressable onPress={async () => {await Clipboard.setStringAsync(groupId)}}>
                        <Text>Copied To Clipboard!</Text>
                    </Pressable>:
                    <Pressable onPress={async () => {await Clipboard.setStringAsync(groupId); setIsCoppiedToClipboard(true)}}>
                        <CopyIcon width={14} height={14}/>
                    </Pressable>
                }
            </View>
            <Button title="Delete Group" onPress={() => {deleteGroup()}}/>
        </View>
    )
}