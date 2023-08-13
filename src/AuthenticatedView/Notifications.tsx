import React, { useState, useEffect, useContext } from 'react'
import { View, Text, Dimensions } from 'react-native'
import { accessTokenContent } from '../../App';
import { getSchoolDayOnSelectedDay } from '../Functions/calendarFunctionsGraph';
import { useMsal } from '@azure/msal-react';

export default function Notifications() {
  const pageData = useContext(accessTokenContent);
  const { instance, accounts } = useMsal();
  async function loadData() {
    const result = await getSchoolDayOnSelectedDay(pageData.accessToken, new Date(), instance, accounts)
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
