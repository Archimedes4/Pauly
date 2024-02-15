import createUUID from '@utils/ultility/createUUID';
import { selectedDateSlice } from '@redux/reducers/selectedDateReducer';
import { RootState } from '@redux/store';
import { Colors } from '@constants';
import React, { useEffect } from 'react';
import {
  FlatList,
  ListRenderItemInfo,
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

// Take the current date and selected date and converts to a date string then removes the day of week and day in month and conpares
// example Date() -> Sun Jan 01 2023 -> Jan 2023
function isDateToday(selectedDate: string): boolean {
  const selectDate = new Date(selectedDate).toDateString();
  const newDate = new Date().toDateString();
  const selectMonthYear = selectDate.slice(4, 7) + selectDate.slice(10, 15);
  const newMonthYear = newDate.slice(4, 7) + newDate.slice(10, 15);
  return selectMonthYear === newMonthYear;
}

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
}: {
  value: ListRenderItemInfo<monthDataType>;
  width: number;
  height: number;
  calendarWidth: number;
}) {
  const selectedDate = useSelector((state: RootState) => state.selectedDate);
  const dispatch = useDispatch();
  function pressCalendar() {
    const d = new Date();
    d.setFullYear(
      new Date(selectedDate).getFullYear(),
      new Date(selectedDate).getMonth(),
      value.item.dayData,
    );
    dispatch(selectedDateSlice.actions.setSelectedDate(d.toISOString()));
  }
  if (calendarWidth <= 519 && value.item.showing) {
    return (
      <Pressable
        style={{
          width,
          height,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: height / 2,
          backgroundColor: getBackgroundColor(selectedDate, value.item.dayData),
        }}
        onPress={() => pressCalendar()}
      >
        <Text
          style={{
            color: getTextBackgroundColor(selectedDate, value.item.dayData),
          }}
        >
          {value.item.dayData}
        </Text>
        {value.item.events.length >= 1 ? (
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
  if (value.item.showing) {
    return (
      <Pressable
        style={{
          width,
          height,
          borderWidth: 1,
          borderTopWidth: value.index < 7 ? 2 : 1,
          borderColor: Colors.lightGray,
          padding: 2,
        }}
        onPress={() => {
          pressCalendar();
          dispatch(addEventSlice.actions.setIsShowingAddDate(true));
          const startDate = new Date(selectedDate);
          startDate.setDate(value.item.dayData);
          const endDate = new Date(selectedDate);
          endDate.setDate(value.item.dayData);
          endDate.setHours(endDate.getHours() + 1);
          dispatch(addEventSlice.actions.setStartDate(startDate.toISOString()));
          dispatch(addEventSlice.actions.setEndDate(endDate));
        }}
      >
        <View
          style={{
            borderRadius: 50,
            width: 16,
            height: 16,
            backgroundColor: isCalendarTextColor(
              selectedDate,
              value.item.dayData,
            )
              ? 'red'
              : 'transparent',
            alignContent: 'center',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: isCalendarTextColor(selectedDate, value.item.dayData)
                ? Colors.white
                : Colors.black,
              fontWeight: isCalendarTextColor(selectedDate, value.item.dayData)
                ? 'bold'
                : 'normal',
            }}
          >
            {value.item.dayData}
          </Text>
        </View>
        <ScrollView style={{ width, height: height * 0.8 }}>
          {value.item.events.map((event: eventType) => (
            <Pressable
              key={`Calendar_Event_${event.id}`}
              onPress={() => {
                dispatch(addEventSlice.actions.setIsShowingAddDate(true));
                dispatch(addEventSlice.actions.setSelectedEvent(event));
              }}
            >
              <Text style={{ fontSize: 10 }}>{event.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </Pressable>
    );
  }
  return (
    <View
      style={{
        width,
        height,
        borderWidth: 1,
        borderTopWidth: value.index < 7 ? 2 : 1,
        borderColor: Colors.lightGray,
      }}
    />
  );
}

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
          alignContent: 'center',
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
            <CalendarCardView
              width={width / 7}
              height={(height - 20) / 7}
              value={value}
              calendarWidth={width}
              key={`CalendarButton_${value.item.id}`}
            />
          )}
          numColumns={7}
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
  const selectedDate: string = useSelector(
    (state: RootState) => state.selectedDate,
  );
  /* Chosing between large mode with each day having expanded calendars and reduced mode with list of events on each day. */
  if (width <= 519) {
    return (
      <ScrollView
        style={{
          backgroundColor: Colors.white,
          height,
          width,
        }}
      >
        <MonthView width={width} height={height * 0.8} />
        {new Date(selectedDate).getDate() <= monthData.length ? (
          <>
            {monthData[new Date(selectedDate).getDate() - 1].events.map(
              event => (
                <View key={event.id}>
                  <Text>{event.name}</Text>
                </View>
              ),
            )}
          </>
        ) : null}
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
