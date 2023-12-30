/*
  Pauly
  Andrew Mainella
  November 9 2023
  AuthenticatedViewMain.tsx
  This holds the main router to Pauly once authenticated.
*/
import React from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NavBarComponent from '@components/NavComponent';
import { RootState } from '@redux/store';
import ProfileBlock from '@src/components/ProfileBlock';
import { Colors } from '@constants';
import { Slot, useFocusEffect, useRouter } from 'expo-router';
import useIsAuthenticated from '@hooks/useIsAuthenticated';

function AuthenticatedView() {
  const { height, currentBreakPoint, totalWidth, width } = useSelector(
    (state: RootState) => state.dimentions,
  );
  const isShowingProfileBlock = useSelector(
    (state: RootState) => state.isShowingProfileBlock,
  );
  const insets = useSafeAreaInsets();

  return (
    <View style={{ width: totalWidth, overflow: 'hidden' }}>
      <View style={{ flexDirection: 'row', width: totalWidth }}>
        {currentBreakPoint >= 1 ? (
          <NavBarComponent />
        ) : null}
        <View
          style={{
            width,
            backgroundColor: Colors.maroon,
            overflow: 'hidden'
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
  return null;
}

export default function Main() {
  const isAuthenticated = useIsAuthenticated();
  if (isAuthenticated.authenticated) {
    return <AuthenticatedView />;
  }

  if (!isAuthenticated.loading) {
    return <PushToAuth />;
  }
  return null;
}
