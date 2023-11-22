/*
  Pauly
  Andrew Mainella
  November 9 2023
  404Page.tsx
  Page not found
*/
import React from 'react';
import { View, Text } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../Redux/store';
import { Colors } from '../types';

export default function Loading() {
  const { height, width } = useSelector((state: RootState) => state.dimentions);
  return (
    <View
      style={{
        width,
        height,
        backgroundColor: Colors.white,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text>Loading</Text>
    </View>
  );
}
