import { View, Text} from 'react-native'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-native'
import { useSelector } from 'react-redux'
import { RootState } from '../../Redux/store'

export default function Profile() {
  const {height, width} = useSelector((state: RootState) => state.dimentions)
  return (
    <View style={{height: height, width: width, backgroundColor: "white", alignItems: "center"}}>
      <Link to="/">
        <Text>Back</Text>
      </Link>
      <Text>Profile</Text>
      <Link to="/profile/commissions" style={{width: width * 0.8, height: height * 0.08, borderRadius: 15, shadowColor: "black", shadowOffset: { width: 2, height: 4 }, shadowOpacity: 0.8, shadowRadius: 10}}>
        <Text>Commissions</Text>
      </Link>
      <Link to="/profile/resources">
        <Text>Resources</Text>
      </Link>
      <Link to="/profile/settings">
        <Text>Settings</Text>
      </Link>
      <Link to="/profile/government">
        <Text>Government</Text>
      </Link>
    </View>
  )
}