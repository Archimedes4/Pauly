/**
 * Pauly React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import React, { useEffect, useState } from 'react';
import { Dimensions, Platform, View } from 'react-native';
import { DefaultTheme, PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider, useSelector } from 'react-redux';
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import store, { RootState } from '@/Redux/store';
import { Colors } from '@/types';
import WebAuthHolder from '@/components/WebAuthHolder';
import setDimentions from '@/Functions/ultility/setDimentions';
import { Navigator, Slot } from "expo-router";
import 'raf/polyfill';

const windowDimensions = Dimensions.get('window');

//Holds main slot redirects to web slot with msal provider if web.
function SlotHolder() {
  if (Platform.OS === 'web') {
    return <WebAuthHolder />
  }
  return <Slot />
}


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
  }, [])

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
        <Navigator initialRouteName='/sign-in'>
          <SlotHolder />
        </Navigator>
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
            backgroundColor: '#793033',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
      ) : null}
    </>
  );
}

const theme = {
  ...DefaultTheme,
  roundness: 2,
  colors: {
    // Primary
    primary: Colors.darkGray, // ALL G
    primaryContainer: Colors.maroon, // Selected Am Mode
    onPrimary: Colors.black, // This is special Text
    onPrimaryContainer: Colors.black,
    inversePrimary: Colors.white,

    secondary: Colors.black,
    secondaryContainer: Colors.lightGray, // Back box of selected time or hour
    onSecondary: Colors.black, // text like if hour or minute is selected
    onSecondaryContainer: Colors.black,

    // Tertiary
    tertiary: Colors.darkGray,
    tertiaryContainer: Colors.darkGray,
    onTertiary: Colors.darkGray,

    // Background
    surface: Colors.white, // ALL G
    surfaceVariant: Colors.lightGray, // ALL G this is the circle
    onSurfaceVariant: Colors.black, // This is am pm and title text
    background: Colors.lightGray,
    onSurface: Colors.black, // This is most text
    onBackground: Colors.black,
    backdrop: 'rgba(237, 237, 237, 0.77)',

    outline: Colors.black, // ALL G
    outlineVariant: Colors.black,

    shadow: Colors.black,
    scrim: Colors.black,
  },
};

//Main Root app holds providers
export default function App() {
  return (
    <Provider store={store}>
      <PaperProvider theme={theme}>
        <SafeAreaProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <AppCore />
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </PaperProvider>
    </Provider>
  );
}