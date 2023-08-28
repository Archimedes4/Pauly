import { View, Text, TextInput, Pressable } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import callMsGraph from '../../../../Functions/microsoftAssets'
import { RootState } from '../../../../Redux/store';
import { useSelector } from 'react-redux';

declare global {
    type microsoftUserType = {
        id: string
        displayName: string
    }
}

export default function GovernmentClassesCreate() {
  const {commissionListId, siteId} = useSelector((state: RootState) => state.paulyList)

  return (
    <View>
        <Text>GovernmentClassesCreate</Text>
        <View>
            <Text>Teacher:</Text>
            <Text>Name:</Text>
            <Text>School Year:</Text>
            <Text>Periods:</Text>
        </View>
    </View>
  )
}