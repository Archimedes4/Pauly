import { View, Text, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { findFirstDayinMonth } from '../../Functions/Calendar/calendarFunctions'
import Svg, { G, Path } from 'react-native-svg'
import { useFonts } from 'expo-font';
import { DownIcon, UpIcon } from '../Icons/Icons';

//Of note
//The allowed date range should have dates which is on midnight
export default function DatePicker({selectedDate, onSetSelectedDate, width, height, onCancel, allowedDatesRange}:{selectedDate: Date, onSetSelectedDate: (item: Date) => void, width: number, height: number, onCancel: () => void, allowedDatesRange?: {startDate: Date, endDate: Date}}) {
    const [viewingDate, setViewingDate] = useState<Date>(selectedDate)
    const today = new Date
    useEffect(() => {
        setViewingDate(selectedDate)
    }, [selectedDate])
    function getValue(columnNumber: number, rowNumber: number, inputDate: Date): {v: number, m: "B" | "C" | "A", d: Date} {
        //Check if this month
        var lastDay = new Date(inputDate.getFullYear(), inputDate.getMonth() + 1, 0);
        var monthBeforeLastDay = new Date(inputDate.getFullYear(), inputDate.getMonth(), 0);
        const firstDayWeek = findFirstDayinMonth(inputDate)
        const gridNumber: number = (columnNumber) + (rowNumber * 7) + 1
        if (gridNumber > firstDayWeek){
            if ((gridNumber - firstDayWeek) <= (lastDay.getDate())) {
                //In the current month
                return {v: gridNumber - firstDayWeek, m: "C", d: new Date(inputDate.getFullYear(), inputDate.getMonth(), gridNumber - firstDayWeek)}
            } else {
                //In the month after
                return {v: gridNumber - firstDayWeek - lastDay.getDate(), m: "A", d: new Date((inputDate.getMonth() === 11) ? inputDate.getFullYear() + 1:inputDate.getFullYear(), (inputDate.getMonth() === 11) ? 1:inputDate.getMonth() + 1, gridNumber - firstDayWeek)}
            }
        } else {
            //In the month before
            return {v: monthBeforeLastDay.getDate() - firstDayWeek + gridNumber, m: "B", d: new Date((inputDate.getMonth() === 1) ? inputDate.getFullYear() - 1:inputDate.getFullYear(), (inputDate.getMonth() === 0) ? 12:inputDate.getMonth() - 1, gridNumber - firstDayWeek)}
        }
    }
  return (
    <View style={{width: width, height: height}}>
        <View style={{flexDirection: "row", height: height/7}}>
            <View style={{width: width * 0.5}}>
                <Text style={{fontSize: (width < height) ? (width * 0.4)/(height * 0.01):(height * 0.5)/(width * 0.02)}} adjustsFontSizeToFit={true} numberOfLines={1}>{viewingDate.toLocaleString("en-us", { month: "long" })} {viewingDate.getFullYear()}</Text>
            </View>
            <Pressable onPress={() => {
                const newDate = new Date(viewingDate.getFullYear(), viewingDate.getMonth() + 1)
                setViewingDate(newDate)
            }}>
               <UpIcon height={width * 0.05} width={width * 0.05}/>
            </Pressable>
            <Pressable onPress={() => {
                const newDate = new Date(viewingDate.getFullYear(), viewingDate.getMonth() - 1)
                setViewingDate(newDate)
            }}>
                <DownIcon height={width * 0.05} width={width * 0.05}/>
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
                    <View>
                        { (allowedDatesRange === undefined || (allowedDatesRange.startDate <= getValue(columnNumber, rowNumber, viewingDate).d && allowedDatesRange.endDate >= getValue(columnNumber, rowNumber, viewingDate).d)) ?
                            <Pressable onPress={() => {
                                const value =  getValue(columnNumber, rowNumber, viewingDate)
                                onSetSelectedDate(new Date(viewingDate.getFullYear(), (value.m === "C") ? viewingDate.getMonth():(value.m === "B") ? viewingDate.getMonth() - 1:viewingDate.getMonth() + 1, value.v))
                            }}>
                                <View style={{height: ((width * 0.8) <= height) ? (width * 0.8)/7:height/6, width: ((width * 0.8) <= height) ? (width * 0.8)/7:height/6, alignItems: "center", justifyContent: "center"}}>
                                    <Text style={{color: "black"}}>{getValue(columnNumber, rowNumber, viewingDate).v}</Text>
                                </View>
                            </Pressable>:
                            <View style={{height: ((width * 0.8) <= height) ? (width * 0.8)/7:height/6, width: ((width * 0.8) <= height) ? (width * 0.8)/7:height/6, alignItems: "center", justifyContent: "center"}}>
                                <Text style={{color: "#787171"}}>{getValue(columnNumber, rowNumber, viewingDate).v}</Text>
                            </View>
                        }
                    </View>
                ))
                }
            </View>
        ))}
        </View>
        <Pressable onPress={() => {onCancel()}}>
            <Text>Cancel</Text>
        </Pressable>
    </View>
  )
}