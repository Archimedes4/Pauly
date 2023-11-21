/*
  Pauly
  Andrew Mainella
  October 18 2023
  Notifications.tsx
*/

import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  Linking,
  ScrollView,
  ListRenderItemInfo,
  Switch,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { FlatList } from 'react-native-gesture-handler';
import store, { RootState } from '../../Redux/store';
import getCurrentPaulyData from '../../Functions/notifications/getCurrentPaulyData';
import { Colors, loadingStateEnum, taskStatusEnum } from '../../types';
import getUsersTasks from '../../Functions/notifications/getUsersTasks';
import ProgressView from '../../components/ProgressView';
import getInsightData from '../../Functions/notifications/getInsightData';
import CustomCheckBox from '../../components/CheckMark/CustomCheckBox';
import { safeAreaColorsSlice } from '../../Redux/reducers/safeAreaColorsReducer';
import { homepageDataSlice } from '../../Redux/reducers/homepageDataReducer';
import PDFView from '../../components/PDF/PDFView';
import BackButton from '../../components/BackButton';
import MimeTypeIcon from '../../components/Icons/MimeTypeIcon';
import { getClassEventsFromDay } from '../../Functions/classesFunctions';
import { TrashIcon, WarningIcon } from '../../components/Icons/Icons';
import {
  deleteTask,
  updateTaskText,
} from '../../Functions/notifications/updateTasks';

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
    (state: RootState) => state.dimentions,
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
                  fontSize: height * 0.4,
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
              <Text style={{ color: Colors.white, fontSize: height / 3 }}>
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

function DeleteTask({ onDelete }: { onDelete: () => void }) {
  return (
    <Pressable
      onPress={() => onDelete()}
      style={{
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: Colors.danger,
      }}
    >
      <TrashIcon width={14} height={14} style={{ margin: 'auto' }} />
    </Pressable>
  );
}

function TaskItem({ task }: { task: ListRenderItemInfo<taskType> }) {
  const { width } = useSelector((state: RootState) => state.dimentions);
  const { isShowingCompleteTasks } = useSelector(
    (state: RootState) => state.homepageData,
  );
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch();

  const checkUpdateText = useCallback(async () => {
    if (mounted) {
      const taskNameSave =
        store.getState().homepageData.userTasks[task.index].name;
      setTimeout(() => {
        if (
          store.getState().homepageData.userTasks[task.index].name ===
          taskNameSave
        ) {
          console.log('Running');
          updateTaskText(task);
        }
      }, 1500);
    } else {
      setMounted(true);
    }
  }, [mounted, task]);

  if (isShowingCompleteTasks || task.item.status !== taskStatusEnum.completed) {
    return (
      <Swipeable
        renderRightActions={() => {
          if (task.item.excess) {
            return null;
          }
          return <DeleteTask onDelete={() => deleteTask(task)} />;
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            width: width * 0.9,
            paddingTop: 5,
            paddingBottom: 5,
          }}
        >
          <Pressable
            onPress={() => {
              if (task.item.status !== taskStatusEnum.completed) {
                dispatch(
                  homepageDataSlice.actions.updateUserTask({
                    task: { ...task.item, status: taskStatusEnum.completed },
                    index: task.index,
                  }),
                );
              } else {
                dispatch(
                  homepageDataSlice.actions.updateUserTask({
                    task: { ...task.item, status: taskStatusEnum.notStarted },
                    index: task.index,
                  }),
                );
              }
            }}
            style={{ marginTop: 'auto', marginBottom: 'auto', marginRight: 2 }}
          >
            {task.item.state === loadingStateEnum.loading && (
              <ProgressView width={14} height={14} />
            )}
            {task.item.state !== loadingStateEnum.loading &&
              task.item.state !== loadingStateEnum.notStarted &&
              task.item.state !== loadingStateEnum.success &&
              !task.item.excess && (
                <WarningIcon
                  width={14}
                  height={14}
                  outlineColor={Colors.danger}
                />
              )}
            {(task.item.state === loadingStateEnum.notStarted ||
              task.item.state === loadingStateEnum.success ||
              task.item.excess) && (
              <CustomCheckBox
                checked={task.item.status === taskStatusEnum.completed}
                checkMarkColor="blue"
                strokeDasharray={task.item.excess ? 5 : undefined}
                height={20}
                width={20}
              />
            )}
          </Pressable>
          <TextInput
            value={task.item.name}
            onChangeText={e => {
              dispatch(
                homepageDataSlice.actions.updateUserTask({
                  task: {
                    ...task.item,
                    name: e,
                  },
                  index: task.index,
                }),
              );
              checkUpdateText();
            }}
            multiline
            numberOfLines={1}
            style={{ width: width * 0.9 - 40 }}
          />
        </View>
      </Swipeable>
    );
  }
  return null;
}

