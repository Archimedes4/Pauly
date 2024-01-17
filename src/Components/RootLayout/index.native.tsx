/*
  Pauly
  Andrew Mainella
  16 January 2024
  RootLayout/index.native
  Native code for main Root app which holds providers
*/
import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import store from '@redux/store';
import { paperTheme } from '@constants';
import AppCore from './AppCore';

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
