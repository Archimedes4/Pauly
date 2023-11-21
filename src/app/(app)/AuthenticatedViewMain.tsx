/*
  Pauly
  Andrew Mainella
  November 9 2023
  AuthenticatedViewMain.tsx
  This holds the main router to Pauly once authenticated.
*/
import React, { useState } from 'react';
import { View, ScaledSize } from 'react-native';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NavBarComponent from '../../components/NavComponent';
import { RootState } from '../../Redux/store';
import ProfileBlock from './Profile/ProfileBlock';
import { Colors } from '../../types';
import LoadingScreen from '../../components/LoadingScreen';
import { Slot } from 'expo-router';

export default function AuthenticatedView({
  dimensions,
  width,
}: {
  dimensions: { window: ScaledSize; screen: ScaledSize };
  width: number;
}) {
  const { height, currentBreakPoint } = useSelector(
    (state: RootState) => state.dimentions,
  );
  const { siteId } = useSelector((state: RootState) => state.paulyList);
  const authenticationToken = useSelector(
    (state: RootState) => state.authenticationToken,
  );
  const isShowingProfileBlock = useSelector(
    (state: RootState) => state.isShowingProfileBlock,
  );
  const insets = useSafeAreaInsets();
  const [overide, setOveride] = useState<boolean>(false);
  if ((siteId !== '' || overide) && authenticationToken !== '') {
    return (
      <View style={{ width, top: -insets.top }}>
        <View style={{ flexDirection: 'row', width }}>
          {currentBreakPoint >= 1 ? (
            <NavBarComponent
              width={width * 0.1}
              height={dimensions.window.height}
            />
          ) : null}
          <View
            style={{
              width: currentBreakPoint >= 1 ? width * 0.9 : width,
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
  return <LoadingScreen setOveride={setOveride} width={width} />;
}
