import { View, Text,Pressable } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import DayView from './DayView';
import create_UUID from '../../Functions/CreateUUID';

export default function Week({width, height}:{width: number, height: number}) {
  //const pageData = useContext(pageDataContext);
  const [daysOfWeek, setDaysOfWeek] = useState<Date[]>([])
  function getDOW(selectedDate: Date) {
    var week: Date[] = []
    // Starting Monday not Sunday
    selectedDate.setDate((selectedDate.getDate() - selectedDate.getDay()));
    for (var i = 0; i < 7; i++) {
        week.push(
          new Date(selectedDate)
        ); 
        selectedDate.setDate(selectedDate.getDate() +1);
    }
    console.log("Week", week)
    return week; 
  }
  useEffect(() => {setDaysOfWeek(getDOW(new Date))}, [])
  return (
    <View>
      <View>
      {/* 768 TO DO get dimentiosn value*/}
      {(false) ?
        <View>
            
        </View>:
        <View>
          <Pressable onTouchMove={(e) => {e.type}}></Pressable>
          <View style={{flexDirection: "row", height: width * 0.142857142857143, width: width}}>
            {daysOfWeek.map((day) => (
              <View key={day.getDay() + "_" + create_UUID()}style={{width: width * 0.1, height: width * 0.1, borderRadius: 50, backgroundColor: "#444444", alignContent: "center", alignItems: "center", justifyContent: "center", margin: width * 0.021428571428571, borderColor: "#793033", borderWidth: (new Date().getDate() === day.getDate()) ? 5:0}}>
                <Text>{day.getDate()}</Text>
              </View>
            ))}
          </View>
        </View>
      }
      </View>
      <View style={{height: (false) ? height:(height - width * 0.179), width: width, alignContent: "center", alignItems: "center"}}>
        <DayView width={width * 0.95} height={(false) ? height * 0.757:height}/>
      </View>
    </View>
  )
}