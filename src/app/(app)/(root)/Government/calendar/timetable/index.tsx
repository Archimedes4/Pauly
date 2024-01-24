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
import { RootState } from '@redux/store';
import { Colors, styles } from '@constants';
import { Link } from 'expo-router';
import StyledButton from '@src/components/StyledButton';

export default function GovernmentTimetable() {
  const { width, height } = useSelector((state: RootState) => state.dimentions);
  return (
    <View style={{ width, height, backgroundColor: Colors.white }}>
      <View style={{ height: height * 0.1 }}>
        <Link href="/government/calendar/">
          <Text>Back</Text>
        </Link>
        <Text style={styles.headerText}>Timetables</Text>
      </View>
      <View style={{
        flex: 1
      }}>
        <SelectTimetable governmentMode />
      </View>
      <StyledButton to='/government/calendar/timetable/create' text='Create New' style={{margin: 15, marginTop: 0}}/>
    </View>
  );
}
