import { View, Text, TextInput, Pressable, ListRenderItemInfo, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-native'
import {convertYearToSchoolYear} from '../../../../Functions/calendar/calendarFunctions'
import callMsGraph from '../../../../Functions/Ultility/microsoftAssets';
import create_UUID from '../../../../Functions/Ultility/CreateUUID';
import { Colors, dataContentTypeOptions, loadingStateEnum } from '../../../../types';
import store, { RootState } from '../../../../Redux/store';
import { useSelector } from 'react-redux';
import { getTeams } from '../../../../Functions/groupsData';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import ProgressView from '../../../../UI/ProgressView';
import MicrosoftFilePicker from '../../../../UI/microsoftFilePicker';
import { CloseIcon } from '../../../../UI/Icons/Icons';
import getFileWithShareID from '../../../../Functions/Ultility/getFileWithShareID';

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
  const [isSelectingFile, setIsSelectingFile] = useState<boolean>(false)
  const [selectedFile, setSelectedFile] = useState<string>("")

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
      var data: object = {
        "fields": {
          "teamName": teamName,
          "season": season
        }
      }
      if (selectedMicrosoftTeam !== undefined) {
        data = {
          "fields": {
            "teamName": teamName,
            "season": season,
            "microsoftTeamId": selectedMicrosoftTeam.id
          }
        }
      }
      const result = await callMsGraph(`https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${id}/items/${teamListItemId}`, "PATCH", JSON.stringify(data))
      if (result.ok){
        setCreateTeamLoadingState(loadingStateEnum.success)
      } else {
        setCreateTeamLoadingState(loadingStateEnum.failed)
      }
    } else {
      const newTeamId = create_UUID()
      var data: object = {
        "fields": {
          "Title": "",
          "teamName": teamName,
          "season": season,
          "teamId": newTeamId
        }
      }
      if (selectedMicrosoftTeam !== undefined) {
        data = {
          "fields": {
            "teamName": teamName,
            "season": season,
            "teamId":newTeamId,
            "microsoftTeamId": selectedMicrosoftTeam.id
          }
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
            "text": { }
          },
          {
            "name": "playerNumber",
            "text": { }
          },
          {
            "name": "posts",
            "text": {"allowMultipleLines": true},
          },
          {
            "name": "imageShareId",
            "text": { }
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
            "body":data,
            "headers": {
              "Content-Type": "application/json"
            }
          },
          {
            "id":"2",
            "method":"POST",
            "dependsOn": ["1"],
            "url":`/sites/${siteId}/lists`,
            "body":listData,
            "headers": {
              "Content-Type": "application/json"
            }
          }
        ]
      }
      const result = await callMsGraph(`https://graph.microsoft.com/v1.0/$batch`, "POST", JSON.stringify(batchData))
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
    const result = await callMsGraph(`https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${id}/items?expand=fields($select=teamId,teamName,season,microsoftTeamId)&$filter=fields/teamId%20eq%20'${teamId}'&$select=id`)
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
        <ScrollView style={{width: width, height: height, backgroundColor: Colors.white}}>
          <Pressable onPress={() => navigate(`/profile/government/sports/team/${sport}/${id}`)} >
            <Text>Back</Text>
          </Pressable>
          <View>
            <Text>{(isCreatingTeam) ? `Create a new ${sport} team`:`Edit the ${teamName} ${sport} Team`}</Text>
          </View>
          <View style={{margin: 10, shadowColor: "black", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 10, backgroundColor: "#FFFFFF", borderRadius: 15}}>
            <View style={{margin: 5}}>
              <View style={{flexDirection: "row"}}>
                <Text>Team Name:</Text>
                <TextInput
                  value={teamName}
                  onChangeText={text => setTeamName(text)}
                  placeholder='Team Name'
                />
              </View>
              <View>
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
              </View>
            </View>
          </View>
          <View style={{height: height * 0.5, margin: 10, shadowColor: "black", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 10, backgroundColor: "#FFFFFF", borderRadius: 15}}>
            <View style={{margin: 10, shadowColor: "black", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 10, backgroundColor: "#FFFFFF", borderRadius: 15}}>
              <View style={{margin: 5}}>
                <Text>Selected Team</Text>
                { (selectedMicrosoftTeam !== undefined) ?
                  <Pressable onPress={() => {setSelectedMicrosoftTeam(undefined)}}>
                    <Text>{selectedMicrosoftTeam.name}</Text>
                  </Pressable>:
                  <Text>NO TEAM SELECTED</Text>
                }
              </View>
            </View>
            <View style={{marginLeft: 5, marginRight: 5}}>
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
            </View>
          </View>
          { (selectedMicrosoftTeam === undefined) ?
            <View>
              <Text>Select a team in order to get a roster</Text>
            </View>:
            <>
              { (isCreatingTeam || teamId === undefined) ?
                <View>
                  <Text>Please Create the team and return later to finish the roster</Text>
                </View>:
                <View>
                  <Text>Roster</Text>
                  <RosterBlock microsoftTeamId={selectedMicrosoftTeam.id} width={100} height={100} teamId={teamId} selectedFile={selectedFile} setIsSelectingFile={setIsSelectingFile} setSelectedFile={setSelectedFile} isSelectingFile={isSelectingFile}/>
                </View>
              }
            </>
          }

          <Pressable style={{margin: 10, backgroundColor: "red", borderRadius: 15, zIndex: -100}} onPress={() => deleteTeam()}>
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
        </ScrollView>:
        <>
          { (teamDataState === loadingStateEnum.loading) ?
            <View style={{width: width, height: height, backgroundColor: Colors.white, alignContent: "center", alignItems: "center", justifyContent: "center"}}>
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
      { isSelectingFile ?
        <RosterSelectFile setIsSelectingFile={setIsSelectingFile} setSelectedFile={setSelectedFile} />:null
      }
    </>
  )
}

