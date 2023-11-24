import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useSignOut, useSilentLogin } from '@/Functions/authentication';
import { useSession } from '@/Functions/ultility/getWebSession.web';
import { useSelector } from 'react-redux';
import store, { RootState } from '@/Redux/store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Network from 'expo-network';
import getPaulyLists from '@/Functions/ultility/getPaulyLists';
import getUserProfile from '@/Functions/ultility/getUserProfile';
import { checkIfGovernmentMode, getWantGovernment } from '@/Functions/handleGovernmentLogin';

export default function index() {
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
  const router = useRouter();
  
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