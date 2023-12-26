import { View, Text, Pressable } from 'react-native';
import React from 'react';
import { Link } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { Colors } from '@constants';
import useSyncCalendar from '@src/hooks/useSyncCalendar';

export default function calendarSync() {
  const { width, height } = useSelector((state: RootState) => state.dimentions);
  const syncCalendar = useSyncCalendar();
  return (
    <View style={{ width, height, backgroundColor: Colors.white }}>
      <Link href="/profile/government/calendar/">
        <Text>Back</Text>
      </Link>
      <Text>Calendar Sync</Text>
      <Pressable onPress={() => syncCalendar()}>
        <Text>Sync Calendar</Text>
      </Pressable>
    </View>
  );
}
