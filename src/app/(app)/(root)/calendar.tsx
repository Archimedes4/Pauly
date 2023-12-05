/*
  Pauly
  Andrew Mainella
  November 9 2023
  Calendar.tsx
  Main Calendar for Pauly see README.md for more info.
*/
import {
  View,
  Text,
  Pressable,
} from 'react-native';
import React, { useCallback, useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useDispatch, useSelector } from 'react-redux';
import Week from '@components/Calendar/Week';
import AddEvent from '@components/Calendar/AddEvent';
import CalendarTypePicker from '@components/CalendarTypePicker';
import { AddIcon } from '@src/components/Icons';
import { RootState } from '@Redux/store';
import { Colors, calendarMode } from '@src/types';
import { safeAreaColorsSlice } from '@Redux/reducers/safeAreaColorsReducer';
import BackButton from '@components/BackButton';
import { addEventSlice } from '@Redux/reducers/addEventReducer';
import { getClasses } from '@Functions/classesFunctions';
import getEvents from '@Functions/calendar/getEvents';
import EventView from '@components/Calendar/EventView';
import MonthViewMain from '@src/components/Calendar/MonthView';

function TopView({ width, height }: { width: number; height: number }) {
  const dispatch = useDispatch();
  const { currentBreakPoint } = useSelector(
    (state: RootState) => state.dimentions,
  );
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        height,
        width,
      }}
    >
      <View
        style={{
          width:
            width * 0.45 -
            (width * 0.1 < height ? width * 0.15 : height + width * 0.025),
          height,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          adjustsFontSizeToFit
          numberOfLines={1}
          style={{
            fontFamily: 'BukhariScript',
            fontSize: currentBreakPoint === 0 ? height * 0.35 : height * 0.7,
            width: width * 0.4,
            height: currentBreakPoint === 0 ? height * 0.5 : height * 0.9,
            color: Colors.white,
            textAlign: 'center',
            verticalAlign: 'middle',
            alignContent: 'center',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          Calendar
        </Text>
      </View>
      <View style={{ width: width * 0.55 }}>
        <View style={{ marginLeft: width * 0.05 }}>
          <CalendarTypePicker
            width={width * 0.5}
            height={width * 0.1 < height * 0.6 ? width * 0.1 : height * 0.6}
          />
        </View>
      </View>
      <View
        style={{ width: width * 0.1 < height * 0.6 ? width * 0.15 : height }}
      >
        <Pressable
          onPress={() => {
            dispatch(addEventSlice.actions.setIsShowingAddDate(true));
            dispatch(addEventSlice.actions.setIsEditing(false));
            dispatch(addEventSlice.actions.setSelectedEvent(undefined));
          }}
          style={{
            height: width * 0.1 < height * 0.6 ? width * 0.1 : height * 0.6,
            width: width * 0.1 < height * 0.6 ? width * 0.1 : height * 0.6,
            alignItems: 'center',
            alignContent: 'center',
            justifyContent: 'center',
            borderRadius: 50,
            backgroundColor: '#7d7d7d',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.8,
            shadowRadius: 1,
            marginLeft: width * 0.025,
            marginRight: width * 0.025,
          }}
        >
          <AddIcon
            width={width * 0.1 < height * 0.6 ? width * 0.05 : height * 0.4}
            height={width * 0.1 < height * 0.6 ? width * 0.05 : height * 0.4}
          />
        </Pressable>
      </View>
    </View>
  );
}

export default function Calendar() {
  const { width, height, currentBreakPoint } = useSelector(
    (state: RootState) => state.dimentions,
  );
  const { selectedCalendarMode, isShowingAddDate } = useSelector(
    (state: RootState) => state.addEvent,
  );
  const selectedDate = useSelector((state: RootState) => state.selectedDate);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      safeAreaColorsSlice.actions.setSafeAreaColors({
        top: Colors.darkGray,
        bottom: Colors.white,
      }),
    );
  }, [dispatch]);

  // This is the main (only) process that updates the events
  // In the month view month data is calculate but the events come from this hook and the month view is a decendant of this view.
  useEffect(() => {
    getEvents();
    getClasses();
  }, [selectedDate]);

  // Fonts
  const [fontsLoaded] = useFonts({
    // eslint-disable-next-line global-require
    BukhariScript: require('assets/fonts/BukhariScript.ttf'),
  });

  useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View>
      <View style={{ height: height * 0.1, backgroundColor: Colors.darkGray }}>
        {currentBreakPoint >= 1 ? null : (
          <BackButton to="/home" style={{ zIndex: 100 }} />
        )}
        <TopView width={width} height={height * 0.1} />
      </View>
      <View style={{ height: height * 0.9 }}>
        {selectedCalendarMode === calendarMode.month ? (
          <View
            style={{
              width,
              alignContent: 'center',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: Colors.white,
            }}
          >
            <MonthViewMain width={width} height={height * 0.9} />
          </View>
        ) : null}
        {selectedCalendarMode === calendarMode.week ? (
          <Week width={width * 1.0} height={height * 0.9} />
        ) : null}
        {selectedCalendarMode === calendarMode.day ? (
          <View
            style={{
              width,
              height: height * 0.9,
              alignItems: 'center',
              alignContent: 'center',
              justifyContent: 'center',
              backgroundColor: Colors.white,
            }}
          >
            <EventView />
          </View>
        ) : null}
      </View>
      {isShowingAddDate ? (
        <View
          style={{
            zIndex: 2,
            position: 'absolute',
            left: width * 0.05 + (width >= 576 ? width * 0.3 : 0) / 2,
            top: height * 0.1,
          }}
        >
          <AddEvent
            width={width * 0.9 - (width >= 576 ? width * 0.3 : 0)}
            height={height * 0.8}
          />
        </View>
      ) : null}
    </View>
  );
}
