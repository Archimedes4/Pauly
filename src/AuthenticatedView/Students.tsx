import { View, Text, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { loadingStateEnum } from '../types'
import { useSelector } from 'react-redux'
import { RootState } from '../Redux/store'
import callMsGraph from '../Functions/Ultility/microsoftAssets'
import ProgressView from '../UI/ProgressView'
import { FlatList } from 'react-native-gesture-handler'

export default function Students() {
  const {height, width} = useSelector((state: RootState) => state.dimentions)
  
  const [usersState, setUsersState] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const [users, setUsers] = useState<schoolUserType[]>([])
  const [nextLink, setNextLink] = useState<string | undefined>(undefined);

  async function checkIfStudent(role: string) {
    const reversed = role.split("").reverse().join("");
  }

  async function getUsers(url?: string) {
    const result = await callMsGraph(url ? url:`https://graph.microsoft.com/v1.0/users`)
    if (result.ok) {
      const data = await result.json()
      var outputUsers: schoolUserType[] = []
      for (var index = 0; index < data["value"].length; index++) {
        outputUsers.push({
          name: data["value"][index]["displayName"],
          id: data["value"][index]["id"],
          role: data["value"][index],
          grade: '12',
          student: false
        })
      }
      setUsers(outputUsers)
      setNextLink(data["@odata.nextLink"])
      setUsersState(loadingStateEnum.success)
    } else {
      setUsersState(loadingStateEnum.failed)
    }
  }

  useEffect(() => {
    getUsers()
  }, [])
  
  return (
    <>
      { (usersState === loadingStateEnum.loading) ?
        <View style={{width: width, height: height, backgroundColor: "#FFFFFF"}}>
          <ProgressView width={14} height={14} />
          <Text>Loading</Text>
        </View>:
        <>
          { (usersState === loadingStateEnum.success) ?
            <View>
              <FlatList 
                data={users}
                renderItem={(user) => (
                  <View>
                    <Text>{user.item.name}</Text>
                    { (user.item.student) ?
                      <Text>{user.item.grade}</Text>:null
                    }
                  </View>
                )}
                numColumns={3}
                onEndReached={() => {
                  if (nextLink !== undefined) {
                    getUsers(nextLink)
                  }
                }}
              />
            </View>:
            <View>
              <Pressable onPress={() => {}}>
                <Text>Back</Text>
              </Pressable>
              <Text>Something went wrong</Text>
            </View>
          }
        </> 
      }
    </>
  )
}