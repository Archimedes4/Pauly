import { View, Text } from 'react-native';
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { Colors } from '@constants';
import { Link } from 'expo-router';

export default function GovernmentCalendar() {
  const { width, height } = useSelector((state: RootState) => state.dimentions);
  return (
    <View
      style={{
        width,
        height,
        backgroundColor: Colors.white,
      }}
    >
      <Link href="/government">
        <Text>Back</Text>
      </Link>
      <Text style={{marginLeft: 'auto', marginRight: 'auto', fontFamily: 'Comfortaa-Regular', marginBottom: 5, fontSize: 25}}>Government Calendar</Text>
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
          padding: 10,
          borderRadius: 15,
        }}
      >
        <Text>Schedule</Text>
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
          padding: 10,
          borderRadius: 15,
        }}
      >
        <Text>Timetables</Text>
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
          padding: 10,
          borderRadius: 15,
        }}
      >
        <Text>Dress Code</Text>
      </Link>
      <Link
        href="/government/calendar/sync"
        style={{
          backgroundColor: '#FFFFFF',
          shadowColor: 'black',
          shadowOffset: { width: 1, height: 1 },
          shadowOpacity: 1,
          shadowRadius: 5,
          width: width - 20,
          margin: 10,
          padding: 10,
          borderRadius: 15,
        }}
      >
        <Text>Calendar Sync</Text>
      </Link>
    </View>
  );
}
