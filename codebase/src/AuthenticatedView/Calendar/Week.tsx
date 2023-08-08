import { View, Text, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'

const windowDimensions = Dimensions.get('window');
const screenDimensions = Dimensions.get('screen');

export default function Week({width, height}:{width: number, height: number}) {
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
              <View>
                {daysOfWeek.map((day) => (
                  <View>
                    <Text>{day.getDate()}</Text>
                  </View>
                ))}
              </View>
            </View>
        }
        </View>
      <Text>Week</Text>
    </View>
  )
}