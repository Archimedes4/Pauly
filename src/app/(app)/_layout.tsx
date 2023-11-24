/*
  Pauly
  Andrew Mainella
  November 9 2023
  LoadingScreen.tsx
  Used to wait for pauly to get its data. Causes problems when siteid and information is not loaded.
*/
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import store, { RootState } from '../../Redux/store';
import { Slot, Stack } from 'expo-router';

export default function LoadingView() {
  const { siteId } = useSelector((state: RootState) => state.paulyList);
  const authenticationToken = useSelector(
    (state: RootState) => state.authenticationToken,
  );

  const overide = false;

  if (((siteId !== '' || overide) && authenticationToken !== '')) {
    return (
      <Slot />
    )
  }

  return (
    <Stack>
      <Stack.Screen name='sign-in'/>
      <Stack.Screen name=''/>
      <Stack.Screen name='terms-of-service'/>
      <Stack.Screen name='private-policy'/>
    </Stack>
  )
}
