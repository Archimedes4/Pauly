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
  Animated,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { FlatList } from 'react-native-gesture-handler';
import store, { RootState } from '../Redux/store';
import getCurrentPaulyData from '../Functions/notifications/getCurrentPaulyData';
import {
  Colors,
  loadingStateEnum,
  taskImportanceEnum,
  taskStatusEnum,
} from '../types';
import callMsGraph from '../Functions/ultility/microsoftAssets';
import getUsersTasks from '../Functions/notifications/getUsersTasks';
import ProgressView from '../UI/ProgressView';
import getInsightData from '../Functions/notifications/getInsightData';
import CustomCheckBox from '../UI/CheckMark/CustomCheckBox';
import { safeAreaColorsSlice } from '../Redux/reducers/safeAreaColorsReducer';
import { homepageDataSlice } from '../Redux/reducers/homepageDataReducer';
import PDFView from '../UI/PDF/PDFView';
import BackButton from '../UI/BackButton';
import MimeTypeIcon from '../UI/Icons/MimeTypeIcon';
import { getClassEventsFromDay } from '../Functions/classesFunctions';
import { TrashIcon, WarningIcon } from '../UI/Icons/Icons';

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
        ) : (
          <>
            {taskState === loadingStateEnum.success ? (
              <FlatList
                data={userTasks}
                renderItem={task => (
                  <TaskItem task={task} key={`User_Task_${task.item.id}`} />
                )}
              />
            ) : (
              <View>
                <Text>Failed</Text>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
}

function DeleteTask({
  onDelete,
}: {
  onDelete: () => void;
  e: Animated.AnimatedInterpolation<string | number>;
}) {
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
  const [checked, setChecked] = useState<boolean>(
    task.item.status === taskStatusEnum.completed,
  );
  const [updateTaskState, setUpdateTaskState] = useState<loadingStateEnum>(
    loadingStateEnum.notStarted,
  );
  const { width } = useSelector((state: RootState) => state.dimentions);
  const { userTasks, isShowingCompleteTasks } = useSelector(
    (state: RootState) => state.homepageData,
  );
  const [currentText, setCurrentText] = useState(task.item.name);
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch();

  async function updateTaskStatus(status: taskStatusEnum) {
    setUpdateTaskState(loadingStateEnum.loading);
    const data = {
      status:
        status === taskStatusEnum.notStarted
          ? 'notStarted'
          : status === taskStatusEnum.inProgress
          ? 'inProgress'
          : status === taskStatusEnum.completed
          ? 'completed'
          : status === taskStatusEnum.waitingOnOthers
          ? 'waitingOnOthers'
          : 'deferred',
    };
    const result = await callMsGraph(
      `https://graph.microsoft.com/v1.0/me/todo/lists/Tasks/tasks/${task.item.id}`,
      'PATCH',
      JSON.stringify(data),
    );
    if (result.ok) {
      const newItem: any = {};
      Object.assign(newItem, task.item);
      newItem.status = status;
      dispatch(
        homepageDataSlice.actions.updateUserTask({
          index: task.index,
          task: newItem,
        }),
      );
      setUpdateTaskState(loadingStateEnum.success);
    } else {
      setUpdateTaskState(loadingStateEnum.failed);
    }
  }

  async function updateText() {
    setUpdateTaskState(loadingStateEnum.loading);
    const data = {
      title: userTasks[task.index].name,
    };
    if (task.item.excess === false) {
      const result = await callMsGraph(
        `https://graph.microsoft.com/v1.0/me/todo/lists/Tasks/tasks/${task.item.id}`,
        'PATCH',
        JSON.stringify(data),
      );
      if (result.ok) {
        setUpdateTaskState(loadingStateEnum.success);
      } else {
        setUpdateTaskState(loadingStateEnum.failed);
      }
    } else {
      const result = await callMsGraph(
        `https://graph.microsoft.com/v1.0/me/todo/lists/Tasks/tasks`,
        'POST',
        JSON.stringify(data),
      );
      if (result.ok) {
        const newTaskData = await result.json();
        dispatch(
          homepageDataSlice.actions.updateUserTask({
            task: {
              name: task.item.name,
              id: newTaskData.id,
              importance:
                newTaskData.importance === 'high'
                  ? taskImportanceEnum.high
                  : data.importance === 'low'
                  ? taskImportanceEnum.low
                  : taskImportanceEnum.normal,
              status:
                newTaskData.status === 'notStarted'
                  ? taskStatusEnum.notStarted
                  : data.status === 'inProgress'
                  ? taskStatusEnum.inProgress
                  : data.status === 'completed'
                  ? taskStatusEnum.completed
                  : data.status === 'waitingOnOthers'
                  ? taskStatusEnum.waitingOnOthers
                  : taskStatusEnum.deferred,
              excess: false,
            },
            index: task.index,
          }),
        );
        dispatch(
          homepageDataSlice.actions.unshiftUserTask({
            name: '',
            importance: taskImportanceEnum.normal,
            id: '',
            status: taskStatusEnum.notStarted,
            excess: true,
          }),
        );
        setUpdateTaskState(loadingStateEnum.success);
      } else {
        setUpdateTaskState(loadingStateEnum.failed);
      }
    }
  }

  async function deleteTask() {
    if (task !== undefined) {
      const result = await callMsGraph(
        `https://graph.microsoft.com/v1.0/me/todo/lists/Tasks/tasks/${task.item.id}`,
        'DELETE',
      );
      if (result.ok) {
        const index = store
          .getState()
          .homepageData.userTasks.findIndex(e => e.id === task.item.id);
        if (index !== -1) {
          dispatch(homepageDataSlice.actions.popUserTask(index));
        }
      }
    }
  }

  async function checkUpdateText() {
    setUpdateTaskState(loadingStateEnum.loading);
    const taskNameSave =
      store.getState().homepageData.userTasks[task.index].name;
    setTimeout(() => {
      if (
        store.getState().homepageData.userTasks[task.index].name ===
        taskNameSave
      ) {
        updateText();
      }
    }, 1500);
  }

  useEffect(() => {
    if (mounted) {
      checkUpdateText();
    } else {
      setMounted(true);
    }
  }, [currentText]);


  if (isShowingCompleteTasks || task.item.status !== taskStatusEnum.completed) {
    <Swipeable
      renderRightActions={e => {
        if (task.item.excess) {
          return null;
        }
        return <DeleteTask e={e} onDelete={() => deleteTask()} />;
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
            setChecked(!checked);
            if (!checked) {
              updateTaskStatus(taskStatusEnum.completed);
            } else {
              updateTaskStatus(taskStatusEnum.notStarted);
            }
          }}
        >
          <View style={{ margin: 'auto' }}>
            {
              updateTaskState === loadingStateEnum.notStarted ||
            updateTaskState === loadingStateEnum.success ? (
              <CustomCheckBox
                checked={checked}
                checkMarkColor="blue"
                strokeDasharray={task.item.excess ? 5 : undefined}
                height={20}
                width={20}
              />
            ) : (
              updateTaskState === loadingStateEnum.loading ? (
                <ProgressView width={14} height={14} />
              ) : (
                <WarningIcon width={14} height={14} outlineColor={Colors.danger} />
              )
            )}
          </View>
        </Pressable>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            alignContent: 'center',
          }}
        >
          <TextInput
            value={task.item.name}
            onChangeText={e => {
              const newTask: taskType = {
                name: task.item.name,
                id: task.item.id,
                importance: task.item.importance,
                status: task.item.status,
                excess: task.item.excess,
              };
              newTask.name = e;
              dispatch(
                homepageDataSlice.actions.updateUserTask({
                  task: newTask,
                  index: task.index,
                }),
              );
              setCurrentText(e);
            }}
            multiline
            numberOfLines={1}
            style={{ width: width * 0.9 - 40 }}
          />
        </View>
      </View>
    </Swipeable>;
  }
  return null;
}

function BoardBlock() {
  const { width, height, currentBreakPoint } = useSelector(
    (state: RootState) => state.dimentions,
  );
  const { powerpointBlob, paulyDataState } = useSelector(
    (state: RootState) => state.paulyData,
  );
  if (paulyDataState === loadingStateEnum.loading || powerpointBlob === '') {
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
        <ProgressView width={14} height={14}/>
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
