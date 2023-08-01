import { View, Text, Button } from 'react-native'
import React from 'react'
import { Link } from 'react-router-native'

export default function GovernmentClasses() {
  return (
    <View>
        <Text>GovernmentClasses</Text>
        <Link to="/profile/government/classes/root/create/">
            <Text>Create Root Class</Text>
        </Link>
        <Link to="/profile/government/classes/main/create/">
          <Text>Create Class</Text>
        </Link>
        <Button title="Import Classes" onPress={() => {}} />
    </View>
  )
}