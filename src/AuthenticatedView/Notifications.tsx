import React, { useState, useEffect, useContext } from 'react'
import { View, Text, Dimensions } from 'react-native'
import { getSchoolDayOnSelectedDay } from '../Functions/calendarFunctionsGraph';
import { useSelector } from 'react-redux';
import { RootState } from '../Redux/store';
import { Link } from 'react-router-native';

export default function Notifications() {
  const {currentBreakPoint} = useSelector((state: RootState) => state.dimentions)
  async function loadData() {
    const result = await getSchoolDayOnSelectedDay(new Date())
    console.log(result)
  }
  useEffect(() => {
    loadData()
  }, [])
  return (
    <View>
      { (currentBreakPoint === 0) ?
        <Link to="/profile/">
          <Text>Back</Text>
        </Link>:null
      }
      <Text>Notifications</Text>
      <View>
        <Text></Text>
      </View>
    </View>
  )
}
