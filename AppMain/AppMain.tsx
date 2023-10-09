import React from 'react'
import { View, Text, ScaledSize } from 'react-native'

export default function AppMain({}:{dimensions: {window: ScaledSize; screen: ScaledSize}}) {
  return (
    <View>
      <Text>Something has gone wrong. This platform is most likely not supported.</Text>
    </View>
  )
}