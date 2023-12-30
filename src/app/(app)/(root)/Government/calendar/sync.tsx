import { View, Text, Pressable } from 'react-native';
import React from 'react';
import { Link } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { Colors } from '@constants';
import useSyncCalendar from '@hooks/useSyncCalendar';
import callMsGraph from '@utils/ultility/microsoftAssets';

async function getPastCalendarSyncs() {
  const result = await callMsGraph('https://graph.microsoft');
  if (result.ok) {

  } else {

  }
}

export default function calendarSync() {
  const { width, height } = useSelector((state: RootState) => state.dimentions);
  const syncCalendar = useSyncCalendar();
  return (
    <View style={{ width, height, backgroundColor: Colors.white }}>
      <Link href="/government/calendar/">
        <Text>Back</Text>
      </Link>
      <Text style={{ marginLeft: 'auto', marginRight: 'auto', fontFamily: 'Comfortaa-Regular', marginBottom: 5, fontSize: 25 }}>Calendar Sync</Text>

      <Pressable onPress={() => syncCalendar()}>
        <Text>Sync Calendar</Text>
      </Pressable>
    </View>
  );
}
