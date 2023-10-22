// Andrew Mainella
// October 14 2023
// Pauly
// GovernmentTimetable.tsx
//
// An timetable selector that direcets to creating a new timetable or editing one.
//

import { View, Text, Pressable } from 'react-native';
import React from 'react';
import { useNavigate } from 'react-router-native';
import { useSelector } from 'react-redux';
import SelectTimetable from '../../../../Calendar/SelectTimetable';
import { RootState } from '../../../../../Redux/store';
import { Colors } from '../../../../../types';

export default function GovernmentTimetable() {
  const { width, height } = useSelector((state: RootState) => state.dimentions);
  const navigate = useNavigate();
  return (
    <View style={{ width, height, backgroundColor: Colors.white }}>
      <View style={{ height: height * 0.1 }}>
        <Pressable onPress={() => navigate('/profile/government/calendar/')}>
          <Text>Back</Text>
        </Pressable>
        <Text>Timetables</Text>
      </View>
      <View style={{ height: height * 0.85 }}>
        <SelectTimetable governmentMode />
      </View>
      <Pressable
        onPress={() =>
          navigate('/profile/government/calendar/timetable/create')
        }
      >
        <Text>Create New</Text>
      </Pressable>
    </View>
  );
}
