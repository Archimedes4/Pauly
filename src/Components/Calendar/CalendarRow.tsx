import { Colors } from '@src/constants';
import { addEventSlice } from '@src/redux/reducers/addEventReducer';
import { currentEventsSlice } from '@src/redux/reducers/currentEventReducer';
import { monthDataSlice } from '@src/redux/reducers/monthDataReducer';
import monthRowsReducer, { monthRowsSlice } from '@src/redux/reducers/monthRowsReducer';
import { selectedDateSlice } from '@src/redux/reducers/selectedDateReducer';
import store, { RootState } from '@src/redux/store';
import { getDateWithDay, getWeekLengthOfEvent } from '@src/utils/calendar/calendarFunctions';
import React, { useEffect, useState } from 'react';
import {
  ListRenderItemInfo,
  Pressable,
  View,
  Text,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

function getBackgroundColor(selectedDate: string, dayData: number): string {
  if (dayData === new Date(selectedDate).getDate()) {
    return Colors.lightGray;
  }
  if (
    dayData === new Date().getDate() &&
    new Date(selectedDate).getMonth() === new Date().getMonth() &&
    new Date(selectedDate).getFullYear() === new Date().getFullYear()
  ) {
    return Colors.darkGray;
  }
  return Colors.white;
}

function getTextBackgroundColor(selectedDate: string, dayData: number): string {
  if (
    dayData === new Date().getDate() &&
    new Date(selectedDate).getMonth() === new Date().getMonth() &&
    new Date(selectedDate).getFullYear() === new Date().getFullYear() &&
    new Date(selectedDate).getDate() !== dayData
  ) {
    return Colors.white;
  }
  return Colors.black;
}

function isCalendarTextColor(selectedDate: string, day: number): boolean {
  const date = new Date(selectedDate);
  date.setDate(day);
  if (new Date().toDateString() === date.toDateString()) {
    return true;
  }
  return false;
}

function CalendarCardView({
  value,
  width,
  height,
  calendarWidth,
  setIsOverflow,
  index,
  setHeight
}: {
  value: monthDataType;
  width: number;
  height: number;
  setHeight: (item: number) => void;
  calendarWidth: number;
  setIsOverflow: (item: boolean) => void;
  index: number;
}) {
  const selectedDate = useSelector((state: RootState) => state.selectedDate);
  const dispatch = useDispatch();
  function pressCalendar() {
    const d = new Date();
    d.setFullYear(
      new Date(selectedDate).getFullYear(),
      new Date(selectedDate).getMonth(),
      value.dayData,
    );
    dispatch(selectedDateSlice.actions.setSelectedDate(d.toISOString()));
  }

  if (calendarWidth <= 519 && value.showing) {
    return (
      <Pressable
        style={{
          width,
          height,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: height / 2,
          backgroundColor: getBackgroundColor(selectedDate, value.dayData),
        }}
        onPress={() => pressCalendar()}
        onLayout={e => {
          if (e.nativeEvent.layout.height - 1 >= height) {
            setIsOverflow(true);
          } else {
            setIsOverflow(false);
          }
        }}
      >
        <Text
          style={{
            color: getTextBackgroundColor(selectedDate, value.dayData),
          }}
        >
          {value.dayData}
        </Text>
        {value.events.length >= 1 ? (
          <View
            style={{
              backgroundColor: 'black',
              borderRadius: 50,
              width: width < height ? width * 0.25 : height * 0.25,
              height: width < height ? width * 0.25 : height * 0.25,
            }}
          />
        ) : (
          <View
            style={{
              backgroundColor: 'transparent',
              borderRadius: 50,
              width: width < height ? width * 0.25 : height * 0.25,
              height: width < height ? width * 0.25 : height * 0.25,
            }}
          />
        )}
      </Pressable>
    );
  }
  if (calendarWidth <= 519) {
    return <View style={{ width, height }} />;
  }
  if (value.showing) {
    return (
      <View
        style={{
          width,
          height: height,
          zIndex: 10
        }}
      >
        <View
          style={{
            width,
            height: height,
            borderWidth: 1,
            borderBottomWidth: 0,
            borderTopWidth: 0,
            borderColor: Colors.lightGray,
            position: 'absolute',
            zIndex: -10
          }}
        />
        <Pressable
          style={{
            width,
            minHeight: height,
            padding: 2,
            position: 'absolute',
            zIndex: 100
          }}
          onPress={() => {
            pressCalendar();
            dispatch(addEventSlice.actions.setIsShowingAddDate(true));
            const startDate = new Date(selectedDate);
            startDate.setDate(value.dayData);
            const endDate = new Date(selectedDate);
            endDate.setDate(value.dayData);
            endDate.setHours(endDate.getHours() + 1);
            dispatch(addEventSlice.actions.setStartDate(startDate.toISOString()));
            dispatch(addEventSlice.actions.setEndDate(endDate));
          }}
          onLayout={e => {
            setHeight(e.nativeEvent.layout.height)
            if (e.nativeEvent.layout.height - 1 >= height) {
              setIsOverflow(true);
            }
          }}
        >
          <View
            style={{
              borderRadius: 50,
              width: 19,
              height: 19,
              backgroundColor: isCalendarTextColor(selectedDate, value.dayData)
                ? 'red'
                : 'transparent',
              alignContent: 'center',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: isCalendarTextColor(selectedDate, value.dayData)
                  ? Colors.white
                  : Colors.black,
                fontWeight: isCalendarTextColor(selectedDate, value.dayData)
                  ? 'bold'
                  : 'normal',
              }}
            >
              {value.dayData}
            </Text>
          </View>
          {[...value.events].sort((a, b) => {return a.order - b.order}).map((event: monthEventType) => {
            if (event.paulyEventType !== 'studentSchedule' && event.isFirst === true) {
              return (
                <Pressable
                  key={`Calendar_Event_${event.id}`}
                  onPress={() => {
                    dispatch(addEventSlice.actions.setIsShowingAddDate(true));
                    dispatch(addEventSlice.actions.setSelectedEvent(event));
                  }}
                  style={{
                    width: (width * getWeekLengthOfEvent(event, getDateWithDay(selectedDate, value.dayData))) - 10,
                    backgroundColor: Colors.lightGray,
                    padding: 5,
                    borderRadius: 15,
                    margin: 3,
                    zIndex: 100
                  }}
                  onLayout={(e) => {
                    if (event.height === undefined) {
                      store.dispatch(monthDataSlice.actions.setEvent({
                        firstIndex: index,
                        id: event.id,
                        height: e.nativeEvent.layout.height
                      }))
                    }
                  }}
                >
                  <Text style={{ fontSize: 10 }}>{event.name}</Text>
                </Pressable>
              );
            }
            if (event.paulyEventType !== 'studentSchedule') {
              return (
                <Pressable
                  key={`Calendar_Event_${event.id}`}
                  style={{height: event.height, margin: 3}}
                  onPress={() => {
                    dispatch(addEventSlice.actions.setIsShowingAddDate(true));
                    dispatch(addEventSlice.actions.setSelectedEvent(event));
                  }}
                />
              )
            }
            return null;
          })}
        </Pressable>
      </View>
    );
  }
  return (
    <View
      onLayout={e => {
        if (e.nativeEvent.layout.height > height) {
          setIsOverflow(true);
        } else {
          setIsOverflow(false);
        }
      }}
      style={{
        width,
        height,
        borderWidth: 1,
        borderBottomWidth: 0,
        borderTopWidth: 0,
        borderColor: Colors.lightGray,
      }}
    />
  );
}

export default function CalendarRow({
  value,
  width,
  height,
  calendarWidth,
}: {
  value: ListRenderItemInfo<monthDataType[]>;
  width: number;
  height: number;
  calendarWidth: number;
}) {
  const [isOverflow, setIsOverflow] = useState<boolean>(true);
  const rowData = useSelector((state: RootState) => state.monthRows);

  function getRowHeight(data: monthRowHeight) {
    if (value.index === 0) {
      return data.rowOne
    }
    if (value.index === 1) {
      return data.rowTwo
    }
    if (value.index === 2) {
      return data.rowThree
    }
    if (value.index === 3) {
      return data.rowFour
    }
    if (value.index === 4) {
      return data.rowFive
    }
    if (value.index === 5) {
      return data.rowSix
    }
    if (value.index === 6) {
      return data.rowSeven
    }
    if (value.index === 7) {
      return data.rowEight
    }
    return 0
  }

  useEffect(() => {
    store.dispatch(monthRowsSlice.actions.setRow({
      row: value.index,
      height: height
    }))
  }, [height])

  return (
    <ScrollView
      scrollEnabled={isOverflow}
      style={{
        height,
        borderTopWidth:
          width <= 74.14285714285714 ? 0 : value.index === 0 ? 2 : 1,
        borderColor: Colors.lightGray,
      }}
    >
      <View style={{ flexDirection: 'row' }}>
        {value.item.map((day, dayIndex) => (
          <CalendarCardView
            key={`${value.item[dayIndex].id}Card`}
            value={day}
            width={width}
            height={getRowHeight(rowData)}
            calendarWidth={calendarWidth}
            setIsOverflow={setIsOverflow}
            index={value.index}
            setHeight={(e) => {
              if (e > getRowHeight(rowData)) {
                store.dispatch(monthRowsSlice.actions.setRow({
                  row: value.index,
                  height: e
                }))
              }
            }}
          />
        ))}
      </View>
    </ScrollView>
  );
}
