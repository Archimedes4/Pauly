import React, { useState, useEffect } from 'react'
import { View, Text, Dimensions } from 'react-native'
import NavBarComponent from '../UI/NavComponent';

const windowDimensions = Dimensions.get('window');
const screenDimensions = Dimensions.get('screen');

export default function Notifications() {
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

  return (
    <View>
      <Text>Notifications</Text>
      <View>
        
      </View>
    </View>
  )
}
