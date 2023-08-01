import { View } from 'react-native'
import React from 'react'
import { Svg, Path } from 'react-native-svg'

export default function ChevronRight() {
  return (
    <View>
        <Svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <Path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"></Path>
        </Svg>
    </View>
  )
}