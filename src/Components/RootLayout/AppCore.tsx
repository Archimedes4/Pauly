import { Colors } from '@constants';
import { RootState } from '@redux/store';
import getMainHeight from '@utils/getMainHeight';
import setDimentions from '@utils/ultility/setDimentions';
import { Slot } from 'expo-router';
import React, { useLayoutEffect, useEffect, useState } from 'react';
import { Dimensions, Platform, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

function useWindowSize() {
  if (Platform.OS === 'web') {
    const [size, setSize] = useState([0, 0]);
    useLayoutEffect(() => {
      function updateSize() {
        setSize([window.innerWidth, window.innerHeight]);
      }
      window.addEventListener('resize', updateSize);
      updateSize();
      return () => window.removeEventListener('resize', updateSize);
    }, []);
    return size;
  }
  const dimentions = useWindowDimensions();
  return [dimentions.width, dimentions.height];
}

// App core holds dimentions
export default function AppCore() {
  // Dimentions
  const safeAreaColors = useSelector(
    (state: RootState) => state.safeAreaColors,
  );
  const expandedMode = useSelector((state: RootState) => state.expandedMode);
  const { currentBreakPoint } = useSelector(
    (state: RootState) => state.dimentions,
  );
  const windowWidth = useWindowSize()[0];
  const windowHeight = useWindowSize()[1];

  const insets = useSafeAreaInsets();

  useEffect(() => {
    console.log(windowWidth, windowHeight);
    setDimentions(
      windowWidth,
      windowHeight,
      insets,
      safeAreaColors.isTopTransparent,
      safeAreaColors.isBottomTransparent,
    );
  }, [windowHeight, windowWidth]);

  useEffect(() => {
    setDimentions(
      windowWidth,
      windowHeight,
      insets,
      safeAreaColors.isTopTransparent,
      safeAreaColors.isBottomTransparent,
    );
  }, [
    expandedMode,
    safeAreaColors.isTopTransparent,
    safeAreaColors.isBottomTransparent,
  ]);

  useEffect(() => {
    const newDimensions = Dimensions.get('window');
    setDimentions(
      newDimensions.width,
      newDimensions.height,
      insets,
      safeAreaColors.isTopTransparent,
      safeAreaColors.isBottomTransparent,
    );
  }, []);

  return (
    <>
      {!safeAreaColors.isTopTransparent ? (
        <View
          style={{
            width: windowWidth,
            height: insets.top,
            backgroundColor: safeAreaColors.top,
          }}
        />
      ) : null}
      <View
        style={{
          backgroundColor: safeAreaColors.bottom,
          width: windowWidth,
          height: getMainHeight(
            windowHeight,
            insets.top,
            insets.bottom,
            safeAreaColors.isTopTransparent,
            safeAreaColors.isBottomTransparent,
          ),
          zIndex: 10,
          position: 'absolute',
          top: safeAreaColors.isTopTransparent ? 0 : insets.top,
          left: 0,
          overflow: Platform.OS === 'web' ? 'hidden' : undefined,
        }}
      >
        <Slot />
      </View>
      {!safeAreaColors.isBottomTransparent ? (
        <View
          style={{
            width: windowWidth,
            height: insets.bottom,
            backgroundColor: safeAreaColors.bottom,
            position: 'absolute',
            bottom: 0,
          }}
        />
      ) : null}
      {currentBreakPoint >= 1 ? (
        <View
          style={{
            height: windowHeight,
            width: expandedMode ? windowWidth * 0.25 : windowWidth * 0.1,
            backgroundColor: Colors.maroon,
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
      ) : null}
    </>
  );
}
