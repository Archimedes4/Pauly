/*
  Pauly
  Andrew Mainella
  November 9 2023
  Calendar.tsx
  Main Calendar for Pauly see README.md for more info.
*/
import { View, Text, Pressable } from 'react-native';
import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Week from '@components/Calendar/Week';
import AddEvent from '@components/Calendar/AddEvent';
import CalendarTypePicker from '@components/CalendarTypePicker';
import { AddIcon } from '@components/Icons';
import store, { RootState } from '@redux/store';
import { Colors, calendarMode } from '@constants';
import { safeAreaColorsSlice } from '@redux/reducers/safeAreaColorsReducer';
import BackButton from '@components/BackButton';
import { addEventSlice } from '@redux/reducers/addEventReducer';
import getEvents, { getClassEvents } from '@utils/calendar/getEvents';
import EventView from '@components/Calendar/EventView';
import MonthViewMain from '@components/Calendar/MonthView';
import { currentEventsSlice } from '@redux/reducers/currentEventReducer';
import { lastCalledSelectedDateSlice } from '@redux/reducers/lastCalledSelectedDateReducer';

function getCalendarFontSize(breakPoint: number, height: number) {
  if (breakPoint === 0) {
    return height * 0.35;
  }
  if (breakPoint === 1) {
    if (height >= 1000) {
      return height * 0.1;
    }
    return height * 0.6;
  }
  return height * 0.7;
}

function TopView({ width, height }: { width: number; height: number }) {
  const dispatch = useDispatch();
  const { currentBreakPoint } = useSelector(
    (state: RootState) => state.dimensions,
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
            fontSize: getCalendarFontSize(currentBreakPoint, height), // getCalendarFontSize(currentBreakPoint, height),
            width:
              width * 0.45 -
              (width * 0.1 < height ? width * 0.15 : height + width * 0.025),
            height: getCalendarFontSize(currentBreakPoint, height),
            color: Colors.white,
            textAlign: 'center',
            overflow: 'visible',
          }}
        >
          Calendar
        </Text>
      </View>
      <View style={{ width: width * 0.55 }}>
        <View style={{ marginLeft: width * 0.05 }}>
          <CalendarTypePicker
            width={currentBreakPoint === 1 ? width * 0.4 : width * 0.5}
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
            dispatch(
              addEventSlice.actions.setSelectedEvent({
                id: 'create',
                name: '',
                startTime: new Date().toISOString(),
                endTime: new Date(Date.now() + 3600000).toISOString(),
                eventColor: Colors.white,
                microsoftEvent: true,
                allDay: false,
                paulyEventType: 'personal',
              }),
            );
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

function isLastSelectedDateValid() {
  if (store.getState().lastCalledSelectedDate === '') {
    return true;
  }
  const lastDate = new Date(store.getState().lastCalledSelectedDate);
  const selectedDate = new Date(store.getState().selectedDate);
  if (
    lastDate.getMonth() !== selectedDate.getMonth() ||
    lastDate.getFullYear() !== selectedDate.getFullYear()
  ) {
    return true;
  }
  return false;
}

export default function Calendar() {
  const { width, height, currentBreakPoint } = useSelector(
    (state: RootState) => state.dimensions,
  );
  const { selectedCalendarMode, isShowingAddDate } = useSelector(
    (state: RootState) => state.addEvent,
  );
  const selectedDate = useSelector((state: RootState) => state.selectedDate);
  const dispatch = useDispatch();

  const updateColors = useCallback(() => {
    dispatch(
      safeAreaColorsSlice.actions.setSafeAreaColors({
        top: Colors.darkGray,
        bottom: Colors.white,
      }),
    );
  }, [dispatch]);

  useEffect(() => {
    updateColors();
  }, []);

  // This is the main (only) process that updates the events when the selected dates.
  // In the month view month data is calculated but the events come from this hook and the month view is a decendant of this view.
  // In day view things work similary as month view.
  useEffect(() => {
    if (isLastSelectedDateValid()) {
      dispatch(currentEventsSlice.actions.clearEvents());
      dispatch(
        lastCalledSelectedDateSlice.actions.setLastCalledSelectedDate(
          selectedDate,
        ),
      );
      getEvents();
    } else {
      dispatch(currentEventsSlice.actions.removeClassEvents());
      getClassEvents()
    }
  }, [selectedDate]);

  return (
    <View>
      <View style={{ height: height * 0.1, backgroundColor: Colors.darkGray }}>
        {currentBreakPoint >= 1 ? null : (
          <BackButton to="/home" style={{ zIndex: 100 }} color={Colors.white} />
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
            <EventView width={width} height={height * 0.9} />
          </View>
        ) : null}
      </View>
      {isShowingAddDate ? (
        <View
          style={{
            zIndex: 2,
            position: 'absolute',
            left:
              width * 0.05 + (currentBreakPoint === 0 ? 0 : width * 0.3) / 2,
            top: height * 0.1,
          }}
        >
          <AddEvent
            width={
              width * 0.9 -
              (currentBreakPoint === 0 ? width * 0.1 : width * 0.3)
            }
            height={height * 0.8}
          />
        </View>
      ) : null}
    </View>
  );
}
