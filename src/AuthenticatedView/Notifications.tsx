import React, { useState, useEffect, useContext } from 'react'
import { View, Text, Dimensions, Platform, Pressable, TextInput, Linking, ScrollView } from 'react-native'
import { getEvent, getSchoolDay, getTimetable } from '../Functions/Calendar/calendarFunctionsGraph';
import { useDispatch, useSelector } from 'react-redux';
import store, { RootState } from '../Redux/store';
import { Link } from 'react-router-native';
import getCurrentPaulyData from '../Functions/Homepage/getCurrentPaulyData';
import { loadingStateEnum, semesters, taskImportanceEnum, taskStatusEnum } from '../types';
import getFileWithShareID from '../Functions/Ultility/getFileWithShareID';
import callMsGraph from '../Functions/Ultility/microsoftAssets';
import getUsersTasks from '../Functions/Homepage/getUsersTasks';
import ProgressView from '../UI/ProgressView';
import getInsightData from '../Functions/Homepage/getInsightData';
import CustomCheckBox from '../UI/CheckMark/CustomCheckBox';
import { safeAreaColorsSlice } from '../Redux/reducers/safeAreaColorsReducer';
import getClassEvents from '../Functions/getClassEventsTimetable';
import { homepageDataSlice } from '../Redux/reducers/homepageDataReducer';
import PDFView from '../UI/PDF/PDFView';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import BackButton from '../UI/BackButton';
import MimeTypeIcon from './MimeTypeIcon';

//Get Messages
// Last Chat Message Channels Included

//Pauly
// Overview Message
// Powerpoint

//Insights
// Quick Access To files

//Calendar
// Calendar Overview
// Calendar Widget
// Dress Code

// Tasks

//Wants
//Assignments (problem is hard to test)

export default function Notifications() {
  const {width, height, currentBreakPoint} = useSelector((state: RootState) => state.dimentions)
  const {siteId} = useSelector((state: RootState) => state.paulyList)
  const {message, animationSpeed, powerpointBlob} = useSelector((state: RootState) => state.paulyData)
  const dispatch = useDispatch()

  async function loadData() {
    if (siteId !== ""){
      //Calendar Data
      const result = await getSchoolDay(new Date())
      if (result.result === loadingStateEnum.success && result.event !== undefined && result.event.paulyEventData !== undefined){
        const outputIds: schoolDayDataCompressedType = JSON.parse(result.event.paulyEventData)
        const eventResult = await getEvent(outputIds.schoolYearEventId)
        if (eventResult.result === loadingStateEnum.success && eventResult.data !== undefined && eventResult.data?.paulyEventData !== undefined){
          const timetableResult = await getTimetable(eventResult.data.paulyEventData)
          if (timetableResult.result === loadingStateEnum.success && timetableResult.timetable !== undefined){
            const schoolDay = timetableResult.timetable.days.find((e) => {return e.id === outputIds.schoolDayId})
            const schedule = timetableResult.timetable.schedules.find((e) => {return e.id === outputIds.scheduleId})
            const dressCode = timetableResult.timetable.dressCode.dressCodeData.find((e) => {return e.id === outputIds.dressCodeId})
            const dressCodeIncentive = timetableResult.timetable.dressCode.dressCodeIncentives.find((e) => {return e.id === outputIds?.dressCodeIncentiveId})
            if (schoolDay !== undefined && schedule !== undefined && dressCode !== undefined) {
              store.dispatch(homepageDataSlice.actions.setSchoolDayData({
                schoolDay: schoolDay,
                schedule: schedule,
                dressCode: dressCode,
                semester: outputIds.semester,
                dressCodeIncentive: dressCodeIncentive
              }))
              if (schedule !== undefined) {
                const classResult = await getClassEvents(schedule.id, outputIds.semester, outputIds.schoolYearEventId, schoolDay, new Date(result.event.startTime))
                console.log("Events", classResult)
                if (classResult.result === loadingStateEnum.success && classResult.data !== undefined) {
                  if (classResult.data.length >= 1) {
                    console.log(classResult.data[0].startTime)
                    const startTimeDate = new Date(classResult.data[0].startTime)
                    dispatch(homepageDataSlice.actions.setStartTime(((startTimeDate.getHours() % 12) + 1 <= 9) ? "0":"" + ((startTimeDate.getHours() % 12) + 1) + ":" + startTimeDate.getMinutes() + (startTimeDate.getMinutes() <= 9) ? "0":""))
                  }
                }
              }
            }
          }
        }
      }


      //Insights
      const insightResult = await getInsightData()
      dispatch(homepageDataSlice.actions.setTrendingData(insightResult.trendingData))
      dispatch(homepageDataSlice.actions.setTrendingState(insightResult.trendingState))
      dispatch(homepageDataSlice.actions.setUserData(insightResult.userData))
      dispatch(homepageDataSlice.actions.setUserState(insightResult.userState))

      //Pauly Data
      await getCurrentPaulyData()

      //List Data 
      const taskResult = await getUsersTasks()
      if (taskResult.result === loadingStateEnum.success && taskResult.data !== undefined) {
        dispatch(homepageDataSlice.actions.setUserTasks(taskResult.data))
      }
      dispatch(homepageDataSlice.actions.setTaskState(taskResult.result))
    }
  }

  useEffect(() => {
    loadData()
  }, [siteId])

  useEffect(() => {
    dispatch(safeAreaColorsSlice.actions.setSafeAreaColors({top: "white", bottom: "white"}))
  }, []) 

  return (
    <ScrollView style={{width: width, height: height, backgroundColor: "white"}}>
      { (currentBreakPoint === 0) ?
        <BackButton to='/'/>:null
      }
      <View style={{width: width, height: height * 0.1, marginTop: (currentBreakPoint === 0) ? 10:0}}>
        <View style={{width: width * 0.9, height: height * 0.07, alignContent: "center", alignItems: "center", justifyContent: "center", borderRadius: 15, backgroundColor: "#444444", marginLeft: width * 0.05, marginRight: width * 0.05, marginTop: height * 0.015, marginBottom: height * 0.015}}>
          <Text style={{color: "#FFFFFF"}}>{message}</Text>
        </View>
      </View>
      <WidgetView />
      <BoardBlock />
      <TaskBlock />
      <InsightsBlock />
    </ScrollView>
  )
}

