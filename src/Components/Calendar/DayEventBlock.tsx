import { Colors } from "@constants";
import { addEventSlice } from "@redux/reducers/addEventReducer";
import store from "@redux/store";
import { computeEventHeight, findTimeOffset } from "@utils/calendar/calendarFunctions";
import React from "react";
import { Pressable, Text, View } from "react-native";

export default function DayEventBlock({
  event,
  width,
  height,
  horizontalShift,
  hourTextWidth,
  topPadding
}: {
  event: eventType;
  width: number;
  height: number;
  hourTextWidth: number;
  horizontalShift?: number;
  topPadding?: number
}) {
  const EventHeight = computeEventHeight(
    new Date(event.startTime),
    new Date(event.endTime),
    height,
  );
  const Offset = findTimeOffset(new Date(event.startTime), height);

  return (
    <Pressable
      style={{
        width: (horizontalShift === 0) ? width-hourTextWidth:width,
        height: EventHeight,
        top: Offset + ((topPadding === undefined) ? 0:topPadding),
        left: (horizontalShift === 0) ? hourTextWidth:((horizontalShift || 1) - 1) * width,
        position: 'absolute',
        right: 0,
        borderColor: Colors.maroon,
        borderLeftWidth: 3,
        backgroundColor: Colors.lightGray
      }}
      onPress={() => {
        store.dispatch(addEventSlice.actions.setIsShowingAddDate(true));
        store.dispatch(addEventSlice.actions.setSelectedEvent(event));
      }}
    >
      <View
        style={{
          width: (horizontalShift === 0) ? width-hourTextWidth:width,
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
    </Pressable>
  );
}