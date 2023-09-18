import { View, Text, Button, Pressable } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import callMsGraph from '../../Functions/Ultility/microsoftAssets'
import { useParams } from 'react-router-native';
import * as Location from 'expo-location';
import { RootState } from '../../Redux/store';
import { useSelector } from 'react-redux';
import { loadingStateEnum } from '../../types';
import CommissionClaim from './CommissionClaim';
import { CloseIcon } from '../../UI/Icons/Icons';
import getCommission from '../../Functions/commissions/getCommission';
import ProgressView from '../../UI/ProgressView';

export default function CommissionsView({id, onClose}:{id: string, onClose: () => void}) {
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  const [commissionData, setCommissionData] = useState<commissionType | undefined>(undefined)
  const [commissionState, setCommissionState] = useState<loadingStateEnum>(loadingStateEnum.loading)
  async function getCommissionInformation() {
    const result = await getCommission(id)
    if (result.result === loadingStateEnum.success && result.data !== undefined) {
      setCommissionData(result.data)
    }
    setCommissionState(result.result)
  }
  async function getUsersLocation(){
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied')
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
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
                  <CloseIcon width={(width < height) ? width * 0.1:height * 0.1} height={(width < height) ? width * 0.1:height * 0.1}/>
                </Pressable>
                <Text>Commission</Text>
              </View>
              <View style={{height: height * 0.6}}>
                <Text>{commissionData.points}</Text>
              </View>
              <View style={{height: height * 0.1}}>
                <CommissionClaim commissionId={id} />
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