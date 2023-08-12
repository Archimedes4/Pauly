import { View, Text, TextInput, Dimensions, Button } from 'react-native'
import React, { useState, useEffect, useContext } from 'react'
import { Link, useParams } from 'react-router-native'
import {convertYearToSchoolYear} from '../../../../Functions/calendarFunctions'
import NavBarComponent from '../../../../UI/NavComponent';
import callMsGraph from '../../../../Functions/microsoftAssets';
import create_UUID from '../../../../Functions/CreateUUID';
import { accessTokenContent } from '../../../../../App';
import { siteID } from '../../../../PaulyConfig';

const windowDimensions = Dimensions.get('window');
const screenDimensions = Dimensions.get('screen');

export default function GovernmentCreateNewTeam() {
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
  const [teamName, setTeamName] = useState<string>("")
  const [season, setSeason] = useState<number>(new Date().getFullYear())
  const { sport, id } = useParams()
  useEffect(() => {
    console.log(id)
  }, [])
  const microsoftAccessToken = useContext(accessTokenContent);
  async function createTeam() {
    const newTeamRosterID: string = create_UUID()
    const listData = {
      "displayName":newTeamRosterID,
      "columns": [
        {
          "name": "PlayerID",
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
    const data = {
      "fields": {
        Title: "",
        TeamName: teamName,
        Season: season,
        teamID: newTeamRosterID
      }
    }
    const resultList = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/"+siteID+"/lists" , "POST", JSON.stringify(listData))
    const result= await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/"+siteID+"/lists/" + id + "/items", "POST", JSON.stringify(data))//TO DO fix id
    console.log(resultList)
    console.log(result)
  }
  return (
    <View>
      <Link to={"/profile/government/sports/team/" + sport + "/" + id}>
        <Text>Back</Text>
      </Link>
      <Text>Government Create a new {sport} Team</Text>
      <Text>Team Name</Text>
      <TextInput
        value={teamName}
        onChangeText={text => setTeamName(text)}
      />
      <Text>Season</Text>
      <Text>{convertYearToSchoolYear(season)}</Text>
      <TextInput 
        keyboardType='numeric'
        onChangeText={(text)=> {
          if (text === ""){
            setSeason(0)
          } else {
            setSeason(parseFloat(text))
          }
        }}
        value={season.toString()}
        maxLength={10}  //setting limit of input
      />
      <Button title="create team" onPress={() => {createTeam()}}/>
    </View>
  )
}