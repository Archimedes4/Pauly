import { View, Text, Dimensions, Button, Pressable } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-native'
import callMsGraph from '../../../../Functions/microsoftAssets'
import { accessTokenContent } from '../../../../../App';
import { useMsal } from '@azure/msal-react';
import { siteID } from '../../../../PaulyConfig';
import { CopyIcon } from '../../../../UI/Icons/Icons';
import * as Clipboard from 'expo-clipboard';

declare global {
    type listColumnType = {
        columnGroup: string
        description: string
        displayName: string
        enforceUniqueValues: boolean
        hidden: boolean
        id: string
        indexed: boolean
        name: string
        readOnly: boolean
        required: boolean
    }
}

export default function MicrosoftGraphEditList() {
    const pageData = useContext(accessTokenContent);

    const [currentColumns, setCurrentColumns] = useState<listColumnType[]>([])
    const { listId } = useParams()
    const [isCoppiedToClipboard, setIsCoppiedToClipboard] = useState<boolean>(false)

    async function getListItems() {
        const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + siteID +"/lists/" + listId + "/items?expand=fields")
        if (result.ok) {
            const data = await result.json()
            console.log(data)
        } else {

        }
    }
    async function indexColumn(columnId: string) {
        const data = {
            "indexed": "true" 
        }
        const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists/"+ listId + "/columns/" + columnId, "PATCH", false, JSON.stringify(data))//TO DO fix ids
        console.log(result)
        if (result.ok){
            const data = await result.json()
            console.log(data)
            var newColumnData: listColumnType[] = currentColumns
            const index = newColumnData.findIndex((e) => {e.id === columnId})
            if (index !== -1){
                newColumnData[index].indexed = true
                setCurrentColumns(newColumnData)
            } else {
                //TO DO failed
            }
        }
    }
    async function getColumns() {
        const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + siteID +"/lists/" + listId + "/columns")
        if (result.ok) {
            const data = await result.json()
            console.log(data)
            if (data["value"].length !== undefined){
                var newCurrentColumns: listColumnType[] = []
                for(let index = 0; index < data["value"].length; index++){
                    newCurrentColumns.push({
                        columnGroup: data["value"][index]["columnGroup"],
                        description: data["value"][index]["description"],
                        displayName: data["value"][index]["displayName"],
                        enforceUniqueValues: data["value"][index]["enforceUniqueValues"],
                        hidden: data["value"][index]["hidden"],
                        id: data["value"][index]["id"],
                        indexed: data["value"][index]["indexed"],
                        name: data["value"][index]["name"],
                        readOnly: data["value"][index]["readOnly"],
                        required: data["value"][index]["required"]
                    })
                }
                setCurrentColumns(newCurrentColumns)
            }
        } else {

        }
    }
    useEffect(() => {getListItems(); getColumns()}, [])
    return (
        <View style={{overflow: "hidden"}}>
            <Link to="/profile/government/graph">
                <Text>Back</Text>
            </Link>
            <Text>MicrosoftGraphEditList</Text>
            <View style={{flexDirection: "row"}}>
                <Text>{listId}</Text>
                { isCoppiedToClipboard ?
                    <Pressable onPress={async () => {await Clipboard.setStringAsync(listId)}}>
                        <Text>Copied To Clipboard!</Text>
                    </Pressable>:
                    <Pressable onPress={async () => {await Clipboard.setStringAsync(listId); setIsCoppiedToClipboard(true)}}>
                        <CopyIcon width={14} height={14}/>
                    </Pressable>
                }
            </View>
            <View style={{flexDirection: "row", overflow: "scroll", height: pageData.dimensions.window.height * 0.4}}>
            {currentColumns.map((item) => (
                <View style={{width: pageData.dimensions.window.width * 0.3, height: pageData.dimensions.window.height * 0.4, borderColor: "black", borderWidth: 2}}>
                    <Text>{item.displayName}</Text>
                    {(item.indexed === false) ? <Button title='Index This Propertie' onPress={() => {indexColumn(item.id)}}/>:<Text>Already Indexed</Text>
                    }
                </View>
            ))}
            </View>
        </View>
    )
}