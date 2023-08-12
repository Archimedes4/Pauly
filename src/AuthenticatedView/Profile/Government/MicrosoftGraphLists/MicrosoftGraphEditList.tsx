import { View, Text, Dimensions, Button } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-native'
import callMsGraph from '../../../../Functions/microsoftAssets'
import { accessTokenContent } from '../../../../../App';

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

const windowDimensions = Dimensions.get('window');
const screenDimensions = Dimensions.get('screen');

export default function MicrosoftGraphEditList() {
    const [dimensions, setDimensions] = useState({
        window: windowDimensions,
        screen: screenDimensions,
      });
    

    useEffect(() => {
        const subscription = Dimensions.addEventListener(
          'change',
          ({window, screen}) => {
            setDimensions({window, screen});
          },
        );
        return () => subscription?.remove();
    });

    useEffect(() => {
        setDimensions({
            window: Dimensions.get('window'),
            screen: Dimensions.get('screen')
        })
    }, [])
    const microsoftAccessToken = useContext(accessTokenContent);
    const [currentColumns, setCurrentColumns] = useState<listColumnType[]>([])
    const { listId } = useParams()
    async function getListItems() {
        const result = await callMsGraph(microsoftAccessToken.accessToken,"https://graph.microsoft.com/v1.0/sites/8td1tk.sharepoint.com,b2ef509e-4511-48c3-b607-a8c2cddc0e35,091feb8c-a978-4e3f-a60f-ecdc319b2304/lists/" + listId + "/items?expand=fields")
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
        const result = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/8td1tk.sharepoint.com,b2ef509e-4511-48c3-b607-a8c2cddc0e35,091feb8c-a978-4e3f-a60f-ecdc319b2304/lists/"+ listId + "/columns/" + columnId, "PATCH", false, JSON.stringify(data))//TO DO fix ids
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
        const result = await callMsGraph(microsoftAccessToken.accessToken,"https://graph.microsoft.com/v1.0/sites/8td1tk.sharepoint.com,b2ef509e-4511-48c3-b607-a8c2cddc0e35,091feb8c-a978-4e3f-a60f-ecdc319b2304/lists/" + listId + "/columns")
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
            <Text>{listId}</Text>
            <View style={{flexDirection: "row", overflow: "scroll", height: dimensions.window.height * 0.4}}>
            {currentColumns.map((item) => (
                <View style={{width: dimensions.window.width * 0.3, height: dimensions.window.height * 0.4, borderColor: "black", borderWidth: 2}}>
                    <Text>{item.displayName}</Text>
                    {(item.indexed === false) ? <Button title='Index This Propertie' onPress={() => {indexColumn(item.id)}}/>:<Text>Already Indexed</Text>
                    }
                </View>
            ))}
            </View>
        </View>
    )
}