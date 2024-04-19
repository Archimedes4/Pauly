/*
  Pauly
  Andrew Mainella
  November 9 2023
  CalendarTypePicker.tsx
  Top compoent in calendar picker
*/
import { View, Text, Pressable } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addEventSlice } from '@redux/reducers/addEventReducer';
import { RootState } from '@redux/store';
import { Colors } from '@constants';
import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';

interface PickerWrapperProps {
  width: number;
  height: number;
}

enum calendarMode {
  month,
  week,
  day,
}

/**
 * The picker in the calendar. Picks Month, Week or Day.
 * @param Width The Width of the picker
 * @param Height The height of the picker
 * @returns
 */
export default function CalendarTypePicker({
  width,
  height,
}: PickerWrapperProps) {
  const pan = useSharedValue(0);
  const [compoentWidth, setComponentWidth] = useState(width / 3);
  const { selectedCalendarMode } = useSelector(
    (state: RootState) => state.addEvent,
  );
  const dispatch = useDispatch();
  const setPanValue = useCallback(
    (newCalendarMode: calendarMode) => {
      pan.value = withTiming(
        newCalendarMode * compoentWidth + compoentWidth * 0.005,
      );
    },
    [compoentWidth, pan],
  );

  useEffect(() => {
    // Update on width resize and on mount of the view.
    setComponentWidth(width / 3);
    pan.value = selectedCalendarMode * (width / 3) + (width / 3) * 0.005;
  }, [width]);

  return (
    <View
      style={{
        flexDirection: 'row',
        height,
        width,
        backgroundColor: '#7d7d7d',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 1,
      }}
    >
      <Pressable
        onPress={() => {
          dispatch(
            addEventSlice.actions.setSelectedCalendarMode(calendarMode.month),
          );
          setPanValue(calendarMode.month);
        }}
        key="Month_Button"
        id="Calendar_Picker_Month_Button"
        style={{
          position: 'absolute',
          width: compoentWidth,
          height,
          alignItems: 'center',
          alignContent: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            textAlign: 'center',
            fontSize: Math.sqrt((compoentWidth * 0.8 * height) / 5),
          }}
        >
          Month
        </Text>
      </Pressable>
      <Pressable
        onPress={() => {
          dispatch(
            addEventSlice.actions.setSelectedCalendarMode(calendarMode.week),
          );
          setPanValue(calendarMode.week);
        }}
        key="Week_Button"
        id="Calendar_Picker_Week_Button"
        style={{
          position: 'absolute',
          transform: [{ translateX: 1 * compoentWidth }],
          width: compoentWidth,
          height,
          alignItems: 'center',
          alignContent: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            textAlign: 'center',
            fontSize: Math.sqrt((compoentWidth * 0.8 * height) / 5),
          }}
        >
          Week
        </Text>
      </Pressable>
      <Pressable
        onPress={() => {
          dispatch(
            addEventSlice.actions.setSelectedCalendarMode(calendarMode.day),
          );
          setPanValue(calendarMode.day);
        }}
        key="Day_Button"
        id="Calendar_Picker_Day_Button"
        style={{
          position: 'absolute',
          transform: [{ translateX: 2 * compoentWidth }],
          width: compoentWidth,
          height,
          alignItems: 'center',
          alignContent: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            textAlign: 'center',
            fontSize: Math.sqrt((compoentWidth * 0.8 * height) / 5),
          }}
        >
          Day
        </Text>
      </Pressable>
      <Animated.View style={{ transform: [{ translateX: pan }], zIndex: -1 }}>
        <View
          style={{
            height: height * 0.95,
            width: compoentWidth - compoentWidth * 0.01,
            backgroundColor: Colors.white,
            top: height * 0.025,
            borderRadius: 20,
            position: 'absolute',
            zIndex: -1,
            alignItems: 'center',
            alignContent: 'center',
            justifyContent: 'center',
          }}
        />
      </Animated.View>
    </View>
  );
}
