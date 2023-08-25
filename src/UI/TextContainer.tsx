import { View, Text, PixelRatio, StyleProp, TextStyle } from 'react-native'
import React, { useEffect, useState } from 'react'

export default function TextContainer({text, height, width, style}:{text: string, height: number, width: number, style?: StyleProp<TextStyle>}) {
  return (
    <View>
      <Text adjustsFontSizeToFit={true} style={style}>{text}</Text>
    </View>
  )
}