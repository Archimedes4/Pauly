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
  ScrollView,
  useWindowDimensions,
  FlatList,
  ListRenderItemInfo,
} from 'react-native';
import React, { useCallback, useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useDispatch, useSelector } from 'react-redux';
import createUUID from '../../Functions/ultility/createUUID';
import Week from '../../components/Calendar/Week';
import AddEvent from '../../components/Calendar/AddEvent';
import CalendarTypePicker from '../../UI/CalendarTypePicker';
import { AddIcon, ChevronLeft, ChevronRight } from '../../UI/Icons/Icons';
import { RootState } from '../../Redux/store';
import { selectedDateSlice } from '../../Redux/reducers/selectedDateReducer';
import { Colors, calendarMode } from '../../types';
import { safeAreaColorsSlice } from '../../Redux/reducers/safeAreaColorsReducer';
import BackButton from '../../UI/BackButton';
import { addEventSlice } from '../../Redux/reducers/addEventReducer';
import { getClasses } from '../../Functions/classesFunctions';
import getEvents from '../../Functions/calendar/getEvents';
import { getMonthData } from '../../Functions/calendar/calendarFunctionsGraph';
import EventView from '../../components/Calendar/EventView';

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
          dispatch(addEventSlice.actions.setStartDate(startDate));
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
                dispatch(addEventSlice.actions.setIsEditing(true));
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
  const [fontsLoaded] = useFonts({
    // eslint-disable-next-line global-require
    BukhariScript: require('../../assets/fonts/BukhariScript.ttf'),
  });

  useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    getMonthData(new Date(selectedDate));
  }, [selectedDate, currentEvents]);

  if (!fontsLoaded) {
    return null;
  }

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
          {new Date(selectedDate).toDateString() !==
          new Date().toDateString() ? (
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
              const d = new Date();
              d.setFullYear(
                new Date(selectedDate).getMonth() === 1
                  ? new Date(selectedDate).getFullYear() - 1
                  : new Date(selectedDate).getFullYear(),
                new Date(selectedDate).getMonth() === 1
                  ? 12
                  : new Date(selectedDate).getMonth() - 1,
                new Date(selectedDate).getDay(),
              );
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
              const d = new Date();
              d.setFullYear(
                new Date(selectedDate).getMonth() === 12
                  ? new Date(selectedDate).getFullYear() + 1
                  : new Date(selectedDate).getFullYear(),
                new Date(selectedDate).getMonth() === 12
                  ? 1
                  : new Date(selectedDate).getMonth() + 1,
                new Date(selectedDate).getDay(),
              );
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
              <Text style={{ color: 'black' }} selectable={false}>
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

function MonthViewMain({ width, height }: { width: number; height: number }) {
  const monthData = useSelector((state: RootState) => state.monthData);
  const selectedDate: string = useSelector(
    (state: RootState) => state.selectedDate,
  );
  return (
    <>
      {/* Chosing between large mode with each day having expanded calendars and reduced mode with list of events on each day. */}
      {width <= 519 ? (
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
      ) : (
        <View
          style={{
            backgroundColor: Colors.white,
            height,
            width,
          }}
        >
          <MonthView width={width} height={height} />
        </View>
      )}
    </>
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
    BukhariScript: require('../../assets/fonts/BukhariScript.ttf'),
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
          <BackButton to="/" style={{ zIndex: 100 }} />
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
