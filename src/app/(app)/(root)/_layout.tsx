/*
  Pauly
  Andrew Mainella
  November 9 2023
  AuthenticatedViewMain.tsx
  This holds the main router to Pauly once authenticated.
*/
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NavBarComponent from '@/components/NavComponent';
import { RootState } from '@/Redux/store';
import ProfileBlock from '@/app/(app)/(root)/Profile/ProfileBlock';
import { Colors } from '@/types';
import { Redirect, Slot, useFocusEffect, usePathname, useRouter } from 'expo-router';

function AuthenticatedView() {
  const { height, currentBreakPoint, totalWidth, width } = useSelector(
    (state: RootState) => state.dimentions,
  );
  const isShowingProfileBlock = useSelector(
    (state: RootState) => state.isShowingProfileBlock,
  );
  const insets = useSafeAreaInsets();
  
  return (
    <View style={{ width: totalWidth, top: -insets.top }}>
      <View style={{ flexDirection: 'row', width: totalWidth }}>
        {currentBreakPoint >= 1 ? (
          <NavBarComponent
            width={totalWidth * 0.1}
            height={height}
          />
        ) : null}
        <View
          style={{
            width: totalWidth,
            height,
            backgroundColor: Colors.maroon,
          }}
        >
          <Slot />
          {currentBreakPoint >= 1 && isShowingProfileBlock ? (
            <ProfileBlock />
          ) : null}
        </View>
      </View>
    </View>
  );
}

function PushToAuth() {
  const router = useRouter();
  useFocusEffect(() => {
    try {
      router.push('(auth)/sign-in');
    } catch (error) {
      console.error(error);
    }
  });
  return (
    null
  )
}

export default function Main() {
  const { siteId } = useSelector((state: RootState) => state.paulyList);
  const authenticationToken = useSelector(
    (state: RootState) => state.authenticationToken,
  );
  const overide = false;

  if (((siteId !== '' || overide) && authenticationToken !== '')) {
    return (
      <AuthenticatedView />
    )
  }

  return (
    <PushToAuth />
  );
}