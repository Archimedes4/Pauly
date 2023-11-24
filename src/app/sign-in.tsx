/*
  Pauly
  Andrew Mainella
  November 10 2023
  login.tsx
  Login page, 
*/
/* eslint-disable global-require */
/* This is for the requires which is not possible to not use require and docs for relevant resources use requrire. */
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { View, Text, Pressable, Image } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootState } from '../Redux/store';
import { safeAreaColorsSlice } from '../Redux/reducers/safeAreaColorsReducer';
import { GearIcon } from '../components/Icons/Icons';
import { Colors } from '../types';
import ProgressView from '../components/ProgressView';
import { useInvokeLogin, useSilentLogin } from '../Functions/authentication';
import { useSession } from '../Functions/ultility/getWebSession.web';

export default function SignIn() {
  //visual
  const { height, totalWidth } = useSelector((state: RootState) => state.dimentions);
  const [isBottonHover, setIsButtonHover] = useState<boolean>(false);
  const [isGovernmentHover, setIsGovernmentHover] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(0);
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();

  const safeArea = useCallback(
    async function setSafeAreaColors() {
      dispatch(safeAreaColorsSlice.actions.setSafeAreaColorTop(Colors.maroon));
      dispatch(
        safeAreaColorsSlice.actions.setSafeAreaColorBottom(Colors.maroon),
      );
    },
    [dispatch],
  );

  useEffect(() => {
    safeArea();
  }, [safeArea]);

  useEffect(() => {
    const heightIsGreater: boolean = totalWidth < height;
    if (heightIsGreater) {
      setFontSize(totalWidth / 4);
    } else {
      setFontSize(height / 3);
    }
  }, [height, totalWidth]);
  // Font
  const [fontsLoaded] = useFonts({
    BukhariScript: require('../assets/fonts/BukhariScript.ttf'),
    'Gochi Hand': require('../assets/fonts/GochiHand-Regular.ttf'),
  });

  useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  //authentication
  const login = useInvokeLogin();
  const authLoading = useSelector((state: RootState) => state.authLoading);
  const [isShowingGovernmentLogin, setIsShowingGovernmentLogin] =
    useState<boolean>(false);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Pressable
      style={{
        backgroundColor: Colors.maroon,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        height,
        width: totalWidth,
        overflow: 'hidden',
        top: -insets.top,
      }}
      onLongPress={() => {
        setIsShowingGovernmentLogin(true);
      }}
      delayLongPress={5000}
    >
      <View
        id="Content_Area"
        style={{
          width: totalWidth < height ? totalWidth : height,
          height: totalWidth < height ? totalWidth : height,
          alignItems: 'center',
          justifyContent: 'center',
          alignContent: 'center',
        }}
      >
        <View
          style={{
            width: fontSize * 1.65,
            height: fontSize,
            flexDirection: 'row',
          }}
          id="Text_Container"
        >
          <Image
            source={require('../assets/images/PaulyLogo.png')}
            resizeMode="contain"
            style={{
              width: fontSize,
              height: fontSize,
              position: 'absolute',
              left: -fontSize * 0.2,
            }}
          />
          <Text
            style={{
              position: 'absolute',
              left: fontSize * 0.5,
              top: fontSize * 0.22,
              fontFamily: 'Gochi Hand',
              fontSize: fontSize - fontSize / 3,
              textShadowColor: 'rgba(0, 0, 0, 1)',
              textShadowOffset: { width: 4, height: 5 },
              textShadowRadius: 0,
              color: Colors.white,
            }}
            selectable={false}
          >
            auly
          </Text>
        </View>
        <Text
          style={{ color: 'white', marginTop: 25, fontFamily: 'BukhariScript' }}
        >
          23/24 Saint Paul&#39;s High School Student Council
        </Text>
        <Pressable
          onPress={() => {login()}}
          onHoverIn={() => {
            setIsButtonHover(true);
          }}
          onHoverOut={() => {
            setIsButtonHover(false);
          }}
          style={{
            height: height * 0.09,
            width: totalWidth * 0.5,
            borderRadius: 50,
            backgroundColor: isBottonHover ? Colors.darkGray : Colors.white,
            alignContent: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: isBottonHover ? Colors.white : 'black',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.8,
            shadowRadius: 10,
            marginTop: totalWidth < height ? totalWidth * 0.05 : height * 0.05,
          }}
        >
          {authLoading ? (
            <ProgressView width={14} height={14} />
          ) : (
            <Text
              style={{
                textAlign: 'center',
                color: isBottonHover ? Colors.white : 'black',
                fontWeight: 'bold',
              }}
            >
              SIGN IN
            </Text>
          )}
        </Pressable>
        {isShowingGovernmentLogin ? (
          <Pressable
            onPress={() => {
              login(true);
            }}
            onHoverIn={() => {
              setIsGovernmentHover(true);
            }}
            onHoverOut={() => {
              setIsGovernmentHover(false);
            }}
            style={{
              height: height * 0.09,
              width: totalWidth * 0.5,
              borderRadius: 50,
              backgroundColor: isGovernmentHover
                ? Colors.darkGray
                : Colors.white,
              alignContent: 'center',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: isBottonHover ? Colors.white : 'black',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.8,
              shadowRadius: 10,
              marginTop: totalWidth < height ? totalWidth * 0.1 : height * 0.1,
              flexDirection: 'row',
            }}
          >
            <GearIcon width={18} height={18} />
            <Text
              style={{
                textAlign: 'center',
                color: isBottonHover ? Colors.white : 'black',
                fontWeight: 'bold',
              }}
            >
              SIGN IN AS ADMIN
            </Text>
          </Pressable>
        ) : null}
      </View>
      <Text
        style={{
          position: 'absolute',
          bottom: 4,
          fontSize: height * 0.02,
          fontFamily: 'Roboto',
          color: Colors.white,
        }}
      >
        A.M.D.G
      </Text>
    </Pressable>
  );
}
