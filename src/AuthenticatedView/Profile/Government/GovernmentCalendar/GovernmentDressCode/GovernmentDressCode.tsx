import { View, Text } from 'react-native'
import React from 'react'
import { Link } from 'react-router-native'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../../Redux/store'

export default function GovernmentDressCode() {
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  return (
    <View style={{width: width, height: height, backgroundColor: "white"}}>
        <Link to="/profile/government/calendar">
            <Text>Back</Text>
        </Link>
      <Text>GovernmentDressCode</Text>
      <Link to="/profile/government/calendar/dresscode/create">
        <Text>Create Dress Code</Text>
      </Link>
    </View>
  )
}