/*
  Pauly
  Andrew Mainella
  November 9 2023
  AuthenticatedViewMain.tsx
  This holds the main router to Pauly once authenticated.
*/
import React from 'react';
import { View, Text, Platform } from 'react-native';
import { useSelector } from 'react-redux';
import NavBarComponent from '@components/NavComponent';
import { RootState } from '@redux/store';
import ProfileBlock from '@components/ProfileBlock';
import { Colors } from '@constants';
import { Slot, useFocusEffect, useRouter } from 'expo-router';
import useIsAuthenticated from '@hooks/useIsAuthenticated';
import { SignInComponent } from '../sign-in';

function AuthenticatedView() {
  const { currentBreakPoint, totalWidth, width } = useSelector(
    (state: RootState) => state.dimentions,
  );
  const isShowingProfileBlock = useSelector(
    (state: RootState) => state.isShowingProfileBlock,
  );
  const overflowHidden = useSelector(
    (state: RootState) => state.safeAreaColors.overflowHidden,
  );

  return (
    <View
      style={{
        width: totalWidth,
        overflow: overflowHidden ? 'hidden' : 'visible',
      }}
    >
      <View style={{ flexDirection: 'row', width: totalWidth,  overflow: overflowHidden ? 'hidden' : 'visible' }}>
        {currentBreakPoint >= 1 ? <NavBarComponent /> : null}
        <View
          style={{
            width,
            backgroundColor: Colors.maroon,
            overflow: overflowHidden ? 'hidden' : 'visible',
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
    console.log("push")
    try {
      router.push('/sign-in');
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

  if (!isAuthenticated.loading && Platform.OS !== 'web') {
    return <PushToAuth />;
  }

  if (!isAuthenticated.loading) {
    return <SignInComponent government={false} />;
  }

  return <Text>Loading</Text>;
}
