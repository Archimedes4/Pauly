import { View, Text } from 'react-native'
import React from 'react'
import { useParams } from 'react-router-native'
import MicrosoftGraphEditList from './MicrosoftGraphEditList'
import MicrosoftGraphEditGroup from './MicrosoftGraphEditGroup'
import MicrosoftGraphEditExtension from './MicrosoftGraphEditExtension'

export default function MicrosoftGraphEdit() {
    const { mode } = useParams()
  return (
    <View>
      { (mode === "list") ?
        <MicrosoftGraphEditList />:null
      }
      { (mode === "group") ?
        <MicrosoftGraphEditGroup />:null
      }
      { (mode === "extension") ?
        <MicrosoftGraphEditExtension />:null
      }
    </View>
  )
}