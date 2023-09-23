import { View, Text, ScrollView, Pressable} from 'react-native'
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-native'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../Redux/store'
import { BookIcon, GearIcon, GovernmentIcon, MedalIcon } from '../../UI/Icons/Icons'
import { statusBarColorSlice } from '../../Redux/reducers/statusBarColorReducer'

export default function Profile() {
  const {height, width, currentBreakPoint} = useSelector((state: RootState) => state.dimentions)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(statusBarColorSlice.actions.setStatusBarColor("#793033"))
  }, [])

  useEffect(() => {
    if (currentBreakPoint !== 0) {
      navigate("/notifications")
    }
  }, [currentBreakPoint])
  return (
    <ScrollView style={{height: height, width: width, backgroundColor: "#793033"}}>
      <Pressable onPress={() => navigate("/")}>
        <Text>Back</Text>
      </Pressable>
      <View>
        <Text>Profile</Text>
      </View>
      <Pressable onPress={() => {navigate("/profile/commissions")}} style={{width: width * 0.8, height: height * 0.08, borderRadius: 15, shadowColor: "black", shadowOffset: { width: 2, height: 4 }, shadowOpacity: 0.8, shadowRadius: 10, marginLeft: "auto", marginRight: "auto", flexDirection: "row", backgroundColor: "white", alignItems: "center"}}>
        <MedalIcon width={(width * 0.8 < height * 0.08) ? width * 0.2:height*0.06} height={(width * 0.8 < height * 0.08) ? width * 0.2:height*0.06} style={{marginLeft: width * 0.025}}/>
        <Text>Commissions</Text>
      </Pressable>
      <Pressable onPress={() => {navigate("/profile/resources")}} style={{width: width * 0.8, height: height * 0.08, borderRadius: 15, shadowColor: "black", shadowOffset: { width: 2, height: 4 }, shadowOpacity: 0.8, shadowRadius: 10, marginLeft: "auto", marginRight: "auto", flexDirection: "row", backgroundColor: "white", alignItems: "center", marginTop: height * 0.05}}>
        <BookIcon width={(width * 0.8 < height * 0.08) ? width * 0.2:height*0.06} height={(width * 0.8 < height * 0.08) ? width * 0.2:height*0.06} style={{marginLeft: width * 0.025}}/>
        <Text>Resources</Text>
      </Pressable>
      <Pressable onPress={() => {navigate("/profile/settings")}} style={{width: width * 0.8, height: height * 0.08, borderRadius: 15, shadowColor: "black", shadowOffset: { width: 2, height: 4 }, shadowOpacity: 0.8, shadowRadius: 10, marginLeft: "auto", marginRight: "auto", flexDirection: "row", backgroundColor: "white", alignItems: "center", marginTop: height * 0.05}}>
        <GearIcon width={(width * 0.8 < height * 0.08) ? width * 0.2:height*0.06} height={(width * 0.8 < height * 0.08) ? width * 0.2:height*0.06} style={{marginLeft: width * 0.025}}/>
        <Text>Settings</Text>
      </Pressable>
      <Pressable onPress={() => {navigate("/profile/government")}} style={{width: width * 0.8, height: height * 0.08, borderRadius: 15, shadowColor: "black", shadowOffset: { width: 2, height: 4 }, shadowOpacity: 0.8, shadowRadius: 10, marginLeft: "auto", marginRight: "auto", flexDirection: "row", backgroundColor: "white", alignItems: "center", marginTop: height * 0.05}}>
        <GovernmentIcon width={(width * 0.8 < height * 0.08) ? width * 0.2:height*0.06} height={(width * 0.8 < height * 0.08) ? width * 0.2:height*0.06} style={{marginLeft: width * 0.025}}/>
        <Text>Government</Text>
      </Pressable>
    </ScrollView>
  )
}