import { View, Text, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'

export default function TimePicker({selectedHourMilitary, selectedMinuteMilitary, onSetSelectedHourMilitary, onSetSelectedMinuteMilitary}:{selectedHourMilitary: number, selectedMinuteMilitary: number, onSetSelectedHourMilitary: (item: number) => void, onSetSelectedMinuteMilitary: (item: number) => void}) {
    const [selectedMinute, setSelectedMinute] = useState<string>("00")
    const [selectedHour, setSelectedHour] = useState<string>("12")
    const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<"AM"|"PM">("AM")
    useEffect(() => {
        console.log("RUN THIS SHIT")
        if (selectedMinuteMilitary <= 9){
            setSelectedMinute("0" + selectedMinuteMilitary.toString())
        } else if (selectedMinuteMilitary) {
            setSelectedMinute(selectedMinuteMilitary.toString())
        }
        if (selectedHourMilitary > 12){
            //PM
            setSelectedTimeOfDay("PM")
            console.log("Here")
            setSelectedHour(((selectedHourMilitary - 12) <= 9) ? "0" + (selectedHourMilitary-12).toString():(selectedHourMilitary-12).toString())
        } else {
            //AM
            setSelectedTimeOfDay("AM")
            console.log("Here AM")
            setSelectedHour(((selectedHourMilitary) <= 9) ? "0" + selectedHourMilitary.toString():selectedHourMilitary.toString())
        }

    }, [selectedHourMilitary, selectedMinuteMilitary])

    function returnHour(selectedHourIn: number) {
        if (selectedTimeOfDay === "AM") {
            onSetSelectedHourMilitary(selectedHourIn)
        } else if (selectedTimeOfDay === "PM") {
            onSetSelectedHourMilitary(selectedHourIn + 12)
        }
    }

    useEffect(() => {returnHour(parseInt(selectedHour))}, [selectedHour, selectedTimeOfDay])

  return (
    <View style={{flexDirection: "row"}}>
        <TextInput value={selectedHour} onChangeText={(e) => {
            if (e.length == 1){
                setSelectedHour("00")
                returnHour(0)
            } else if (e.length == 3) {
                const array = Array.from(e)
                console.log(array)
                if (array[2] === "0" || array[2] === "1" || array[2] === "2" || array[2] === "3" || array[2] === "4" || array[2] === "5" || array[2] === "6" || array[2] === "7" || array[2] === "8" || array[2] === "9") {
                    if (parseInt(array[1] + array[2]) <= 12 && parseInt(array[1] + array[2]) >= 1) {
                        setSelectedHour(array[1] + array[2])
                        returnHour(parseInt(array[1] + array[2]))
                    }
                }   
            }
        }} keyboardType='numeric'/>
        <TextInput value={selectedMinute} onChangeText={(e) => {
            if (e.length == 1){
                setSelectedMinute("00")
                onSetSelectedMinuteMilitary(0)
            } else if (e.length == 3) {
                const array = Array.from(e)
                console.log(array)
                if (array[2] === "0" || array[2] === "1" || array[2] === "2" || array[2] === "3" || array[2] === "4" || array[2] === "5" || array[2] === "6" || array[2] === "7" || array[2] === "8" || array[2] === "9") {
                    if (parseInt(array[1] + array[2]) <= 59 && parseInt(array[1] + array[2]) >= 0) {
                        setSelectedMinute(array[1] + array[2])
                        onSetSelectedMinuteMilitary(parseInt(array[1] + array[2]))
                    }
                }   
            }
        }} keyboardType='numeric'/>
        <TextInput value={selectedTimeOfDay} onChangeText={(e) => {
            if (e == "PMa" || e == "PMA"){
                setSelectedTimeOfDay("AM")
            } else if (e == "AMp" || e == "AMP") {
                setSelectedTimeOfDay("PM")
            }
        }}/>

    </View>
  )
}