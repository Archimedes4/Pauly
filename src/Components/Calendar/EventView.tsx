/*
  Pauly
  Andrew Mainella
  November 9 2023
  EventView.tsx
*/
import { View, Text, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { getClassEventsFromDay } from '@utils/classesFunctions';
import { Colors, loadingStateEnum } from '@constants';

function EventBlock({ event }: { event: eventType }) {
  return (
    <View
      style={{
        borderRadius: 15,
        backgroundColor: Colors.white,
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10,
        padding: 10,
      }}
    >
      <Text>{event.name}</Text>
      <Text>
        {new Date(event.startTime).getDay()}{' '}
        {new Date(event.startTime).getHours()}{' '}
        {new Date(event.startTime).getMinutes()}
      </Text>
    </View>
  );
}

export default function EventView({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
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
    <ScrollView
      style={{
        width,
        height,
        backgroundColor: Colors.lightGray,
        paddingTop: 10,
      }}
    >
      {currentEvents.length === 0 && schoolEvents.length === 0 ? (
        <View>
          <Text style={{ margin: 'auto' }}>There are no events!</Text>
        </View>
      ) : (
        <>
          {schoolEvents.map(event => (
            <EventBlock event={event} />
          ))}
          {currentEvents.map(event => {
            return <EventBlock event={event} />;
          })}
        </>
      )}
    </ScrollView>
  );
}
