import { View, Text } from 'react-native'
import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../Redux/store'

export default function GovernmentResources() {
    const {width, height} = useSelector((state: RootState) => state.dimentions)
  return (
    <View style={{width: width, height: height, backgroundColor: "white"}}>
        <Text>GovernmentResources</Text>
        <Text>Teams Search Pages / channels</Text>
    </View>
  )
}