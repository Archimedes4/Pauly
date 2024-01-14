import {
  calculateIfShowing,
  computeEventHeight,
  findTimeOffset,
  isTimeOnDay,
} from '@utils/calendar/calendarFunctions';
import { getClassEventsFromDay } from '@utils/classesFunctions';
import { RootState } from '@redux/store';
import { Colors, loadingStateEnum } from '@constants';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, View, useColorScheme, Text } from 'react-native';
import { useSelector } from 'react-redux';
import createUUID from '@src/utils/ultility/createUUID';

function EventBlock({
  event,
  width,
  height,
  eventPane,
}: {
  event: eventType;
  width: number;
  height: number;
  eventPane: number[][];
}) {
  const EventHeight = computeEventHeight(
    new Date(event.startTime),
    new Date(event.endTime),
    height,
  );
  const Offset = findTimeOffset(new Date(event.startTime), height);
  const [horizontalShift, setHorizontalShift] = useState<number>(0);
  function calculateHorizontalShift() {
    let handeled = false;
    for (
      let horizontalCheck = 0;
      horizontalCheck < eventPane.length;
      horizontalCheck += 1
    ) {
      const beforeIndex = eventPane[horizontalCheck].findIndex(
        e => e >= Offset,
      );
      if (beforeIndex !== -1) {
        if (beforeIndex - 1 < eventPane[horizontalCheck].length) {
          if (eventPane[horizontalCheck][beforeIndex - 1] <= Offset) {
            // Fail Check Next Hoizontal Array
            continue;
          } else {
            // Everything Checks Out
            const afterIndex = eventPane[horizontalCheck].findIndex(
              e => e >= Offset + EventHeight,
            );
            if (afterIndex !== -1) {
              if (afterIndex - 1 < eventPane[horizontalCheck].length) {
                if (
                  eventPane[horizontalCheck][afterIndex - 1] <=
                  Offset + EventHeight
                ) {
                  // Fails check next horizontal array
                  continue;
                } else {
                  // All Good
                  eventPane[horizontalCheck].push(Offset);
                  eventPane[horizontalCheck].push(Offset + EventHeight);
                  eventPane[horizontalCheck].sort();
                  handeled = true;
                  break;
                }
              } else {
                // Error
                continue;
              }
            } else {
              // All Good
              const newEvents: number[][] = eventPane;
              newEvents[horizontalCheck].push(Offset);
              newEvents[horizontalCheck].push(Offset + EventHeight);
              // [...eventPane[horizontalCheck], Offset, Offset + EventHeight])
              eventPane[horizontalCheck].sort();
              handeled = true;
              break;
            }
          }
        } else {
          // Error
          continue;
        }
      } else {
        eventPane[horizontalCheck].push(Offset);
        eventPane[horizontalCheck].push(Offset + EventHeight);
        eventPane[horizontalCheck].sort();
        handeled = true;
        break;
      }
    }

    if (!handeled) {
      eventPane.push([]);
      eventPane[eventPane.length - 1].push(Offset);
      eventPane[eventPane.length - 1].push(Offset + EventHeight);
    }
    // setHorizontalShift(width * horizontalCheck);
  }

  useEffect(() => {
    calculateHorizontalShift();
  }, []);

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

export default function WeekDayView({
  width,
  height,
  week,
  start,
  day,
}: {
  width: number;
  height: number;
  week: true;
  start: boolean;
  day: Date;
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
  const [eventsPane, setEventsPane] = useState<number[][]>([[]]); // This is a sorted 2d array for calculating the horizintal shift of an event
  const [schoolEvents, setSchoolEvents] = useState<eventType[]>();

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
    if (
      result.result === loadingStateEnum.success &&
      result.data !== undefined
    ) {
      setSchoolEvents(result.data);
    }
  }

  useEffect(() => {
    getClassesEvents();
  }, [selectedDate]);

  return (
    <View
      style={{
        height: week ? undefined : height,
        width,
        backgroundColor: Colors.white,
      }}
    >
      <>
        {isShowingTime ? (
          <>
            {hoursText.map(value => (
              <View
                key={`${value}_${createUUID()}`}
                style={{ flexDirection: 'row', height: hourLength }}
              >
                {calculateIfShowing(value, new Date(selectedDate)) &&
                (week === undefined || start === true) ? (
                  <Text
                    selectable={false}
                    style={{
                      color: colorScheme == 'dark' ? Colors.white : 'black',
                    }}
                  >
                    {value}
                  </Text>
                ) : null}
                <View
                  style={{
                    backgroundColor: 'black',
                    width: start ? width * 0.8 : width,
                    height: 6,
                    position: 'absolute',
                    right: 0,
                    borderEndStartRadius: start ? 25 : 0,
                    borderStartStartRadius: start ? 25 : 0,
                  }}
                />
              </View>
            ))}
          </>
        ) : null}
      </>
      {currentEvents.map(event => (
        <>
          {event.allDay || !isTimeOnDay(event.endTime, selectedDate) ? null : (
            <EventBlock
              event={event}
              width={width}
              height={height}
              eventPane={eventsPane}
            />
          )}
        </>
      ))}
      {schoolEvents?.map(event => (
        <EventBlock
          event={event}
          width={width}
          height={height}
          eventPane={eventsPane}
        />
      ))}
      {isTimeOnDay(selectedDate, day.toISOString()) ? (
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
    </View>
  );
}
