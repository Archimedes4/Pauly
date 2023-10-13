import { View, Text, Pressable } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-native'
import callMsGraph from '../../../../Functions/Ultility/microsoftAssets'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../Redux/store'
import { Colors, commissionTypeEnum, loadingStateEnum, submissionTypeEnum } from '../../../../types'
import getCommissions from '../../../../Functions/commissions/getCommissions'
import ProgressView from '../../../../UI/ProgressView'
import getSubmissions from '../../../../Functions/commissions/getSubmissions'
import create_UUID from '../../../../Functions/Ultility/CreateUUID'
import { create } from 'domain'
import { ScrollView } from 'react-native-gesture-handler'

export default function GovernmentCommissions() {
  const {height, width} = useSelector((state: RootState) => state.dimentions)
  const [commissions, setCommissions] = useState<commissionType[]>([])
  const [commissionsState, setCommissionsState] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const navigate = useNavigate()

  async function loadData() {
    const result = await getCommissions()
    if (result.result === loadingStateEnum.success) {
      if (result.data  !== undefined) {
        setCommissions(result.data)
      }
      //TO DO pagination
    }
    setCommissionsState(result.result)
  }

  useEffect(() => {loadData()}, [])
  return (
    <View style={{height: height, width: width, backgroundColor: Colors.white}}>
      <View style={{height: height * 0.1}}>
        <Pressable onPress={() => {navigate("/profile/government")}}>
          <Text>Back</Text>
        </Pressable>
        <View style={{width: width, alignItems: "center", justifyContent: "center"}}>
          <Text>Commissions</Text>
        </View>
      </View>
      <View style={{height: height * 0.85}}>
        { (commissionsState === loadingStateEnum.loading) ?
          <Text>Loading</Text>:
          <>
            { (commissionsState === loadingStateEnum.success) ?
              <ScrollView style={{height: height * 0.85}}>
                {commissions.map((commission) => (
                  <CommissionBlock key={`Commission_${commission.commissionId}_${create_UUID()}`} commission={commission} />
                ))}
              </ScrollView>:<Text>Failed</Text>
            }
          </>
        }
      </View>
      <View style={{height: height * 0.05}}>
        <Pressable onPress={() => {navigate("/profile/government/commissions/create")}}>
          <Text>Create New Commission</Text>
        </Pressable>
      </View>
    </View>
  )
}

function CommissionBlock({commission}:{commission: commissionType}) {
  const {width} = useSelector((state: RootState) => state.dimentions)
  const navigate = useNavigate()
  const [unclaimedState, setUnclaimedState] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const [unclaimedCount, setUnclaimedCount] = useState<string>("0")

  async function loadData() {
    const result = await getSubmissions(commission.commissionId, submissionTypeEnum.unReviewed)
    if (result.result === loadingStateEnum.success && result.count !== undefined) {
      if (result.count >= 50) {
        setUnclaimedCount(result.count.toString() + "+")
      } else {
        setUnclaimedCount(result.count.toString())
      }
    }
    setUnclaimedState(result.result)
  }

  useEffect(() => {
    loadData()
  }, [])
  return (
    <Pressable onPress={() => navigate("/profile/government/commissions/" + commission.commissionId)} key={"Commission_" + commission.commissionId + "_" + create_UUID()} style={{margin: 10, borderRadius: 15, shadowColor: "black", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 10}}>
      <View style={{margin: 10}}>
        <Text selectable={false}>{commission.title}</Text>
      </View>
      { (unclaimedCount !== "0") ?
        <View key={create_UUID()} style={{width: 20, height: 20, borderRadius: 50, backgroundColor: "red", position: "absolute", alignContent: "center", alignItems: "center", justifyContent: "center", top: -2, left: width-25}}>
          <Text style={{color: Colors.white}}>{unclaimedCount}</Text>
        </View>:null
      }
      {
        (unclaimedState === loadingStateEnum.loading) ?
        <View key={create_UUID()} style={{width: 20, height: 20, borderRadius: 50, backgroundColor: "#FF6700", position: "absolute", alignContent: "center", alignItems: "center", justifyContent: "center", top: -2, left: width-25}}>
          <ProgressView width={10} height={10}/>
        </View>:null
      }
      {
        (unclaimedState === loadingStateEnum.failed) ?
        <View key={create_UUID()} style={{width: 20, height: 20, borderRadius: 50, backgroundColor: "red", position: "absolute", alignContent: "center", alignItems: "center", justifyContent: "center", top: -2, left: width-25}}>
          <Text style={{color: Colors.white}}>!</Text>
        </View>:null
      }
    </Pressable>
  )
}