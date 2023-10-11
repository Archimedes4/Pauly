import { View, Text, TextInput, Dimensions, Button, Pressable } from 'react-native'
import React, { useState, useEffect, useContext } from 'react'
import { Link, useNavigate, useParams } from 'react-router-native'
import {convertYearToSchoolYear} from '../../../../Functions/calendar/calendarFunctions'
import callMsGraph from '../../../../Functions/Ultility/microsoftAssets';
import create_UUID from '../../../../Functions/Ultility/CreateUUID';
import { loadingStateEnum } from '../../../../types';
import store, { RootState } from '../../../../Redux/store';
import { useSelector } from 'react-redux';
import { getTeams } from '../../../../Functions/groupsData';
import { FlatList } from 'react-native-gesture-handler';
import ProgressView from '../../../../UI/ProgressView';

export default function GovernmentCreateNewTeam() {
  const { sport, id, teamId } = useParams()
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  const {siteId} = useSelector((state: RootState) => state.paulyList)
  const navigate = useNavigate()

  const [createTeamLoadingState, setCreateTeamLoadingState] = useState<loadingStateEnum>(loadingStateEnum.notStarted)
  const [teamDataState, setTeamDataState] = useState<loadingStateEnum>(loadingStateEnum.notStarted)
  const [isCreatingTeam, setIsCreatingTeam] = useState<boolean>(true)

  //Team Data
  const [teamName, setTeamName] = useState<string>("")
  const [season, setSeason] = useState<number>(new Date().getFullYear())
  const [teamListItemId, setTeamListItemId] = useState<string>("")

  const [teamsState, setTeamsState] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const [teams, setTeams] = useState<groupType[]>([])
  const [teamsNextLink, setTeamsNextLink] = useState<undefined | string>(undefined)
  const [selectedMicrosoftTeam, setSelectedMicrosoftTeam] = useState<groupType | undefined>(undefined)

  async function loadMicrosftTeams() {
    const result = await getTeams("https://graph.microsoft.com/v1.0/groups?$filter=resourceProvisioningOptions/Any(x:x%20eq%20'Team')")
    if (result.result === loadingStateEnum.success && result.data !== undefined) {
      setTeams(result.data)
      setTeamsNextLink(result.nextLink)
    }
    setTeamsState(result.result)
  }

  async function updateTeam() { //This function will also create a team
    setCreateTeamLoadingState(loadingStateEnum.loading)
    if (!isCreatingTeam) {
      const data = {
        "fields": {
          "teamName": teamName,
          "season": season
        }
      }
      const result = await callMsGraph(`https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${id}/items/${teamListItemId}`, "PATCH", false, JSON.stringify(data))
      if (result.ok){
        setCreateTeamLoadingState(loadingStateEnum.success)
      } else {
        setCreateTeamLoadingState(loadingStateEnum.failed)
      }
    } else {
      const newTeamId = create_UUID()
      const data = {
        "fields": {
          "Title": "",
          "teamName": teamName,
          "season": season,
          "teamId": newTeamId
        }
      }
      const listData = {
        "displayName":newTeamId,
        "columns": [
          {
            "name": "playerId", //This is any member of the rester
            "text": { },
            "required": true,
            "indexed": true,
            "enforceUniqueValues": true
          },
          {
            "name": "position",
            "text": { },
            "required": true
          },
          {
            "name": "playerNumber",
            "text": { }
          },
          {
            "name": "posts",
            "text": {"allowMultipleLines": true},
          }
        ],
        "list":
        {
          "template": " genericList"
        }
      }

      const batchData = {
        "requests":[
          {
            "id":"1",
            "method":"POST",
            "url":`/sites/${siteId}/lists/${id}/items`,
            "body":JSON.stringify(data),
            "headers": {
              "Content-Type": "application/json"
            }
          },
          {
            "id":"2",
            "method":"POST",
            "dependsOn": ["1"],
            "url":`/sites/${siteId}/lists`,
            "body":JSON.stringify(listData),
            "headers": {
              "Content-Type": "application/json"
            }
          }
        ]
      }
      const result = await callMsGraph(`https://graph.microsoft.com/v1.0/$batch`, "POST", undefined, JSON.stringify(batchData))
      if (result.ok){
        setCreateTeamLoadingState(loadingStateEnum.success)
      } else {
        setCreateTeamLoadingState(loadingStateEnum.failed)
      }
    }
  }

  async function deleteTeam() {
    const result = await callMsGraph(`https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${id}/items/${teamListItemId}`, "DELETE")
    if (result.ok) {

    } else {

    }
  }

  async function getMicrosoftTeam(getMicrosoftTeamId: string): Promise<{result: loadingStateEnum, data?: groupType}> {
    const result = await callMsGraph(`https://graph.microsoft.com/v1.0/groups/${getMicrosoftTeamId}`)
    if (result.ok) {
      const data = await result.json()
      return {result: loadingStateEnum.success, data: {
        name: data["displayName"],
        id: data["id"]
      }}
    } else {
      return {result: loadingStateEnum.failed}
    }
  }

  async function getTeamData() {
    setTeamDataState(loadingStateEnum.loading)
    const result = await callMsGraph(`https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${id}/items?expand=fields($select=teamId,teamName,season)&$filter=fields/teamId%20eq%20'${teamId}'&$select=id`)
    if (result.ok) {
      const data = await result.json()
      if (data["value"].length === 1) {
        setTeamName(data["value"][0]["fields"]["teamName"])
        setSeason(data["value"][0]["fields"]["season"])
        setTeamListItemId(data["value"][0]["id"])
        if (data["value"][0]["fields"]["microsoftTeamId"] !== undefined) {
          const teamResult = await getMicrosoftTeam(data["value"][0]["fields"]["microsoftTeamId"])
          if (teamResult.result === loadingStateEnum.success && teamResult.data !== undefined) {
            setSelectedMicrosoftTeam(teamResult.data)
            setTeamDataState(loadingStateEnum.success)
          } else {
            setTeamDataState(loadingStateEnum.failed)
          }
        } else {
          setTeamDataState(loadingStateEnum.success)
        }
      } else {
        setTeamDataState(loadingStateEnum.failed)
      }
    } else {
      setTeamDataState(loadingStateEnum.failed)
    }
  }

  useEffect(() => {
    loadMicrosftTeams()
  }, [])

  useEffect(() => {
    if (teamId === "create") {
      setIsCreatingTeam(true)
    } else {
      setIsCreatingTeam(false)
      getTeamData()
    }
  }, [teamId])

  return (
    <>
      { (isCreatingTeam || teamDataState === loadingStateEnum.success) ?
        <View style={{width: width, height: height, backgroundColor: "white"}}>
          <Pressable onPress={() => navigate(`/profile/government/sports/team/${sport}/${id}`)}>
            <Text>Back</Text>
          </Pressable>
          <Text>{(isCreatingTeam) ? `Create a new ${sport} team`:`Edit the ${teamName} ${sport} Team`}</Text>
          <View style={{flexDirection: "row"}}>
            <Text>Team Name:</Text>
            <TextInput
              value={teamName}
              onChangeText={text => setTeamName(text)}
              placeholder='Team Name'
            />
          </View>
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
          { (selectedMicrosoftTeam !== undefined) ?
            <Pressable onPress={() => {setSelectedMicrosoftTeam(undefined)}}>
              <Text>{selectedMicrosoftTeam.name}</Text>
            </Pressable>:null
          }
          <FlatList
            data={teams}
            renderItem={(team) => (
              <>
                { (team.item.id !== selectedMicrosoftTeam?.id) ?
                  <Pressable key={`Team_${team.item.id}_${create_UUID()}`}  onPress={() => {setSelectedMicrosoftTeam(team.item)}}>
                    <Text>{team.item.name}</Text>
                  </Pressable>:null
                }
              </>
            )}
          />
          { (selectedMicrosoftTeam === undefined) ?
            <View>
              <Text>Select a team in order to get a roster</Text>
            </View>:
            <View>
              <Text>Roster</Text>
              <RosterBlock microsoftTeamId={selectedMicrosoftTeam.id} width={100} height={100} teamId={selectedMicrosoftTeam.id}/>
            </View>
          }

          <Pressable style={{margin: 10, backgroundColor: "red", borderRadius: 15}} onPress={() => deleteTeam()}>
            <Text style={{margin: 10}}>Delete Team</Text>
          </Pressable>
          <Pressable onPress={() => {
            if (createTeamLoadingState === loadingStateEnum.notStarted) {
              updateTeam()
            } else if (createTeamLoadingState === loadingStateEnum.failed) {
              setCreateTeamLoadingState(loadingStateEnum.notStarted)
            }
          }}>
            <Text style={{margin: 10}}>{(createTeamLoadingState === loadingStateEnum.notStarted) ? (isCreatingTeam ? "CREATE TEAM":"UPDATE TEAM"):(createTeamLoadingState === loadingStateEnum.loading) ? "LOADING":(createTeamLoadingState === loadingStateEnum.success) ? "SUCCESS":"FAILED"}</Text>
          </Pressable>
        </View>:
        <>
          { (teamDataState === loadingStateEnum.loading) ?
            <View style={{width: width, height: height, backgroundColor: "white", alignContent: "center", alignItems: "center", justifyContent: "center"}}>
              <ProgressView width={width * 0.1} height={height * 0.1}/>
              <Text>Loading</Text>
            </View>:
            <View>
              <Pressable onPress={() => {navigate(`/profile/government/sports/team/${sport}/${id}`)}}>
                <Text>Back</Text>
              </Pressable>
              <Text>Failed</Text>
            </View>
          }
        </>
      }
    </>
  )
}

