/*
  Pauly
  Andrew Mainella
  17 December 2023
  Authenticated layout
*/
import { View, Text, Pressable } from 'react-native';
import React, { useEffect } from 'react';
import useIsConnected from '@hooks/useIsConnected';
import { Colors } from '@constants';
import { OfflineIcon } from '@components/Icons';
import { Slot } from 'expo-router';
import { useSelector } from 'react-redux';
import store, { RootState } from '@redux/store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useAuthentication from '@hooks/useAuthentication';
import { useSignOut } from '@hooks/authentication';
import ProgressView from '@components/ProgressView';
import useIsShowingLogout from '@hooks/useIsShowingLogout';
import { safeAreaColorsSlice } from '@src/redux/reducers/safeAreaColorsReducer';

export const unstable_settings = {
  // Ensure any route can link back to `/`
  initialRouteName: '',
};

function OfflineView() {
  const { totalHeight, totalWidth } = useSelector(
    (state: RootState) => state.dimensions,
  );
  const insets = useSafeAreaInsets();
  
  useEffect(() => {
    store.dispatch(
      safeAreaColorsSlice.actions.setSafeAreaColors({
        top: Colors.maroon,
        bottom: Colors.maroon,
      }),
    );
  }, []);

  return (
    <View
      style={{
        width: totalWidth,
        top: -insets.top,
        height: totalHeight,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <OfflineIcon width={50} height={50} color={Colors.white} />
    </View>
  )
}

function Loading() {
  const isGovernmentMode = useSelector(
    (state: RootState) => state.isGovernmentMode,
  );
  const signOut = useSignOut();
  const { height, totalWidth } = useSelector(
    (state: RootState) => state.dimensions,
  );
  const insets = useSafeAreaInsets();
  const isShowingLogout = useIsShowingLogout();

  return (
    <View
      style={{
        width: totalWidth,
        top: -insets.top,
        height,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ProgressView width={14} height={14} />
      <Text style={{ color: Colors.white }}>Loading</Text>
      {isGovernmentMode ? (
        <Pressable style={{ margin: 5 }}>
          <Text style={{ color: Colors.white }}>Overide</Text>
        </Pressable>
      ) : null}
      {isShowingLogout ? (
        <Pressable
          onPress={() => {
            signOut();
          }}
          style={{ margin: 5 }}
        >
          <Text style={{ color: Colors.white }}>Logout</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default function Layout() {
  const isConnected = useIsConnected();
  const { height, totalWidth } = useSelector(
    (state: RootState) => state.dimensions,
  );
  const insets = useSafeAreaInsets();
  const isLoading = useAuthentication();

  if (isConnected && !isLoading) {
    return <Slot />;
  }

  if (isConnected) {
    return <Loading />;
  }

  return <OfflineView />
}
