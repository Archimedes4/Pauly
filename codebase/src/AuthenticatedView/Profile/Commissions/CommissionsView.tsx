import { View, Text, Button } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import callMsGraph from '../../../Functions/microsoftAssets'
import { accessTokenContent } from '../../../App';
import { siteID } from '../../../PaulyConfig';
import { useParams } from 'react-router-native';

export default function CommissionsView() {
  const microsoftAccessToken = useContext(accessTokenContent);
  const [commissionData, setCommissionData] = useState<commissionType | undefined>(undefined)
  const { id } = useParams()
  async function getCommissionInformation() {
    const result = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists/15357035-e94e-4664-b6a4-26e641f0f509/items?expand=fields&filter=fields/CommissionID%20eq%20'"+ id +"'")
    if (result.ok){
      const data = await result.json()
      console.log(data)

    } else {
      //TO DO error occured
      console.log("Error occured")
    }
  }
  async function claimCommission() {
    if (commissionData !== undefined) {
      const result = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists/" + commissionData.commissionId +"/items")
      
    }
  }
  useEffect(() => {getCommissionInformation()}, [id])
  return (
    <View>
      <Text>Commission</Text>
      { (commissionData === undefined) ?
        <View>
          <Text>Loading</Text>
        </View>:
        <View>
          <Text>{commissionData.title}</Text>
        </View>
      }
      <Button title='Claim Commission' onPress={() => {claimCommission}}/>
    </View>
  )
}