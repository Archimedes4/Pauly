import { View, Text } from 'react-native'
import React from 'react'
import { Redirect } from 'expo-router'

export default function Missing() {
  return (
    <>
    <Redirect href='/'/>
      <View>
        <Text>Missing</Text>
      </View>
    </>
  )
}