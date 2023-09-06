import { View, Text, TextInput, Pressable } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import callMsGraph from '../../../../Functions/Ultility/microsoftAssets'
import { RootState } from '../../../../Redux/store';
import { useSelector } from 'react-redux';
import { loadingStateEnum } from '../../../../types';

declare global {
  type microsoftUserType = {
    id: string
    displayName: string
  }
  type classType = {
    name: string,
    id: string
  }
}

export default function GovernmentClassesEdit() {
  const {width, height} = useSelector((state: RootState) => state.dimentions)

  async function createClass() {
    
  }
  return (
    <View style={{width: width, height: height, backgroundColor: "white"}}>
      <View>
        <Text>Add Class Data</Text>
        <View>
          <Text>_Teacher:</Text>
          <Text>Name:</Text>
          <Text>School Year Event Id:</Text>
          <Text>Periods: number[]</Text>
          <Text>Semester Id: string</Text>
          <Text>Room Id: string</Text>
        </View>
      </View>
    </View>
  )
}