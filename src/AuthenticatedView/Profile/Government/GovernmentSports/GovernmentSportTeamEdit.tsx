import { View, Text, TextInput, Dimensions, Button } from 'react-native'
import React, { useState, useEffect, useContext } from 'react'
import { Link, useParams } from 'react-router-native'
import {convertYearToSchoolYear} from '../../../../Functions/calendar/calendarFunctions'
import callMsGraph from '../../../../Functions/Ultility/microsoftAssets';
import create_UUID from '../../../../Functions/Ultility/CreateUUID';
import { loadingStateEnum } from '../../../../types';
import { RootState } from '../../../../Redux/store';
import { useSelector } from 'react-redux';
import { getTeams } from '../../../../Functions/groupsData';
import { FlatList } from 'react-native-gesture-handler';

export default function GovernmentCreateNewTeam() {
  const { sport, id, teamId } = useParams()
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  const {siteId} = useSelector((state: RootState) => state.paulyList)

  const [createTeamLoadingState, setCreateTeamLoadingState] = useState<loadingStateEnum>(loadingStateEnum.notStarted)

  //New Team Data
  const [teamName, setTeamName] = useState<string>("")
  const [season, setSeason] = useState<number>(new Date().getFullYear())

  const [teamsState, setTeamsState] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const [teams, setTeams] = useState<groupType[]>([])
  const [teamsNextLink, setTeamsNextLink] = useState<undefined | string>(undefined)

  async function getTeam() {
    const result = await getTeams("https://graph.microsoft.com/v1.0/groups?$filter=resourceProvisioningOptions/Any(x:x%20eq%20'Team')")
    if (result.result === loadingStateEnum.success && result.data !== undefined) {
      setTeams(result.data)
      setTeamsNextLink(result.nextLink)
    }
    setTeamsState(result.result)
  }

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
    const resultList = await callMsGraph("https://graph.microsoft.com/v1.0/sites/"+siteId+"/lists", "POST", false, JSON.stringify(listData))
    if (resultList.ok){
      const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/"+siteId+"/lists/" + id + "/items", "POST", false, JSON.stringify(data))//TO DO fix id (this isn't really important because it will work anyway it might be better to call for the id though)
      if (result.ok){
        setCreateTeamLoadingState(loadingStateEnum.success)
      } else {
        setCreateTeamLoadingState(loadingStateEnum.failed)
      }
    } else {
      setCreateTeamLoadingState(loadingStateEnum.failed)
    }
  }

  async function getTeamData() {
    const result = await callMsGraph("")
  }

  useEffect(() => {
    if (teamId === "create") {

    } else {

    }
  }, [teamId])

  return (
    <View style={{width: width, height: height, backgroundColor: "white"}}>
      <Link to={"/profile/government/sports/team/" + sport + "/" + id}>
        <Text>Back</Text>
      </Link>
      <Text>Create a new {sport} team</Text>
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
      <Text>Selected Team</Text>
      <FlatList
        data={teams}
        renderItem={(team) => (
          <View key={`Team_${team.item.id}_${create_UUID()}`}>
            <Text>{team.item.name}</Text>
          </View>
        )}
      />
      <Button title={(createTeamLoadingState === loadingStateEnum.notStarted) ? "CREATE TEAM":(createTeamLoadingState === loadingStateEnum.loading) ? "LOADING":(createTeamLoadingState === loadingStateEnum.success) ? "SUCCESS":"FAILED"} onPress={() => {if (createTeamLoadingState === loadingStateEnum.notStarted) {createTeam()} else if (createTeamLoadingState === loadingStateEnum.failed) {setCreateTeamLoadingState(loadingStateEnum.notStarted)}}}/>
    </View>
  )
}