function RosterBlock({microsoftTeamId, width, height, teamId, setIsSelectingFile, selectedFile, isSelectingFile, setSelectedFile}:{microsoftTeamId: string, width: number, height: number, teamId: string, selectedFile: string, setSelectedFile: (item: string) => void, isSelectingFile: boolean, setIsSelectingFile: (item: boolean) => void}) {
  const [membersState, setMembersState] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const [members, setMembers] = useState<governmentRosterType[]>([])

  async function getMembers() {
    const teamResult = await callMsGraph(`https://graph.microsoft.com/v1.0/sites/${store.getState().paulyList.siteId}/lists/${teamId}/items?$expand=fields($select=playerId,position,playerNumber,posts,imageShareId)&$select=id`)
    if (teamResult.ok) {
      const teamResultData = await teamResult.json()
      const result = await callMsGraph(`https://graph.microsoft.com/v1.0/teams/${microsoftTeamId}/members`)
      if (result.ok) {
        const data = await result.json()
        var users: microsoftUserType[] = []
        for (var index = 0; index < data["value"].length; index++) {
          users.push({
            id: data["value"][index]["userId"],
            displayName: data["value"][index]["displayName"]
          })
        }
        var rosters: governmentRosterType[] = []
        console.log(users, teamResultData)
        for (var teamIndex = 0; teamIndex < teamResultData["value"].length; teamIndex++) {
          const userData = users.findIndex((e) => {return e.id === teamResultData["value"][teamIndex]["fields"]["playerId"]})
          console.log(userData)
          if (userData !== -1) {
            rosters.push({
              name: users[userData].displayName,
              id: teamResultData["value"][teamIndex]["fields"]["playerId"],
              listItemId: teamResultData["value"][teamIndex]["id"],
              imageShareId: teamResultData["value"][teamIndex]["fields"]["imageShareId"],
              position: teamResultData["value"][teamIndex]["fields"]["position"],
              playerNumber: teamResultData["value"][teamIndex]["fields"]["playerNumber"],
              posts: (teamResultData["value"][teamIndex]["fields"]["posts"] !== undefined) ? JSON.parse(teamResultData["value"][teamIndex]["fields"]["playerNumber"]):undefined
            })
            const save = users[0]
            users[0] = users[userData]
            users[userData] = save
            users.shift()
          }
        }
        for (var index = 0; index < users.length; index++) {
          rosters.push({
            name: users[index].displayName,
            id: users[index].id
          })
        }
        setMembers(rosters)
        setMembersState(loadingStateEnum.success)
      } else {
        const data = await result.json()
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
    <>
      { (membersState === loadingStateEnum.loading) ?
        <View style={{width: width, height: height, alignContent: "center", alignItems: "center", justifyContent: "center"}}>
          <ProgressView width={width * 0.1} height={height * 0.1}/>
          <Text>Loading</Text>
        </View>:
        <>
          { (membersState === loadingStateEnum.success) ?
            <View>
              <FlatList
                data={members}
                renderItem={(member) => (
                  <RosterBlockItem members={members} setMembers={setMembers} member={member} teamId={teamId} selectedFile={selectedFile} setIsSelectingFile={setIsSelectingFile} setSelectedFile={setSelectedFile} isSelectingFile={isSelectingFile}/>
                )}
              />
            </View>:
            <View>
              <Text>Failed</Text>
            </View>
          }
        </>
      }
    </>
  )
}

function RosterBlockItem({member, members, setMembers, teamId, setIsSelectingFile, isSelectingFile, selectedFile, setSelectedFile}:{members: governmentRosterType[], setMembers: (item: governmentRosterType[]) => void, member: ListRenderItemInfo<governmentRosterType>, teamId: string, selectedFile: string, setSelectedFile: (item: string) => void, isSelectingFile: boolean, setIsSelectingFile: (item: boolean) => void}) {
  const [rosterState, setRosterState] = useState<loadingStateEnum>(loadingStateEnum.notStarted)
  const [callingSelectedFile, setIsCallingSelectedFile] = useState<boolean>(false)
  const [imageUrl, setImageUrl] = useState<string>("")

  async function createMemberItem(member: governmentRosterType) {
    const index = members.findIndex((e) => {return e.id === member.id})
    if (index === -1) {
      setRosterState(loadingStateEnum.failed)
      return
    }
    setRosterState(loadingStateEnum.loading)
    const data = {
      "fields":{
        "playerNumber":member.playerNumber,
        "position":member.position,
        "playerId":member.id
      }
    }
    const result = await callMsGraph(`https://graph.microsoft.com/v1.0/sites/${store.getState().paulyList.siteId}/lists/${teamId}/items`, "POST", JSON.stringify(data))
    if (result.ok) {
      const data = await result.json()
      var save = members
      save[index].listItemId = data["id"]
      setMembers(save)
      setRosterState(loadingStateEnum.success)
    } else {
      setRosterState(loadingStateEnum.failed)
    }
  }

  async function updatePlayerData(member: governmentRosterType) {
    if (member.listItemId !== undefined) {
      setRosterState(loadingStateEnum.loading)
      const data = {
        "fields":{
          "playerNumber":member.playerNumber,
          "position":member.position,
          "imageShareId":member.imageShareId
        }
      }
      const result = await callMsGraph(`https://graph.microsoft.com/v1.0/sites/${store.getState().paulyList.siteId}/lists/${teamId}/items/${member.listItemId}`, "PATCH", JSON.stringify(data))
      if (result.ok) {
        setRosterState(loadingStateEnum.success)
      } else {
        setRosterState(loadingStateEnum.failed)
      }
    } else {
      createMemberItem(member)
    }
  }
  

  useEffect(() => {
    if (callingSelectedFile) {
      var save = members
      save[member.index].imageShareId = selectedFile
      setSelectedFile("") 
      setMembers(save)
      updatePlayerData(save[member.index])
    }
    if (isSelectingFile === false) {
      setIsCallingSelectedFile(false)
    }
  }, [isSelectingFile, selectedFile])

  async function loadImage() {
    if (member.item.imageShareId !== undefined) {
      const result = await getFileWithShareID(member.item.imageShareId)
      console.log(result)
      if (result.result === loadingStateEnum.success && result.url && result.contentType === dataContentTypeOptions.image) {
        setImageUrl(result.url)
      } else {
        setImageUrl("")
      }
    } else {
      setImageUrl("")
    }
  }

  useEffect(() => {
    loadImage()
  }, [member.item.imageShareId])

  return (
    <View key={`Member_${member.item.id}_${create_UUID()}`} style={{margin: 5}}>
      <View>
        { (rosterState === loadingStateEnum.loading) ?
          <ProgressView width={14} height={14}/>:
          <>
            { (rosterState === loadingStateEnum.success || rosterState === loadingStateEnum.notStarted) ?
              <View style={{width: 14, height: 14, borderRadius: 7, backgroundColor: "green"}}/>:
              <View style={{width: 14, height: 14, borderRadius: 7, backgroundColor: "red"}}/>
            }
          </>
        }
      </View>
      <Text>{member.item.name}</Text>
      <View style={{flexDirection: "row"}}>
        <Text>Player Number:</Text>
        <TextInput value={member.item.playerNumber} onChangeText={(e) => {
          var save = members
          save[member.index].playerNumber = e
          setMembers([...save])
        }} onFocus={() => {}} onBlur={() => {updatePlayerData(member.item)}}/>
      </View>
      <View style={{flexDirection: "row"}}>
        <Text>Position:</Text>
        <TextInput value={member.item.position} onChangeText={(e) => {
          var save = members
          save[member.index].position = e
          setMembers([...save])
        }} onBlur={() => {updatePlayerData(member.item)}}/>
      </View>
      { (imageUrl !== "") ?
        <Image source={{uri: imageUrl}} style={{width: 100, height: 100}}/>:null
      }
      <Pressable onPress={() => {setIsSelectingFile(true); setIsCallingSelectedFile(true)}}>
        <Text>Choose Player Image</Text>
      </Pressable>
    </View>
  )
}

function RosterSelectFile({setIsSelectingFile, setSelectedFile}:{setIsSelectingFile: (item: boolean) => void, setSelectedFile: (item: string) => void}) {
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  return (
    <View style={{height: height, width: width, position: "absolute", zIndex: 200, top: 0, alignContent: "center", alignItems: "center", justifyContent: "center", backgroundColor: "#ededed"}}>
      <Pressable onPress={() => {setIsSelectingFile(false)}} style={{position: "absolute", top: height * 0.05, left: height * 0.05}}>
        <CloseIcon width={20} height={20}/>
      </Pressable>
      <View style={{height: height * 0.8, width: width * 0.8, shadowColor: "black", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 10, backgroundColor: Colors.white, borderRadius: 15}}>
        <View style={{margin: 10}}>
          <MicrosoftFilePicker height={height * 0.8 - 5} width={width * 0.8 - 5} onSelectedFile={async (file) => {
            const data = {
              "type": "view",
              "scope": "organization"
            }
            const result = await callMsGraph(file.callPath + "/createLink", "POST", JSON.stringify(data))
            if (result.ok){
              const data = await result.json()
              if (data["shareId"] !== undefined) {
                setSelectedFile(data["shareId"])
                setIsSelectingFile(false)
              } else {
                setIsSelectingFile(false)
              }
            } else {
              setIsSelectingFile(false)
            }
          }} />
        </View>
      </View>
    </View>
  )
}