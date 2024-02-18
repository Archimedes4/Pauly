/*
  Pauly
  Andrew Mainella
  July 7 2023
  DayView.tsx
  This holds the events as a day meaning each hour is represented and a red line is present at the current time.
*/

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, ScrollView, useColorScheme, Text, FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import {
  calculateIfShowing,
  computeEventHeight,
  findTimeOffset,
  isDateToday,
  isEventDuringInterval,
} from '@utils/calendar/calendarFunctions';
import { RootState } from '@redux/store';
import createUUID from '@utils/ultility/createUUID';
import { Colors, loadingStateEnum } from '@constants';
import { getClassEventsFromDay } from '@utils/classesFunctions';
import dayCurrentTimeLine from '@src/hooks/dayCurrentTimeLine';


function CurrentTimeLine({day, width, height, highestHorizontalOffset}:{day: Date, width: number, height: number, highestHorizontalOffset: number}) {
  const [timeWidth, setTimeWidth] = useState<number>(0)
  const dayData = dayCurrentTimeLine(height)

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
        <Text onLayout={(e) => {
          setTimeWidth(e.nativeEvent.layout.width)
        }} selectable={false} style={{ color: 'red', zIndex: 2 }}>
          {dayData.currentTime}
        </Text>
        <View
          style={{
            backgroundColor: 'red',
            width: (width * highestHorizontalOffset) - timeWidth - 2,
            height: 6,
            position: 'absolute',
            right: 0,
            borderRadius: 15
          }}
        />
      </View>
    )
  }
  return null
}

