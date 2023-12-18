/**
 * Pauly React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import React, { useEffect, useState } from 'react';
import { Dimensions, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider, useSelector } from 'react-redux';
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import store, { RootState } from '@Redux/store';
import { Colors, paperTheme } from '@src/types';
import setDimentions from '@Functions/ultility/setDimentions';
import { Slot } from 'expo-router';
import getMainHeight from '@src/Functions/getMainHeight';

const windowDimensions = Dimensions.get('window');

// App core holds dimentions
function AppCore() {
  // Dimentions
  const safeAreaColors = useSelector(
    (state: RootState) => state.safeAreaColors,
  );
  const expandedMode = useSelector((state: RootState) => state.expandedMode);
  const { currentBreakPoint } = useSelector(
    (state: RootState) => state.dimentions,
  );
  const [dimensions, setStateDimensions] = useState(windowDimensions);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setStateDimensions(window);
      setDimentions(
        window.width,
        window.height,
        insets,
        safeAreaColors.isTopTransparent,
        safeAreaColors.isBottomTransparent,
      );
    });
    return () => subscription?.remove();
  });

  useEffect(() => {
    setDimentions(
      dimensions.width,
      dimensions.height,
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
    setStateDimensions(newDimensions);
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
            width: dimensions.width,
            height: insets.top,
            backgroundColor: safeAreaColors.top,
          }}
        />
      ) : null}
      <View
        style={{
          backgroundColor: safeAreaColors.bottom,
          width: dimensions.width,
          height: getMainHeight(
            dimensions.height,
            insets.top,
            insets.bottom,
            safeAreaColors.isTopTransparent,
            safeAreaColors.isBottomTransparent,
          ),
          zIndex: 10,
          top: safeAreaColors.isTopTransparent ? 0 : insets.top,
          position: 'absolute',
        }}
      >
        <Slot />
      </View>
      {!safeAreaColors.isBottomTransparent ? (
        <View
          style={{
            width: dimensions.width,
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
            height: dimensions.height,
            width: expandedMode
              ? dimensions.width * 0.25
              : dimensions.width * 0.1,
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

// Main Root app holds providers
export default function RootLayout() {
  return (
    <Provider store={store}>
      <PaperProvider theme={paperTheme}>
        <SafeAreaProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <AppCore />
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </PaperProvider>
    </Provider>
  );
}
