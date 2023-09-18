import { View, Text, Pressable } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-native'
import callMsGraph from '../../../../Functions/Ultility/microsoftAssets'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../Redux/store'
import { commissionTypeEnum, loadingStateEnum } from '../../../../types'
import getCommissions from '../../../../Functions/commissions/getCommissions'
import ProgressView from '../../../../UI/ProgressView'

declare global {
  type commissionType = {
    itemId: string
    title: string
    timed: boolean
    points: number
    hidden: boolean
    maxNumberOfClaims: number
    allowMultipleSubmissions: boolean
    commissionId: string
    value: commissionTypeEnum
    startDate?: Date
    endDate?: Date
    proximity?: number
    coordinateLat?: number
    coordinateLng?: number
    postData?: {
      teamId: string
      channelId: string
      postId: string
    }
  }
}

function CommissionPickerType() {
  
}

export default function GovernmentCommissions() {
  const {height, width} = useSelector((state: RootState) => state.dimentions)
  const [commissions, setCommissions] = useState<commissionType[]>([])
  const [commissionsState, setCommissionsState] = useState<loadingStateEnum>(loadingStateEnum.loading)

  async function loadData() {
    const result = await getCommissions()
    if (result.result === loadingStateEnum.success) {
      setCommissions(result.data)
      //TO DO pagination
    }
    setCommissionsState(result.result)
  }

  useEffect(() => {loadData()}, [])
  return (
    <View style={{height: height, width: width, backgroundColor: "white"}}>
      <View style={{height: height * 0.1}}>
        <Link to="/profile/government">
          <Text>Back</Text>
        </Link>
        <View style={{width: width, alignItems: "center", justifyContent: "center"}}>
          <Text>Commissions</Text>
        </View>
      </View>
      <View style={{height: height * 0.85}}>
        { (commissionsState === loadingStateEnum.loading) ?
          <Text>Loading</Text>:
          <View>
            { (commissionsState === loadingStateEnum.success) ?
              <View>
                {commissions.map((commission) => (
                  <CommissionBlock commission={commission} />
                ))}
              </View>:<Text>Failed</Text>
            }
          </View>
        }
      </View>
      <View style={{height: height * 0.05}}>
        <Link to="/profile/government/commissions/create">
          <Text>Create New Commission</Text>
        </Link>
      </View>
    </View>
  )
}

function CommissionBlock({commission}:{commission: commissionType}) {
  const {width} = useSelector((state: RootState) => state.dimentions)
  const navigate = useNavigate()
  const [unclaimedState, setUnclaimedState] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const [unclaimedCount, setUnclaimedCount] = useState<number>(0)
  return (
    <>
      <Pressable onPress={() => navigate("/profile/government/commissions/" + commission.commissionId)} key={"Commission_" + commission.commissionId} style={{margin: 10, borderRadius: 15, shadowColor: "black", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 10}}>
        <View style={{margin: 10}}>
          <Text selectable={false}>{commission.title}</Text>
        </View>
      </Pressable>
      { (unclaimedCount === 0) ?
        <View style={{width: 20, height: 20, borderRadius: 50, backgroundColor: "red"}}>
              
        </View>:null
      }
      {
        (unclaimedState === loadingStateEnum.loading) ?
        <View style={{width: 20, height: 20, borderRadius: 50, backgroundColor: "red"}}>
          <ProgressView width={10} height={10}/>
        </View>:null
      }
    </>
  )
}