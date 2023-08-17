import { View, Text } from 'react-native'
import React from 'react'
import { Link } from 'react-router-native'

export default function Sports() {
  return (
    <View>
      <Text>Uh Oh something went wrong</Text>
      <Link to="/">
        <Text>Return Home</Text>
      </Link>
    </View>
  )
}