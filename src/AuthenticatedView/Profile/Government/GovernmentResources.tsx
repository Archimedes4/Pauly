import { View, Text, Pressable, Switch, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import store, { RootState } from '../../../Redux/store'
import callMsGraph from '../../../Functions/Ultility/microsoftAssets'
import { loadingStateEnum, resourceResponce } from '../../../types'
import { Link } from 'react-router-native'
import ProgressView from '../../../UI/ProgressView'
import getResource from '../../../Functions/getResources'

type channelType = {
  id: string,
  displayName: string,
  selected: boolean,
  loading: boolean,
  error: boolean,
  description?: string
}

type resourceGroupType = {
  name: string,
  id: string,
  error: boolean,
  channels?: channelType[]
}  

function ChannelBlock({group, groups, groupIndex, setGroups, selectedGroup, channel, channelIndex}:{group: resourceGroupType, groups: resourceGroupType[], groupIndex: number, setGroups: (item: resourceGroupType[]) => void, selectedGroup: string, channel: channelType, channelIndex: number}) {
  const [isSelected, setIsSelected] = useState<boolean>(group.channels[channelIndex].selected)
  const [isLoading, setIsLoading] = useState<boolean>(group.channels[channelIndex].loading)


  async function addChannel() {
    const data = {
      "fields": {
        "resourceGroupId":group.id,
        "resourceConversationId":channel.id
      }
    }
    const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + store.getState().paulyList.siteId + "/lists/" + store.getState().paulyList.resourceListId + "/items", "POST", false, JSON.stringify(data))
    if (result.ok){
      var outGroups: resourceGroupType[] = groups
      outGroups[groupIndex].channels[channelIndex].selected = true
      outGroups[groupIndex].channels[channelIndex].loading = false
      setGroups(outGroups)
      setIsSelected(true)
      setIsLoading(false)
    } else {
      var outGroups: resourceGroupType[] = groups
      outGroups[groupIndex].channels[channelIndex].loading = false
      setGroups(outGroups)
      setIsLoading(false)
    }
  }

  async function removeChannel() {
    const itemResult = await getResource(group.id, channel.id)
    if (itemResult.result === resourceResponce.found && itemResult.itemId !== undefined) {
      const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + store.getState().paulyList.siteId + "/lists/" + store.getState().paulyList.resourceListId + "/items/" + itemResult.itemId, "DELETE")
      if (result.ok){
        var outGroups: resourceGroupType[] = groups
        outGroups[groupIndex].channels[channelIndex].selected = false
        outGroups[groupIndex].channels[channelIndex].loading = false
        setGroups(outGroups)
        setIsSelected(false)
        setIsLoading(false)
      } else {
        var outGroups: resourceGroupType[] = groups
        outGroups[groupIndex].channels[channelIndex].loading = false
        setGroups(outGroups)
        setIsLoading(false)
      }
    } else {
      var outGroups: resourceGroupType[] = groups
      outGroups[groupIndex].channels[channelIndex].loading = false
      setGroups(outGroups)
      setIsLoading(false)
    }
  }

  return (
    <View key={"Team_" + group.id + "Channel_" + channel.id} style={{flexDirection: "row"}}>
      { isLoading ?
        <ProgressView width={12} height={12}/>:
        <View>
          { (selectedGroup === group.id) ?
            <Switch
              trackColor={{false: '#767577', true: '#81b0ff'}}
              thumbColor={isSelected ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={(e) => {
                var outGroups: resourceGroupType[] = groups
                outGroups[groupIndex].channels[channelIndex].loading = true
                setGroups(outGroups)
                setIsLoading(true)
                if (e === true) {
                  addChannel()
                } else {
                  removeChannel()
                }
              }}
              value={isSelected}
            />:<View style={{height: 12, width: 12, borderRadius: 50, backgroundColor: channel.selected ? "green":"blue"}}/>
          }
        </View>
      }
      <Text>{channel.displayName}</Text>
    </View>
  )
}

