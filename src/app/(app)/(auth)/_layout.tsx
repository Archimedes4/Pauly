import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { Slot } from 'expo-router'

export default function PublicLayout() {
  useEffect(() => {
    console.log('public layout')
  }, [])
  return (
    <Slot />
  )
}