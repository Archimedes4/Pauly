import { Colors } from "@src/constants";
import { addEventSlice } from "@src/redux/reducers/addEventReducer";
import { selectedDateSlice } from "@src/redux/reducers/selectedDateReducer";
import { RootState } from "@src/redux/store";
import React, { useEffect, useState } from "react";
import { ListRenderItemInfo, Pressable, View, Text, ScrollView } from "react-native";
import { useDispatch, useSelector } from "react-redux";

function getBackgroundColor(selectedDate: string, dayData: number): string {
  if (dayData === new Date(selectedDate).getDate()) {
    return Colors.lightGray;
  }
  if (
    dayData === new Date().getDate() &&
    new Date(selectedDate).getMonth() === new Date().getMonth() &&
    new Date(selectedDate).getFullYear() === new Date().getFullYear()
  ) {
    return Colors.darkGray;
  }
  return Colors.white;
}

function getTextBackgroundColor(selectedDate: string, dayData: number): string {
  if (
    dayData === new Date().getDate() &&
    new Date(selectedDate).getMonth() === new Date().getMonth() &&
    new Date(selectedDate).getFullYear() === new Date().getFullYear() &&
    new Date(selectedDate).getDate() !== dayData
  ) {
    return Colors.white;
  }
  return Colors.black;
}

function isCalendarTextColor(selectedDate: string, day: number): boolean {
  const date = new Date(selectedDate);
  date.setDate(day);
  if (new Date().toDateString() === date.toDateString()) {
    return true;
  }
  return false;
}

function CalendarCardView({
  value,
  width,
  height,
  calendarWidth,
  setIsOverflow
}: {
  value: monthDataType;
  width: number;
  height: number;
  calendarWidth: number;
  setIsOverflow: (item: boolean) => void
}) {
  const selectedDate = useSelector((state: RootState) => state.selectedDate);
  const dispatch = useDispatch();
  function pressCalendar() {
    const d = new Date();
    d.setFullYear(
      new Date(selectedDate).getFullYear(),
      new Date(selectedDate).getMonth(),
      value.dayData,
    );
    dispatch(selectedDateSlice.actions.setSelectedDate(d.toISOString()));
  }
  if (calendarWidth <= 519 && value.showing) {
    return (
      <Pressable
        style={{
          width,
          height,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: height / 2,
          backgroundColor: getBackgroundColor(selectedDate, value.dayData),
        }}
        onPress={() => pressCalendar()}
        onLayout={(e) => {
          if (e.nativeEvent.layout.height >= height) {
            setIsOverflow(true)
          } else {
            setIsOverflow(false)
          }
        }}
      >
        <Text
          style={{
            color: getTextBackgroundColor(selectedDate, value.dayData),
          }}
        >
          {value.dayData}
        </Text>
        {value.events.length >= 1 ? (
          <View
            style={{
              backgroundColor: 'black',
              borderRadius: 50,
              width: width < height ? width * 0.25 : height * 0.25,
              height: width < height ? width * 0.25 : height * 0.25,
            }}
          />
        ) : (
          <View
            style={{
              backgroundColor: 'transparent',
              borderRadius: 50,
              width: width < height ? width * 0.25 : height * 0.25,
              height: width < height ? width * 0.25 : height * 0.25,
            }}
          />
        )}
      </Pressable>
    );
  }
  if (calendarWidth <= 519) {
    return <View style={{ width, height }} />;
  }
  if (value.showing) {
    return (
      <Pressable
        style={{
          width,
          minHeight: height,
          padding: 2,
          borderWidth: 1,
          borderBottomWidth: 0,
          borderTopWidth: 0,
          borderColor: Colors.lightGray,
        }}
        onPress={() => {
          pressCalendar();
          dispatch(addEventSlice.actions.setIsShowingAddDate(true));
          const startDate = new Date(selectedDate);
          startDate.setDate(value.dayData);
          const endDate = new Date(selectedDate);
          endDate.setDate(value.dayData);
          endDate.setHours(endDate.getHours() + 1);
          dispatch(addEventSlice.actions.setStartDate(startDate.toISOString()));
          dispatch(addEventSlice.actions.setEndDate(endDate));
        }}
        onLayout={(e) => {
          if (e.nativeEvent.layout.height >= height) {
            setIsOverflow(true)
          } else {
            setIsOverflow(false)
          }
        }}
      >
        <View
          style={{
            borderRadius: 50,
            width: 16,
            height: 16,
            backgroundColor: isCalendarTextColor(
              selectedDate,
              value.dayData,
            )
              ? 'red'
              : 'transparent',
            alignContent: 'center',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: isCalendarTextColor(selectedDate, value.dayData)
                ? Colors.white
                : Colors.black,
              fontWeight: isCalendarTextColor(selectedDate, value.dayData)
                ? 'bold'
                : 'normal',
            }}
          >
            {value.dayData}
          </Text>
        </View>
        {value.events.map((event: eventType) => {
          if (event.paulyEventType !== "studentSchedule") {
          return (
            <Pressable
              key={`Calendar_Event_${event.id}`}
              onPress={() => {
                dispatch(addEventSlice.actions.setIsShowingAddDate(true));
                dispatch(addEventSlice.actions.setSelectedEvent(event));
              }}
            >
              <Text style={{ fontSize: 10 }}>{event.name}</Text>
            </Pressable>
          )
          } 
          return null
        })}
      </Pressable>
    );
  }
  return (
    <View
      onLayout={(e) => {
        if (e.nativeEvent.layout.height > height) {
          setIsOverflow(true)
        } else {
          setIsOverflow(false)
        }
      }}
      style={{
        width,
        height,
        borderWidth: 1,
        borderBottomWidth: 0,
        borderTopWidth: 0,
        borderColor: Colors.lightGray,
      }}
    />
  );
}


export default function CalendarRow({
  value,
  width,
  height,
  calendarWidth,
}: {
  value: ListRenderItemInfo<monthDataType[]>;
  width: number;
  height: number;
  calendarWidth: number;
}) {
  const [isOverflow, setIsOverflow] = useState<boolean>(true)
  return (
    <ScrollView scrollEnabled={isOverflow} style={{height: height, borderTopWidth: (width <= 74.14285714285714) ? 0:value.index === 0 ? 2 : 1, borderColor: Colors.lightGray}}>
      <View style={{flexDirection: 'row'}}>
      {value.item.map((day, dayIndex) => (
        <CalendarCardView key={value.item[dayIndex].id + "Card"} value={day} width={width} height={height} calendarWidth={calendarWidth} setIsOverflow={setIsOverflow}/>
      ))}
      </View>
    </ScrollView>
  )
}