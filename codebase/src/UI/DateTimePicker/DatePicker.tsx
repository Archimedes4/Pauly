import { View, Text, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { findFirstDayinMonth } from '../../Functions/calendarFunctions'
import Svg, { G, Path } from 'react-native-svg'
import { useFonts } from 'expo-font';

export default function DatePicker({selectedDate, onSetSelectedDate, width, height}:{selectedDate: Date, onSetSelectedDate: (item: Date) => void, width: number, height: number}) {
    const [viewingDate, setViewingDate] = useState<Date>(selectedDate)
    const today = new Date
    useEffect(() => {
        setViewingDate(selectedDate)
        console.log("Operation")
    }, [selectedDate])
    useEffect(() => {
        console.log("NEW DATE", viewingDate)
    }, [viewingDate])
    function getValue(columnNumber: number, rowNumber: number, inputDate: Date): {v: number, m: "B" | "C" | "A"} {
        //Check if this month
        var lastDay = new Date(inputDate.getFullYear(), inputDate.getMonth() + 1, 0);
        var monthBeforeLastDay = new Date(inputDate.getFullYear(), inputDate.getMonth(), 0);
        const firstDayWeek = findFirstDayinMonth(inputDate)
        const gridNumber: number = (columnNumber) + (rowNumber * 7) + 1
        if (gridNumber > firstDayWeek){
            if ((gridNumber - firstDayWeek) <= (lastDay.getDate())) {
                //In the current month
                return {v: gridNumber - firstDayWeek, m: "C"}
            } else {
                //In the month after
                return {v: gridNumber - firstDayWeek - lastDay.getDate(), m: "A"}
            }
        } else {
            //In the month before
            return {v: monthBeforeLastDay.getDate() - firstDayWeek + gridNumber, m: "B"}
        }
    }
  return (
    <View style={{width: width, height: height}}>
        <View style={{flexDirection: "row", height: height/7}}>
            <View style={{width: width * 0.5}}>
                <Text  style={{fontSize: (width < height) ? (width * 0.4)/(height * 0.01):(height * 0.5)/(width * 0.02), fontFamily: require("../../assests/fonts/BukhariScript.woff")}} adjustsFontSizeToFit={true} numberOfLines={1}>{viewingDate.toLocaleString("en-us", { month: "long" })} {viewingDate.getFullYear()}</Text>
            </View>
            <Pressable onPress={() => {
                const newDate = new Date(viewingDate.getFullYear(), viewingDate.getMonth() + 1)
                setViewingDate(newDate)
            }}>
                <Svg fill="#000000" height={width * 0.05} width={width * 0.05} viewBox="0 0 330 330">
                    <G id="SVGRepo_bgCarrier" stroke-width="0"/>
                    <G id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
                    <G id="SVGRepo_iconCarrier"> 
                        <Path id="XMLID_224_" d="M325.606,229.393l-150.004-150C172.79,76.58,168.974,75,164.996,75c-3.979,0-7.794,1.581-10.607,4.394 l-149.996,150c-5.858,5.858-5.858,15.355,0,21.213c5.857,5.857,15.355,5.858,21.213,0l139.39-139.393l139.397,139.393 C307.322,253.536,311.161,255,315,255c3.839,0,7.678-1.464,10.607-4.394C331.464,244.748,331.464,235.251,325.606,229.393z" />
                    </G>
                </Svg>
            </Pressable>
            <Pressable onPress={() => {
                const newDate = new Date(viewingDate.getFullYear(), viewingDate.getMonth() - 1)
                setViewingDate(newDate)
            }}>
                <Svg fill="#000000"  height={width * 0.05} width={width * 0.05} viewBox="0 0 330 330">
                    <G id="SVGRepo_bgCarrier" stroke-width="0" />
                    <G id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" />
                    <G id="SVGRepo_iconCarrier">
                        <Path id="XMLID_225_" d="M325.607,79.393c-5.857-5.857-15.355-5.858-21.213,0.001l-139.39,139.393L25.607,79.393 c-5.857-5.857-15.355-5.858-21.213,0.001c-5.858,5.858-5.858,15.355,0,21.213l150.004,150c2.813,2.813,6.628,4.393,10.606,4.393 s7.794-1.581,10.606-4.394l149.996-150C331.465,94.749,331.465,85.251,325.607,79.393z" />
                    </G>
                </Svg>
            </Pressable>
            { (viewingDate.getMonth() != today.getMonth() || viewingDate.getFullYear() != today.getFullYear()) ?
                <Pressable onPress={() => {setViewingDate(today)}}>
                    <Text>Today</Text>
                </Pressable>:null
            }
            <Text>{(width < height) ? "true":"false"} {width} {height}</Text>
        </View>
        <View style={{alignContent: "center", justifyContent: "center", alignItems: "center", width: width, height: height/7 * 6}}>
        {Array.from(Array(6).keys()).map((rowNumber) => (
            <View style={{flexDirection: "row"}}>
                { Array.from(Array(7).keys()).map((columnNumber) => (
                    <Pressable onPress={() => {
                        const value =  getValue(columnNumber, rowNumber, viewingDate)
                        onSetSelectedDate(new Date(viewingDate.getFullYear(), (value.m === "C") ? viewingDate.getMonth():(value.m === "B") ? viewingDate.getMonth() - 1:viewingDate.getMonth() + 1, value.v))
                    }}>
                        <View style={{height: ((width * 0.8) <= height) ? (width * 0.8)/7:height/6, width: ((width * 0.8) <= height) ? (width * 0.8)/7:height/6, alignItems: "center", justifyContent: "center"}}>
                            <Text>{getValue(columnNumber, rowNumber, viewingDate).v}</Text>
                            {/* <Text>{(columnNumber) + (rowNumber * 7) + 1} {columnNumber} {rowNumber}</Text> */}
                        </View>
                    </Pressable>
                ))
                }
            </View>
        ))}
        </View>
    </View>
  )
}