import { View, Text, TextInput, Button, Dimensions } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import callMsGraph from '../../../../Functions/microsoftAssets'
import { Link } from 'react-router-native';
import create_UUID from '../../../../Functions/CreateUUID';
import { RootState } from '../../../../Redux/store';
import { useSelector } from 'react-redux';

export default function GovernmentCreateNewSport() {
  const [sportName, setSportName] = useState<string>("")
  const {siteId} = useSelector((state: RootState) => state.paulyList)
  async function createSport() {
    const newSportID: string = create_UUID()
    const data = {
      "fields": {
        Title: "",
        SportName: sportName,
        SportID: newSportID
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
        "contentTypesEnabled": false,
        "hidden": false,
        "template": " genericList"
      }
    }
    const resultList = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" +siteId + "/lists", "POST", false, JSON.stringify(listData))
    if (resultList.ok){
      const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" +siteId + "/lists/af29f01a-df11-4e9d-85c8-7461ca4dc6e9/items", "POST", false, JSON.stringify(data))//TO DO fix this id
    }
    console.log(resultList)
  }
  return (
    <View>
      <Link to="/profile/government/sports">
        <Text>Back</Text>
      </Link>
      <Text>GovernmentCreateNewSport</Text>
      <Text>Sport Name</Text>
      <TextInput value={sportName} onChangeText={setSportName}/>
      <Button title='Create' onPress={() => {
        createSport()
      }}/>
    </View>
  )
}