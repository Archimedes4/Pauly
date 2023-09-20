import React, { useState, useEffect, useContext } from 'react'
import { View, Text, Dimensions, Platform, Pressable, TextInput, Linking, ScrollView } from 'react-native'
import { getEvent, getSchoolDay, getTimetable } from '../Functions/Calendar/calendarFunctionsGraph';
import { useDispatch, useSelector } from 'react-redux';
import store, { RootState } from '../Redux/store';
import { Link } from 'react-router-native';
import getCurrentPaulyData from '../Functions/Homepage/getCurrentPaulyData';
import { WebView } from 'react-native-webview';
import { loadingStateEnum, semesters } from '../types';
import getFileWithShareID from '../Functions/Ultility/getFileWithShareID';
import callMsGraph from '../Functions/Ultility/microsoftAssets';
import getUsersTasks from '../Functions/Homepage/getUsersTasks';
import CommissionClaim from './Commissions/CommissionClaim';
import ProgressView from '../UI/ProgressView';
import getInsightData from '../Functions/Homepage/getInsightData';
import CustomCheckBox from '../UI/CheckMark/CustomCheckBox';
import { statusBarColorSlice } from '../Redux/reducers/statusBarColorReducer';
import getClassEvents from '../Functions/getClassEventsTimetable';
import { homepageDataSlice } from '../Redux/reducers/homepageDataReducer';

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
  const {schoolDayData} = useSelector((state: RootState) => state.homepageData)
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
                const classResult = await getClassEvents(schedule.id, outputIds.semester, outputIds.schoolYearEventId, schoolDay, result.event.startTime)
                if (classResult.result === loadingStateEnum.success && classResult.data !== undefined) {
                  if (classResult.data.length >= 1) {
                    classResult.data[0].startTime
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
      await getCurrentPaulyData(siteId)

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
    dispatch(statusBarColorSlice.actions.setStatusBarColor("white"))
  }, []) 

  return (
    <ScrollView style={{width: width, height: height, backgroundColor: "white"}}>
      { (currentBreakPoint === 0) ?
        <Link to="/">
          <Text>Back</Text>
        </Link>:null
      }
      <View style={{width: width, height: height * 0.1}}>
        <View style={{width: width * 0.9, height: height * 0.07, borderRadius: 15, backgroundColor: "#444444", margin: "auto"}}>
          <Text>{message}</Text>
        </View>
      </View>
      <View>
        { (powerpointBlob !== "") ?  
          <PDFView />:
          <View>
            <ProgressView width={100} height={100}/>
            <Text>Loading</Text>
          </View>
        }
      </View>
      <TaskBlock />
      <InsightsBlock />
      <View style={{backgroundColor: "#793033", width: width * 0.3, height: height * 0.3, borderRadius: 15}}>
        <View>
          <Text style={{color: "white"}}>{new Date().toLocaleDateString("en-US", {weekday: "long"})}</Text>
        </View>
        <View style={{backgroundColor: "#444444", alignItems: "center", alignContent: "center", justifyContent: "center", width: width * 0.3, height: height * 0.075}}>
          <Text style={{color: "white"}}>{schoolDayData?.schedule.descriptiveName}</Text>
        </View>
        <View>
          <Text style={{color: "white"}}>{schoolDayData?.schoolDay.shorthand}</Text>
        </View>
      </View>
    </ScrollView>
  )
}

function TaskBlock() {
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  const {taskState, userTasks} = useSelector((state: RootState) => state.homepageData)
  return (
    <View style={{width: width}}>
      <Text>Tasks</Text>
      <View style={{shadowColor: "black", width: width * 0.9, marginLeft: width * 0.05, marginRight: width * 0.05, height: height * 0.5, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 10, borderRadius: 15}}>
        <ScrollView style={{margin: 10, height: height * 0.5 - 20}}>
          { (taskState === loadingStateEnum.loading) ?
            <View style={{width: width * 0.9, height: height * 0.5-20, alignContent: "center", alignItems: "center", justifyContent: "center"}}>
              <ProgressView width={(width * 0.9 < (height * 0.5-20)) ? width * 0.45:(height * 0.25-20)} height={(width * 0.9 < (height * 0.5-20)) ? width * 0.45:(height * 0.25 -20)}/>
              <Text>Loading</Text>
            </View>:
            <>
              { (taskState === loadingStateEnum.success) ?
                <>
                  {userTasks.map((task) => (
                    <TaskItem task={task} key={"User_Task_" + task.id} excessItem={false}/>
                  ))}
                  <TaskItem key={"User_Task_Excess"} excessItem={true}/>
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

function TaskItem({task, excessItem}:{task?: taskType, excessItem: boolean}) {
  const [checked, setChecked] = useState<boolean>(false)
  const [taskName, setTaskName] = useState<string>(task ? task.name:"")
  return (
    <View style={{flexDirection: "row"}}>
      <Pressable onPress={() => {setChecked(!checked)}}>
        <CustomCheckBox checked={checked} checkMarkColor={'blue'} strokeDasharray={excessItem ? 5:undefined} height={20} width={20} />
      </Pressable>
      <View style={{justifyContent: "center", alignItems: "center", alignContent: "center"}}>
        <TextInput 
          value={taskName}
          onChangeText={(e) => {
            setTaskName(e)
          }}
        />
      </View>
    </View>
  ) 
}

function PDFView() {
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  const {powerpointBlob} = useSelector((state: RootState) => state.paulyData)
  return (
    <>
      {(Platform.OS === 'web') ?
        <embed src={powerpointBlob} width={width * 0.5 + 'px'} height={height * 0.2 + 'px'}/>:
        <WebView
          style={{width: width * 0.5, height: height * 0.2}}
          source={{ html: '<embed src="' + powerpointBlob + "#page=2"+ '" width="' + width * 0.5 + 'px" height="' +  height * 0.2 + 'px" />' }}
        />
      }
    </>
  )
}

function InsightsBlock() {
  const {width, currentBreakPoint} = useSelector((state: RootState) => state.dimentions)
  return (
    <>
      { (currentBreakPoint <= 0) ?
        <>
          <View>
            <TrendingFiles />
          </View>
          <View>
            <PopularFiles />
          </View>
        </>:
        <View style={{width: width * 0.9, flexDirection: "row", marginLeft: "auto", marginRight: "auto"}}>
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
        <ScrollView  style={{height: height * 0.1-14}}>
          {(trendingState === loadingStateEnum.success) ?
            <>
              {trendingData.map((data) => (
                <Pressable key={"User_Insight_" + data.id} onPress={() => {Linking.openURL(data.webUrl)}}>
                  <Text style={{margin: 10}}>{data.title}</Text>
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
    <View style={{height: height * 0.1, width: width * 0.5}}>
        <Text>Recent Files</Text>
        <ScrollView style={{height: height * 0.1-14}}>
          { (userState === loadingStateEnum.loading) ?
            <Text>Loading</Text>:
            <View>
              { (userState === loadingStateEnum.success) ?
                <View>
                  { userData.map((data) => (
                    <Pressable key={"User_Insight_" + data.id} onPress={() => {Linking.openURL(data.webUrl)}}>
                      <Text style={{margin: 10}}>{data.title}</Text>
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