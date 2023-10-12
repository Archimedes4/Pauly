import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { Link, useNavigate } from 'react-router-native'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../Redux/store'

export default function GovernmentCalendar() {
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  const navigate = useNavigate()
  return (
    <View style={{width: width, height: height, backgroundColor: "white"}}>
      <Link to="/profile/government/">
        <Text>Back</Text>
      </Link>
      <Text>Government Calendar</Text>
      <Pressable onPress={() => navigate("/profile/government/calendar/schedule")} style={{backgroundColor: "#FFFFFF", shadowColor: "black", shadowOffset: {width: 1, height: 1}, shadowOpacity: 1, shadowRadius: 5, width: width - 20, margin: 10, borderRadius: 15}}>
        <Text style={{margin: 10}}>Schedule</Text>
      </Pressable>
      <Pressable onPress={() => navigate("/profile/government/calendar/timetable")} style={{backgroundColor: "#FFFFFF", shadowColor: "black", shadowOffset: {width: 1, height: 1}, shadowOpacity: 1, shadowRadius: 5, width: width - 20, margin: 10, borderRadius: 15}}>
        <Text style={{margin: 10}}>Timetables</Text>
      </Pressable>
      <Pressable onPress={() => navigate("/profile/government/calendar/dresscode")} style={{backgroundColor: "#FFFFFF", shadowColor: "black", shadowOffset: {width: 1, height: 1}, shadowOpacity: 1, shadowRadius: 5, width: width - 20, margin: 10, borderRadius: 15}}>
        <Text style={{margin: 10}}>Dress Code</Text>
      </Pressable>
    </View>
  )
}