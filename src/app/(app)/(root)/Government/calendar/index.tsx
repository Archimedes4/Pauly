import { View, Text } from 'react-native';
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { Colors } from '@constants';
import StyledButton from '@components/StyledButton';
import BackButton from '@components/BackButton';

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
      <BackButton to="/government" />
      <Text
        style={{
          marginLeft: 'auto',
          marginRight: 'auto',
          fontFamily: 'Comfortaa-Regular',
          marginBottom: 5,
          fontSize: 25,
          marginTop: 15,
        }}
      >
        Government Calendar
      </Text>
      <StyledButton
        to="/government/calendar/schedule"
        text="Schedule"
        style={{ marginLeft: 15, marginRight: 15, marginTop: 15 }}
      />
      <StyledButton
        to="/government/calendar/timetable"
        text="Timetables"
        style={{ marginLeft: 15, marginRight: 15, marginTop: 20 }}
      />
      <StyledButton
        to="/government/calendar/dresscode"
        text="Dress Code"
        style={{ marginLeft: 15, marginRight: 15, marginTop: 20 }}
      />
      <StyledButton
        to="/government/calendar/sync"
        text="Calendar Sync"
        style={{ marginLeft: 15, marginRight: 15, marginTop: 20 }}
      />
      <StyledButton
        to="/government/calendar/utility"
        text="Calendar Utility"
        style={{ marginLeft: 15, marginRight: 15, marginTop: 20 }}
      />
    </View>
  );
}
