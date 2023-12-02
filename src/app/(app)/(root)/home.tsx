/*
  Pauly
  Andrew Mainella
  November 9 2023
  HomePage.tsx
  This is the homepage for when the width is less than 576
*/
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useCallback } from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import MonthView from '@components/MonthView';
import store, { RootState } from '@Redux/store';
import { safeAreaColorsSlice } from '@Redux/reducers/safeAreaColorsReducer';
import getCurrentPaulyData from '@Functions/notifications/getCurrentPaulyData';
import ProgressView from '@components/ProgressView';
import { BookIcon, MedalIcon, PersonIcon } from '@src/components/Icons';
import ScrollingTextAnimation from '@components/ScrollingTextAnimation';
import { Colors, loadingStateEnum } from '@src/types';
import { Link, useRouter } from "expo-router";

export default function HomePage() {
  const router = useRouter();
  const { siteId } = useSelector((state: RootState) => state.paulyList);
  const authenticationToken = useSelector(
    (state: RootState) => state.authenticationToken,
  );
  const { message, paulyDataState } = useSelector(
    (state: RootState) => state.paulyData,
  );
  const { height, width, currentBreakPoint } = useSelector(
    (state: RootState) => state.dimentions,
  );
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  async function loadData() {
    await getCurrentPaulyData();
  }

  const updateOutColors = useCallback(() => {
    dispatch(
      safeAreaColorsSlice.actions.setSafeAreaColors({
        top: Colors.maroon,
        bottom: Colors.maroon,
      }),
    );
  }, [dispatch]);

  useEffect(() => {
    updateOutColors();
  }, [updateOutColors]);

  useEffect(() => {
    if (
      store.getState().authenticationToken !== '' &&
      store.getState().paulyList.siteId !== ''
    ) {
      loadData();
    }
  }, [authenticationToken, siteId]);

  const backToHome = useCallback(() => {
    router.replace('/notifications');
  }, [router]);

  useEffect(() => {
    if (currentBreakPoint > 0) {
      backToHome();
    }
  }, [backToHome, currentBreakPoint]);

  // Font
  const [fontsLoaded] = useFonts({
    // eslint-disable-next-line global-require
    BukhariScript: require('assets/fonts/BukhariScript.ttf'),
    // eslint-disable-next-line global-require
    GochiHand: require('assets/fonts/GochiHand-Regular.ttf'),
  });

  useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <View style={{ backgroundColor: Colors.maroon, overflow: 'hidden' }}>
        <Link href="/notifications">
          <Pressable
            style={{ width: width * 1.0, height: height * 0.08 }}
          >
            {paulyDataState === loadingStateEnum.loading ? (
              <View
                style={{
                  width: width * 1.0,
                  height: height * 0.08,
                  alignContent: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ProgressView
                  width={width < height * 0.08 ? width * 0.1 : height * 0.07}
                  height={width < height * 0.08 ? width * 0.1 : height * 0.07}
                />
              </View>
            ) : (
              <>
                {paulyDataState === loadingStateEnum.success ? (
                  <>
                    {message !== '' ? (
                      <ScrollingTextAnimation
                        width={width * 1.0}
                        height={height * 0.08}
                        text={message}
                      />
                    ) : null}
                  </>
                ) : (
                  <Text>Failed</Text>
                )}
              </>
            )}
          </Pressable>
        </Link>
        <Link href={"/calendar"}>
          <Pressable
            style={{ width: width * 0.999, height: height * 0.42 }}
          >
            <View>
              <View
                style={{
                  width: width * 1.0,
                  height: height * 0.05,
                  alignItems: 'center',
                  alignContent: 'center',
                  justifyContent: 'center',
                  borderTopColor: 'black',
                  borderTopWidth: 2,
                  borderBottomColor: 'black',
                  borderBottomWidth: 2,
                }}
              >
                <Text style={{ margin: 'auto', color: Colors.white }}>
                  Calendar
                </Text>
              </View>
              <MonthView width={width * 1.0} height={height * 0.37} />
            </View>
          </Pressable>
        </Link>
        <View
          style={{
            flexDirection: 'row',
            width: width * 1.0,
            height: height * 0.25,
          }}
        >
          <Link href={"/commissions"}>
            <View style={{ borderColor: 'black', borderWidth: 2 }}>
              <View
                style={{
                  backgroundColor: Colors.maroon,
                  width: width * 0.5,
                  height: height * 0.25,
                  borderTopWidth: 1,
                  borderTopColor: 'black',
                  zIndex: 1,
                }}
              />
              <MedalIcon
                width={width * 0.5}
                height={height * 0.23}
                style={{ position: 'absolute', top: height * 0.01, zIndex: 2 }}
              />
            </View>
          </Link>
          <Link href={"/sports"}>
            <Pressable
              style={{ borderColor: 'black', borderWidth: 2 }}
            >
              <View
                style={{
                  backgroundColor: Colors.maroon,
                  width: width * 0.5,
                  height: height * 0.25,
                  borderTopWidth: 1,
                  borderTopColor: 'black',
                  zIndex: 1,
                }}
              />
              <Image
                // eslint-disable-next-line global-require
                source={require('assets/images/Football.png')}
                resizeMode="contain"
                width={width * 0.3}
                height={height * 0.25}
                style={{
                  zIndex: 2,
                  height: height * 0.25,
                  width: width * 0.5,
                  position: 'absolute',
                  aspectRatio: '1/1',
                }}
              />
            </Pressable>
          </Link>
        </View>
        <View
          style={{
            flexDirection: 'row',
            width: width * 1.0,
            height: height * 0.25,
          }}
        >
          <Link href={"/resources"}>
            <View style={{ borderColor: 'black', borderWidth: 2 }}>
              <View
                style={{
                  backgroundColor: Colors.maroon,
                  width: width * 0.5,
                  height: height * 0.25,
                  borderTopWidth: 1,
                  borderTopColor: 'black',
                  zIndex: 1,
                }}
              />
              <BookIcon
                width={width * 0.5}
                height={height * 0.25}
                style={{ position: 'absolute', zIndex: 2 }}
              />
            </View>
          </Link>
          <Link href={"/profile"}>
            <View style={{ borderColor: 'black', borderWidth: 2 }}>
              <View
                style={{
                  backgroundColor: Colors.maroon,
                  width: width * 0.5,
                  height: height * 0.25,
                  borderTopWidth: 1,
                  borderTopColor: 'black',
                }}
              />
              <PersonIcon
                width={width * 0.5}
                height={height * 0.25}
                style={{ position: 'absolute', zIndex: 2 }}
              />
            </View>
          </Link>
        </View>
      </View>
      <View
        style={{
          position: 'absolute',
          backgroundColor: 'black',
          width: 4,
          left: width / 2 + 2,
          bottom: -insets.bottom,
          height: insets.bottom,
        }}
      />
    </>
  );
}
