import { View, Text } from 'react-native'
import React from 'react'
import { Link } from 'react-router-native'

export default function GovernmentDressCode() {

  return (
    <View>
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