import { View, Text } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-native'
import callMsGraph from '../../../../Functions/microsoftAssets'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../Redux/store'
import { loadingStateEnum } from '../../../../types'

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
  const [getCommissionsLoadingState, setGetCommissionsLoadingState] = useState<loadingStateEnum>(loadingStateEnum.loading)

  async function getCommissions(){
    const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + siteId + "/lists/" + commissionListId + "/items?expand=fields")
    if (result.ok){
      const data = await result.json()
      if (data["value"].length !== undefined){
        var newCommissions: commissionType[] = []
        for (let index = 0; index < data["value"].length; index++){
          newCommissions.push({
            title: data["value"][index]["fields"]["Title"],
            startDate: new Date(data["value"][index]["fields"]["startDate"]),
            endDate: new Date(data["value"][index]["fields"]["endDate"]),
            points: data["value"][index]["fields"]["points"],
            hidden: data["value"][index]["fields"]["hidden"],
            commissionId: data["value"][index]["fields"]["commissionID"],
            proximity: data["value"][index]["fields"]["proximity"],
            coordinateLat: data["value"][index]["fields"]["coordinateLat"],
            coordinateLng: data["value"][index]["fields"]["coordinateLng"]
          })
        }
        setCommissions(newCommissions)
        setGetCommissionsLoadingState(loadingStateEnum.success)
      } else {
        setGetCommissionsLoadingState(loadingStateEnum.failed)
      }
    } else {
      setGetCommissionsLoadingState(loadingStateEnum.failed)
    }
  }
  useEffect(() => {getCommissions()}, [])
  return (
    <View style={{height: height, width: width, backgroundColor: "white"}}>
      <View>
        <Link to="/profile/government">
          <Text>Back</Text>
        </Link>
        <Text>GovernmentCommissions</Text>
        <View>
          { (getCommissionsLoadingState === loadingStateEnum.loading) ?
            <Text>Loading</Text>:
            <View>
              { (getCommissionsLoadingState === loadingStateEnum.success) ?
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
        <Link to="/profile/government/commissions/create">
          <Text>Create New Commission</Text>
        </Link>
      </View>
    </View>
  )
}