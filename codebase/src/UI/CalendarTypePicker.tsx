import { View, Text, Animated, Pressable } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'

interface PickerWrapperProps {
    selectedIndex: number;
    setSelectedCalendarMode: (item: calendarMode) => void;
    width: number
    height: number
}

enum calendarMode {
    month,
    week,
    day
  }

export default function CalendarTypePicker({ selectedIndex, setSelectedCalendarMode, width, height }) {
    const pan = useRef(new Animated.Value(0)).current
    const [compoentWidth, setComponentWidth] = useState(width/3)
    function fadeIn(id: number) {
        // Will change fadeAnim value to 1 in 5 seconds
        Animated.timing(pan, {
        toValue: id * compoentWidth + compoentWidth * 0.005,
        duration: 500,
        useNativeDriver: true,
        }).start();
    };
    
    useEffect(() => {
        pan.setValue(selectedIndex * compoentWidth + compoentWidth * 0.005)
    }, [])
  
    useEffect(() => {console.log(selectedIndex)}, [selectedIndex])

    useEffect(() => {
        setComponentWidth(width/3)
        pan.setValue(selectedIndex * compoentWidth + compoentWidth * 0.005)
    }, [width])

    return (
        <>
            <View style={{flexDirection: 'row', height: height, width: width, backgroundColor: "#7d7d7d", borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 1}}>
                <Pressable onPress={() => {
                    setSelectedCalendarMode(calendarMode.month)
                    fadeIn(0)
                }} style={{position: "absolute", width: compoentWidth, height: height, alignItems: "center", alignContent: "center", justifyContent: "center"}}>
                    <Text style={{textAlignVertical: "center", textAlign: "center", fontSize: Math.sqrt((compoentWidth * 0.8)*height/5)}}>Month</Text>
                </Pressable>
                <Pressable onPress={() => {
                    setSelectedCalendarMode(calendarMode.week)
                    fadeIn(1)
                }} style={{position: "absolute", transform: [{translateX: 1 * compoentWidth}], width: compoentWidth, height: height, alignItems: "center", alignContent: "center", justifyContent: "center"}}>
                    <Text style={{textAlignVertical: "center", textAlign: "center", fontSize: Math.sqrt((compoentWidth * 0.8)*height/5)}}>Week</Text>
                </Pressable>
                <Pressable onPress={() => {
                    setSelectedCalendarMode(calendarMode.day)
                    fadeIn(2)
                }} style={{position: "absolute", transform: [{translateX: 2 * compoentWidth}], width: compoentWidth, height: height, alignItems: "center", alignContent: "center", justifyContent: "center"}}>
                    <Text style={{textAlignVertical: "center", textAlign: "center", fontSize: Math.sqrt((compoentWidth * 0.8)*height/5)}}>Day</Text>
                </Pressable>
                <Animated.View style={{transform: [{translateX: pan}], zIndex: -1}}>
                    <View style={{ height: height * 0.95, width: compoentWidth - compoentWidth * 0.01, backgroundColor: "white", top: height * 0.025, borderRadius: 20, position: "absolute", zIndex: -1, alignItems: "center", alignContent: "center", justifyContent: "center"}} />
                </Animated.View>
            </View>
        </>
    )
}