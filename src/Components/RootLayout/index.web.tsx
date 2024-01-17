/**
 * Pauly React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import React, { useEffect, useState } from 'react';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import store from '@redux/store';
import { paperTheme } from '@constants';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import AppCore from './AppCore';

// stop redirect error
function getRedirectUri() {
  if (typeof window !== 'undefined') {
    // checking if window is undefined as it is in node
    return `${window.location.protocol}//${window.location.host}`;
  }
  return '';
}

// This is for the microsoft authentication on web.
const pca = new PublicClientApplication({
  auth: {
    clientId: process.env.EXPO_PUBLIC_CLIENTID
      ? process.env.EXPO_PUBLIC_CLIENTID
      : '',
    authority: `https://login.microsoftonline.com/${process.env.EXPO_PUBLIC_TENANTID}/`,
    redirectUri: getRedirectUri(), // to stop node js error
    navigateToLoginRequestUrl: true
  },
});

// Main Root app holds providers
export default function RootLayout() {
  const [mounted, setMounted] = useState(false);

  async function wait() {
    await pca.initialize();
    setMounted(true);
  }

  useEffect(() => {
    wait();
  }, []);
  if (!mounted) {
    return null;
  }
  return (
    <Provider store={store}>
      <PaperProvider theme={paperTheme}>
        <SafeAreaProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <MsalProvider instance={pca}>
              <AppCore />
            </MsalProvider>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </PaperProvider>
    </Provider>
  );
}
