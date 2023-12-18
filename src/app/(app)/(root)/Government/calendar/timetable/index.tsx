// Andrew Mainella
// October 14 2023
// Pauly
// GovernmentTimetable.tsx
//
// An timetable selector that direcets to creating a new timetable or editing one.
//

import { View, Text } from 'react-native';
import React from 'react';
import { useSelector } from 'react-redux';
import SelectTimetable from '@components/Calendar/SelectTimetable';
import { RootState } from '@Redux/store';
import { Colors } from '@src/types';
import { Link } from 'expo-router';

export default function GovernmentTimetable() {
  const { width, height } = useSelector((state: RootState) => state.dimentions);
  return (
    <View style={{ width, height, backgroundColor: Colors.white }}>
      <View style={{ height: height * 0.1 }}>
        <Link href="/profile/government/calendar/">
          <Text>Back</Text>
        </Link>
        <Text>Timetables</Text>
      </View>
      <View style={{ height: height * 0.85 }}>
        <SelectTimetable governmentMode />
      </View>
      <Link href="/profile/government/calendar/timetable/create">
        <Text>Create New</Text>
      </Link>
    </View>
  );
}
