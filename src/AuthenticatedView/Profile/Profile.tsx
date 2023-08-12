import { View, Text, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-native'

export default function Profile() {
  return (
    <View>
      <Link to="/">
        <Text>Back</Text>
      </Link>
      <Text>Profile</Text>
      <Link to="/profile/commissions">
        <Text>Commissions</Text>
      </Link>
      <Link to="/profile/settings">
        <Text>Settings</Text>
      </Link>
      <Link to="/profile/resources">
        <Text>Resources</Text>
      </Link>
      <Link to="/profile/government">
        <Text>Government</Text>
      </Link>
    </View>
  )
}