import { View, Text, Animated, Pressable } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addEventSlice } from '../Redux/reducers/addEventReducer'
import { RootState } from '../Redux/store'

interface PickerWrapperProps {
  width: number
  height: number
}

enum calendarMode {
  month,
  week,
  day
}

export default function CalendarTypePicker({width, height }:PickerWrapperProps) {
  const pan = useRef(new Animated.Value(0)).current
  const [compoentWidth, setComponentWidth] = useState(width/3)
  const {selectedCalendarMode} = useSelector((state: RootState) => state.addEvent)
  const dispatch = useDispatch()

  function fadeIn(id: number) {
    // Will change fadeAnim value to 1 in 5 seconds
    Animated.timing(pan, {
    toValue: id * compoentWidth + compoentWidth * 0.005,
    duration: 500,
    useNativeDriver: true,
    }).start();
  };
  
  useEffect(() => {
    pan.setValue(selectedCalendarMode * compoentWidth + compoentWidth * 0.005)
  }, [])

  useEffect(() => {
    setComponentWidth(width/3)
    pan.setValue(selectedCalendarMode * compoentWidth + compoentWidth * 0.005)
  }, [width])

  return (
    <>
      <View style={{flexDirection: 'row', height: height, width: width, backgroundColor: "#7d7d7d", borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 1}}>
        <Pressable onPress={() => {
          dispatch(addEventSlice.actions.setSelectedCalendarMode(calendarMode.month))
          fadeIn(0)
        }} style={{position: "absolute", width: compoentWidth, height: height, alignItems: "center", alignContent: "center", justifyContent: "center"}}>
          <Text style={{textAlign: "center", fontSize: Math.sqrt((compoentWidth * 0.8)*height/5)}}>Month</Text>
        </Pressable>
        <Pressable onPress={() => {
          dispatch(addEventSlice.actions.setSelectedCalendarMode(calendarMode.week))
          fadeIn(1)
        }} style={{position: "absolute", transform: [{translateX: 1 * compoentWidth}], width: compoentWidth, height: height, alignItems: "center", alignContent: "center", justifyContent: "center"}}>
          <Text style={{textAlign: "center", fontSize: Math.sqrt((compoentWidth * 0.8)*height/5)}}>Week</Text>
        </Pressable>
        <Pressable onPress={() => {
          dispatch(addEventSlice.actions.setSelectedCalendarMode(calendarMode.day))
          fadeIn(2)
        }} style={{position: "absolute", transform: [{translateX: 2 * compoentWidth}], width: compoentWidth, height: height, alignItems: "center", alignContent: "center", justifyContent: "center"}}>
          <Text style={{textAlign: "center", fontSize: Math.sqrt((compoentWidth * 0.8)*height/5)}}>Day</Text>
        </Pressable>
        <Animated.View style={{transform: [{translateX: pan}], zIndex: -1}}>
          <View style={{ height: height * 0.95, width: compoentWidth - compoentWidth * 0.01, backgroundColor: Colors.white, top: height * 0.025, borderRadius: 20, position: "absolute", zIndex: -1, alignItems: "center", alignContent: "center", justifyContent: "center"}} />
        </Animated.View>
      </View>
    </>
  )
}