export default function DayView({
  width,
  height
}:
  | {
      width: number;
      height: number;
    }) {
  const colorScheme = useColorScheme();
  const currentEvents = useSelector((state: RootState) => state.currentEvents);
  const selectedDate = useSelector((state: RootState) => state.selectedDate);
  const [heightOffsetTop, setHeightOffsetTop] = useState<number>(0);
  const [currentMinuteInt, setCurrentMinuteInt] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<string>('12:00');
  const [isShowingTime, setIsShowingTime] = useState<boolean>(true);
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
  const [schoolEvents, setSchoolEvents] = useState<eventType[]>();
  const [dayEvents, setDayEvents] = useState<dayEvent[]>([]);
  const [highestHorizontalOffset, setHighestHorizontalOffset] = useState<number>(1);
  const [textWidth, setTextWidth] = useState<number>(0);

  function setCurrentTimeFunction(hour: number, minuite: number) {
    if (hour === 12) {
      setCurrentTime(`12:${minuite.toString().padStart(2, "0")}`);
    } else {
      setCurrentTime(`${(hour % 12).toString()}:${minuite.toString().padStart(2, "0")}`);
    }
  }

  const getDayEvents = useCallback(() => {
    let allEvents = (schoolEvents !== undefined) ? [...currentEvents, ...schoolEvents]:[...currentEvents]
    let dayEvents = [];
    for (let index = 0; index < allEvents.length; index += 1) {
      if (isEventDuringInterval(selectedDate, allEvents[index]) && !allEvents[index].allDay) {
        dayEvents.push(allEvents[index]);
      }
    }
    dayEvents = dayEvents.sort((a, b) => {
      return a.startTime.localeCompare(b.startTime);
    });
    console.log("\nStart\n\n\nDay Events:", dayEvents)
    const result: dayEvent[] = [];
    let busy: {
      start: string,
      end: string 
    }[][] = []
    let highestHorizontalOffsetTemp = 0;
    for (let index = 0; index < dayEvents.length; index += 1) {
      console.log(`\n Busy: ${JSON.stringify(busy)} \nEvent: ${dayEvents[index].name}`)
      if (busy.length == 0) {
        busy = [[]]
        busy[0].push({
          start: dayEvents[index].startTime,
          end: dayEvents[index].endTime
        })
        result.push({
          event: dayEvents[index],
          horizontalOffset: 0,
        });
      } else {
        let numberOfOffsets = 0
        for (let busyIndex = 0, len = busy[numberOfOffsets].length;busyIndex < len; busyIndex += 1) {
          if (new Date(dayEvents[index].startTime) < new Date(busy[numberOfOffsets][busyIndex].start) && new Date(dayEvents[index].endTime) >= new Date(busy[numberOfOffsets][busyIndex].end)) {
            // Starts before and ends after check
            // it is busy duing this time
            numberOfOffsets += 1;
            busyIndex = -1
          } else if (new Date(dayEvents[index].startTime) >= new Date(busy[numberOfOffsets][busyIndex].start) && new Date(dayEvents[index].startTime) <= new Date(busy[numberOfOffsets][busyIndex].end)) {
            // Starts after check and ends before or on check
            // it is busy duing this time
            numberOfOffsets += 1;
            busyIndex = -1
          }
          if (busy.length <= numberOfOffsets) {
            busy.push([])
            break
          }
        }
        if (numberOfOffsets > highestHorizontalOffsetTemp) {
          highestHorizontalOffsetTemp = numberOfOffsets
        }
        busy[numberOfOffsets].push({
          start: dayEvents[index].startTime,
          end: dayEvents[index].endTime
        })
        result.push({
          event: dayEvents[index],
          horizontalOffset: numberOfOffsets,
        });
      }
    }
    console.log(`result: `, result, `\nHighest: ${highestHorizontalOffsetTemp}`)
    setHighestHorizontalOffset(highestHorizontalOffsetTemp + 1)
    setDayEvents(result);
  }, [selectedDate, currentEvents, schoolEvents])

  const loadCalendarContent = useCallback(() => {
    const currentDate = new Date();
    const resultHeightTopOffset = findTimeOffset(currentDate, height);
    setHeightOffsetTop(resultHeightTopOffset);
    const minuiteInt: number = currentDate.getMinutes();
    setCurrentMinuteInt(minuiteInt);
    const hourInt = currentDate.getHours();
    setCurrentTimeFunction(hourInt, minuiteInt);
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

  async function getClassesEvents() {
    const result = await getClassEventsFromDay();
    if (result.result === loadingStateEnum.success) {
      setSchoolEvents(result.data);
    }
    if (currentEvents.length > 0) {
      getDayEvents();
    } else {
      setDayEvents([])
    }
  }

  useEffect(() => {
    getClassesEvents();
  }, [selectedDate, currentEvents]);

  return (
    <ScrollView
      ref={mainScrollRef}
      contentContainerStyle={{
        height:hourLength * 24,
      }}
    >
      <ScrollView
        contentContainerStyle={{
          width: width * highestHorizontalOffset,
        }}
        style={{
          width: width
        }}
        horizontal
      >
        <View>
          <>
            {isShowingTime ? (
              <>
                {hoursText.map(value => (
                  <View
                    key={`${value}`}
                    style={{ flexDirection: 'row', height: hourLength }}
                  >
                    {calculateIfShowing(value, new Date(selectedDate)) ? (
                      <Text
                        selectable={false}
                        style={{
                          color:
                            colorScheme == 'dark' ? Colors.white : Colors.black,
                        }}
                        onLayout={(e) => {
                          if (e.nativeEvent.layout.width >= textWidth) {
                            setTextWidth(e.nativeEvent.layout.width)
                          }
                        }}
                      >
                        {value}
                      </Text>
                    ) : null}
                    <View
                      style={{
                        backgroundColor: Colors.black,
                        width: width * 0.9 + (highestHorizontalOffset * width),
                        height: 6,
                        position: 'absolute',
                        left: textWidth,
                        borderRadius: 25,
                      }}
                    />
                  </View>
                ))}
              </>
            ) : null}
          </>
          {dayEvents.map(event => {
            if (!event.event.allDay) {
              return (
                <EventBlock
                  key={event.event.id}
                  event={event.event}
                  width={width}
                  height={height}
                  horizontalShift={event.horizontalOffset}
                />
              );
            }
            return null;
          })}
          <CurrentTimeLine day={new Date(selectedDate)} width={width} height={height} highestHorizontalOffset={highestHorizontalOffset} />
        </View>
      </ScrollView>
    </ScrollView>
  );
}

function EventBlock({
  event,
  width,
  height,
  horizontalShift
}: {
  event: eventType;
  width: number;
  height: number;
  horizontalShift: number;
}) {
  const EventHeight = computeEventHeight(
    new Date(event.startTime),
    new Date(event.endTime),
    height,
  );
  const Offset = findTimeOffset(new Date(event.startTime), height);

  return (
    <View
      key={`Event_${createUUID()}`}
      style={{
        width: width * 0.9,
        height: EventHeight,
        top: Offset,
        left: horizontalShift * width,
        position: 'absolute',
        right: 0,
        borderColor: Colors.maroon,
        borderLeftWidth: 3,
      }}
    >
      <View
        style={{
          width: width * 0.9,
          height: EventHeight,
          position: 'absolute',
          backgroundColor: event.eventColor,
          opacity: 0.3,
          zIndex: -1,
        }}
      />
      <Text style={{ opacity: 1 }}>{event.name}</Text>
      <Text>
        {new Date(event.startTime).toLocaleString('en-us', {
          hour: 'numeric',
          minute: 'numeric',
        })}{' '}
        to{' '}
        {new Date(event.endTime).toLocaleString('en-us', {
          hour: 'numeric',
          minute: 'numeric',
        })}
      </Text>
    </View>
  );
}
