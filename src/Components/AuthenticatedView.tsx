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
import NavBarComponent from './NavComponent';
import { RootState } from '../Redux/store';
import ProfileBlock from '../app/Profile/ProfileBlock';
import { Colors } from '../types';
import { Slot, usePathname } from 'expo-router';
import LoadingView from './Loading';

export default function AuthenticatedView() {
  const { height, currentBreakPoint, totalWidth, width } = useSelector(
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
  const pathname = usePathname()

  useEffect(() => {
    console.log('path here:', pathname, totalWidth, width)
  }, [pathname])
  
  if ((siteId !== '' || overide) && authenticationToken !== '') {
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
  if (pathname === '/sign-in') {
    return <Slot />
  }
  return <LoadingView />
  // return <Redirect href={'/'}/>
}
