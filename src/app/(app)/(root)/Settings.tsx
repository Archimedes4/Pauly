/*
  Pauly
  Andrew Mainella
  November 10 2023
  Settings.tsx
  Settings for when current breake point is 0 (less than 576), allows the user to logout, go to the student search page and access goverment if in government mode.
*/
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { safeAreaColorsSlice } from '@redux/reducers/safeAreaColorsReducer';
import {
  GearIcon,
  GovernmentIcon,
  PersonIcon,
  StudentSearchIcon,
} from '@components/Icons';
import BackButton from '@components/BackButton';
import { Colors, loadingStateEnum } from '@constants';
import { Link, useRouter } from 'expo-router';
import { useSignOut } from '@src/hooks/authentication';

export default function Settings() {
  const router = useRouter();
  const { height, width, currentBreakPoint } = useSelector(
    (state: RootState) => state.dimensions,
  );
  const isGovernmentMode = useSelector(
    (state: RootState) => state.isGovernmentMode,
  );
  const { uri, displayName } = useSelector(
    (state: RootState) => state.microsoftProfileData,
  );
  const [imageLoadState, setImageLoadState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
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
    <View>
      <BackButton to="/home" color={Colors.white}/>
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
            onError={() => {
              setImageLoadState(loadingStateEnum.failed);
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
      <Pressable
        onPress={() => {
          signOut();
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
          backgroundColor: Colors.white,
          alignItems: 'center',
          alignContent: 'center',
          justifyContent: 'center',
          marginTop: height * 0.05,
        }}
      >
        <Text style={{ fontWeight: 'bold' }}>SIGN OUT</Text>
      </Pressable>
      <Link
        href="/students"
        style={{
          width: width * 0.8,
          height: height * 0.08,
          marginLeft: 'auto',
          marginRight: 'auto',
          marginTop: height * 0.05,
          marginBottom: height * 0.05,
          shadowColor: Colors.black,
          shadowOffset: { width: 2, height: 4 },
          shadowOpacity: 0.8,
          borderRadius: 15,
          shadowRadius: 10,
        }}
      >
        <View
          style={{
            width: width * 0.8,
            height: height * 0.08,
            flexDirection: 'row',
            backgroundColor: Colors.white,
            alignItems: 'center',
            borderRadius: 15,
            overflow: 'hidden',
          }}
        >
          <StudentSearchIcon
            width={width * 0.8 < height * 0.08 ? width * 0.2 : height * 0.06}
            height={width * 0.8 < height * 0.08 ? width * 0.2 : height * 0.06}
            style={{ marginLeft: width * 0.025 }}
          />
          <Text style={{ marginTop: 'auto', marginBottom: 'auto' }}>
            Students
          </Text>
        </View>
      </Link>
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
            marginBottom: 15,
            shadowRadius: 10,
          }}
        >
          <View
            style={{
              width: width * 0.8,
              height: height * 0.08,
              flexDirection: 'row',
              backgroundColor: Colors.white,
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
    </View>
  );
}
