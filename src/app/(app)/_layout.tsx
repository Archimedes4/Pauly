/*
  Pauly
  Andrew Mainella
  17 December 2023
  Authenticated layout
*/
import { View, Text, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import useIsConnected from '@hooks/useIsConnected';
import { Colors } from '@constants';
import { OfflineIcon } from '@components/Icons';
import { Redirect, Slot, useFocusEffect, usePathname, useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import store, { RootState } from '@redux/store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useAuthentication from '@hooks/useAuthentication';
import { safeAreaColorsSlice } from '@src/redux/reducers/safeAreaColorsReducer';
import LoadingComponent from '@src/components/LoadingComponent';
import useIsAuthenticated from '@src/hooks/useIsAuthenticated';

function OfflineView() {
  const { totalHeight, totalWidth } = useSelector(
    (state: RootState) => state.dimensions,
  );
  const insets = useSafeAreaInsets();
  
  useEffect(() => {
    store.dispatch(
      safeAreaColorsSlice.actions.setSafeAreaColors({
        top: Colors.maroon,
        bottom: Colors.maroon,
      }),
    );
  }, []);

  return (
    <View
      style={{
        width: totalWidth,
        top: -insets.top,
        height: totalHeight,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <OfflineIcon width={50} height={50} color={Colors.white} />
    </View>
  )
}

function PushToAuth({deepLink}:{deepLink: string}) {
  const router = useRouter();
  useFocusEffect(() => {
    try {
      if (deepLink !== "/") {
        router.push({
          pathname: "/sign-in",
          params: {
            deepLink
          }
        });
      } else {
        router.push({
          pathname: "/sign-in",
        });
      }
    } catch (error) {}
  });
  return null;
}

export default function Layout() {
  const [deepLink, setDeepLink] = useState<string>("/")
  const isConnected = useIsConnected();
  const isLoading = useAuthentication();
  const isAuthenticated = useIsAuthenticated();
  const pathname = usePathname()
  useEffect(() => {
    if (pathname !== "/" && pathname !== "/sign-in" && pathname !== "/admin-sign-in") {
      setDeepLink(pathname)
    }
  }, [])
  
  if (!isConnected) {
    return <OfflineView />
  }

  if (isAuthenticated.loading || isLoading) {
    return <LoadingComponent />;
  }

  if (!isAuthenticated.authenticated && (pathname === "/sign-in" || pathname === "/admin-sign-in")) {
    // User is *not* auth, on sign in
    return <Slot />;
  }

  if (isAuthenticated.authenticated && (pathname === "/sign-in" || pathname === "/admin-sign-in")) {
    // User *is* auth, on sign in
    return <Redirect href={"/"}/>
  }

  if (!isAuthenticated.authenticated) {
    return <PushToAuth deepLink={deepLink}/>
  }


  if (isConnected && !isLoading && !isAuthenticated.loading) {
    return <Slot />;
  }

  return <OfflineView />
}
