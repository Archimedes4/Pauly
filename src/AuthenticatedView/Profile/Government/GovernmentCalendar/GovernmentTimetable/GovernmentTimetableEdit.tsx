import { View, Text } from 'react-native'
import React from 'react'
import { RootState } from '../../../../../Redux/store'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-native'

export default function GovernmentTimetableEdit() {
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  return (
    <View style={{width: width, height: height, backgroundColor: "white"}}>
      <Link to="/profile/government/calendar/timetable">
        <Text>Back</Text>
      </Link>
      <Text>Edit Timetable</Text>
    </View>
  )
}