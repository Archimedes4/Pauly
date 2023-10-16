import { View, Text } from 'react-native'
import React from 'react'

export default function SVGXml({xml, height, width}:{xml: string, width: number, height: number}) {
  return (
    <View style={{height: height, width: width}}>
      <div dangerouslySetInnerHTML={{__html: xml}}/>
    </View>
  )
}