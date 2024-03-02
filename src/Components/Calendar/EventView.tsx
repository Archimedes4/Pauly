/*
  Pauly
  Andrew Mainella
  November 9 2023
  EventView.tsx
*/
import { View, Text, FlatList, Pressable } from 'react-native';
import React from 'react';
import { useSelector } from 'react-redux';
import store, { RootState } from '@redux/store';
import { Colors } from '@constants';
import { addEventSlice } from '@redux/reducers/addEventReducer';

export function DefaultEventBlock({ event }: { event: eventType }) {
  function getStart() {
    if (event.allDay) {
      return new Date(event.startTime).toLocaleString('en-us', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return new Date(event.startTime).toLocaleString('en-us', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
  }
  function getText() {
    const start = getStart();
    if (
      new Date(event.startTime).getDate() === new Date(event.endTime).getDate()
    ) {
      return new Date(event.startTime).toLocaleString('en-us', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      });
    }
    return start;
  }
  return (
    <Pressable
      onPress={() => {
        store.dispatch(addEventSlice.actions.setIsShowingAddDate(true));
        store.dispatch(addEventSlice.actions.setSelectedEvent(event));
      }}
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
      <Text>{getText()}</Text>
    </Pressable>
  );
}

export default function EventView({
  width,
}: {
  width: number;
  height: number;
}) {
  const currentEvents = useSelector((state: RootState) => state.currentEvents);
  const selectedDate = useSelector((state: RootState) => state.selectedDate);

  return (
    <FlatList
      data={currentEvents.sort(function (a, b) {
        return `${a.startTime}`.localeCompare(b.endTime);
      })}
      renderItem={event => (
        <DefaultEventBlock key={event.item.id} event={event.item} />
      )}
      style={{
        backgroundColor: Colors.lightGray,
        width,
        paddingTop: 10,
      }}
      ListEmptyComponent={() => (
        <View>
          <Text style={{ margin: 'auto' }}>There are no events!</Text>
        </View>
      )}
    />
  );
}
