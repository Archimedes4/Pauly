import { View, Text, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-native'
import NavBarComponent from '../../../UI/NavComponent'

function Block() {
  return (
    <View>
      
    </View>
  )
}

export default function Government() {
  return (
    <View>
      <Text>Government</Text>
      <Link to="/profile/government/graph">
        <Text>Microsoft Graph</Text>
      </Link>
      <Link to="/profile/government/commissions">
        <Text>Commissions</Text>
      </Link>
      <Link to="/profile/government/sports">
        <Text>Sports</Text>
      </Link>
      <Link to="/profile/government/president">
        <Text>President</Text>
      </Link>
      <Link to="/profile/government/calendar">
        <Text>Calendar</Text>
      </Link>
      <Link to="/profile/government/classes">
        <Text>Classes</Text>
      </Link>
    </View>
  )
}