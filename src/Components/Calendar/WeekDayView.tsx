import {
  calculateIfShowing,
  computeEventHeight,
  findTimeOffset,
  isDateToday,
  isTimeOnDay,
} from '@utils/calendar/calendarFunctions';
import { getClassEventsFromDay } from '@utils/classesFunctions';
import { RootState } from '@redux/store';
import { Colors, loadingStateEnum } from '@constants';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, View, useColorScheme, Text } from 'react-native';
import { useSelector } from 'react-redux';
import createUUID from '@utils/ultility/createUUID';
import dayCurrentTimeLine from '@src/hooks/dayCurrentTimeLine';

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

  useEffect(() => {
    setHourLength(height * 0.1);
  }, [height]);

  async function getClassesEvents() {
    const result = await getClassEventsFromDay();
    if (
      result.result === loadingStateEnum.success
    ) {
      setSchoolEvents(result.data);
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
      <>
        {isShowingTime ? (
          <>
            {hoursText.map(value => (
              <View
                key={`${value}_${createUUID()}`}
                style={{ flexDirection: 'row', height: hourLength }}
              >
                {calculateIfShowing(value, new Date(selectedDate)) &&
                (start === true) ? (
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
      {currentEvents.map(event => {
        if (event.allDay || !isTimeOnDay(event.endTime, day.toISOString())) {
          return null
        }
        
        return (
          <EventBlock
            key={event.id}
            event={event}
            width={width}
            height={height}
          />
        )
      })}
      {schoolEvents?.map(event => {
        if (event.allDay || !isTimeOnDay(event.endTime, day.toISOString())) {
          return null
        }
        
        return (
          <EventBlock
            event={event}
            width={width}
            height={height}
          />
        )
      })}
      <CurrentTimeLine day={day} width={width} height={height} topPadding={topPadding}/>
    </View>
  );
}
