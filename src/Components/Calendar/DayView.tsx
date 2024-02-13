/*
  Pauly
  Andrew Mainella
  July 7 2023
  DayView.tsx
  This holds the events as a day meaning each hour is represented and a red line is present at the current time.
*/

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, ScrollView, useColorScheme, Text } from 'react-native';
import { useSelector } from 'react-redux';
import {
  calculateIfShowing,
  computeEventHeight,
  findTimeOffset,
  isDateToday,
  isEventDuringInterval,
  isTimeOnDay,
} from '@utils/calendar/calendarFunctions';
import { RootState } from '@redux/store';
import createUUID from '@utils/ultility/createUUID';
import { Colors, loadingStateEnum } from '@constants';
import { getClassEventsFromDay } from '@utils/classesFunctions';

export default function DayView({
  width,
  height,
  week,
  start,
}:
  | {
      width: number;
      height: number;
      week?: undefined;
      start?: undefined;
    }
  | {
      width: number;
      height: number;
      week: true;
      start: boolean;
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

  function setCurrentTimeFunction(hour: number, minuite: number) {
    if (minuite.toString().length === 1) {
      if (hour === 12) {
        setCurrentTime(`12:0${minuite.toString()}`);
      } else {
        setCurrentTime(`${(hour % 12).toString()}:0${minuite.toString()}`);
      }
    } else if (hour === 12) {
      setCurrentTime(`12:${minuite}`);
    } else {
      setCurrentTime(`${(hour % 12).toString()}:${minuite.toString()}`);
    }
  }

  async function getDayEvents() {
    let dayEvents = [];
    for (let index = 0; index < currentEvents.length; index += 1) {
      if (isEventDuringInterval(selectedDate, currentEvents[index])) {
        dayEvents.push(currentEvents[index]);
      }
    }
    dayEvents = dayEvents.sort((a, b) => {
      return a.startTime.localeCompare(b.startTime);
    });
    console.log(dayEvents);
    const result: dayEvent[] = [];
    for (let index = 0; index < dayEvents.length; index += 1) {
      result.push({
        event: [dayEvents[index]],
        offset: findTimeOffset(new Date(dayEvents[index].startTime), height),
      });
    }
    setDayEvents(result);
  }

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

  // https://stackoverflow.com/questions/65049812/how-to-call-a-function-every-minute-in-a-react-component
  // Upadtes every second
  useEffect(() => {
    const interval = setInterval(() => {
      const minuiteInt = new Date().getMinutes();
      if (currentMinuteInt !== minuiteInt!) {
        setCurrentMinuteInt(minuiteInt);

        const hourInt = new Date().getHours();
        if (minuiteInt.toString().length === 1) {
          setCurrentTimeFunction(hourInt, minuiteInt);
        } else {
          setCurrentTimeFunction(hourInt, minuiteInt);
        }
        setHeightOffsetTop(findTimeOffset(new Date(), height));
      }
    }, 1000);

    return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
  }, [currentMinuteInt, height]);

  useEffect(() => {
    setHourLength(height * 0.1);
    loadCalendarContent();
  }, [height, loadCalendarContent]);

  async function getClassesEvents() {
    const result = await getClassEventsFromDay();
    if (result.result === loadingStateEnum.success) {
      setSchoolEvents(result.data);
    }
  }

  useEffect(() => {
    getDayEvents();
  }, [currentEvents, selectedDate]);

  useEffect(() => {
    //getClassesEvents();
  }, [selectedDate]);

  return (
    <ScrollView
      style={{
        height: week ? undefined : height,
        width,
        backgroundColor: Colors.white,
      }}
      ref={mainScrollRef}
      scrollEnabled={week != true}
    >
      <>
        {isShowingTime ? (
          <>
            {hoursText.map(value => (
              <View
                key={`${value}`}
                style={{ flexDirection: 'row', height: hourLength }}
              >
                {calculateIfShowing(value, new Date(selectedDate)) &&
                (week === undefined || start === true) ? (
                  <Text
                    selectable={false}
                    style={{
                      color:
                        colorScheme == 'dark' ? Colors.white : Colors.black,
                    }}
                  >
                    {value}
                  </Text>
                ) : null}
                <View
                  style={{
                    backgroundColor: Colors.black,
                    width: width * 0.9,
                    height: 6,
                    position: 'absolute',
                    right: 0,
                    borderRadius: 25,
                  }}
                />
              </View>
            ))}
          </>
        ) : null}
      </>
      {dayEvents.map(block => {
        return (
          block.event.map(event => {
            if (!event.allDay) {
              return (
                <EventBlock
                  key={event.id}
                  event={event}
                  width={width}
                  height={height}
                />
              );
            }
            return null;
          })
        )})}
      {schoolEvents?.map(event => (
        <EventBlock key={event.id} event={event} width={width} height={height} />
      ))}
      {week === undefined &&
      start === false &&
      isTimeOnDay(selectedDate, new Date().toISOString()) ? (
        <View
          style={{
            position: 'absolute',
            top: heightOffsetTop,
            height: height * 0.005,
            width,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text selectable={false} style={{ color: 'red', zIndex: 2 }}>
            {currentTime}
          </Text>
          <View
            style={{
              backgroundColor: 'red',
              width: width * 0.914,
              height: 6,
              position: 'absolute',
              right: 0,
            }}
          />
        </View>
      ) : null}
    </ScrollView>
  );
}

function EventBlock({
  event,
  width,
  height,
}: {
  event: eventType;
  width: number;
  height: number;
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
