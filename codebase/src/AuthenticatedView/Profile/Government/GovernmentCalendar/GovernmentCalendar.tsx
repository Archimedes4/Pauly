import { View, Text } from 'react-native'
import React from 'react'
import { Link } from 'react-router-native'

export default function GovernmentCalendar() {
  return (
    <View>
      <Link to="/profile/government/">
        <Text>Back</Text>
      </Link>
      <Text>Government Calendar</Text>
      <Link to="/profile/government/calendar/schedule">
        <Text>Schedule</Text>
      </Link>
      <Link to="/profile/government/calendar/timetable">
        <Text>Timetables</Text>
      </Link>
      <Link to="/profile/government/calendar/events">
        <Text>Events</Text>
      </Link>
    </View>
  )
}