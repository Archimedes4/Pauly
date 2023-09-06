import { View, Text, Button, Pressable } from 'react-native'
import React from 'react'
import { Link, useNavigate } from 'react-router-native'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../Redux/store'

export default function GovernmentClasses() {
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  const navigate = useNavigate();
  return (
    <View style={{width: width, height: height, backgroundColor: "white"}}>
      <Link to="/profile/government/">
        <Text>Back</Text>
      </Link>
        <Text>Classes</Text>
        <Link to="/profile/government/classes/create">
          <Text>Create Class</Text>
        </Link>
        <Pressable onPress={() => {
          navigate("/profile/government/classes/room")
        }}>
          <Text>Rooms</Text>
        </Pressable>
        <Button title="Import Classes" onPress={() => {}} />
    </View>
  )
}