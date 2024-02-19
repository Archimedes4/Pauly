import { Colors } from '@constants';
import { RootState } from '@redux/store';
import setDimentions from '@utils/ultility/setDimentions';
import { Slot } from 'expo-router';
import React, { useLayoutEffect, useEffect, useState } from 'react';
import { Dimensions, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

const windowDimensions = Dimensions.get('window');

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
  

  const [dimensions, setDimensions] = useState(
    windowDimensions
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener(
      'change',
      ({window}) => {
        setDimensions(window);
      },
    );
    return () => subscription?.remove();
  });
  return [dimensions.width, dimensions.height];
}

// App core holds dimensions
export default function AppCore() {
  // Dimentions
  const safeAreaColors = useSelector(
    (state: RootState) => state.safeAreaColors,
  );
  const expandedMode = useSelector((state: RootState) => state.expandedMode);
  const { currentBreakPoint, width, height } = useSelector(
    (state: RootState) => state.dimensions,
  );
  const windowWidth = useWindowSize()[0];
  const windowHeight = useWindowSize()[1];

  const insets = useSafeAreaInsets();

  if (Platform.OS === 'web') {
    useEffect(() => {
      setDimentions(
        windowWidth,
        windowHeight,
        insets,
        safeAreaColors.isTopTransparent,
        safeAreaColors.isBottomTransparent,
      );
    }, [expandedMode, safeAreaColors, windowHeight, windowWidth, insets]);
  } else {
    useEffect(() => {
      setDimentions(
        windowWidth,
        windowHeight,
        insets,
        safeAreaColors.isTopTransparent,
        safeAreaColors.isBottomTransparent,
      );
    });
  }

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
          height: height,
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
