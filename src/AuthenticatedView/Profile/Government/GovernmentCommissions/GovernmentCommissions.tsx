import { View, Text } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-native'
import callMsGraph from '../../../../Functions/microsoftAssets'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../Redux/store'

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

export default function GovernmentCommissions() {
  const {commissionListId, siteId} = useSelector((state: RootState) => state.paulyList)
  const [commissions, setCommissions] = useState<commissionType[]>([])
  async function getCommissions(){
    const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + siteId + "/lists/" + commissionListId + "/items?expand=fields")
    if (result.ok){
      const data = await result.json()
      console.log(data)
      if (data["value"].length !== undefined){
        var newCommissions: commissionType[] = []
        for (let index = 0; index < data["value"].length; index++){
          newCommissions.push({
            title: data["value"][index]["fields"]["Title"],
            startDate: new Date(data["value"][index]["fields"]["StartDate"]),
            endDate: new Date(data["value"][index]["fields"]["EndDate"]),
            points: data["value"][index]["fields"]["Points"],
            hidden: data["value"][index]["fields"]["Hidden"],
            commissionId: data["value"][index]["fields"]["CommissionID"],
            proximity: data["value"][index]["fields"]["Proximity"],
            coordinateLat: data["value"][index]["fields"]["CoordinateLat"],
            coordinateLng: data["value"][index]["fields"]["CoordinateLng"]
          })
        }
        console.log(newCommissions)
        setCommissions(newCommissions)
      } else {
        //TO DO this shouldn't happen graph broken
      }
    } else {
      //TO Do handle error
    }
  }
  useEffect(() => {getCommissions()}, [])
  return (
    <View>
      <View>
        <Link to="/profile/government">
          <Text>Back</Text>
        </Link>
        <Text>GovernmentCommissions</Text>
        {commissions.map((commission) => (
          <View key={commission.commissionId}>
            <Text>{commission.title}</Text>
          </View>
        ))
        }
        <Link to="/profile/government/commissions/create">
          <Text>Create New Commission</Text>
        </Link>
      </View>
    </View>
  )
}