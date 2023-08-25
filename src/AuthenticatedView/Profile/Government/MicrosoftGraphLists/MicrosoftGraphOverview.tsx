import { View, Text, Button, Dimensions, ScrollView } from 'react-native'
import React, {useContext, useEffect, useState} from 'react'
import callMsGraph from '../../../../Functions/microsoftAssets'
import { Link } from 'react-router-native';
import PickerWrapper from '../../../../UI/Pickers/Picker';
import { loadingStateEnum } from '../../../../types';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../Redux/store';

type ListType = {
  displayName: string
  listId: string
  name: string
}

type groupType = {
  name: string,
  id: string
}

enum graphMode {
  list,
  group
}

export default function MicrosoftGraphOverview() {
  const {height, width} = useSelector((state: RootState) => state.dimentions)
  const {siteId} = useSelector((state: RootState) => state.paulyList)
  const [lists, setLists] = useState<ListType[]>([])
  const [groups, setGroups] = useState<groupType[]>([])
  const [searchText, setSearchText] = useState<string>("")
  const [selectedGraphMode, setSelectedGraphMode] =  useState<graphMode>(graphMode.list)

  //loading states
  const [groupLoadingState, setGroupLoadingState] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const [listLoadingState, setListLoadingState] = useState<loadingStateEnum>(loadingStateEnum.loading)

  async function getLists(){
    const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + siteId +  "/lists")//sites/8td1tk.onmicrosoft.com/sites
    if (result.ok){
      const data = await result.json()
      if (data["value"] !== undefined){
        var incomingLists: ListType[] = []
        for(let index = 0; index < data["value"].length; index++){
          incomingLists.push({
            displayName: data["value"][index]["displayName"],
            listId: data["value"][index]["id"],
            name: data["value"][index]["name"]
          })
        }
        setLists(incomingLists)
        setListLoadingState(loadingStateEnum.success)
      } else {
        setListLoadingState(loadingStateEnum.failed)
      }
    } else {
      setListLoadingState(loadingStateEnum.failed)
    }
  }

  async function searchGroups(search: string) {
    const groupResult = await callMsGraph("https://graph.microsoft.com/v1.0/groups?$filter=startswith(displayName,'" + search +"')")
  }

  async function getGroups() {
    const groupResult = await callMsGraph("https://graph.microsoft.com/v1.0/groups")
    if (groupResult.ok) {
      const groupResultData = await groupResult.json()
      if (groupResultData["value"] !== undefined){
        var outputData: groupType[] = []
        for(var index = 0; index < groupResultData["value"].length; index++) {
          outputData.push({
            name: groupResultData["value"][index]["displayName"],
            id: groupResultData["value"][index]["id"]
          })
        }
        setGroups(outputData)
        setGroupLoadingState(loadingStateEnum.success)
      } else {
        setGroupLoadingState(loadingStateEnum.failed)
      }
    } else {
      setGroupLoadingState(loadingStateEnum.failed)
    }
  }

  useEffect(() => {
    getLists()
    getGroups()
  }, [])
  return (
    <View>
      <Link to="/profile/government">
        <Text>Back</Text>
      </Link>
      <Text>Microsoft Graph Overview</Text>
      <PickerWrapper selectedIndex={selectedGraphMode} onSetSelectedIndex={setSelectedGraphMode} width={width} height={30}>
        <Text>Lists</Text>
        <Text>Groups</Text>
      </PickerWrapper>
      <ScrollView style={{height: height * 0.6}}>
        { (selectedGraphMode === graphMode.list) ?
          <View>
            { (listLoadingState === loadingStateEnum.loading) ?
              <Text>Loading</Text>:
              <View>
                { (listLoadingState === loadingStateEnum.success) ?
                  <View>
                    { lists.map((item: ListType) => (
                      <Link key={item.listId + "Link"} to={"/profile/government/graph/list/edit/" + item.listId}>
                        <View key={item.listId}>
                          { //TO DO PRODuction fix these ids
                            (item.listId !== "2b86ba89-0262-4906-9247-bfd1260fb68e" && item.listId != "1f4cd053-dd6b-4e40-bb9b-803cbc74e872") ? 
                            <View style={{marginBottom: 5, borderColor: "black", borderWidth: 5}}>
                              <Text>{item.displayName}</Text>
                              <Text>{item.listId}</Text>
                            </View>:null 
                          }
                        </View>
                      </Link>
                    ))}
                  </View>:<Text>Failed</Text>
                }
              </View>

            }
          </View>:null
        }
        { (selectedGraphMode === graphMode.group) ?
          <View>
            { (groupLoadingState === loadingStateEnum.loading) ?
              <Text>Loading</Text>:
              <View>
                { (groupLoadingState === loadingStateEnum.success) ?
                  <View>
                    {groups.map((group) => (
                      <Link to={"/profile/government/graph/group/edit/" + group.id} key={"group_" + group.id}>
                        <View>
                          <Text>{group.name}</Text>
                        </View>
                      </Link>
                    ))}
                  </View>:<Text>Failed</Text>
                }
              </View>
            }
          </View>:null
        }
      </ScrollView>
      <Link to={"/profile/government/graph/list/create"}>
        <Text>Create List</Text>
      </Link>
    </View>
  )
}