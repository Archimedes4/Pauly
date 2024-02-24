import { Colors } from "@constants";
import { addEventSlice } from "@redux/reducers/addEventReducer";
import store from "@redux/store";
import calculateFontSize from "@src/utils/ultility/calculateFontSize";
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

  function getEventTimeText(startTime: string, endTime: string) {
    const startDate = new Date(startTime).toLocaleString('en-us', {
      hour: 'numeric',
      minute: 'numeric',
    })
    const endDate = new Date(endTime).toLocaleString('en-us', {
      hour: 'numeric',
      minute: 'numeric',
    })
    return `${startDate} to ${endDate}`
  }

  return (
    <Pressable
      style={{
        width: (horizontalShift === 0) ? width-hourTextWidth:width,
        height: EventHeight,
        top: Offset + ((topPadding === undefined) ? 0:topPadding),
        left: (horizontalShift === 0) ? hourTextWidth:((horizontalShift || 1) - 1) * width,
        position: 'absolute',
        overflow: 'hidden',
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
      <Text style={{ opacity: 1, fontSize: calculateFontSize(width, 14, event.name)}}>{event.name}</Text>
      <Text style={{ opacity: 1, fontSize: 14}}>{getEventTimeText(event.startTime, event.endTime)}</Text>
    </Pressable>
  );
}