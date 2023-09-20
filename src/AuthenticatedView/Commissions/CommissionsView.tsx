import { View, Text, Button, Pressable, Image } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import callMsGraph from '../../Functions/Ultility/microsoftAssets'
import { useParams } from 'react-router-native';
import { RootState } from '../../Redux/store';
import { useSelector } from 'react-redux';
import { commissionTypeEnum, loadingStateEnum } from '../../types';
import CommissionClaim from './CommissionClaim';
import { CloseIcon } from '../../UI/Icons/Icons';
import getCommission from '../../Functions/commissions/getCommission';
import ProgressView from '../../UI/ProgressView';
import * as ImagePicker from 'expo-image-picker';
import WebViewCross from '../../UI/WebViewCross';

export default function CommissionsView({id, onClose}:{id: string, onClose: () => void}) {
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  const [commissionData, setCommissionData] = useState<commissionType | undefined>(undefined)
  const [commissionState, setCommissionState] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const [messageState, setMessageState] = useState<loadingStateEnum>(loadingStateEnum.notStarted)
  const [messageData, setMessageData] = useState<string>("")
  const [imageUri, setImageUri] = useState<string>("")

  async function getPost(teamId: string, channelId: string, messageId: string) {
    setMessageState(loadingStateEnum.loading)
    const result = await callMsGraph(`https://graph.microsoft.com/v1.0/teams/${teamId}/channels/${channelId}/messages/${messageId}`)
    if (result.ok) {
      const data = await result.json()
      setMessageData(data["body"]["content"])
      setMessageState(loadingStateEnum.success)
    } else {
      setMessageState(loadingStateEnum.failed)
    }
  }

  async function getCommissionInformation() {
    const result = await getCommission(id)
    if (result.result === loadingStateEnum.success && result.data !== undefined) {
      setCommissionData(result.data)
      if (result.data?.postData !== undefined) {
        getPost(result.data.postData.teamId, result.data.postData.channelId, result.data.postData.postId)
      }
    }
    setCommissionState(result.result)
  }
  
  async function pickImage() {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: false,
      allowsEditing: false,
      mediaTypes: ImagePicker.MediaTypeOptions.Images
    })
    if (!result.canceled) {
      if (result.assets.length === 1) {
        setImageUri(result.assets[0].uri)
      } else {
        console.log("errror")
      }
    } else {
      alert('You did not select any image.');
    }
  }

  async function takeImage() {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      allowsMultipleSelection: false,
      mediaTypes: ImagePicker.MediaTypeOptions.Images
    })
    if (!result.canceled) {
      if (result.assets.length === 1) {
        setImageUri(result.assets[0].uri)
      } else {

      }
    }
  }

  useEffect(() => {getCommissionInformation()}, [id])
  return (
    <View style={{width: width * 0.8, height: height * 0.8, backgroundColor: "white", shadowColor: "black", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 10, borderRadius: 15}}>
      { (commissionState === loadingStateEnum.loading) ?
        <View style={{height: height * 0.6, width: width * 0.8, alignItems: "center", justifyContent: "center", alignContent: "center"}}>
          <ProgressView width={(width * 0.8 < height * 0.7) ? width * 0.4:height * 0.35} height={(width * 0.8 < height * 0.7) ? width * 0.4:height * 0.35}/>
          <Text>Loading</Text>
        </View>:
        <>
          { (commissionState === loadingStateEnum.success && commissionData !== undefined) ?
            <View>
              <View style={{height: height * 0.1, overflow: "hidden"}}>
                <Pressable onPress={() => onClose()}>
                  <CloseIcon width={(width < height) ? width * 0.05:height * 0.05} height={(width < height) ? width * 0.05:height * 0.05}/>
                </Pressable>
                <Text>Commission</Text>
              </View>
              <View style={{height: height * 0.6}}>
                <Text>{commissionData.points}</Text>
                <View>
                  <WebViewCross html={messageData}/>
                </View>
                { (commissionData.value === commissionTypeEnum.Image || commissionData.value === commissionTypeEnum.ImageLocation) ?
                  <View style={{height: height * 0.5}}>
                    <View style={{width: width * 0.7, height: height * 0.3, marginLeft: "auto", marginRight: "auto", alignContent: "center", alignItems: "center", justifyContent: "center"}}>
                      { (imageUri !== "") ?
                        <Image source={{uri: imageUri, width: width * 0.7, height: height * 0.3}} width={width * 0.7} height={height * 0.3}/>:
                        <View>
                          <Text>No Photo Selected</Text>
                        </View>
                      }
                    </View>
                    <Pressable onPress={() => takeImage()} style={{marginLeft: "auto", marginRight: "auto", backgroundColor: "#ededed", width: width * 0.7, borderRadius: 15, alignItems: "center", alignContent: "center", justifyContent: "center"}}>
                      <Text style={{margin: 10, fontWeight: "bold"}}>TAKE PHOTO</Text>
                    </Pressable>
                    <Pressable onPress={() => pickImage()} style={{marginLeft: "auto", marginRight: "auto", backgroundColor: "#ededed", width: width * 0.7, borderRadius: 15, alignItems: "center", alignContent: "center", justifyContent: "center"}}>
                      <Text style={{margin: 10, fontWeight: "bold"}}>CHOOSE PHOTO</Text>
                    </Pressable>
                  </View>:null
                }
              </View>
              <View style={{height: height * 0.1}}>
                <CommissionClaim commission={commissionData} />
              </View>
            </View>:
            <View>
              <Text>Something Went Wrong</Text>
            </View>
          }
        </>
      }
    </View>
  )
}