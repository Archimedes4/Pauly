/*
  Pauly
  Andrew Mainella
  November 10 2023
  Week.tsx
*/
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { selectedDateSlice } from '@redux/reducers/selectedDateReducer';
import { Colors } from '@constants';
import WeekDayView from './WeekDayView';
import { ChevronLeft, ChevronRight } from '../Icons';
import DayView from './DayView';

function WeekDayButton({ width, day }: { width: number; day: Date }) {
  const selectedDateRedux: string = useSelector(
    (state: RootState) => state.selectedDate,
  );
  const dispatch = useDispatch();

  const [isHover, setIsHover] = useState<boolean>(false);
  return (
    <Pressable
      onPress={() => {
        dispatch(selectedDateSlice.actions.setSelectedDate(day.toISOString()));
      }}
      key={`${day.getDay()}`}
      onHoverIn={() => setIsHover(true)}
      onHoverOut={() => setIsHover(false)}
      onPressIn={() => setIsHover(true)}
      onPressOut={() => setIsHover(false)}
      style={{
        width: width * 0.08888888888888889,
        height: width * 0.08888888888888889,
        margin: width * 0.01111111111111111,
        borderRadius: 50,
        backgroundColor: isHover ? Colors.lightGray : Colors.darkGray,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        borderColor:
          day.getDate() === new Date(selectedDateRedux).getDate()
            ? Colors.black
            : Colors.maroon,
        borderWidth:
          new Date().getDate() === day.getDate() ||
          day.getDate() === new Date(selectedDateRedux).getDate()
            ? 5
            : 0,
        shadowRadius: 4,
        shadowColor: Colors.black,
      }}
    >
      <Text
        selectable={false}
        style={{ color: isHover ? Colors.black : Colors.white }}
      >
        {day.getDate()}
      </Text>
    </Pressable>
  );
}

export default function Week({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  const selectedDateRedux: string = useSelector(
    (state: RootState) => state.selectedDate,
  );
  const [daysOfWeek, setDaysOfWeek] = useState<Date[]>([]);
  const dispatch = useDispatch();
  function getDOW(selectedDate: Date) {
    const week: Date[] = [];
    // Starting Monday not Sunday
    selectedDate.setDate(selectedDate.getDate() - selectedDate.getDay());
    for (let i = 0; i < 7; i += 1) {
      week.push(new Date(selectedDate));
      selectedDate.setDate(selectedDate.getDate() + 1);
    }
    return week;
  }
  useEffect(() => {
    setDaysOfWeek(getDOW(new Date(selectedDateRedux)));
  }, [selectedDateRedux]);

  if (width >= 768) {
    return (
      <View style={{ width, height, backgroundColor: Colors.white }}>
        <View style={{ flexDirection: 'row', height: 40 }}>
          {daysOfWeek.map(dow => (
            <View style={{ marginLeft: 'auto', marginRight: 'auto' }}>
              <Text>
                {dow.toLocaleDateString('en-US', { weekday: 'long' })}
              </Text>
              <Text style={{ marginLeft: 'auto', marginRight: 'auto' }}>
                {dow.toLocaleDateString('en-US', { day: 'numeric' })}
              </Text>
            </View>
          ))}
        </View>
        <ScrollView style={{ height }}>
          <View style={{ flexDirection: 'row' }}>
            {daysOfWeek.map((day, index) => (
              <View key={day.getDate()} id={day.getDate().toString()}>
                <WeekDayView
                  width={width / 7}
                  height={false ? height * 0.757 : height}
                  week
                  start={index === 0}
                  day={day}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    )
  }

  return (
    <View style={{ width, height, backgroundColor: Colors.white }}>
      <View
        style={{
          flexDirection: 'row',
          height: width * 0.142857142857143,
          width,
        }}
      >
        <Pressable
          style={{ margin: width * 0.01111111111111111 }}
          onPress={() => {
            const d = new Date(selectedDateRedux);
            d.setDate(d.getDate() - 7);
            dispatch(
              selectedDateSlice.actions.setSelectedDate(d.toISOString()),
            );
          }}
        >
          <ChevronLeft
            width={width * 0.08888888888888889}
            height={width * 0.08888888888888889}
          />
        </Pressable>
        {daysOfWeek.map(day => (
          <WeekDayButton key={day.toISOString()} width={width} day={day} />
        ))}
        <Pressable
          style={{ margin: width * 0.01111111111111111 }}
          onPress={() => {
            const d = new Date(selectedDateRedux);
            d.setDate(d.getDate() + 7);
            dispatch(
              selectedDateSlice.actions.setSelectedDate(d.toISOString()),
            );
          }}
        >
          <ChevronRight
            width={width * 0.08888888888888889}
            height={width * 0.08888888888888889}
          />
        </Pressable>
      </View>
      <View
        style={{
          height: false ? height : height - width * 0.179,
          width,
          alignContent: 'center',
          alignItems: 'center',
          backgroundColor: Colors.white,
        }}
      >
        <DayView
          width={width * 0.95}
          height={false ? height * 0.757 : height}
        />
      </View>
    </View>
  );
}
