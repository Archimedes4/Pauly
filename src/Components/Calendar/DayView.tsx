/*
  Pauly
  Andrew Mainella
  July 7 2023
  DayView.tsx
  This holds the events as a day meaning each hour is represented and a red line is present at the current time.
*/

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  useColorScheme,
  Text,
  Pressable,
} from 'react-native';
import { useSelector } from 'react-redux';
import {
  findTimeOffset,
  isDateToday,
  isEventDuringInterval,
} from '@utils/calendar/calendarFunctions';
import store, { RootState } from '@redux/store';
import { Colors } from '@constants';
import dayCurrentTimeLine from '@hooks/dayCurrentTimeLine';
import useTimeHidden from '@hooks/useTimeHidden';
import { addEventSlice } from '@redux/reducers/addEventReducer';
import DayEventBlock from './DayEventBlock';
import { UpIcon } from '../Icons';

function CurrentTimeLine({
  day,
  width,
  height,
  highestHorizontalOffset,
}: {
  day: Date;
  width: number;
  height: number;
  highestHorizontalOffset: number;
}) {
  const [timeWidth, setTimeWidth] = useState<number>(0);
  const dayData = dayCurrentTimeLine(height);
  if (isDateToday(day)) {
    return (
      <View
        style={{
          position: 'absolute',
          top: dayData.heightOffsetTop,
          height: height * 0.005,
          width: width * highestHorizontalOffset,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Text
          onLayout={e => {
            setTimeWidth(e.nativeEvent.layout.width);
          }}
          selectable={false}
          style={{ color: 'red', zIndex: 2 }}
        >
          {dayData.currentTime}
        </Text>
        <View
          style={{
            backgroundColor: 'red',
            width: width * highestHorizontalOffset - timeWidth - 2,
            height: 6,
            position: 'absolute',
            right: 0,
            borderRadius: 15,
          }}
        />
      </View>
    );
  }
  return null;
}

export default function DayView({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  const colorScheme = useColorScheme();
  const currentEvents = useSelector((state: RootState) => state.currentEvents);
  const selectedDate = useSelector((state: RootState) => state.selectedDate);
  const [hourLength, setHourLength] = useState<number>(0);
  const hoursText: string[] = [
    '12AM',
    '1AM',
    '2AM',
    '3AM',
    '4AM',
    '5AM',
    '6AM',
    '7AM',
    '8AM',
    '9AM',
    '10AM',
    '11AM',
    '12PM',
    '1PM',
    '2PM',
    '3PM',
    '4PM',
    '5PM',
    '6PM',
    '7PM',
    '8PM',
    '9PM',
    '10PM',
    '11PM',
  ];
  const mainScrollRef = useRef<ScrollView>(null);
  const [dayEvents, setDayEvents] = useState<dayEvent[]>([]);
  const [highestHorizontalOffset, setHighestHorizontalOffset] =
    useState<number>(1);
  const [allDayEventsExpanded, setAllDayEventsExpanded] =
    useState<boolean>(false);
  const [allDayEvents, setAllDayEvents] = useState<eventType[]>([]);
  const hiddenTime = useTimeHidden();
  const [hourTextWidth, setHourTextWidth] = useState<number>(0);
  const [hourTextHeight, setHourTextHeight] = useState<number>(0);

  const getDayEvents = useCallback(() => {
    let dayEvents = [];
    for (let index = 0; index < currentEvents.length; index += 1) {
      if (
        isEventDuringInterval({ selectedDate, event: currentEvents[index] }) &&
        !currentEvents[index].allDay
      ) {
        dayEvents.push(currentEvents[index]);
      }
    }

    dayEvents = dayEvents.sort((a, b) => {
      return a.startTime.localeCompare(b.startTime);
    });
    const result: dayEvent[] = [];
    let busy: {
      start: string;
      end: string;
    }[][] = [];
    let highestHorizontalOffsetTemp = 0;
    for (let index = 0; index < dayEvents.length; index += 1) {
      if (busy.length == 0) {
        busy = [[]];
        busy[0].push({
          start: dayEvents[index].startTime,
          end: dayEvents[index].endTime,
        });
        result.push({
          event: dayEvents[index],
          horizontalOffset: 0,
        });
      } else {
        let numberOfOffsets = 0;
        let len = busy[numberOfOffsets].length;
        for (let busyIndex = 0; busyIndex < len; busyIndex += 1) {
          if (
            new Date(dayEvents[index].startTime) <
              new Date(busy[numberOfOffsets][busyIndex].start) &&
            new Date(dayEvents[index].endTime) >=
              new Date(busy[numberOfOffsets][busyIndex].end)
          ) {
            // Starts before and ends after check
            // it is busy duing this time
            numberOfOffsets += 1;
            busyIndex = -1;
          } else if (
            new Date(dayEvents[index].startTime) >=
              new Date(busy[numberOfOffsets][busyIndex].start) &&
            new Date(dayEvents[index].startTime) <=
              new Date(busy[numberOfOffsets][busyIndex].end)
          ) {
            // Starts after check and ends before or on check
            // it is busy duing this time
            numberOfOffsets += 1;
            busyIndex = -1;
          }
          if (busy.length <= numberOfOffsets) {
            busy.push([]);
            break;
          }
          len = busy[numberOfOffsets].length;
        }
        if (numberOfOffsets > highestHorizontalOffsetTemp) {
          highestHorizontalOffsetTemp = numberOfOffsets;
        }
        busy[numberOfOffsets].push({
          start: dayEvents[index].startTime,
          end: dayEvents[index].endTime,
        });
        result.push({
          event: dayEvents[index],
          horizontalOffset: numberOfOffsets,
        });
      }
    }
    setHighestHorizontalOffset(highestHorizontalOffsetTemp + 1);
    setDayEvents(result);
  }, [selectedDate, currentEvents]);

  const loadCalendarContent = useCallback(() => {
    const currentDate = new Date();
    const resultHeightTopOffset = findTimeOffset(currentDate, height);
    mainScrollRef.current?.scrollTo({
      x: 0,
      y: resultHeightTopOffset,
      animated: false,
    });
  }, [height]);

  useEffect(() => {
    setHourLength(height * 0.1);
    loadCalendarContent();
  }, [height, loadCalendarContent]);

  useEffect(() => {
    if (currentEvents.length > 0) {
      getDayEvents();
    } else {
      setDayEvents([]);
    }
    setAllDayEvents(
      currentEvents.filter(e => {
        return (
          e.allDay === true &&
          new Date(e.startTime).getDate() === new Date(selectedDate).getDate()
        );
      }),
    );
  }, [selectedDate, currentEvents]);

  return (
    <>
      {allDayEvents.length >= 1 ? (
        <Pressable
          onPress={() => {
            setAllDayEventsExpanded(!allDayEventsExpanded);
          }}
          style={{
            position: 'absolute',
            backgroundColor: `${Colors.white}75`,
            width,
            zIndex: 3,
          }}
        >
          {allDayEvents.length >= 2 && !allDayEventsExpanded ? (
            <View
              style={{
                backgroundColor: Colors.lightGray,
                borderRadius: 15,
                padding: 5,
              }}
            >
              <Text>{allDayEvents.length} all day events</Text>
            </View>
          ) : (
            <View>
              {allDayEvents.map(event => (
                <Pressable
                  key={event.id}
                  onPress={() => {
                    store.dispatch(
                      addEventSlice.actions.setIsShowingAddDate(true),
                    );
                    store.dispatch(
                      addEventSlice.actions.setSelectedEvent(event),
                    );
                  }}
                  style={{
                    backgroundColor: Colors.lightGray,
                    borderRadius: 15,
                    padding: 5,
                    margin: 5,
                  }}
                >
                  <Text style={{ fontFamily: 'Roboto' }}>{event.name}</Text>
                </Pressable>
              ))}
              <Pressable
                onPress={() => {
                  setAllDayEventsExpanded(!allDayEventsExpanded);
                }}
                style={{
                  flexDirection: 'row',
                  backgroundColor: Colors.white,
                  borderWidth: 1,
                  borderColor: Colors.black,
                  borderRadius: 15,
                  padding: 5,
                  margin: 5,
                }}
              >
                <UpIcon width={14} height={14} />
                <Text style={{ marginLeft: 3 }}>Close</Text>
              </Pressable>
            </View>
          )}
        </Pressable>
      ) : null}
      <ScrollView
        ref={mainScrollRef}
        contentContainerStyle={{
          height: hourLength * 24,
        }}
      >
        <ScrollView
          contentContainerStyle={{
            width: width * highestHorizontalOffset,
          }}
          style={{
            width,
          }}
          horizontal
        >
          <View>
            {hoursText.map(value => (
              <View
                key={`${value}_${selectedDate}`}
                style={{ flexDirection: 'row', height: hourLength }}
              >
                {value !== hiddenTime ? (
                  <Text
                    selectable={false}
                    style={{
                      color:
                        colorScheme == 'dark' ? Colors.white : Colors.black,
                      position: 'absolute',
                      left: 0,
                      top: -hourTextHeight,
                    }}
                    onLayout={e => {
                      if (value === '12PM') {
                        if (e.nativeEvent.layout.height - 6 >= 0) {
                          setHourTextHeight(
                            (e.nativeEvent.layout.height - 6) / 2,
                          );
                        }
                        setHourTextWidth(e.nativeEvent.layout.width + 4);
                      }
                    }}
                  >
                    {value}
                  </Text>
                ) : null}
                <View
                  style={{
                    backgroundColor: Colors.black,
                    width: highestHorizontalOffset * width - hourTextWidth,
                    height: 6,
                    position: 'absolute',
                    left: hourTextWidth,
                    borderRadius: 25,
                  }}
                />
              </View>
            ))}
            {dayEvents.map(event => {
              if (!event.event.allDay) {
                return (
                  <DayEventBlock
                    key={event.event.id}
                    event={event.event}
                    width={width}
                    height={height}
                    horizontalShift={event.horizontalOffset}
                    hourTextWidth={hourTextWidth}
                  />
                );
              }
              return null;
            })}
            <CurrentTimeLine
              day={new Date(selectedDate)}
              width={width}
              height={height}
              highestHorizontalOffset={highestHorizontalOffset}
            />
          </View>
        </ScrollView>
      </ScrollView>
    </>
  );
}
