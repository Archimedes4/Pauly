import { View, Text, Pressable, TextInput, Button, Switch } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import callMsGraph from '../../../Functions/Ultility/microsoftAssets';
import { Link } from 'react-router-native';
import MicrosoftFilePicker from '../../../UI/microsoftFilePicker';
import { useMsal } from '@azure/msal-react';
import store, { RootState } from '../../../Redux/store';
import { useSelector } from 'react-redux';
import getCurrentPaulyData from '../../../Functions/homepage/getCurrentPaulyData';
import { Colors, loadingStateEnum } from '../../../types';

export default function GovernmentHomePage() {
    const {paulyDataListId, siteId} = useSelector((state: RootState) => state.paulyList)
    const {width, height} = useSelector((state: RootState) => state.dimentions)

    //Loading States
    const [loadContentLoadingState, setLoadContentLoadingState] = useState<loadingStateEnum>(loadingStateEnum.loading)
    const [newMessageState, setNewMessageState] = useState<loadingStateEnum>(loadingStateEnum.notStarted)

    //New Data 
    const [newMessageText, setNewMessageText] = useState(store.getState().paulyData.message)
    const [newAnimationSpeed, setNewAnnimationSpeed] = useState(store.getState().paulyData.animationSpeed)
    const [selectedPowerpoint, setSelectedPowerpoint] = useState<microsoftFileType | undefined>(undefined)
    const [isAutoUpdatingText, setIsAutoUpdatingText] = useState<boolean>(false)

    async function loadCurrentPaultData() {
      const result = await getCurrentPaulyData()
      setLoadContentLoadingState(loadingStateEnum.success)
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
        setNewMessageState(loadingStateEnum.success)
      } else {
        setNewMessageState(loadingStateEnum.failed)
      }
    }

    useEffect(() => {
      const storeText = newMessageText
      setTimeout(() => {
        if (isAutoUpdatingText && newMessageText === storeText) {
          updatePaulyData("message", newMessageText)
        }
      }, 2000)
    }, [newMessageText])
    useEffect(() => {
      loadCurrentPaultData()
    }, [])

    return (
      <View style={{width: width, height: height, backgroundColor: Colors.white}}>
        <Link to="/profile/government/">
          <Text>Back</Text>
        </Link>
        <Text>Home Page</Text>
        <View>
          <View style={{flexDirection: "row"}}>
            <TextInput value={newMessageText} onChangeText={(e) => {setNewMessageText(e)}}/>
          </View>
          { isAutoUpdatingText ?
            null:
            <Pressable onPress={() => {updatePaulyData("message", newMessageText)}}>
              <Text>Update Text</Text>
            </Pressable>
          }
          <View style={{flexDirection: "row"}}>
            <Text>Is auto updating text: </Text>
            <Switch
              trackColor={{false: '#767577', true: '#81b0ff'}}
              thumbColor={isAutoUpdatingText ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={setIsAutoUpdatingText}
              value={isAutoUpdatingText}
            />
          </View>
        </View>
        <View>
          <View>
            <Text style={{margin: 5}}>Select Powerpoint: {selectedPowerpoint?.name}</Text>
          </View>
          <MicrosoftFilePicker height={height * 0.6} width={width} onSelectedFile={(selectedFile) => {
            setSelectedPowerpoint(selectedFile)
          }}/>
        </View>
        <Pressable onPress={async () => {
          if (selectedPowerpoint !== undefined) {
            const shareId = await createShareId(selectedPowerpoint)
            if ((shareId) !== undefined) {
              updatePaulyData("powerpointId", shareId)
            }
          }
        }}>
          <Text>Save Changes</Text>
        </Pressable>
      </View>
    )
}