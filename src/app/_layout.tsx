/*
  Pauly
  Andrew Mainella
  1 December 2023
  _layout.tsx
*/
import RootLayout from '@components/RootLayout';
import React, { useEffect, useState } from 'react';
import Head from 'expo-router/head';
import { loadAsync } from 'expo-font';
import { SplashScreen } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function App(): React.JSX.Element | null {
  // Fixing hydration issues
  const [mounted, setMounted] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (!mounted) {
      loadAsync({
        BukhariScript: require('assets/fonts/BukhariScript.ttf'),
        'Gochi-Hand': require('assets/fonts/GochiHand-Regular.ttf'),
        Roboto: require('assets/fonts/Roboto-Regular.ttf'),
        'Roboto-Bold': require('assets/fonts/Roboto-Bold.ttf'),
        'Comfortaa-Regular': require('assets/fonts/Comfortaa-Regular.ttf'),
      })
        .then(() => setFontsLoaded(true
          ))
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
    hideSplash()
  }, [fontsLoaded])

  if (!mounted && !fontsLoaded) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Pauly</title>
      </Head>
      <RootLayout />
    </>
  );
}
