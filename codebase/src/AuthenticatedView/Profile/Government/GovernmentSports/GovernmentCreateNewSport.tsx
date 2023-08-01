import { View, Text, TextInput, Button, Dimensions } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import callMsGraph from '../../../../Functions/microsoftAssets'
import { accessTokenContent } from '../../../../App';
import { Link } from 'react-router-native';
import NavBarComponent from '../../../../UI/NavComponent';
import create_UUID from '../../../../Functions/CreateUUID';
import { siteID } from '../../../../PaulyConfig';

const windowDimensions = Dimensions.get('window');
const screenDimensions = Dimensions.get('screen');

export default function GovernmentCreateNewSport() {
  const [sportName, setSportName] = useState<string>("")
  const microsoftAccessToken = useContext(accessTokenContent);
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
    const resultList = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/" +siteID + "/lists", "POST", JSON.stringify(listData))
    if (resultList.ok){
      const result = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/" +siteID + "/lists/af29f01a-df11-4e9d-85c8-7461ca4dc6e9/items", "POST", JSON.stringify(data))//TO DO fix this id
    }
    console.log(resultList)
  }
  const [dimensions, setDimensions] = useState({
    window: windowDimensions,
    screen: screenDimensions,
  });

  useEffect(() => {
      const subscription = Dimensions.addEventListener(
        'change',
        ({window, screen}) => {
          setDimensions({window, screen});
        },
      );
      return () => subscription?.remove();
  });
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