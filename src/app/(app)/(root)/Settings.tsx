/*
  Pauly
  Andrew Mainella
  November 10 2023
  Settings.tsx
  Settings for when current breake point is 0 (less than 576), allows the user to logout, go to the student search page and access goverment if in government mode.
*/
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, Image, StatusBar } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { safeAreaColorsSlice } from '@redux/reducers/safeAreaColorsReducer';
import { GearIcon, GovernmentIcon, PersonIcon } from '@components/Icons';
import { Colors, loadingStateEnum } from '@constants';
import { Link, useRouter } from 'expo-router';
import { useSignOut } from '@hooks/authentication';
import getUserImage from '@hooks/useGetUserProfile/getUserImage';
import PaulySettingsComponent from '@components/PaulySettingsComponent';

function SettingsImageComponent() {
  const { height, width } = useSelector(
    (state: RootState) => state.dimensions,
  );
  const { uri, displayName } = useSelector(
    (state: RootState) => state.microsoftProfileData,
  );
  const [imageLoadState, setImageLoadState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [triedReload, setTiredReload] = useState<boolean>(false); // Tried reloading the image
  return (
    <View
        style={{
          width,
          alignContent: 'center',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {uri !== '' && imageLoadState !== loadingStateEnum.failed ? (
          <Image
            source={{ uri }}
            onError={async e => {
              if (
                e.nativeEvent.error ===
                  'The operation couldn’t be completed. (NSURLErrorDomain error -1000.)' &&
                !triedReload
              ) {
                setImageLoadState(loadingStateEnum.failed);
                await getUserImage();
                setImageLoadState(loadingStateEnum.loading);
                setTiredReload(true);
              } else {
                setImageLoadState(loadingStateEnum.failed);
              }
            }}
            style={{
              width: width * 0.3,
              height: width * 0.3,
              borderRadius: width * 0.25,
            }}
          />
        ) : (
          <PersonIcon width={width * 0.4} height={width * 0.4} />
        )}
        <Text
          style={{
            color: Colors.white,
            fontWeight: 'bold',
            fontSize: 24,
            marginTop: height * 0.05,
          }}
        >
          {displayName}
        </Text>
      </View>
  )
}

export default function Settings() {
  const router = useRouter();
  const { height, width, currentBreakPoint } = useSelector(
    (state: RootState) => state.dimensions,
  );
  const isGovernmentMode = useSelector(
    (state: RootState) => state.isGovernmentMode,
  );
  const [isSignOutButtonPressed, setIsSignedOutButtonPressed] = useState<boolean>(false)
  const [isGovernmentButtonPressed, setIsGovernmentButtonPressed] = useState<boolean>(false)

  const dispatch = useDispatch();
  const signOut = useSignOut();

  useEffect(() => {
    dispatch(
      safeAreaColorsSlice.actions.setSafeAreaColors({
        top: Colors.maroon,
        bottom: Colors.maroon,
      }),
    );
  }, [dispatch]);

  const returnHome = useCallback(() => {
    router.replace('/');
  }, [router]);

  useEffect(() => {
    if (currentBreakPoint >= 1) {
      returnHome();
    }
  }, [currentBreakPoint, returnHome]);

  return (
    <View style={{ width, height }}>
      <StatusBar barStyle="light-content" />
      <View
        style={{
          alignContent: 'center',
          justifyContent: 'center',
          alignItems: 'center',
          height: height * 0.2,
          marginTop: height * 0.025,
          marginBottom: height * 0.02,
        }}
      >
        <GearIcon
          width={width < height ? width * 0.3 : height * 0.2}
          height={width < height ? width * 0.3 : height * 0.2}
          style={{ position: 'absolute', left: width * 0.2 }}
        />
        <Text
          style={{
            fontFamily: 'BukhariScript',
            fontSize: 45,
            color: Colors.white,
          }}
        >
          Settings
        </Text>
      </View>
      <SettingsImageComponent />
      <Pressable
        onPress={() => {
          signOut();
        }}
        onPressIn={() => {
          setIsGovernmentButtonPressed(true)
        }}
        onPressOut={() => {
          setIsGovernmentButtonPressed(false)
        }}
        style={{
          width: width * 0.8,
          height: height * 0.08,
          borderRadius: 15,
          shadowColor: Colors.black,
          shadowOffset: { width: 2, height: 4 },
          shadowOpacity: 0.8,
          shadowRadius: 10,
          marginLeft: 'auto',
          marginRight: 'auto',
          flexDirection: 'row',
          backgroundColor: isGovernmentButtonPressed ? Colors.lightGray:Colors.white,
          alignItems: 'center',
          alignContent: 'center',
          justifyContent: 'center',
          marginTop: height * 0.05,
        }}
      >
        <Text style={{ fontWeight: 'bold' }}>SIGN OUT</Text>
      </Pressable>
      {isGovernmentMode ? (
        <Link
          href="/government"
          style={{
            width: width * 0.8,
            height: height * 0.08,
            marginLeft: 'auto',
            marginRight: 'auto',
            shadowColor: Colors.black,
            shadowOffset: { width: 2, height: 4 },
            shadowOpacity: 0.8,
            borderRadius: 15,
            marginTop: 15,
            shadowRadius: 10,
          }}
        >
          <View
            style={{
              width: width * 0.8,
              height: height * 0.08,
              flexDirection: 'row',
              backgroundColor: isGovernmentButtonPressed ? Colors.lightGray:Colors.white,
              alignItems: 'center',
              borderRadius: 15,
              overflow: 'hidden',
            }}
          >
            <GovernmentIcon
              width={width * 0.8 < height * 0.08 ? width * 0.2 : height * 0.06}
              height={width * 0.8 < height * 0.08 ? width * 0.2 : height * 0.06}
              style={{ marginLeft: width * 0.025 }}
            />
            <Text style={{ marginTop: 'auto', marginBottom: 'auto' }}>
              Government
            </Text>
          </View>
        </Link>
      ) : null}
      <PaulySettingsComponent margin={width * 0.05} textColor={Colors.white}/>
    </View>
  );
}
