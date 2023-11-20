/*
  Pauly
  Andrew Mainella
  November 9 2023
  EventView.tsx
*/
import { View, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../Redux/store';
import { getClassEventsFromDay } from '../../Functions/classesFunctions';
import { loadingStateEnum } from '../../types';

function EventBlock({ event }: { event: eventType }) {
  return (
    <View>
      <Text>{event.name}</Text>
      <Text>
        {new Date(event.startTime).getDay()}{' '}
        {new Date(event.startTime).getHours()}{' '}
        {new Date(event.startTime).getMinutes()}
      </Text>
    </View>
  );
}

export default function EventView() {
  const currentEvents = useSelector((state: RootState) => state.currentEvents);
  const selectedDate = useSelector((state: RootState) => state.selectedDate);
  const [schoolEvents, setSchoolEvents] = useState<eventType[]>([]);
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
    <View>
      {currentEvents.length === 0 && schoolEvents.length === 0 ? (
        <View>
          <Text>There are no events</Text>
        </View>
      ) : (
        <>
          {schoolEvents.map(event => (
            <EventBlock event={event} />
          ))}
          {currentEvents.map(event => {
            if (
              event.allDay ||
              new Date(event.endTime).toDateString() !==
                new Date(selectedDate).toDateString()
            ) {
              return null;
            }
            return <EventBlock event={event} />;
          })}
        </>
      )}
    </View>
  );
}
