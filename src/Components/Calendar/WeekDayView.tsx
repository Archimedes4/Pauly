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
import { ScrollView, View, useColorScheme, Text, Pressable, Modal, FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import createUUID from '@utils/ultility/createUUID';
import dayCurrentTimeLine from '@hooks/dayCurrentTimeLine';
import useTimeHidden from '@hooks/useTimeHidden';
import { CloseIcon, UpIcon } from '../Icons';
import { DefaultEventBlock } from './EventView';
import DayEventBlock from './DayEventBlock';

function CurrentTimeLine({day, width, height, topPadding}:{day: Date, width: number, height: number, topPadding: number}) {
  const [timeWidth, setTimeWidth] = useState<number>(0)
  const dayData = dayCurrentTimeLine(height)

  if (isDateToday(day)) {
    return (
    <View
      style={{
        position: 'absolute',
        top: dayData.heightOffsetTop + topPadding,
        height: 20,
        width,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Text onLayout={(e) => {
        setTimeWidth(e.nativeEvent.layout.width)
      }} selectable={false} style={{ color: 'red', zIndex: 2, backgroundColor: Colors.white, padding: 4, paddingLeft: 1, paddingRight: 1, borderRadius: 15 }}>
        {dayData.currentTime}
      </Text>
      <View
        style={{
          backgroundColor: 'red',
          width: width - timeWidth - 2,
          height: 6,
          position: 'absolute',
          left: timeWidth + 2,
          borderRadius: 15
        }}
      />
    </View>
  )}
  return null
}

function MultiEventBlock({
  start,
  end,
  events,
  width,
  height,
}: {
  start: string;
  end: string;
  events: eventType[];
  width: number;
  height: number;
}) {
  const EventHeight = computeEventHeight(
    new Date(start),
    new Date(end),
    height,
  );
  const Offset = findTimeOffset(new Date(start), height);
  const [isShowingModal, setIsShowingModal] = useState<boolean>(false);
  const dimensions = useSelector(
    (state: RootState) => state.dimensions,
  );

  return (
    <>
      <Modal transparent visible={isShowingModal}>
        <Pressable style={{width: dimensions.totalWidth, height: dimensions.height}} onPress={() => setIsShowingModal(false)}/>
        <View style={{left: dimensions.totalWidth * 0.15, top: dimensions.height * 0.05, height: dimensions.height * 0.9, width: dimensions.totalWidth * 0.8, borderRadius: 15, borderWidth: 4, backgroundColor: Colors.lightGray, position: 'absolute', zIndex: 2}}>
          <Pressable style={{margin: 10}} onPress={() => setIsShowingModal(false)}>
            <CloseIcon width={25} height={25}/>
          </Pressable>
          <FlatList
            data={events}
            renderItem={(event) => (
              <DefaultEventBlock event={event.item} />
            )}
          />
        </View>
      </Modal>
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
          setIsShowingModal(true)
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
        <Text style={{ opacity: 1 }}>{events.length} events from</Text>
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
    </>
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
  const [hourTextWidth, setHourTextWidth] = useState<number>(0)
  const [hourTextHeight, setHourTextHeight] = useState<number>(0)

  useEffect(() => {
    setHourLength(height * 0.1);
  }, [height]);

  async function getWeekEvents() {
    let dayEvents = [];
    for (let index = 0; index < currentEvents.length; index += 1) {
      if (isEventDuringInterval(day, currentEvents[index]) && !currentEvents[index].allDay) {
        dayEvents.push(currentEvents[index]);
      }
    }
    dayEvents = dayEvents.sort((a, b) => {
      return a.startTime.localeCompare(b.startTime);
    });
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
        result.push({
          start: dayEvents[index].startTime,
          end: dayEvents[index].endTime,
          events: [dayEvents[index]]
        })
      }
    }
    setWeekEvents(result);
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
    getWeekEvents()
  }, [selectedDate, currentEvents]);

  return (
    <View
      style={{
        height: hourLength * 24,
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
                position: 'absolute',
                top: -hourTextHeight
              }}
              onLayout={(e) => {
                if (value == "12PM") {
                  setHourTextWidth(e.nativeEvent.layout.width)
                  if (e.nativeEvent.layout.height - 6 >= 0) {
                    setHourTextHeight((e.nativeEvent.layout.height - 6)/2)
                  }
                }
              }}
            >
              {value}
            </Text>
          ) : null)}
          <View
            style={{
              backgroundColor: 'black',
              width: start ? width - hourTextWidth - 3: width,
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
            <DayEventBlock
              key={weekDay.events[0].id + day.toISOString()}
              event={weekDay.events[0]}
              width={width}
              height={height}
              hourTextWidth={start ? hourTextWidth:0}
              topPadding={topPadding}
            />
          ) 
        }
        return (
          <MultiEventBlock
            key={weekDay.events[0].id + day.toISOString() + "multi"}
            start={weekDay.start}
            end={weekDay.end}
            events={weekDay.events}
            width={width}
            height={height}
          />
        )
      })}
      <CurrentTimeLine day={day} width={width} height={height} topPadding={topPadding}/>
    </View>
  );
}
