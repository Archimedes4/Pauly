/*
  Pauly
  Andrew Mainella
  October 18 2023
  Notifications.tsx
*/
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StatusBar, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import store, { RootState } from '@redux/store';
import getCurrentPaulyData from '@utils/notifications/getCurrentPaulyData';
import { Colors, loadingStateEnum } from '@constants';
import ProgressView from '@components/ProgressView';
import { safeAreaColorsSlice } from '@redux/reducers/safeAreaColorsReducer';
import PDFView from '@components/PDF';
import { getClassEventsFromDay } from '@utils/classesFunctions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import calculateFontSize from '@utils/ultility/calculateFontSize';
import { getClasses } from '@redux/reducers/classesReducer';
import { Link } from 'expo-router';
import CompressedMonthView from '@components/CompressedMonthView';
import ScrollingTextAnimation from '@components/ScrollingTextAnimation';

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
  );
}

/*
  TODO
  The code below is should be looked at with much confusion.
  Everything works and looks the way it should on the web.
  But on iOS there is some bug when using the height directly and it gets updated.
  This happens right away as the zero footer comes in.
  Therefore calendarHeight is needed to force a rerender and all is well. I have placed a marker beside the buggy heights.
  This is a very small performance issue, one that I believe to be expo-routers fault.
  This might be fixed in the future. To test remove the calendar height and replace it with height. OR just find the bug I cannot see.
*/
function HomePageSmallCalendar({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  const [calendarHeight, setCalendarHeight] = useState<number>(0);
  useEffect(() => {
    setCalendarHeight(height);
  }, [height]);
  if (calendarHeight !== height) {
    return null;
  }
  return (
    <View style={{ width, height: height * 0.42 }}>
      <View
        style={{
          width,
          height: Math.round(calendarHeight * 0.05), // buggy height
          alignItems: 'center',
          alignContent: 'center',
          justifyContent: 'center',
          borderTopColor: Colors.black,
          borderTopWidth: 2,
          borderBottomColor: Colors.black,
          borderBottomWidth: 2,
        }}
      >
        <Text
          style={{
            margin: 'auto',
            color: Colors.white,
            fontFamily: 'Comfortaa-Regular',
            width,
            textAlign: 'center',
          }}
        >
          Calendar
        </Text>
      </View>
      <CompressedMonthView
        width={width}
        height={calendarHeight * 0.37} // buggy height
      />
    </View>
  );
}
// End TODO

function HomePageSmall() {
  const { message, paulyDataState } = useSelector(
    (state: RootState) => state.paulyData,
  );
  const { height, width } = useSelector((state: RootState) => state.dimensions);
  const dispatch = useDispatch();

  async function loadData() {
    await getCurrentPaulyData();
  }

  const updateOutColors = useCallback(() => {
    dispatch(
      safeAreaColorsSlice.actions.setSafeArea({
        top: Colors.maroon,
        bottom: Colors.maroon,
        isTopTransparent: false,
        isBottomTransparent: false,
        overflowHidden: false,
      }),
    );
  }, [dispatch]);

  useEffect(() => {
    updateOutColors();
  }, [updateOutColors]);

  useEffect(() => {
    loadData();
  }, []);

  return (
    <ScrollView style={{ backgroundColor: Colors.maroon, height }}>
      <View style={{ width: width * 1.0, height: height * 0.08 }}>
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
      </View>
      <Link href="/calendar" style={{ padding: 0, height: height * 0.42 }}>
        <HomePageSmallCalendar width={width} height={height} />
      </Link>
      <BoardBlock />
    </ScrollView>
  );
}

function HomePageLarge() {
  const { width, height, currentBreakPoint } = useSelector(
    (state: RootState) => state.dimensions,
  );
  const { message } = useSelector((state: RootState) => state.paulyData);
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const loadData = useCallback(async () => {
    // Calendar Data
    getClassEventsFromDay();

    await getCurrentPaulyData();
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
      </ScrollView>
    </>
  );
}

export default function HomePage() {
  const { currentBreakPoint } = useSelector(
    (state: RootState) => state.dimensions,
  );
  if (currentBreakPoint === 0) {
    return <HomePageSmall />;
  }
  return <HomePageLarge />;
}
