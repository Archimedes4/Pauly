import { View, Text, TextInput, Button, Dimensions, Pressable } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import callMsGraph from '../../../../Functions/microsoftAssets'
import { Link } from 'react-router-native';
import create_UUID from '../../../../Functions/CreateUUID';
import { RootState } from '../../../../Redux/store';
import { useSelector } from 'react-redux';
import { loadingStateEnum } from '../../../../types';

export default function GovernmentCreateNewSport() {
  const {width, height} = useSelector((state: RootState) => state.dimentions)

  const [sportName, setSportName] = useState<string>("")
  const {siteId, sportsListId} = useSelector((state: RootState) => state.paulyList)
  const [createSportLoadingState, setCreateSportLoadingState] = useState<loadingStateEnum>(loadingStateEnum.notStarted)
  async function createSport() {
    setCreateSportLoadingState(loadingStateEnum.loading)
    const newSportID: string = create_UUID()
    const data = {
      "fields": {
        Title: "",
        sportName: sportName,
        sportId: newSportID
      }
    }
    const listData = {
      "displayName":newSportID,
      "columns": [
        {
          "name": "TeamName",
          "text": { }
        },
        {
          "name": "Season",
          "number": { }
        },
        {
          "name": "teamID",
          "text": { }
        }
      ],
      "list":
      {
        "template": " genericList"
      }
    }
    const resultList = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" +siteId + "/lists", "POST", false, JSON.stringify(listData))
    if (resultList.ok){
      const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" +siteId + "/lists/" + sportsListId + "/items", "POST", false, JSON.stringify(data))
      if (result.ok){
        setCreateSportLoadingState(loadingStateEnum.success)
      } else {
        const resultData = await result.json()
        console.log(resultData)
        setCreateSportLoadingState(loadingStateEnum.failed)
      }
    } else {
      setCreateSportLoadingState(loadingStateEnum.failed)
    }
  }
  return (
    <View style={{width: width, height: height, backgroundColor: "white"}}>
      <Link to="/profile/government/sports">
        <Text>Back</Text>
      </Link>
      <Text>GovernmentCreateNewSport</Text>
      <Text>Sport Name</Text>
      <TextInput value={sportName} onChangeText={setSportName}/>
      <Pressable onPress={() => {createSport()}}>
        <Text>{(createSportLoadingState === loadingStateEnum.notStarted) ? "Create":(createSportLoadingState === loadingStateEnum.loading) ? "Loading":(createSportLoadingState === loadingStateEnum.success) ? "Created Sport!":"Failed to create sport."}</Text>
      </Pressable>
    </View>
  )
}