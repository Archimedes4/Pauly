/*
  Pauly
  Andrew Mainella
  October 18 2023
  Notifications.tsx
*/
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  FlatList,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import store, { RootState } from '@redux/store';
import getCurrentPaulyData from '@utils/notifications/getCurrentPaulyData';
import { Colors, loadingStateEnum } from '@constants';
import ProgressView from '@components/ProgressView';
import { safeAreaColorsSlice } from '@redux/reducers/safeAreaColorsReducer';
import PDFView from '@components/PDF';
import BackButton from '@components/BackButton';
import { getClassEventsFromDay } from '@utils/classesFunctions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import calculateFontSize from '@utils/ultility/calculateFontSize';
import { getClasses } from '@redux/reducers/classesReducer';

// Get Messages
// Last Chat Message Channels Included

// Pauly
// Overview Message
// Powerpoint

// Insights
// Quick Access To files

// Calendar
// Calendar Overview
// Calendar Widget
// Dress Code

// Tasks

// Wants
// Assignments (problem is hard to test)

function WidgetView({ width, height }: { width: number; height: number }) {
  const { currentBreakPoint } = useSelector(
    (state: RootState) => state.dimensions,
  );
  const { schoolDayData, startTime } = useSelector(
    (state: RootState) => state.homepageData,
  );
  const dow: string[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return (
    <View
      style={{
        backgroundColor: Colors.maroon,
        width,
        height,
        borderRadius: 15,
        marginLeft: currentBreakPoint === 0 ? width * 0.05 : 0,
      }}
    >
      <View
        style={{
          width,
          height: height / 3,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: Colors.white, fontSize: height / 6 }}>
          {dow[new Date().getDay()]}
        </Text>
      </View>
      {schoolDayData !== undefined ? (
        <>
          <View
            style={{
              backgroundColor: Colors.darkGray,
              alignItems: 'center',
              alignContent: 'center',
              justifyContent: 'center',
              width,
              height: height / 6,
            }}
          >
            <Text style={{ color: Colors.white }}>
              {schoolDayData?.schedule.descriptiveName}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', height: height / 2 }}>
            <View
              style={{
                height: height * 0.5,
                width: width * 0.3,
                alignContent: 'center',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: Colors.white,
                  fontWeight: 'bold',
                  fontSize: calculateFontSize(
                    width * 0.2,
                    height * 0.5,
                    schoolDayData?.schoolDay.shorthand,
                  ),
                }}
              >
                {schoolDayData?.schoolDay.shorthand}
              </Text>
            </View>
            <View
              style={{
                height: height * 0.5,
                width: width * 0.7,
                alignContent: 'center',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  color: Colors.white,
                  fontSize: calculateFontSize(
                    width * 0.7,
                    height * 0.5,
                    startTime,
                  ),
                  fontFamily: 'Roboto-Bold',
                }}
              >
                {startTime}
              </Text>
            </View>
          </View>
        </>
      ) : (
        <View
          style={{
            backgroundColor: Colors.darkGray,
            alignItems: 'center',
            alignContent: 'center',
            justifyContent: 'center',
            width,
            height: height / 2,
          }}
        >
          <Text style={{ color: Colors.white }}>No School</Text>
        </View>
      )}
    </View>
  );
}


function BoardBlock() {
  const { width, height, currentBreakPoint } = useSelector(
    (state: RootState) => state.dimensions,
  );
  const { powerpointBlob, paulyDataState } = useSelector(
    (state: RootState) => state.paulyData,
  );
  if (paulyDataState === loadingStateEnum.loading || powerpointBlob === '') {
    return (
      <View
        style={{
          width: currentBreakPoint === 0 ? width * 0.9 : width * 0.7,
          height: height * 0.3,
          borderRadius: 15,
          marginTop: height * 0.03,
          marginLeft: currentBreakPoint === 0 ? width * 0.05 : 0,
          marginRight: width * 0.05,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: Colors.white,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.8,
          shadowRadius: 10,
        }}
      >
        <ProgressView width={100} height={100} />
        <Text>Loading</Text>
      </View>
    );
  }

  if (paulyDataState === loadingStateEnum.success) {
    return (
      <View
        style={{
          width: currentBreakPoint === 0 ? width * 0.9 : width * 0.7,
          borderRadius: 15,
          marginTop: height * 0.03,
          marginLeft: currentBreakPoint === 0 ? width * 0.05 : 0,
          marginRight: currentBreakPoint === 0 ? width * 0.05 : width * 0.03,
          backgroundColor: Colors.white,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.8,
          shadowRadius: 10,
        }}
      >
        <PDFView width={currentBreakPoint === 0 ? width * 0.9 : width * 0.7} />
      </View>
    );
  }

  return (
    <View
      style={{
        width: currentBreakPoint === 0 ? width * 0.9 : width * 0.7,
        height: height * 0.3,
        marginTop: height * 0.03,
        marginLeft: currentBreakPoint === 0 ? width * 0.05 : 0,
        backgroundColor: Colors.white,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        borderRadius: 15,
      }}
    >
      <Text>Failed</Text>
    </View>
  );
}

function ClassBlock() {
  const { width, height, currentBreakPoint } = useSelector(
    (state: RootState) => state.dimensions,
  );
  const classes = useSelector((state: RootState) => state.classes);
  useEffect(() => {
    getClasses(store);
  }, []);
  return (
    <>
      <View>
        <FlatList
          data={classes.classes}
          renderItem={e => (
            <View>
              <Text>{e.item.name}</Text>
            </View>
          )}
        />
      </View>
    </>
  );
}

export default function Notifications() {
  const { width, height, currentBreakPoint } = useSelector(
    (state: RootState) => state.dimensions,
  );
  const { message } = useSelector((state: RootState) => state.paulyData);
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const [isShowingDiscipline, setIsShowingdiscipline] =
    useState<boolean>(false);

  const loadData = useCallback(async () => {
    // Calendar Data
    getClassEventsFromDay();

    await getCurrentPaulyData()
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    dispatch(
      safeAreaColorsSlice.actions.setSafeArea({
        top: Colors.white,
        bottom: Colors.white,
        isTopTransparent: true,
        isBottomTransparent: true,
        overflowHidden: true,
      }),
    );
  }, [dispatch]);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={{ width, height, backgroundColor: Colors.lightGray }}>
        <View style={{ height: insets.top }} />
        {currentBreakPoint === 0 ? <BackButton to="/home" /> : null}
        <View
          style={{
            width,
            height: height * 0.1,
            marginTop: currentBreakPoint === 0 ? 10 : 0,
          }}
        >
          <View
            style={{
              width: width * 0.9,
              height: height * 0.07,
              alignContent: 'center',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 15,
              backgroundColor: Colors.darkGray,
              marginLeft: width * 0.05,
              marginRight: width * 0.05,
              marginTop: height * 0.015,
              marginBottom: height * 0.015,
            }}
          >
            <Text
              style={{ color: Colors.white, fontFamily: 'Comfortaa-Regular' }}
            >
              {message}
            </Text>
          </View>
        </View>
        {currentBreakPoint === 0 ? (
          <>
            <WidgetView width={width * 0.9} height={height * 0.3} />
            <BoardBlock />
          </>
        ) : (
          <View
            style={{
              flexDirection: 'row',
              width: width * 0.9,
              marginLeft: width * 0.05,
            }}
          >
            <BoardBlock />
            <View style={{ marginTop: height * 0.03 }}>
              <WidgetView width={width * 0.2} height={height * 0.2} />
            </View>
          </View>
        )}
      </ScrollView>
    </>
  );
}
