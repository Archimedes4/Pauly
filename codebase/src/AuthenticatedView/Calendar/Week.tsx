import { View, Text, Dimensions, Pressable } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { accessTokenContent } from '../../../App';
import DayView from './DayView';

export default function Week({width, height, selectedDate}:{width: number, height: number, selectedDate: Date}) {
  //const microsoftAccessToken = useContext(accessTokenContent);
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
          <View style={{flexDirection: "row", height: width * 0.179}}>
            {daysOfWeek.map((day) => (
              <View style={{width: width * 0.135, height: width * 0.135, borderRadius: 50, backgroundColor: "#444444", alignContent: "center", alignItems: "center", justifyContent: "center", margin: width * 0.022}}>
                <Text>{day.getDate()}</Text>
              </View>
            ))}
          </View>
        </View>
      }
      </View>
      <View style={{height: (false) ? height:(height - width * 0.179)}}>
        <DayView width={width} height={(false) ? height * 0.757:height} selectedDate={selectedDate} currentEvents={[]} />
      </View>
    </View>
  )
}