/*
  Pauly
  Andrew Mainella
  November 9 2023
  AuthenticatedViewMain.tsx
  This holds the main router to Pauly once authenticated.
*/
import React, { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { useSelector } from 'react-redux';
import NavBarComponent from '@components/NavComponent';
import { RootState } from '@redux/store';
import ProfileBlock from '@components/ProfileBlock';
import { Colors } from '@constants';
import { Slot, router, useGlobalSearchParams } from 'expo-router';
import useIsShowingZeroFooter from '@hooks/useIsShowingZeroFooter';
import ZeroFooterComponent from '@components/ZeroFooterComponent';

export default function AuthenticatedView() {
  const { currentBreakPoint, totalWidth, width } = useSelector(
    (state: RootState) => state.dimensions,
  );
  const isShowingProfileBlock = useSelector(
    (state: RootState) => state.isShowingProfileBlock,
  );
  const overflowHidden = useSelector(
    (state: RootState) => state.safeAreaColors.overflowHidden,
  );
  const isShowingFooter = useIsShowingZeroFooter()
  const { deepLink } = useGlobalSearchParams()

  useEffect(() => {
    if (Platform.OS !== "web" && typeof deepLink === 'string') {
      router.replace(deepLink)
    }
  }, [])

  return (
    <View
      style={{
        width: totalWidth,
        overflow: overflowHidden ? 'hidden' : 'visible',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          width: totalWidth,
          overflow: overflowHidden ? 'hidden' : 'visible',
        }}
      >
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
      {isShowingFooter ?
        <ZeroFooterComponent />:null
      }
    </View>
  );
}
