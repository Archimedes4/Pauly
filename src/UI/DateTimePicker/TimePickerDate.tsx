import { View, Text, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'

export default function TimePicker(
    {date, setDate, dimentions}:{date: Date, setDate: (item: Date) => void, dimentions?: {hourHeight?: number, hourWidth?: number, minuteHeight?: number, minuteWidth?: number, timeWidth?: number, timeHeight?: number}}) {
    const [selectedMinute, setSelectedMinute] = useState<string>("00")
    const [selectedHour, setSelectedHour] = useState<string>("12")
    const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<"AM"|"PM">("AM")
    useEffect(() => {
        if (date.getMinutes() <= 9){
            setSelectedMinute("0" + date.getMinutes().toString())
        } else {
            setSelectedMinute(date.getMinutes().toString())
        }
        if (date.getHours() > 12){
            //PM
            setSelectedTimeOfDay("PM")
            setSelectedHour(((date.getHours() - 12) <= 9) ? "0" + (date.getHours()-12).toString():(date.getHours()-12).toString())
        } else {
            //AM
            setSelectedTimeOfDay("AM")
            setSelectedHour((date.getHours() <= 9) ? "0" + date.getHours().toString():date.getHours().toString())
        }

    }, [date])


  return (
    <View style={{flexDirection: "row"}}>
        <TextInput value={selectedHour} onChangeText={(e) => {
            if (e.length == 1){
                setSelectedHour("00")
                var newDate = date
                newDate.setHours(0)
                setDate(newDate)
            } else if (e.length == 3) {
                const array = Array.from(e)
                console.log(array)
                if (array[2] === "0" || array[2] === "1" || array[2] === "2" || array[2] === "3" || array[2] === "4" || array[2] === "5" || array[2] === "6" || array[2] === "7" || array[2] === "8" || array[2] === "9") {
                    if (parseInt(array[1] + array[2]) <= 12 && parseInt(array[1] + array[2]) >= 1) {
                        setSelectedHour(array[1] + array[2])
                        var newDate = date
                        newDate.setHours(parseInt(array[1] + array[2]) + ((selectedTimeOfDay === "AM") ? 0:12))
                        setDate(newDate)
                    }
                }   
            }
        }} inputMode='numeric' style={{width: (dimentions?.hourWidth) ? dimentions.hourWidth:"100%", height:  (dimentions?.hourHeight) ? dimentions.hourHeight:"100%"}}/>
        <TextInput value={selectedMinute} onChangeText={(e) => {
            if (e.length == 1){
                setSelectedMinute("00")
                var newDate = date
                newDate.setMinutes(0)
                setDate(newDate)
            } else if (e.length == 3) {
                const array = Array.from(e)
                console.log(array)
                if (array[2] === "0" || array[2] === "1" || array[2] === "2" || array[2] === "3" || array[2] === "4" || array[2] === "5" || array[2] === "6" || array[2] === "7" || array[2] === "8" || array[2] === "9") {
                    if (parseInt(array[1] + array[2]) <= 59 && parseInt(array[1] + array[2]) >= 0) {
                        setSelectedMinute(array[1] + array[2])
                        var newDate = date
                        newDate.setMinutes(parseInt(array[1] + array[2]))
                        setDate(newDate)
                    }
                }   
            }
        }} inputMode='numeric' style={{width: (dimentions?.minuteWidth) ? dimentions.minuteWidth:"100%", height: (dimentions?.minuteHeight) ? dimentions.minuteHeight:"100%"}}/>
        <TextInput value={selectedTimeOfDay} onChangeText={(e) => {
            if (e == "PMa" || e == "PMA"){
                setSelectedTimeOfDay("AM")
            } else if (e == "AMp" || e == "AMP") {
                setSelectedTimeOfDay("PM")
            }
        }} style={{width: (dimentions?.timeWidth) ? dimentions.timeWidth:"100%", height:  (dimentions?.timeHeight) ? dimentions.timeHeight:"100%"}}/>

    </View>
  )
}