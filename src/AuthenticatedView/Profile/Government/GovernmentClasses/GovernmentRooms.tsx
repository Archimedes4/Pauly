import { View, Text, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import callMsGraph from '../../../../Functions/Ultility/microsoftAssets'
import store, { RootState } from '../../../../Redux/store'
import { useNavigate } from 'react-router-native'
import { useSelector } from 'react-redux'
import { loadingStateEnum } from '../../../../types'
import { getRooms } from '../../../../Functions/getRooms'

declare global {
  type roomType = {
    name: string,
    id: string
  }
}

export default function GovernmentRooms() {
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  const navigate = useNavigate();
  const [roomState, setRoomState] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const [rooms, setRooms] = useState<roomType[]>([])

  async function loadData() {
    const result = await getRooms()
    setRoomState(result.result)
    if (result.result === loadingStateEnum.success && result.data !== undefined) {
      setRooms(result.data)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <View style={{width: width, height: height, backgroundColor: "white"}}>
      <Pressable onPress={() => {navigate("/profile/government/classes")}}>
        <Text>Back</Text>
      </Pressable>
      <Text>Rooms</Text>
      <View>
        { (roomState === loadingStateEnum.loading) ?
          <Text>Loading</Text>:
          <View>
            { (roomState === loadingStateEnum.success) ?
              <View>
                { rooms.map((room) => (
                  <View key={"Room_"+room.id}>
                    <Text>{room.name}</Text>
                  </View>
                ))}
              </View>:<Text>Failed</Text>
            }
          </View>
        }
      </View>
      <Pressable onPress={() => {navigate("/profile/government/classes/room/create")}}>
        <Text>Create Room</Text>
      </Pressable>
    </View>
  )
}