import { View, Text } from 'react-native'
import React from 'react'
import { Link } from 'react-router-native'

export default function PageNotFound() {
  return (
    <View>
      <Text>Page Not Found</Text>
      <Link to="/">
        <Text>Return Home</Text>
      </Link>
    </View>
  )
}