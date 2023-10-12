import { View, Text } from 'react-native'
import React from 'react'
import BackButton from '../../../UI/BackButton'

export default function GovernmentStudents() {
  return (
    <View>
      <BackButton to='/profile/government/'/>
      <Text style={{marginTop: 14}}>Government Students</Text>
      
    </View>
  )
}