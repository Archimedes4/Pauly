import React, { useState, useEffect, useContext } from 'react'
import { View, Text, Dimensions } from 'react-native'
import { accessTokenContent } from '../../App';
import { getSchoolDayOnSelectedDay } from '../Functions/calendarFunctionsGraph';
import { useMsal } from '@azure/msal-react';

export default function Notifications() {
  const pageData = useContext(accessTokenContent);
  async function loadData() {
    const result = await getSchoolDayOnSelectedDay(new Date())
    console.log(result)
  }
  useEffect(() => {
    loadData()
  }, [])
  return (
    <View>
      <Text>Notifications</Text>
      <View>
        <Text></Text>
      </View>
    </View>
  )
}
