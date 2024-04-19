import { Colors, calendarViewingMode } from '@constants';
import { addEventSlice } from '@redux/reducers/addEventReducer';
import { monthDataSlice } from '@redux/reducers/monthDataReducer';
import { selectedDateSlice } from '@redux/reducers/selectedDateReducer';
import store, { RootState } from '@redux/store';
import getEventTop from '@utils/calendar/getEventTop';
import {
  findFirstDayEventWeek,
  findFirstDayinMonth,
  getDateWithDay,
  getWeekLengthOfEvent,
} from '@utils/calendar/calendarFunctions';
import React, { useEffect, useState } from 'react';
import {
  ListRenderItemInfo,
  Pressable,
  View,
  Text,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

function getCardHeight(calendarWidth: number, valueHeight: number, height: number, calendarViewMode: calendarViewingMode) {
  if (calendarWidth > 519 && calendarViewMode === calendarViewingMode.full && valueHeight < height) {
    return height
  }
  if (calendarWidth > 519) {
    return valueHeight
  }
  return height
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
  calendarWidth,
  height,
}: {
  value: monthDataType;
  width: number;
  calendarWidth: number;
  height: number;
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
      >
        <Text
          style={{
            color: getTextBackgroundColor(selectedDate, value.dayData),
          }}
        >
          {value.dayData}
        </Text>
        {value.hasEvents ? (
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
          height,
          zIndex: 10,
        }}
      >
        <View
          style={{
            width,
            height,
            borderWidth: 1,
            borderBottomWidth: 0,
            borderTopWidth: 0,
            borderColor: Colors.lightGray,
            position: 'absolute',
            zIndex: -10,
          }}
        />
        <Pressable
          style={{
            width,
            minHeight: height,
            padding: 2,
            position: 'absolute',
            zIndex: 100,
          }}
          onPress={() => {
            pressCalendar();
            dispatch(addEventSlice.actions.setIsShowingAddDate(true));
            const startDate = new Date(selectedDate);
            startDate.setDate(value.dayData);
            const endDate = new Date(selectedDate);
            endDate.setDate(value.dayData);
            endDate.setHours(endDate.getHours() + 1);
            dispatch(
              addEventSlice.actions.setStartDate(startDate.toISOString()),
            );
            dispatch(addEventSlice.actions.setEndDate(endDate));
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
        </Pressable>
      </View>
    );
  }
  return (
    <View
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

function CalendarRowEvent({
  event,
  value,
  width,
}: {
  event: monthEventType;
  value: ListRenderItemInfo<monthRowType>;
  width: number;
}) {
  const [eventHeight, setEventHeight] = useState<number>(0);
  const dispatch = useDispatch();
  const selectedDate = useSelector((state: RootState) => state.selectedDate);
  const [mounted, setMounted] = useState<boolean>(false);
  const [heightMounted, setHeightMounted] = useState<boolean>(true);

  function loadData() {
    if (!mounted) {
      return;
    }
    if (!heightMounted) {
      setHeightMounted(true);
      return;
    }
    const newEventHeight =
      getEventTop(value.item.events, event, selectedDate, value.item.days) + 21;
    if (newEventHeight + (event.height ?? 0) + 3 > value.item.height) {
      dispatch(
        monthDataSlice.actions.setRowHeight({
          rowIndex: value.index,
          height: newEventHeight + (event.height ?? 0) + 6,
        }),
      );
      setHeightMounted(false);
    }
    if (eventHeight !== newEventHeight) {
      setEventHeight(newEventHeight);
    }
  }

  useEffect(() => {
    loadData();
  }, [value.item, event, selectedDate, mounted, loadData]);

  if (event.paulyEventType !== 'studentSchedule') {
    return (
      <Pressable
        key={`Calendar_Event_${event.id}`}
        onPress={() => {
          dispatch(addEventSlice.actions.setIsShowingAddDate(true));
          dispatch(addEventSlice.actions.setSelectedEvent(event));
        }}
        style={{
          width:
            width *
              getWeekLengthOfEvent(
                event,
                getDateWithDay(
                  selectedDate,
                  findFirstDayEventWeek(event, value.item.days),
                ),
              ) -
            10,
          backgroundColor: Colors.darkGray,
          padding: 5,
          borderRadius: 15,
          margin: 3,
          zIndex: 100,
          left:
            width *
            (findFirstDayEventWeek(event, value.item.days) -
              value.index * 7 +
              findFirstDayinMonth(new Date(selectedDate)) -
              1),
          top: eventHeight,
          position: 'absolute',
          opacity: event.height !== 0 ? 1 : 0,
        }}
        onLayout={e => {
          if (
            event.height === undefined ||
            event.height !== e.nativeEvent.layout.height
          ) {
            store.dispatch(
              monthDataSlice.actions.setEventHeight({
                rowIndex: value.index,
                eventIndex: value.item.events.findIndex(x => {
                  return x.id === event.id;
                }),
                height: e.nativeEvent.layout.height,
              }),
            );
          }
          setMounted(true);
        }}
      >
        <Text style={{ fontSize: 10, color: Colors.white }}>{event.name}</Text>
      </Pressable>
    );
  }
  return null;
}

export default function CalendarRow({
  value,
  width,
  height,
  calendarWidth,
}: {
  value: ListRenderItemInfo<monthRowType>;
  width: number;
  height: number;
  calendarWidth: number;
}) {
  const [isOverflow, setIsOverflow] = useState<boolean>(true);
  const calendarViewMode = useSelector((state: RootState) => state.paulySettings.calendarViewingMode);
  useEffect(() => {
    if (calendarViewMode === calendarViewingMode.full || calendarViewMode === calendarViewingMode.fullRemoved) {
      setIsOverflow(false)
      return
    }
    if (value.item.height === 0) {
      store.dispatch(
        monthDataSlice.actions.setRowHeight({
          rowIndex: value.index,
          height,
        }),
      );
    }
    if (height >= value.item.height) {
      setIsOverflow(false);
    } else {
      setIsOverflow(true);
    }
  }, [value.item.height, height]);
  if (calendarViewMode === calendarViewingMode.full || calendarViewMode === calendarViewingMode.fullRemoved) {
    return (
      <View
        style={{
          minHeight: (calendarViewMode === calendarViewingMode.full) ? height:0,
          borderTopWidth:
            width <= 74.14285714285714 ? 0 : value.index === 0 ? 2 : 1,
          borderColor: Colors.lightGray,
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          {value.item.days.map((day, dayIndex) => (
            <CalendarCardView
              key={`${value.item.days[dayIndex].id}Card`}
              value={day}
              width={width}
              calendarWidth={calendarWidth}
              height={getCardHeight(calendarWidth, value.item.height, height, calendarViewMode)}
            />
          ))}
          {calendarWidth > 519 &&
            [...value.item.events]
              .sort((a, b) => {
                return a.order - b.order;
              })
              .map((event: monthEventType) => (
                <CalendarRowEvent
                  key={`Week_${value.index}_${event.id}`}
                  event={event}
                  value={value}
                  width={width}
                />
              ))}
        </View>
      </View>
    );
  }
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
        {value.item.days.map((day, dayIndex) => (
          <CalendarCardView
            key={`${value.item.days[dayIndex].id}Card`}
            value={day}
            width={width}
            calendarWidth={calendarWidth}
            height={getCardHeight(calendarWidth, value.item.height, height, calendarViewMode)}
          />
        ))}
        {calendarWidth > 519 &&
          [...value.item.events]
            .sort((a, b) => {
              return a.order - b.order;
            })
            .map((event: monthEventType) => (
              <CalendarRowEvent
                key={`Week_${value.index}_${event.id}`}
                event={event}
                value={value}
                width={width}
              />
            ))}
      </View>
    </ScrollView>
  );
}