function RosterBlock({microsoftTeamId, width, height, teamId}:{microsoftTeamId: string, width: number, height: number, teamId: string}) {
  const [membersState, setMembersState] = useState<loadingStateEnum>(loadingStateEnum.loading)

  const [playerNumber, setPlayerNumber] = useState<string>("")
  const [position, setPosition] = useState<string>("")

  const [members, setMembers] = useState<governmentRosterType[]>([])

  async function getMembers() {
    const teamResult = await callMsGraph(`https://graph.microsoft.com/v1.0/sites/${store.getState().paulyList.siteId}/lists/${teamId}/items`)
    if (teamResult.ok) {
      const teamResultData = await teamResult.json()
      const result = await callMsGraph(`https://graph.microsoft.com/v1.0/teams/${microsoftTeamId}/members`)
      if (result.ok) {
        const data = await result.json()
        console.log(data)
        setMembersState(loadingStateEnum.success)
      } else {
        setMembersState(loadingStateEnum.failed)
      }
    } else {
      setMembersState(loadingStateEnum.failed)
    }
  }

  useEffect(() => {
    getMembers()
  }, [])

  return (
    <View style={{width: width, height: height}}>
      <FlatList
        data={members}
        renderItem={(member) => (
          <View key={`Member_${member.item.id}_${create_UUID()}`}>
            <Text>{member.item.name}</Text>
            <View style={{flexDirection: "row"}}>
              <Text>Player Number:</Text>
              <TextInput value={member.item.playerNumber} onChangeText={(e) => {
                var save = members
                save[member.index].playerNumber = e
                setMembers(save)
              }}/>
            </View>
            <View>
              <Text>Position:</Text>
              <TextInput value={member.item.position} onChangeText={(e) => {
                 var save = members
                 save[member.index].position = e
                 setMembers(save)
              }}/>
            </View>
          </View>
        )}
        />
    </View>
  )
}