function WidgetView() {
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  const {schoolDayData, startTime} = useSelector((state: RootState) => state.homepageData)
  const dow: string[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  return (
    <View style={{backgroundColor: "#793033", width: width * 0.9, height: height * 0.3, borderRadius: 15, marginLeft: width * 0.05}}>
      <View style={{width: width * 0.9, height: height * 0.05, alignContent: "center", alignItems: "center", justifyContent: "center"}}>
        <Text style={{color: "white"}}>{dow[new Date().getDay()]}</Text>
      </View>
      <View style={{backgroundColor: "#444444", alignItems: "center", alignContent: "center", justifyContent: "center", width: width * 0.9, height: height * 0.1}}>
        <Text style={{color: "white", height}}>{schoolDayData?.schedule.descriptiveName}</Text>
      </View>
      <View style={{flexDirection: "row", height: height * 0.15}}>
        <View style={{height: height * 0.15, alignContent: "center", justifyContent: "ce`"}}>
          <Text style={{color: "white", fontWeight: "bold", fontSize: height * 0.125}}>{schoolDayData?.schoolDay.shorthand}</Text>
        </View>
        <Text style={{color: "white", fontSize: height * 0.1}}>{startTime}</Text>
      </View>
    </View>
  )
}

function TaskBlock() {
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  const {taskState, userTasks} = useSelector((state: RootState) => state.homepageData)
  return (
    <View style={{width: width}}>
      <Text style={{fontSize: 24, marginLeft: width * 0.05, marginTop: height * 0.03, marginBottom: height * 0.02}}>Tasks</Text>
      <View style={{shadowColor: "black", width: width * 0.9, marginLeft: width * 0.05, backgroundColor: "#FFFFFF", marginRight: width * 0.05, height: height * 0.5, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 10, borderRadius: 15}}>
        <ScrollView style={{margin: 10, height: height * 0.5 - 20}}>
          { (taskState === loadingStateEnum.loading) ?
            <View style={{width: width * 0.9, height: height * 0.5-20, alignContent: "center", alignItems: "center", justifyContent: "center"}}>
              <ProgressView width={(width * 0.9 < (height * 0.5-20)) ? width * 0.45:(height * 0.25-20)} height={(width * 0.9 < (height * 0.5-20)) ? width * 0.45:(height * 0.25 -20)}/>
              <Text>Loading</Text>
            </View>:
            <>
              { (taskState === loadingStateEnum.success) ?
                <>
                  {userTasks.map((task, index) => (
                    <TaskItem task={task} key={"User_Task_" + task.id} index={index}/>
                  ))}
                </>:
                <View>
                  <Text>Failed</Text>
                </View>
              }
            </>
          }
        </ScrollView>
      </View>
    </View>
  )
}

function DeleteTask({onDelete}:{onDelete: () => void}) {
  return (
    <Pressable onPress={() => onDelete()}>
      <Text>Delete</Text>
    </Pressable>
  )
}

function TaskItem({task, index}:{task: taskType, index: number}) {
  const [checked, setChecked] = useState<boolean>((task.status === taskStatusEnum.completed))
  const [updateTaskState, setUpdateTaskState] = useState<loadingStateEnum>(loadingStateEnum.notStarted)
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  const { userTasks } = useSelector((state: RootState) => state.homepageData)
  const [currentText, setCurrentText] = useState(task.name)
  const [mounted, setMounted] = useState(false)
  const dispatch = useDispatch()
  async function updateTaskStatus(status: taskStatusEnum) {
    setUpdateTaskState(loadingStateEnum.loading)
    const data = {
      "status":(status === taskStatusEnum.notStarted) ? "notStarted":(status === taskStatusEnum.inProgress) ? "inProgress":(status === taskStatusEnum.completed) ? "completed":(status === taskStatusEnum.waitingOnOthers) ? "waitingOnOthers":"deferred",
    }
    const result = await callMsGraph(`https://graph.microsoft.com/v1.0/me/todo/lists/Tasks/tasks/${task.id}`, "PATCH", undefined, JSON.stringify(data))
    if (result.ok) {
      setUpdateTaskState(loadingStateEnum.success) 
    } else {
      setUpdateTaskState(loadingStateEnum.failed)
    }
  }
  async function updateText() {
    const data = {
      "title":userTasks[index].name
    }
    if (task.excess === false) {
      const result = await callMsGraph(`https://graph.microsoft.com/v1.0/me/todo/lists/Tasks/tasks/${task.id}`, "PATCH", undefined, JSON.stringify(data))
      if (result.ok) {
        setUpdateTaskState(loadingStateEnum.success)
      } else {
        setUpdateTaskState(loadingStateEnum.failed)
      }
    } else {
      const result = await callMsGraph(`https://graph.microsoft.com/v1.0/me/todo/lists/Tasks/tasks`, "POST", undefined, JSON.stringify(data))
      if (result.ok) {
        const data = await result.json()
        dispatch(homepageDataSlice.actions.updateUserTask({task: {
          name: task.name,
          id: data["id"],
          importance: (data["importance"] === "high") ? taskImportanceEnum.high : (data["importance"] === "low") ? taskImportanceEnum.low : taskImportanceEnum.normal,
          status: (data["status"] === "notStarted") ? taskStatusEnum.notStarted:(data["status"] === "inProgress") ? taskStatusEnum.inProgress:(data["status"] === "completed") ? taskStatusEnum.completed:(data["status"] === "waitingOnOthers") ? taskStatusEnum.waitingOnOthers:taskStatusEnum.deferred,
          excess: false
        }, index: index}))
        dispatch(homepageDataSlice.actions.unshiftUserTask({
          name: "",
          importance: taskImportanceEnum.normal,
          id: "",
          status: taskStatusEnum.notStarted,
          excess: true
        }))
        setUpdateTaskState(loadingStateEnum.success)
      } else {
        setUpdateTaskState(loadingStateEnum.failed)
      }
    }
  }

  async function deleteTask() {
    if (task !== undefined) {
      const result = await callMsGraph(`https://graph.microsoft.com/v1.0/me/todo/lists/Tasks/tasks/${task.id}`, "DELETE")
      if (result.ok) {
        const index = store.getState().homepageData.userTasks.findIndex((e) => e.id === task.id)
        console.log(index)
        if (index !== -1){
          dispatch(homepageDataSlice.actions.popUserTask(index))
        }
      } else {

      }
    }
  }

  async function checkUpdateText() {
    setUpdateTaskState(loadingStateEnum.loading)
    if (index !== undefined) {
      const taskNameSave = store.getState().homepageData.userTasks[index].name
      setTimeout(() => {
        if (store.getState().homepageData.userTasks[index].name === taskNameSave) {
          console.log("ran")
          updateText() 
        } else {
          console.log("Not ran")
        }
      }, 1500)
    }
  }

  useEffect(() => {
    if (mounted) {
      checkUpdateText()
    } else {
      setMounted(true)
    }
  }, [currentText])

  return (
    <Swipeable onSwipeableOpen={(e) => {console.log(e, "Logged")}} renderRightActions={() => <>
      {task.excess ?
        null:<DeleteTask onDelete={() => deleteTask()}/>
      }
    </>}>
      <View style={{flexDirection: "row", width: width * 0.9}}>
        <Pressable onPress={(e) => {
          setChecked(!checked)
          if (e) {
            updateTaskStatus(taskStatusEnum.completed)
          } else {
            updateTaskStatus(taskStatusEnum.notStarted)
          }
        }}>
          <CustomCheckBox checked={checked} checkMarkColor={'blue'} strokeDasharray={(task.excess) ? 5:undefined} height={20} width={20} />
        </Pressable>
        <View style={{justifyContent: "center", alignItems: "center", alignContent: "center"}}>
          <TextInput 
            value={task.name}
            onChangeText={(e) => {
              var newTask: taskType = {
                name: task.name,
                id: task.id,
                importance: task.importance,
                status: task.status,
                excess: task.excess
              }
              newTask["name"] = e
              dispatch(homepageDataSlice.actions.updateUserTask({task: newTask, index: index}))
              setCurrentText(e)
            }}
            style={{width: width * 0.9 - 35}}
          />
        </View>
      </View>
    </Swipeable>
  ) 
}

function BoardBlock() {
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  const {powerpointBlob, paulyDataState} = useSelector((state: RootState) => state.paulyData)
  return (
    <View style={{width: width * 0.9, height: height * 0.3, marginLeft: width * 0.05, backgroundColor: "#FFFFFF", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 10, borderRadius: 15}}>
      { (paulyDataState === loadingStateEnum.loading) ?
        <View>
          <ProgressView width={100} height={100}/>
          <Text>Loading</Text>
        </View>:
        <>
          { (paulyDataState === loadingStateEnum.success) ?
            <>
              { (powerpointBlob !== "") ?  
                <PDFView width={width * 0.9} height={height * 0.3}/>:
                <View style={{width: width * 0.9, height: height * 0.3, alignContent: "center", alignItems: "center", justifyContent: "center"}}>
                  <ProgressView width={100} height={100}/>
                  <Text>Loading</Text>
                </View>
              }
            </>:
            <View>
              <Text>Failed</Text>
            </View>
          }
        </>
      }
    </View>
  )
}

function InsightsBlock() {
  const {width, height, currentBreakPoint} = useSelector((state: RootState) => state.dimentions)
  return (
    <>
      { (currentBreakPoint <= 0) ?
        <>
          <Text style={{fontSize: 24, marginLeft: width * 0.05, marginTop: height * 0.03, marginBottom: height * 0.02}}>Recent Files</Text>
          <View style={{marginLeft: width * 0.05, marginRight: width * 0.05, width: width * 0.9, height: height * 0.3, backgroundColor: "#FFFFFF", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 10, borderRadius: 15}}>
            <TrendingFiles />
          </View>
          <Text style={{fontSize: 24, marginLeft: width * 0.05, marginTop: height * 0.03, marginBottom: height * 0.02}}>Popular Files</Text>
          <View style={{marginLeft: width * 0.05, marginRight: width * 0.05, width: width * 0.9, height: height * 0.3, backgroundColor: "#FFFFFF", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 10, borderRadius: 15}}>
            <PopularFiles />
          </View>
        </>:
        <View style={{width: width * 0.9, flexDirection: "row", marginLeft: "auto", marginRight: "auto", marginTop: height * 0.025, backgroundColor: "#FFFFFF", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 10, borderRadius: 15}}>
          <View style={{width: width * 0.45}}>
            <TrendingFiles />
          </View>
          <View style={{width: width * 0.45}}>
            <PopularFiles />
          </View>
        </View>
      }
    </>
  )
}

function PopularFiles() {
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  const {trendingData, trendingState} = useSelector((state: RootState) => state.homepageData)
  return (
    <>
      {(trendingState === loadingStateEnum.loading) ?
        <View>
          <Text>Loading</Text>
        </View>:
        <ScrollView  style={{height: height * 0.3}}>
          {(trendingState === loadingStateEnum.success) ?
            <>
              {trendingData.map((data) => (
                <Pressable key={"User_Insight_" + data.id} style={{flexDirection: "row"}} onPress={() => {Linking.openURL(data.webUrl)}}>
                  <View style={{margin: 10}}>
                    <MimeTypeIcon width={14} height={14} mimeType={data.type}/>
                    <Text>{data.title}</Text>
                  </View>
                </Pressable>
              ))}
            </>:<Text>Failed To Load</Text>
          }
        </ScrollView>
      }
    </>
  )
}

function TrendingFiles() {
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  const {userState, userData} = useSelector((state: RootState) => state.homepageData)
  return  (
    <View style={{height: height * 0.3, width: width * 0.5}}>
        <ScrollView style={{height: height * 0.3}}>
          { (userState === loadingStateEnum.loading) ?
            <Text>Loading</Text>:
            <View>
              { (userState === loadingStateEnum.success) ?
                <View>
                  { userData.map((data) => (
                    <Pressable key={"User_Insight_" + data.id} style={{flexDirection: "row"}} onPress={() => {Linking.openURL(data.webUrl)}}>
                      <View style={{margin: 10, flexDirection: "row"}}>
                        <MimeTypeIcon width={14} height={14} mimeType={data.type}/>
                        <Text>{data.title}</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>:<Text>Failed</Text>
              }
            </View>
          }
        </ScrollView>
      </View>
  )
}