/*
  Pauly
  Andrew Mainella
  November 10 2023
  login.tsx
  Login page, 
*/
/* eslint-disable global-require */
/* This is for the requires which is not possible to not use require and docs for relevant resources use requrire. */
import { View, Text, Pressable, Image } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { safeAreaColorsSlice } from '@redux/reducers/safeAreaColorsReducer';
import { GearIcon } from '@components/Icons';
import { Colors } from '@constants';
import ProgressView from '@components/ProgressView';
import { useInvokeLogin } from '@hooks/authentication';
import { RootState } from '@redux/store';
import useIsAuthenticated from '@hooks/useIsAuthenticated';
import { router } from 'expo-router';

export function SignInComponent({ government }: { government: boolean }) {
  // visual
  const { height, totalWidth } = useSelector(
    (state: RootState) => state.dimensions,
  );
  const [isBottonHover, setIsButtonHover] = useState<boolean>(false);
  const [isGovernmentHover, setIsGovernmentHover] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(0);
  const dispatch = useDispatch();

  const safeArea = useCallback(
    async function setSafeAreaColors() {
      dispatch(
        safeAreaColorsSlice.actions.setSafeArea({
          top: Colors.maroon,
          bottom: Colors.maroon,
          isTopTransparent: false,
          isBottomTransparent: false,
          overflowHidden: true,
        }),
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

  // authentication
  const login = useInvokeLogin();
  const authActive = useSelector((state: RootState) => state.authActive);
  const [isShowingGovernmentLogin, setIsShowingGovernmentLogin] =
    useState<boolean>(false);
  const isAuthenticated = useIsAuthenticated();
  const currentBreakPoint = useSelector(
    (state: RootState) => state.dimensions.currentBreakPoint,
  );

  useEffect(() => {
    if (currentBreakPoint === 0 && isAuthenticated.authenticated) {
      router.push('/home');
    } else if (isAuthenticated.authenticated) {
      router.push('/');
    }
  }, [isAuthenticated]);

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
            source={require('assets/images/PaulyLogo.png')}
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
              fontFamily: 'Gochi-Hand',
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
          onPress={() => {
            if (!authActive) {
              login(false);
            }
          }}
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
            shadowColor: isBottonHover ? Colors.white : Colors.black,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.8,
            shadowRadius: 10,
            marginTop: totalWidth < height ? totalWidth * 0.05 : height * 0.05,
          }}
        >
          {authActive ? (
            <ProgressView width={14} height={14} />
          ) : (
            <Text
              selectable={false}
              style={{
                textAlign: 'center',
                color: isBottonHover ? Colors.white : Colors.black,
                fontFamily: 'Roboto-Bold',
              }}
            >
              SIGN IN
            </Text>
          )}
        </Pressable>
        {isShowingGovernmentLogin || government ? (
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
              shadowColor: isGovernmentHover ? Colors.white : Colors.black,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.8,
              shadowRadius: 10,
              marginTop: totalWidth < height ? totalWidth * 0.1 : height * 0.1,
              flexDirection: 'row',
            }}
          >
            {authActive ? (
              <ProgressView width={14} height={14} />
            ) : (
              <>
                <GearIcon
                  width={18}
                  height={18}
                  color={isGovernmentHover ? Colors.white : Colors.black}
                />
                <Text
                  selectable={false}
                  style={{
                    textAlign: 'center',
                    color: isGovernmentHover ? Colors.white : Colors.black,
                    fontFamily: 'Roboto-Bold',
                  }}
                >
                  SIGN IN AS ADMIN
                </Text>
              </>
            )}
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

export default function SignIn() {
  return <SignInComponent government={false} />;
}
