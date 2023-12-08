import { View, Text } from 'react-native'
import React from 'react'
import { Link } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@src/Redux/store';
import { Colors } from '@src/types';

export default function calendarSync() {
  const { width, height } = useSelector((state: RootState) => state.dimentions);
  return (
    <View style={{ width, height, backgroundColor: Colors.white }}>
      <Link href={'/profile/government/calendar/'}>
        <Text>Back</Text>
      </Link>
      <Text>Calendar Sync</Text>
    </View>
  )
}