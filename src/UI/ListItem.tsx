import { View, Text, Pressable, ViewStyle } from 'react-native'
import React from 'react'
import { Link, useNavigate } from 'react-router-native'
import create_UUID from '../Functions/Ultility/CreateUUID'

export default function ListItem({to, title, width, caption, onPress, style}:{title: string, width: number, caption?: string, to?: string, onPress?: () => void, style?: ViewStyle}) {
  const navigate = useNavigate();
  return (
    <Pressable onPress={() => {if (to !== undefined) {navigate(to)}; if (onPress !== undefined) {onPress()}}} key={create_UUID()} style={[{shadowColor: "black", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 10, borderRadius: 15, marginLeft: width * 0.03, marginRight: width * 0.03}, style]}>
      <View style={{margin: 10}}>
        <Text style={{fontSize: 16}}>{title}</Text>
        { (caption !== undefined) ?
          <Text style={{fontSize: 12}}>{caption}</Text>:null
        }
      </View>
    </Pressable>
  )
}