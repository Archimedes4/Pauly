import { View, Text } from 'react-native';
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@Redux/store';
import { Colors } from '@src/types';
import { Link } from 'expo-router';

export default function GovernmentCalendar() {
  const { width, height } = useSelector((state: RootState) => state.dimentions);
  return (
    <View
      style={{
        width,
        height,
        backgroundColor: Colors.lightGray,
      }}
    >
      <Link href="/government">
        <Text>Back</Text>
      </Link>
      <Text>Government Calendar</Text>
      <Link
        href="/government/calendar/schedule"
        style={{
          backgroundColor: '#FFFFFF',
          shadowColor: 'black',
          shadowOffset: { width: 1, height: 1 },
          shadowOpacity: 1,
          shadowRadius: 5,
          width: width - 20,
          margin: 10,
          borderRadius: 15,
        }}
      >
        <Text style={{ margin: 10 }}>Schedule</Text>
      </Link>
      <Link
        href="/government/calendar/timetable"
        style={{
          backgroundColor: '#FFFFFF',
          shadowColor: 'black',
          shadowOffset: { width: 1, height: 1 },
          shadowOpacity: 1,
          shadowRadius: 5,
          width: width - 20,
          margin: 10,
          borderRadius: 15,
        }}
      >
        <Text style={{ margin: 10 }}>Timetables</Text>
      </Link>
      <Link
        href="/government/calendar/dresscode"
        style={{
          backgroundColor: '#FFFFFF',
          shadowColor: 'black',
          shadowOffset: { width: 1, height: 1 },
          shadowOpacity: 1,
          shadowRadius: 5,
          width: width - 20,
          margin: 10,
          borderRadius: 15,
        }}
      >
        <Text style={{ margin: 10 }}>Dress Code</Text>
      </Link>
      <Link
        href="/government/calendar/calendarSync"
        style={{
          backgroundColor: '#FFFFFF',
          shadowColor: 'black',
          shadowOffset: { width: 1, height: 1 },
          shadowOpacity: 1,
          shadowRadius: 5,
          width: width - 20,
          margin: 10,
          borderRadius: 15,
        }}
      >
        <Text style={{ margin: 10 }}>Calendar Sync</Text>
      </Link>
    </View>
  );
}
