import { View, Text, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'

const windowDimensions = Dimensions.get('window');
const screenDimensions = Dimensions.get('screen');

export default function Week({width, height}:{width: number, height: number}) {
  const [dimensions, setDimensions] = useState({
    window: windowDimensions,
    screen: screenDimensions,
  });
  
  useEffect(() => {
      const subscription = Dimensions.addEventListener(
        'change',
        ({window, screen}) => {
          setDimensions({window, screen});
        },
      );
      return () => subscription?.remove();
  });

  useEffect(() => {
      setDimensions({
          window: Dimensions.get('window'),
          screen: Dimensions.get('screen')
      })
  }, [])

  function getDOW(selectedDate: Date) {
    var week = new Array(); 
    // Starting Monday not Sunday
    selectedDate.setDate((selectedDate.getDate() - selectedDate.getDay() +1));
    for (var i = 0; i < 7; i++) {
        week.push(
          new Date(selectedDate)
        ); 
        selectedDate.setDate(selectedDate.getDate() +1);
    }
    return week; 
  }
  useEffect(() => {console.log(getDOW(new Date(2023, 1, 1)))}, [])
  return (
    <View>
        <View>
        {(dimensions.window.width >= 768) ?
            <View>
                
            </View>:
            <View>
                <View>

                </View>
            </View>
        }
        </View>
      <Text>Week</Text>
    </View>
  )
}