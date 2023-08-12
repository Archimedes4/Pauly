import React, { useState, useEffect, useContext } from 'react'
import { View, Text, Dimensions } from 'react-native'
import { accessTokenContent } from '../../App';
import { getSchoolDayOnSelectedDay } from '../Functions/calendarFunctionsGraph';
import { useMsal } from '@azure/msal-react';

export default function Notifications() {
  const microsoftAccessToken = useContext(accessTokenContent);
  const { instance, accounts } = useMsal();
  useEffect(() => {
    getSchoolDayOnSelectedDay(microsoftAccessToken.accessToken, new Date(), instance, accounts)
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
