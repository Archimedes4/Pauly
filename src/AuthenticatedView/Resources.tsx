import { View, Text } from 'react-native'
import React from 'react'
import { Link } from 'react-router-native'

export default function Resources() {
  return (
    <View>
        <Link to="/profile/">
            <Text>Back</Text>
        </Link>
      <Text>Resources</Text>
      
    </View>
  )
}