/*
  Pauly
  Andrew Mainella
  November 9 2023
  LoadingScreen.tsx
  Used to wait for pauly to get its data. Causes problems when siteid and information is not loaded.
*/
import { View, Text, Platform, Pressable } from 'react-native';
import * as Network from 'expo-network';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import store, { RootState } from '../Redux/store';
import ProgressView from './ProgressView';
import { Colors } from '../types';
import { OfflineIcon } from './Icons/Icons';
import { useSession } from '../Functions/ultility/getWebSession.web';
import { useSignOut } from '../Functions/authentication/index.native';
import getPaulyLists from '../Functions/ultility/getPaulyLists';
import getUserProfile from '../Functions/ultility/getUserProfile';
import { checkIfGovernmentMode, getWantGovernment } from '../Functions/handleGovernmentLogin';
import { usePathname, useRouter } from 'expo-router';
import { useMsal } from '@azure/msal-react';
import { authenticationTokenSlice } from '../Redux/reducers/authenticationTokenReducer';
import { scopes } from '../PaulyConfig';

function useSilentLogin(): (() => Promise<void>) {
  const { instance } = useMsal();
  const router = useRouter();
  async function main() {
    // handle auth redired/do all initial setup for msal
    //checking if an account exists
    const accounts = instance.getAllAccounts();
    if (accounts.length > 0) {
      //getting the first account
      instance.setActiveAccount(accounts[0]);
      const accountResult = await instance.getActiveAccount();
      if (accountResult !== null) {
        const result = await instance.acquireTokenSilent({
          scopes,
        });
        store.dispatch(
          authenticationTokenSlice.actions.setAuthenticationToken(
            result.accessToken,
          ),
        );
        return;
      }
    }
    const redirectResult = await instance.handleRedirectPromise();
    if (redirectResult !== null) {
      instance.setActiveAccount(redirectResult.account);
      store.dispatch(authenticationTokenSlice.actions.setAuthenticationToken(redirectResult.accessToken))
      return;
    }
    return;
  }
  return main;
}

export default function LoadingView() {
  const isGovernmentMode = useSelector(
    (state: RootState) => state.isGovernmentMode,
  );
  const { height, totalWidth } = useSelector((state: RootState) => state.dimentions);
  const insets = useSafeAreaInsets();
  const [isShowingLogout, setIsShowingLogout] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const silentLogin = useSilentLogin();
  const getSession = useSession();
  const signOut = useSignOut();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState<boolean>(false);

  async function checkIfConnected() {
    const result = await Network.getNetworkStateAsync();
    if (result.isInternetReachable) {
      // Internet reachable
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }

  //connection hook
  useEffect(() => {
    checkIfConnected();
    const intervalId = setInterval(() => {
      // assign interval to a variable to clear it.
      checkIfConnected();
    }, 5000); // 5s

    return () => clearInterval(intervalId);
  }, []);

  async function loadContent() {
    await silentLogin();
    if (store.getState().authenticationToken !== '') {
      getSession();
      getPaulyLists();
      getUserProfile();
      if (await getWantGovernment()) {
        checkIfGovernmentMode();
      }
      if (pathname === '/') {
        console.log('redirect')
        router.push('/notifications')
      }
    } else {
      router.replace('/sign-in')
    }
  }

  useEffect(() => {
    console.log('mounted')
    if (!mounted) {
      loadContent(); 
      setMounted(true)
    }
  }, [])

  useEffect(() => {
    setTimeout(() => {
      setIsShowingLogout(true);
    }, 10000);
  }, []);


  if (!mounted) {
    return null
  }

  return (
    <View
      style={{
        width: totalWidth,
        top: -insets.top,
        height,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {isConnected ? (
        <>
          <ProgressView width={14} height={14} />
          <Text style={{ color: Colors.white }}>Loading</Text>
          {isGovernmentMode ? (
            <Pressable
              style={{ margin: 5 }}
            >
              <Text style={{ color: Colors.white }}>Overide</Text>
            </Pressable>
          ) : null}
          {isShowingLogout ? (
            <Pressable
              onPress={() => {
                signOut();
              }}
              style={{ margin: 5 }}
            >
              <Text style={{ color: Colors.white }}>Logout</Text>
            </Pressable>
          ) : null}
        </>
      ) : (
        <OfflineIcon width={50} height={50} color={Colors.white} />
      )}
    </View>
  );
}
