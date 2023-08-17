import React, { useState, useEffect, useContext } from 'react'
import { View, Text, Dimensions } from 'react-native'
import { getSchoolDayOnSelectedDay } from '../Functions/calendarFunctionsGraph';
import { useSelector } from 'react-redux';
import { RootState } from '../Redux/store';
import { Link } from 'react-router-native';
import getCurrentPaulyData from '../Functions/getCurrentPaulyData';

export default function Notifications() {
  const {width, height, currentBreakPoint} = useSelector((state: RootState) => state.dimentions)
  const {siteId} = useSelector((state: RootState) => state.paulyList)
  const [messageText, setMessageText] = useState<string>("")

  async function loadData() {
    const result = await getSchoolDayOnSelectedDay(new Date())
    console.log(result)
    const data = await getCurrentPaulyData(siteId)
    console.log(data)
  }

  useEffect(() => {
    console.log("Here", siteId)
    loadData()
  }, [siteId])
  return (
    <View style={{width: width, height: height, backgroundColor: "white"}}>
      { (currentBreakPoint === 0) ?
        <Link to="/profile/">
          <Text>Back</Text>
        </Link>:null
      }
      <Text>Notifications</Text>
      <View>
        <Text>
          Last Chat Message Channels Included
          Calendar Overview
          Calendar Widget
          Tasks
          Assignments
          Dress Code
          Overview Message
          Powerpoint
          Quick Access To files
        </Text>
      </View>
      <View>
        <Text>Recent Files</Text>
        <Text>Popular Files</Text>
      </View>
    </View>
  )
}
