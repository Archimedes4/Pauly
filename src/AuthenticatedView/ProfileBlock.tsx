import { View, Text } from 'react-native'
import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../Redux/store'

export default function ProfileBlock({width}:{width: number}) {
  const expandedMode = useSelector((state: RootState) => state.expandedMode)
  return (
    <View style={{position: "absolute", bottom: 0, left: (expandedMode) ? (width * 2.5):width, backgroundColor: "white", width: width}}>
      <Text>ProfileBlock</Text>
    </View>
  )
}