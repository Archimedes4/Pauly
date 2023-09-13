import { View, Text } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-native'
import callMsGraph from '../../../../Functions/Ultility/microsoftAssets'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../Redux/store'
import { loadingStateEnum } from '../../../../types'
import getCommissions from '../../../../Functions/getCommissions'

declare global {
  type commissionType = {
    title: string
    startDate: Date
    endDate: Date
    points: number
    hidden: boolean
    commissionId: string
    proximity?: number
    coordinateLat?: number
    coordinateLng?: number
  }
}

function CommissionPickerType() {
  
}

export default function GovernmentCommissions() {
  const {commissionListId, siteId} = useSelector((state: RootState) => state.paulyList)
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
                  <Link to={"/profile/government/commissions/edit/" + commission.commissionId} key={"Commission_" + commission.commissionId} style={{margin: 10, borderRadius: 15, shadowColor: "black", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 10}}>
                    <View style={{margin: 10}}>
                      <Text selectable={false}>{commission.title}</Text>
                    </View>
                  </Link>
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