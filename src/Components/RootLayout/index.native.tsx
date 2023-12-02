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
import { Slot } from "expo-router";

const windowDimensions = Dimensions.get('window');

//App core holds dimentions
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
    const subscription = Dimensions.addEventListener(
      'change',
      ({window}) => {
        setStateDimensions(window);
        setDimentions(window.width, window.height, insets);
      },
    );
    return () => subscription?.remove();
  });

  useEffect(() => {
    const newDimensions = Dimensions.get('window');
    setStateDimensions(newDimensions);
    setDimentions(newDimensions.width, newDimensions.height, insets);
  }, []);

  return (
    <>
      <View
        style={{
          width: dimensions.width,
          height: insets.top,
          backgroundColor: safeAreaColors.top,
        }}
      />
      <SafeAreaView
        style={{
          backgroundColor: safeAreaColors.bottom,
          width: dimensions.width,
          height: dimensions.height - (insets.top + insets.bottom),
          zIndex: 10,
          top: insets.top,
          position: 'absolute',
        }}
      > 
        <Slot />      
      </SafeAreaView>
      <View
        style={{
          width: dimensions.width,
          height: insets.bottom,
          backgroundColor: safeAreaColors.bottom,
          position: 'absolute',
          bottom: 0,
        }}
      />
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

//Main Root app holds providers
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