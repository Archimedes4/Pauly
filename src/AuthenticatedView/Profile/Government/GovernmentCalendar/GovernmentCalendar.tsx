import { View, Text } from 'react-native'
import React from 'react'
import { Link } from 'react-router-native'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../Redux/store'

export default function GovernmentCalendar() {
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  return (
    <View style={{width: width, height: height, backgroundColor: "white"}}>
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
      <Link to="/profile/government/calendar/dresscode">
        <Text>Dress Code</Text>
      </Link>
    </View>
  )
}