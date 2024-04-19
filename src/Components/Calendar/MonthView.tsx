import createUUID from '@utils/ultility/createUUID';
import { selectedDateSlice } from '@redux/reducers/selectedDateReducer';
import store, { RootState } from '@redux/store';
import { Colors } from '@constants';
import React, { useEffect, useState } from 'react';
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
import {
  findFirstDayinMonth,
  isDateToday,
  isEventDuringInterval,
} from '@utils/calendar/calendarFunctions';
import { ChevronLeft, ChevronRight } from '../Icons';
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
            <CalendarRow
              width={width / 7}
              height={(height - 20) / 7}
              value={value}
              calendarWidth={width}
              key={`Row_${value.item.days[0].id}`}
            />
          )}
          scrollEnabled={false}
        />
      </View>
    </>
  );
}

// A list of events on the selected event to go under the calendar when the width is less than or equal to 519.
function ReducedMonthEvents({}: {}) {
  const selectedDate: string = useSelector(
    (state: RootState) => state.selectedDate,
  );
  const monthData = useSelector((state: RootState) => state.monthData);
  const lastCalledDate = useSelector(
    (state: RootState) => state.lastCalledSelectedDate,
  );
  const [longestWidth, setLongestWidth] = useState<number>(0);
  const [longestText, setLongestText] = useState<string>('');
  const [dayData, setDayData] = useState<monthEventType[][]>([]);
  function getDayData(): monthEventType[][] {
    if (monthData.length !== 6) {
      return [];
    }
    let firstIndex = Math.floor(
      (new Date(selectedDate).getDate() +
        findFirstDayinMonth(new Date(selectedDate))) /
        7,
    );
    let secondIndex =
      (new Date(selectedDate).getDate() +
        findFirstDayinMonth(new Date(selectedDate))) %
      7;
    if (
      (new Date(selectedDate).getDate() +
        findFirstDayinMonth(new Date(selectedDate))) %
        7 ===
      0
    ) {
      firstIndex -= 1;
    }
    if (secondIndex !== 0) {
      secondIndex -= 1;
    } else {
      secondIndex = 6;
    }
    const result = [];

    const checkStartDate = new Date(selectedDate);
    checkStartDate.setHours(0);
    checkStartDate.setMinutes(0);
    checkStartDate.setSeconds(0);
    const checkEndDate = new Date(checkStartDate);
    checkEndDate.setDate(checkEndDate.getDate() + 1);

    const newDayData = [...monthData[firstIndex].events]
      .filter(e => {
        return (
          e.paulyEventType !== 'studentSchedule' &&
          isEventDuringInterval({
            checkStart: checkStartDate.getTime(),
            checkEnd: checkEndDate.getTime() - 1000,
            event: e,
          })
        );
      })
      .sort(function (a, b) {
        return `${a.startTime}`.localeCompare(b.endTime);
      });
    let longestText = '';
    for (let index = 0; index < newDayData.length; index += 1) {
      if (getEventTime(newDayData[index]).length > longestText.length) {
        longestText = getEventTime(newDayData[index]);
      }
      if (
        index !== 0 &&
        ((newDayData[index].startTime === newDayData[index - 1].startTime &&
          newDayData[index].endTime === newDayData[index - 1].endTime) ||
          newDayData[index].allDay === newDayData[index - 1].allDay)
      ) {
        result[result.length - 1].push(newDayData[index]);
      } else {
        result.push([newDayData[index]]);
      }
    }
    setLongestText(longestText);
    console.log(result);
    return result;
  }
  function getEventTime(event: eventType) {
    if (event.allDay) {
      return 'all-day';
    }
    const startDate = new Date(event.startTime);
    if (startDate.getSeconds() === 0) {
      return startDate.toLocaleString('en-us', {
        hour: 'numeric',
        minute: 'numeric',
      });
    }
    return startDate.toLocaleString('en-us', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
  }

  useEffect(() => {
    setDayData(getDayData());
  }, [monthData, selectedDate]);

  return (
    <>
      <View>
        <Text
          style={{ height: 0, overflow: 'hidden', marginRight: 'auto' }}
          onLayout={e => {
            setLongestWidth(e.nativeEvent.layout.width + 5);
          }}
        >
          {longestText}
        </Text>
      </View>
      {dayData.map(row => (
        <View
          key={`${row[0].id}_${lastCalledDate}_Row`}
          style={{ flexDirection: 'row', marginBottom: 5 }}
        >
          <View style={{ marginLeft: 5, width: longestWidth }}>
            {row.length >= 1 ? <Text>{getEventTime(row[0])} </Text> : null}
          </View>
          <View>
            {row.map(event => (
              <Pressable
                key={`${event.id}_${lastCalledDate}_${selectedDate}`}
                onPress={() => {
                  store.dispatch(
                    addEventSlice.actions.setIsShowingAddDate(true),
                  );
                  store.dispatch(addEventSlice.actions.setSelectedEvent(event));
                }}
                style={{
                  flexDirection: 'row',
                  borderLeftColor: Colors.maroon,
                  borderLeftWidth: 2,
                  marginLeft: 5,
                }}
              >
                <Text style={{ fontFamily: 'Roboto', padding: 2 }}>
                  {event.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}
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
        <ReducedMonthEvents />
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
