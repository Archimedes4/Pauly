import { View, Text } from 'react-native'
import React from 'react'
import { Link } from 'react-router-native'

export default function GovernmentScheduleEdit() {
  return (
    <View>
      <Link to="/profile/government/calendar/schedule">
        <Text>Back</Text>
      </Link>
      <Text>GovernmentScheduleEdit</Text>
    </View>
  )
}