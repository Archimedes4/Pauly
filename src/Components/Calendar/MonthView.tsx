import createUUID from '@utils/ultility/createUUID';
import { selectedDateSlice } from '@redux/reducers/selectedDateReducer';
import store, { RootState } from '@redux/store';
import { Colors } from '@constants';
import React, { useEffect } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getMonthData } from '@utils/calendar/calendarFunctionsGraph';
import { addEventSlice } from '@redux/reducers/addEventReducer';
import { ChevronLeft, ChevronRight } from '../Icons';
import { findFirstDayinMonth, isDateToday } from '@utils/calendar/calendarFunctions';
import CalendarRow from './CalendarRow';

function MonthView({ width, height }: { width: number; height: number }) {
  const daysInWeek: { DOW: string; id: string }[] = [
    { DOW: 'Sun', id: createUUID() },
    { DOW: 'Mon', id: createUUID() },
    { DOW: 'Tue', id: createUUID() },
    { DOW: 'Wen', id: createUUID() },
    { DOW: 'Thu', id: createUUID() },
    { DOW: 'Fri', id: createUUID() },
    { DOW: 'Sat', id: createUUID() },
  ];
  const currentEvents = useSelector((state: RootState) => state.currentEvents);
  const selectedDate: string = useSelector(
    (state: RootState) => state.selectedDate,
  );
  const monthData = useSelector((state: RootState) => state.monthData);
  const { fontScale } = useWindowDimensions();

  const dispatch = useDispatch();

  useEffect(() => {
    return getMonthData(new Date(selectedDate));
  }, [selectedDate, currentEvents]);

  return (
    <>
      <View
        style={{
          height: (height - 20) / 7,
          width,
          justifyContent: 'center',
          alignContent: 'center'
        }}
        key="Calendar_Header"
      >
        <View
          style={{
            flexDirection: 'row',
            marginLeft: 'auto',
            marginRight: 'auto',
            width: width * 0.9,
          }}
        >
          <View
            style={{
              width: width * 0.9 * 0.6,
              flexDirection: 'row',
              marginRight: 'auto',
            }}
          >
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={{ fontSize: 30 }}
            >
              {new Date(selectedDate).toLocaleString('en-us', {
                month: 'long',
              })}{' '}
              {new Date(selectedDate).getFullYear()}
            </Text>
          </View>
          {!isDateToday(selectedDate) ? (
            <Pressable
              style={{
                width: width * 0.9 * 0.2,
                alignContent: 'center',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => {
                dispatch(
                  selectedDateSlice.actions.setSelectedDate(
                    new Date().toISOString(),
                  ),
                );
              }}
            >
              <Text style={{ color: 'black', fontSize: 12 / fontScale }}>
                Today
              </Text>
            </Pressable>
          ) : (
            <View style={{ width: width * 0.9 * 0.2 }} />
          )}
          {/* This is left chevron */}
          <Pressable
            onPress={() => {
              const d = new Date(selectedDate);
              const month = d.getMonth();
              d.setMonth(d.getMonth() - 1);
              while (d.getMonth() === month) {
                d.setDate(d.getDate() - 1);
              }
              dispatch(
                selectedDateSlice.actions.setSelectedDate(d.toISOString()),
              );
            }}
            style={{ marginTop: 'auto', marginBottom: 'auto' }}
          >
            <ChevronLeft width={14} height={14} />
          </Pressable>
          {/* This is right chevron */}
          <Pressable
            onPress={() => {
              const d = new Date(selectedDate);
              d.setMonth(d.getMonth() + 1);
              dispatch(
                selectedDateSlice.actions.setSelectedDate(d.toISOString()),
              );
            }}
            style={{ marginTop: 'auto', marginBottom: 'auto' }}
          >
            <ChevronRight width={14} height={14} />
          </Pressable>
        </View>
      </View>
      <View style={{ width }} key="Calendar_Body">
        <View style={{ flexDirection: 'row' }}>
          {daysInWeek.map(DOW => (
            <View
              key={`DOW_${DOW.id})}`}
              style={{
                width: width / 7,
                height: 20,
                alignItems: 'center',
                alignContent: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: Colors.black }} selectable={false}>
                {DOW.DOW}
              </Text>
            </View>
          ))}
        </View>
        <FlatList
          data={monthData}
          renderItem={value => (
            <CalendarRow
              width={width / 7}
              height={(height - 20) / 7}
              value={value}
              calendarWidth={width}
              key={`Row_${value.item[0].id}`}
            />
          )}
          scrollEnabled={false}
        />
      </View>
    </>
  );
}

export default function MonthViewMain({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  const monthData = useSelector((state: RootState) => state.monthData);
  const lastCalledDate = useSelector((state: RootState) => state.lastCalledSelectedDate);
  const selectedDate: string = useSelector(
    (state: RootState) => state.selectedDate,
  );
  /* Chosing between large mode with each day having expanded calendars and reduced mode with list of events on each day. */
  function getMonthDataEvents(): eventType[] {
    if (monthData.length !== 6) {
      return []
    }
    let firstIndex = Math.floor((new Date(selectedDate).getDate() + findFirstDayinMonth(new Date(selectedDate)))/7)
    let secondIndex = (new Date(selectedDate).getDate() + findFirstDayinMonth(new Date(selectedDate)))%7
    if (secondIndex !== 0) {
      secondIndex -= 1
    } else {
      secondIndex = 6
    }
    
    return monthData[firstIndex][secondIndex].events
  }
  
  if (width <= 519) {
    return (
      <ScrollView
        style={{
          backgroundColor: Colors.lightGray,
          height,
          width,
        }}
      >
        <MonthView width={width} height={height * 0.8} />
        <>
          {monthData.length === 6 && getMonthDataEvents().map(event => (
              <Pressable key={`${event.id}_${lastCalledDate}`} onPress={() => {
                store.dispatch(addEventSlice.actions.setIsShowingAddDate(true));
                store.dispatch(addEventSlice.actions.setSelectedEvent(event));
              }}>
                <Text style={{fontFamily: 'Roboto', padding: 2}}>{event.name}</Text>
              </Pressable>
            )
          )}
        </>
      </ScrollView>
    );
  }
  return (
    <View
      style={{
        backgroundColor: Colors.white,
        height,
        width,
      }}
    >
      <MonthView width={width} height={height} />
    </View>
  );
}
