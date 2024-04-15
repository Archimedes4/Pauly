/*
  Pauly
  Andrew Mainella
  14 October 2023
  GovernmentTimetable.tsx

  An timetable selector that direcets to creating a new timetable or editing one.
  
*/
import { View, Text } from 'react-native';
import React from 'react';
import { useSelector } from 'react-redux';
import SelectTimetable from '@components/Calendar/SelectTimetable';
import { RootState } from '@redux/store';
import { Colors, styles } from '@constants';
import { Link } from 'expo-router';
import StyledButton from '@components/StyledButton';
import BackButton from '@src/components/BackButton';

export default function GovernmentTimetable() {
  const { width, height } = useSelector((state: RootState) => state.dimensions);
  return (
    <View style={{ width, height, backgroundColor: Colors.white }}>
      <View>
        <BackButton to="/government/calendar/"/>
        <Text style={[styles.headerText, {marginTop: 15}]}>Timetables</Text>
      </View>
      <View
        style={{
          flex: 1,
        }}
      >
        <SelectTimetable governmentMode />
      </View>
      <StyledButton
        to="/government/calendar/timetable/create"
        text="Create New"
        style={{ margin: 15, marginTop: 0 }}
        second
      />
    </View>
  );
}
