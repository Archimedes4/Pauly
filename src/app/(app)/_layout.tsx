/*
  Pauly
  Andrew Mainella
  November 9 2023
  LoadingScreen.tsx
  Used to wait for pauly to get its data. Causes problems when siteid and information is not loaded.
*/
import { View, Text, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import store, { RootState } from '../../Redux/store';
import { Slot, Stack, usePathname, useRouter } from 'expo-router';

export default function LoadingView() {
  const [mounted, setMounted] = useState<boolean>(false);
  const pathname = usePathname();
  const { siteId } = useSelector((state: RootState) => state.paulyList);
  const authenticationToken = useSelector(
    (state: RootState) => state.authenticationToken,
  );


  if (!mounted) {
    return null
  }

  const overide = false;

  if (((siteId !== '' || overide) && authenticationToken !== '') || pathname === '/sign-in' || pathname === '/terms-of-service') {
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
