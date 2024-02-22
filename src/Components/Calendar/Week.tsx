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
import { getDOW, isDateToday } from '@src/utils/calendar/calendarFunctions';
import AllDayComponent from './AllDayComponent';

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
  const [topPadding, setTopPadding] = useState<number>(0);
  const dispatch = useDispatch();
  useEffect(() => {
    setDaysOfWeek(getDOW(new Date(selectedDateRedux)));
  }, [selectedDateRedux]);

  if (width >= 768) {
    return (
      <View style={{ width, height, backgroundColor: Colors.white }}>
        <View style={{ flexDirection: 'row', height: 40, position: 'absolute', zIndex: 2, width, backgroundColor: Colors.white + "50" }}>
          <Pressable
            onPress={() => {
              const d = new Date(selectedDateRedux);
              d.setDate(d.getDate() - 7);
              dispatch(
                selectedDateSlice.actions.setSelectedDate(d.toISOString()),
              );
            }}
            style={{marginTop: 'auto', marginBottom: 'auto', marginLeft: 2}}
          >
            <ChevronLeft width={16} height={16}/>
          </Pressable>
          {daysOfWeek.map(dow => (
            <View key={dow.toISOString()} onLayout={(e) => {setTopPadding(e.nativeEvent.layout.height)}} style={{ width: ((width - 36)/7), backgroundColor: isDateToday(dow) ? Colors.darkGray + "75":Colors.white + "70", padding: 'auto' }}>
              <Text style={{opacity: 1, marginLeft: 'auto', marginRight: 'auto'}}>
                {dow.toLocaleDateString('en-US', { weekday: 'long' })}
              </Text>
              <Text style={{ marginLeft: 'auto', marginRight: 'auto' }}>
                {dow.toLocaleDateString('en-US', { day: 'numeric' })}
              </Text>
              <AllDayComponent
                day={dow.toISOString()}
                width={width/7}
                topPadding={topPadding}
              />
            </View>
          ))}
          <Pressable
            onPress={() => {
              const d = new Date(selectedDateRedux);
              d.setDate(d.getDate() + 7);
              dispatch(
                selectedDateSlice.actions.setSelectedDate(d.toISOString()),
              );
            }}
            style={{marginTop: 'auto', marginBottom: 'auto', marginRight: 2}}
          >
            <ChevronRight width={16} height={16}/>
          </Pressable>
        </View>
        <ScrollView style={{ height }} >
          <View style={{ flexDirection: 'row' }}>
            {daysOfWeek.map((day, index) => (
              <View key={day.getDate()} id={day.getDate().toString()}>
                <WeekDayView
                  width={width / 7}
                  height={false ? height * 0.757 : height}
                  start={index === 0}
                  day={day}
                  topPadding={topPadding}
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
          height: false ? height : height - width * 0.142857142857143,
          width,
          alignContent: 'center',
          alignItems: 'center',
          backgroundColor: Colors.white,
        }}
      >
        <DayView
          width={width * 0.95}
          height={height}
        />
      </View>
    </View>
  );
}
