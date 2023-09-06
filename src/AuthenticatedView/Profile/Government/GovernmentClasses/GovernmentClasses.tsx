import { View, Text, Button, Pressable, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-native'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../Redux/store'
import { loadingStateEnum } from '../../../../types'
import callMsGraph from '../../../../Functions/Ultility/microsoftAssets'


export default function GovernmentClasses() {
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  const navigate = useNavigate();
  const [classState, setClassState] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const [classes, setClasses] = useState<classType[]>([])

  async function getClasses() {
    const groupResult = await callMsGraph("https://graph.microsoft.com/v1.0/groups")
    if (groupResult.ok) {
      const groupResultData = await groupResult.json()
      if (groupResultData["value"] !== undefined){
        var outputData: classType[] = []
        for(var index = 0; index < groupResultData["value"].length; index++) {
          outputData.push({
            name: groupResultData["value"][index]["displayName"],
            id: groupResultData["value"][index]["id"]
          })
        }
        setClasses(outputData)
        setClassState(loadingStateEnum.success)
      } else {
        setClassState(loadingStateEnum.failed)
      }
    } else {
      setClassState(loadingStateEnum.failed)
    }
  }

  useEffect(() => {
    getClasses()
  }, [])

  return (
    <View style={{width: width, height: height, backgroundColor: "white"}}>
      <View>
      <Link to="/profile/government/">
        <Text>Back</Text>
      </Link>
      <Text>Classes</Text>
      </View>
      <ScrollView style={{height: height * 0.85}}>
        {classes.map((classMap) => (
          <Pressable onPress={() => {navigate("/profile/government/classes/edit/" + classMap.id)}}>
            <Text>{classMap.name}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <Pressable onPress={() => {
        navigate("/profile/government/classes/room")
      }}>
        <Text>Rooms</Text>
      </Pressable>
    </View>
  )
}