import { View, Text, Platform, Pressable } from 'react-native';
import * as Network from 'expo-network';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  DiscoveryDocument,
  revokeAsync,
  useAutoDiscovery,
} from 'expo-auth-session';
import { useMsal } from '@azure/msal-react';
import { AccountInfo, IPublicClientApplication } from '@azure/msal-browser';
import { authenticationTokenSlice } from '../Redux/reducers/authenticationTokenReducer';
import store, { RootState } from '../Redux/store';
import ProgressView from '../UI/ProgressView';
import { Colors } from '../types';
import { tenantId } from '../PaulyConfig';
import { OfflineIcon } from '../UI/Icons/Icons';

function signOutNative(discovery: DiscoveryDocument) {
  revokeAsync({ token: store.getState().authenticationToken }, discovery);
  store.dispatch(authenticationTokenSlice.actions.setAuthenticationToken(''));
}

function signOutWeb(instance: IPublicClientApplication, account?: AccountInfo) {
  store.dispatch(authenticationTokenSlice.actions.setAuthenticationToken(''));
  instance.logoutPopup({
    account,
  });
}

export default function LoadingView({
  setOveride,
  width,
}: {
  setOveride: (item: boolean) => void;
  width: number;
}) {
  const isGovernmentMode = useSelector(
    (state: RootState) => state.isGovernmentMode,
  );
  const { height } = useSelector((state: RootState) => state.dimentions);
  const insets = useSafeAreaInsets();
  const [isShowingLogout, setIsShowingLogout] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(true);

  const discovery = useAutoDiscovery(
    `https://login.microsoftonline.com/${tenantId}/v2.0`,
  );
  const { instance } = useMsal();

  function signOut() {
    if (Platform.OS === 'web') {
      const account = instance.getActiveAccount();
      if (account !== null) {
        signOutWeb(instance, account);
      } else {
        signOutWeb(instance);
      }
    } else if (discovery !== null) {
      signOutNative(discovery);
    }
  }

  async function checkIfConnected() {
    const result = await Network.getNetworkStateAsync();
    if (result.isInternetReachable) {
      // Internet reachable
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }

  useEffect(() => {
    checkIfConnected();
    const intervalId = setInterval(() => {
      // assign interval to a variable to clear it.
      checkIfConnected();
    }, 5000); // 5s

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setIsShowingLogout(true);
    }, 10000);
  }, []);

  return (
    <View
      style={{
        width,
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
              onPress={() => {
                setOveride(true);
              }}
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
