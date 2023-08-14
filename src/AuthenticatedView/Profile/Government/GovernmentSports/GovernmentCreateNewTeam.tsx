import { View, Text, TextInput, Dimensions, Button } from 'react-native'
import React, { useState, useEffect, useContext } from 'react'
import { Link, useParams } from 'react-router-native'
import {convertYearToSchoolYear} from '../../../../Functions/calendarFunctions'
import NavBarComponent from '../../../../UI/NavComponent';
import callMsGraph from '../../../../Functions/microsoftAssets';
import create_UUID from '../../../../Functions/CreateUUID';
import { accessTokenContent } from '../../../../../App';
import { siteID } from '../../../../PaulyConfig';
import { useMsal } from '@azure/msal-react';
import { loadingStateEnum } from '../../../../types';

export default function GovernmentCreateNewTeam() {
  const pageData = useContext(accessTokenContent);
  const { sport, id } = useParams()

  const [createTeamLoadingState, setCreateTeamLoadingState] = useState<loadingStateEnum>(loadingStateEnum.notStarted)

  //New Team Data
  const [teamName, setTeamName] = useState<string>("")
  const [season, setSeason] = useState<number>(new Date().getFullYear())

  async function createTeam() {
    setCreateTeamLoadingState(loadingStateEnum.loading)
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
    const resultList = await callMsGraph("https://graph.microsoft.com/v1.0/sites/"+siteID+"/lists", "POST", false, JSON.stringify(listData))
    if (resultList.ok){
      const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/"+siteID+"/lists/" + id + "/items", "POST", false, JSON.stringify(data))//TO DO fix id (this isn't really important because it will work anyway it might be better to call for the id though)
      if (result.ok){
        setCreateTeamLoadingState(loadingStateEnum.success)
      } else {
        setCreateTeamLoadingState(loadingStateEnum.failed)
      }
    } else {
      setCreateTeamLoadingState(loadingStateEnum.failed)
    }
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
        placeholder='Team Name'
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
      <Button title={(createTeamLoadingState === loadingStateEnum.notStarted) ? "CREATE TEAM":(createTeamLoadingState === loadingStateEnum.loading) ? "LOADING":(createTeamLoadingState === loadingStateEnum.success) ? "SUCCESS":"FAILED"} onPress={() => {if (createTeamLoadingState === loadingStateEnum.notStarted) {createTeam()} else if (createTeamLoadingState === loadingStateEnum.failed) {setCreateTeamLoadingState(loadingStateEnum.notStarted)}}}/>
    </View>
  )
}