function TaskBlock() {
  const { width, height } = useSelector((state: RootState) => state.dimentions);
  const { taskState, userTasks, isShowingCompleteTasks } = useSelector(
    (state: RootState) => state.homepageData,
  );
  return (
    <View style={{ width }}>
      <Text
        style={{
          fontSize: 24,
          marginLeft: width * 0.05,
          marginTop: height * 0.03,
          marginBottom: height * 0.02,
        }}
      >
        Tasks
      </Text>
      <View
        style={{
          shadowColor: 'black',
          width: width * 0.9,
          marginLeft: width * 0.05,
          backgroundColor: Colors.white,
          marginRight: width * 0.05,
          height: height * 0.5,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.8,
          shadowRadius: 10,
          borderRadius: 15,
        }}
      >
        <View style={{ flexDirection: 'row', marginLeft: 10, marginTop: 5 }}>
          <Text>Show Completed:</Text>
          <Switch
            trackColor={{ false: Colors.lightGray, true: Colors.darkGray }}
            thumbColor={
              isShowingCompleteTasks ? Colors.maroon : Colors.darkGray
            }
            ios_backgroundColor={Colors.lightGray}
            onValueChange={e => {
              store.dispatch(
                homepageDataSlice.actions.setIsShowingCompletedTasks(e),
              );
            }}
            value={isShowingCompleteTasks}
            style={{ marginLeft: 5 }}
          />
        </View>
        {taskState === loadingStateEnum.loading ? (
          <View
            style={{
              width: width * 0.9,
              height: height * 0.5 - 20,
              alignContent: 'center',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ProgressView
              width={
                width * 0.9 < height * 0.5 - 20
                  ? width * 0.45
                  : height * 0.25 - 20
              }
              height={
                width * 0.9 < height * 0.5 - 20
                  ? width * 0.45
                  : height * 0.25 - 20
              }
            />
            <Text>Loading</Text>
          </View>
        ) : null}
        {taskState === loadingStateEnum.success && (
          <FlatList
            data={userTasks}
            id="Task Container"
            renderItem={task => (
              <TaskItem task={task} key={`User_Task_${task.item.id}`} />
            )}
          />
        )}
        {taskState !== loadingStateEnum.success &&
          taskState !== loadingStateEnum.failed && (
            <View>
              <Text>Failed</Text>
            </View>
          )}
      </View>
    </View>
  );
}

function BoardBlock() {
  const { width, height, currentBreakPoint } = useSelector(
    (state: RootState) => state.dimentions,
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
        width: width * 0.9,
        height: height * 0.3,
        marginTop: height * 0.03,
        marginLeft: currentBreakPoint === 0 ? width * 0.05 : 0,
        backgroundColor: '#FFFFFF',
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

function PopularFiles({ width }: { width: number }) {
  const { height } = useSelector((state: RootState) => state.dimentions);
  const { trendingData, trendingState } = useSelector(
    (state: RootState) => state.homepageData,
  );
  if (trendingState === loadingStateEnum.loading) {
    return (
      <View
        style={{
          width,
          height,
          overflow: 'hidden',
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ProgressView width={14} height={14} />
        <Text>Loading</Text>
      </View>
    );
  }

  if (trendingState === loadingStateEnum.success) {
    return (
      <>
        {trendingData.map(data => (
          <Pressable
            key={`User_Insight_${data.id}`}
            style={{ flexDirection: 'row' }}
            onPress={() => {
              Linking.openURL(data.webUrl);
            }}
          >
            <View style={{ margin: 10, flexDirection: 'row' }}>
              <MimeTypeIcon width={14} height={14} mimeType={data.type} />
              <Text>{data.title}</Text>
            </View>
          </Pressable>
        ))}
      </>
    );
  }
  return <Text>Failed To Load</Text>;
}

function TrendingFiles({ width }: { width: number }) {
  const { height } = useSelector((state: RootState) => state.dimentions);
  const { userState, userData } = useSelector(
    (state: RootState) => state.homepageData,
  );
  return (
    <ScrollView style={{ height: height * 0.3, width }}>
      {userState === loadingStateEnum.loading ? (
        <Text>Loading</Text>
      ) : (
        <View>
          {userState === loadingStateEnum.success ? (
            <View>
              {userData.map(data => (
                <Pressable
                  key={`User_Insight_${data.id}`}
                  style={{ flexDirection: 'row' }}
                  onPress={() => {
                    Linking.openURL(data.webUrl);
                  }}
                >
                  <View style={{ margin: 10, flexDirection: 'row' }}>
                    <MimeTypeIcon width={14} height={14} mimeType={data.type} />
                    <Text>{data.title}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <Text>Failed</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

function InsightsBlock() {
  const { width, height, currentBreakPoint } = useSelector(
    (state: RootState) => state.dimentions,
  );

  if (currentBreakPoint <= 0) {
    <>
      <Text
        style={{
          fontSize: 24,
          marginLeft: width * 0.05,
          marginTop: height * 0.03,
          marginBottom: height * 0.02,
        }}
      >
        Recent Files
      </Text>
      <View
        style={{
          marginLeft: width * 0.05,
          marginRight: width * 0.05,
          width: width * 0.9,
          height: height * 0.3,
          backgroundColor: Colors.white,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.8,
          shadowRadius: 10,
          borderRadius: 15,
        }}
      >
        <TrendingFiles width={width * 0.9} />
      </View>
      <Text
        style={{
          fontSize: 24,
          marginLeft: width * 0.05,
          marginTop: height * 0.03,
          marginBottom: height * 0.02,
        }}
      >
        Popular Files
      </Text>
      <View
        style={{
          marginLeft: width * 0.05,
          marginRight: width * 0.05,
          width: width * 0.9,
          height: height * 0.3,
          backgroundColor: Colors.white,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.8,
          shadowRadius: 10,
          borderRadius: 15,
          marginBottom: height * 0.05,
        }}
      >
        <PopularFiles width={width * 0.9} />
      </View>
    </>;
  }

  return (
    <>
      <Text
        style={{
          fontSize: 24,
          marginLeft: width * 0.05,
          marginTop: height * 0.03,
          marginBottom: height * 0.02,
        }}
      >
        Files
      </Text>
      <View
        style={{
          width: width * 0.9,
          flexDirection: 'row',
          marginLeft: 'auto',
          marginRight: 'auto',
          marginTop: height * 0.025,
          marginBottom: height * 0.025,
          backgroundColor: Colors.white,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.8,
          shadowRadius: 10,
          borderRadius: 15,
        }}
      >
        <View style={{ width: width * 0.45, overflow: 'scroll' }}>
          <TrendingFiles width={width * 0.45} />
        </View>
        <View style={{ width: width * 0.45, overflow: 'visible' }}>
          <PopularFiles width={width * 0.45} />
        </View>
      </View>
    </>
  );
}

export default function Notifications() {
  const { width, height, currentBreakPoint } = useSelector(
    (state: RootState) => state.dimentions,
  );
  const { message } = useSelector((state: RootState) => state.paulyData);
  const dispatch = useDispatch();

  const loadData = useCallback(async () => {
    // Calendar Data
    getClassEventsFromDay();

    // Insights
    const insightResult = await getInsightData();
    dispatch(
      homepageDataSlice.actions.setTrendingData(insightResult.trendingData),
    );
    dispatch(
      homepageDataSlice.actions.setTrendingState(insightResult.trendingState),
    );
    dispatch(homepageDataSlice.actions.setUserData(insightResult.userData));
    dispatch(homepageDataSlice.actions.setUserState(insightResult.userState));

    // Pauly Data
    await getCurrentPaulyData();

    // List Data
    const taskResult = await getUsersTasks();
    if (
      taskResult.result === loadingStateEnum.success &&
      taskResult.data !== undefined
    ) {
      dispatch(homepageDataSlice.actions.setUserTasks(taskResult.data));
    }
    dispatch(homepageDataSlice.actions.setTaskState(taskResult.result));
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    dispatch(
      safeAreaColorsSlice.actions.setSafeAreaColors({
        top: Colors.white,
        bottom: Colors.white,
      }),
    );
  }, [dispatch]);

  const [fontsLoaded] = useFonts({
    // eslint-disable-next-line global-require
    'Comfortaa-Regular': require('../../assets/fonts/Comfortaa-Regular.ttf'),
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
    <ScrollView style={{ width, height, backgroundColor: Colors.white }}>
      {currentBreakPoint === 0 ? <BackButton to="/" /> : null}
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
      <TaskBlock />
      <InsightsBlock />
    </ScrollView>
  );
}
