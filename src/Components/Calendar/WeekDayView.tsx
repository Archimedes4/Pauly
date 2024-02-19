import {
  computeEventHeight,
  findTimeOffset,
  isDateToday,
  isEventDuringInterval,
  isEventDuringIntervalRaw,
  isTimeOnDay,
} from '@utils/calendar/calendarFunctions';
import { getClassEventsFromDay } from '@utils/classesFunctions';
import { RootState } from '@redux/store';
import { Colors, loadingStateEnum } from '@constants';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, View, useColorScheme, Text, Pressable } from 'react-native';
import { useSelector } from 'react-redux';
import createUUID from '@utils/ultility/createUUID';
import dayCurrentTimeLine from '@hooks/dayCurrentTimeLine';
import useTimeHidden from '@hooks/useTimeHidden';

function CurrentTimeLine({day, width, height, topPadding}:{day: Date, width: number, height: number, topPadding: number}) {
  const [timeWidth, setTimeWidth] = useState<number>(0)
  const dayData = dayCurrentTimeLine(height)

  if (isDateToday(day)) {
    return (
    <View
      style={{
        position: 'absolute',
        top: dayData.heightOffsetTop + topPadding,
        height: height * 0.005,
        width,
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
          width: width - timeWidth - 2,
          height: 6,
          position: 'absolute',
          right: 0,
          borderRadius: 15
        }}
      />
    </View>
  )}
  return null
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

function MultiEventBlock({
  start,
  end,
  length,
  width,
  height,
}: {
  start: string;
  end: string;
  length: number;
  width: number;
  height: number;
}) {
  const EventHeight = computeEventHeight(
    new Date(start),
    new Date(end),
    height,
  );
  const Offset = findTimeOffset(new Date(start), height);

  return (
    <Pressable
      key={`Event_${createUUID()}`}
      style={{
        width: width,
        height: EventHeight,
        top: Offset,
        position: 'absolute',
        right: 0,
        borderColor: Colors.maroon,
        borderLeftWidth: 3,
      }}
      onPress={() => {

      }}
    >
      <View
        style={{
          width: width,
          height: EventHeight,
          position: 'absolute',
          backgroundColor: Colors.lightGray,
          opacity: 0.8,
          zIndex: -1,
        }}
      />
      <Text style={{ opacity: 1 }}>{length} events from</Text>
      <Text>
        {new Date(start).toLocaleString('en-us', {
          hour: 'numeric',
          minute: 'numeric',
        })}{' '}
        to{' '}
        {new Date(end).toLocaleString('en-us', {
          hour: 'numeric',
          minute: 'numeric',
        })}
      </Text>
    </Pressable>
  );
}

export default function WeekDayView({
  width,
  height,
  start,
  day,
  topPadding
}: {
  width: number;
  height: number;
  start: boolean;
  day: Date;
  topPadding: number
}) {
  const colorScheme = useColorScheme();
  const currentEvents = useSelector((state: RootState) => state.currentEvents);
  const selectedDate = useSelector((state: RootState) => state.selectedDate);
  const [hourLength, setHourLength] = useState<number>(0);
  const [weekEvents, setWeekEvents] = useState<weekDayEvent[]>([]);
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
  const hiddenTime = useTimeHidden()

  useEffect(() => {
    setHourLength(height * 0.1);
  }, [height]);

  async function getWeekEvents(schoolEvents: eventType[]) {
    let allEvents = (schoolEvents !== undefined) ? [...currentEvents, ...schoolEvents]:[...currentEvents]
    let dayEvents = [];
    for (let index = 0; index < allEvents.length; index += 1) {
      if (isEventDuringInterval(day, allEvents[index]) && !allEvents[index].allDay) {
        dayEvents.push(allEvents[index]);
      }
    }
    dayEvents = dayEvents.sort((a, b) => {
      return a.startTime.localeCompare(b.startTime);
    });
    console.log("Day Events", dayEvents)
    const result: weekDayEvent[] = [];
    for (let index = 0; index < dayEvents.length; index += 1) {
      let found = false
      for (let busyIndex = 0; busyIndex < result.length; busyIndex += 1) {
        if (isEventDuringIntervalRaw(dayEvents[index], new Date(result[busyIndex].start).getTime(), new Date(result[busyIndex].end).getTime())) {
          found = true
          result[busyIndex].events.push(dayEvents[index])
          if (new Date(dayEvents[index].startTime) > new Date(result[busyIndex].start)) {
            result[busyIndex].start = dayEvents[index].startTime
          }
          if (new Date(dayEvents[index].endTime) > new Date(result[busyIndex].end)) {
            result[busyIndex].end = dayEvents[index].endTime 
          }
        }
      }
      if (found === false) {
        console.log("push")
        result.push({
          start: dayEvents[index].startTime,
          end: dayEvents[index].endTime,
          events: [dayEvents[index]]
        })
      }
    }
    console.log(result)
    setWeekEvents(result);
  }

  async function getClassesEvents() {
    const result = await getClassEventsFromDay();
    if (
      result.result === loadingStateEnum.success
    ) {
      getWeekEvents(result.data);
    } else {
      getWeekEvents([]);
    }
  }

  useEffect(() => {
    const resultHeightTopOffset = findTimeOffset(new Date(), height);
    mainScrollRef.current?.scrollTo({
      x: 0,
      y: resultHeightTopOffset,
      animated: false,
    });
  }, [])

  useEffect(() => {
    getClassesEvents();
  }, [selectedDate]);

  return (
    <View
      style={{
        height: height,
        width,
        backgroundColor: Colors.white,
        paddingTop: topPadding
      }}
    >
      {hoursText.map(value => (
        <View
          key={`${value}_${createUUID()}`}
          style={{ flexDirection: 'row', height: hourLength }}
        >
          {((value !== hiddenTime || !isDateToday(new Date(day))) &&
          (start === true) ? (
            <Text
              selectable={false}
              style={{
                color: colorScheme == 'dark' ? Colors.white : 'black',
              }}
            >
              {value}
            </Text>
          ) : null)}
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
      {weekEvents.map(weekDay => {
        if (weekDay.events.length <= 0) {
          return null
        }
        if (weekDay.events.length === 1) {
          if (weekDay.events[0].allDay || !isTimeOnDay(weekDay.events[0].endTime, day.toISOString())) {
            return null
          }
          
          return (
            <EventBlock
              key={weekDay.events[0].id + day.toISOString()}
              event={weekDay.events[0]}
              width={width}
              height={height}
            />
          ) 
        }
        return (
          <MultiEventBlock
            key={weekDay.events[0].id + day.toISOString() + "multi"}
            start={weekDay.start}
            end={weekDay.end}
            length={weekDay.events.length}
            width={width}
            height={height}
          />
        )
      })}
      <CurrentTimeLine day={day} width={width} height={height} topPadding={topPadding}/>
    </View>
  );
}