function GroupBlock({group, groups, groupIndex, setGroups, selectedGroup, setSelectedGroup}:{group: resourceGroupType, groups: resourceGroupType[], groupIndex: number, setGroups: (item: resourceGroupType[]) => void, selectedGroup: string, setSelectedGroup: (item: string) => void}) {
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  return (
    <Pressable key={"Team_" + group.id} onPress={() => {setSelectedGroup(group.id)}}>
      <View style={{shadowColor: "black", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 10, borderRadius: 15, marginLeft: width * 0.03, marginRight: width * 0.03, marginTop: height * 0.02, marginBottom: height * 0.02}}>
        <View style={{margin: 10}}>
          <Text>{group.name}</Text>
          <Text>Channels</Text>
          { (group.channels !== undefined) ?
            <View>
              { group.channels.map((channel, channelIndex) => (
                <ChannelBlock group={group} groups={groups} groupIndex={groupIndex} setGroups={setGroups} selectedGroup={selectedGroup} channel={channel} channelIndex={channelIndex} />
              ))}
            </View>:<Text>An Error Occurred: Could not get channels</Text>
          }
        </View>
      </View>
    </Pressable>
  )
}

export default function GovernmentResources() {
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  const [groups, setGroups] = useState<resourceGroupType[]>([])
  const [selectedGroup, setSelectedGroup] = useState<string>("")
  const [getTeamsState, setGetTeamsState] = useState<loadingStateEnum>(loadingStateEnum.loading)
  
  async function getTeams() {
    const result = await callMsGraph("https://graph.microsoft.com/v1.0/groups?$filter=resourceProvisioningOptions/Any(x:x eq 'Team')")
    if (!result.ok) {setGetTeamsState(loadingStateEnum.failed); return}
    const data = await result.json()
    var resultGroups: resourceGroupType[] = []
    for (var index = 0; index < data["value"].length; index++) {
      const getResult = await callMsGraph("https://graph.microsoft.com/v1.0/teams/" + data["value"][index]["id"] + "/allChannels")
      var channelResult: channelType[] = []
      if (getResult.ok) {
        const getResultData = await getResult.json()
        for (var indexResult = 0; indexResult < getResultData["value"].length; indexResult++) {
          const channelGetResult = await getResource(data["value"][index]["id"], getResultData["value"][indexResult]["id"])
          channelResult.push({
            id: getResultData["value"][indexResult]["id"],
            selected: (channelGetResult.result === resourceResponce.found) ? true:false,
            loading: false,
            displayName: getResultData["value"][indexResult]["displayName"],
            error: (channelGetResult.result === resourceResponce.failed) ? true:false
          })
        }
      }
      resultGroups.push({
        name: data["value"][index]["displayName"],
        id: data["value"][index]["id"],
        error: (getResult.ok) ? true:false,
        channels: (getResult.ok) ? channelResult:undefined
      })
    }
    setGetTeamsState(loadingStateEnum.success)
    setGroups(resultGroups)
  }
  async function updateResources() {

  }
  useEffect(() => {
    getTeams()
  }, [])
  return (
    <View style={{width: width, height: height, backgroundColor: "white"}}>
      <View style={{height: height * 0.1}}>
        <Link to="/profile/government">
          <Text>Back</Text>
        </Link>
        <Text>GovernmentResources</Text>
      </View>
      <ScrollView style={{height: height * 0.9}}>
        { (getTeamsState === loadingStateEnum.loading) ?
          <Text>Loading</Text>:
          <View>
            { (getTeamsState === loadingStateEnum.success) ?
              <View>
                {groups.map((group, groupIndex) => (
                  <GroupBlock group={group} groupIndex={groupIndex} groups={groups} selectedGroup={selectedGroup} setGroups={setGroups} setSelectedGroup={setSelectedGroup}/>
                ))}
              </View>:<Text>Failed</Text>
            }
          </View>
        }
      </ScrollView>
    </View>
  )
}