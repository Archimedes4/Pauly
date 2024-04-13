/*
  Pauly
  Andrew Mainella
  1 December 2023
  _layout.tsx
  Main layout for the app.
*/
import React, { useEffect, useLayoutEffect, useState } from 'react';
import Head from 'expo-router/head';
import { loadAsync } from 'expo-font';
import { Slot, SplashScreen, usePathname } from 'expo-router';
import { Dimensions, Platform, View } from 'react-native';
import { ExpoMsalProvider } from '@archimedes4/expo-msal';
import store, { RootState } from '@redux/store';
import { Colors, paperTheme } from '@constants';
import { PaperProvider } from 'react-native-paper';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Provider, useSelector } from 'react-redux';
import setDimentions from '@utils/ultility/setDimentions';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import useIsShowingZeroFooter from '@hooks/useIsShowingZeroFooter';

SplashScreen.preventAutoHideAsync();

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

  const [dimensions, setDimensions] = useState(windowDimensions);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  });
  return [dimensions.width, dimensions.height];
}

// App core holds dimensions
function AppCore() {
  // Dimentions
  const safeAreaColors = useSelector(
    (state: RootState) => state.safeAreaColors,
  );
  const expandedMode = useSelector((state: RootState) => state.expandedMode);
  const zeroFooterHeight = useSelector(
    (state: RootState) => state.dimensions.zeroFooterHeight,
  );
  const { currentBreakPoint, totalHeight } = useSelector(
    (state: RootState) => state.dimensions,
  );
  const windowWidth = useWindowSize()[0];
  const windowHeight = useWindowSize()[1];

  const insets = useSafeAreaInsets();
  const isShowingFooter = useIsShowingZeroFooter()

  useEffect(() => {
    setDimentions(
      windowWidth,
      windowHeight,
      insets,
      safeAreaColors.isTopTransparent,
      safeAreaColors.isBottomTransparent,
      isShowingFooter
    );
  }, [expandedMode, safeAreaColors, windowHeight, windowWidth, insets, isShowingFooter, zeroFooterHeight]);

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
          height: totalHeight,
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

function RootLayout() {
  return (
    <PaperProvider theme={paperTheme}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ExpoMsalProvider clientId={process.env.EXPO_PUBLIC_CLIENTID ?? ""} tenantId={process.env.EXPO_PUBLIC_TENANTID}>
            <AppCore />
          </ExpoMsalProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </PaperProvider>
  );
}

export default function App(): React.JSX.Element | null {
  // Fixing hydration issues
  const [mounted, setMounted] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);
  const pathname = usePathname()

  useEffect(() => {
    if (!mounted) {
      loadAsync({
        BukhariScript: require('assets/fonts/BukhariScript.ttf'),
        'Gochi-Hand': require('assets/fonts/GochiHand-Regular.ttf'),
        Roboto: require('assets/fonts/Roboto-Regular.ttf'),
        'Roboto-Bold': require('assets/fonts/Roboto-Bold.ttf'),
        'Comfortaa-Regular': require('assets/fonts/Comfortaa-Regular.ttf'),
      })
        .then(() => setFontsLoaded(true))
        .catch(() => {});
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    async function hideSplash() {
      if (fontsLoaded) {
        await SplashScreen.hideAsync();
      }
    }
    hideSplash();
  }, [fontsLoaded]);

  if (!mounted && !fontsLoaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <Head>
        <title>Pauly</title>
        <meta property="og:url" content={process.env.EXPO_PUBLIC_PAULYHOST + pathname} />
      </Head>
      <RootLayout />
    </Provider>
  );
}
