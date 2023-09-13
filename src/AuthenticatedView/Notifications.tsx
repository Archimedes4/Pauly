import React, { useState, useEffect, useContext } from 'react'
import { View, Text, Dimensions, Platform, Pressable, TextInput, Linking, ScrollView } from 'react-native'
import { getEvent, getSchoolDay, getTimetable } from '../Functions/Calendar/calendarFunctionsGraph';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../Redux/store';
import { Link } from 'react-router-native';
import getCurrentPaulyData from '../Functions/Homepage/getCurrentPaulyData';
import { WebView } from 'react-native-webview';
import { loadingStateEnum } from '../types';
import getFileWithShareID from '../Functions/Ultility/getFileWithShareID';
import callMsGraph from '../Functions/Ultility/microsoftAssets';
import testApi from '../Functions/AzureFunctions/Test';
import getUsersTasks from '../Functions/Homepage/getUsersTasks';
import CommissionClaim from './Commissions/CommissionClaim';
import ProgressView from '../UI/ProgressView';
import getInsightData from '../Functions/Homepage/getInsightData';
import CustomCheckBox from '../UI/CheckMark/CustomCheckBox';
import { statusBarColorSlice } from '../Redux/reducers/statusBarColorReducer';

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
  const [userTasks, setUserTasks] = useState<taskType[]>([])
  const [trendingData, setTrendingData] = useState<resourceType[]>()
  const [userData, setUserData] = useState<resourceType[]>([])
  const [trendingState, setTrendingState] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const [userState, setUserState] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const [schoolDayData, setSchoolDayData] = useState<schoolDayDataType | undefined>(undefined)
  const dispatch = useDispatch()

  async function loadData() {
    if (siteId !== ""){
      //Calendar Data
      const result = await getSchoolDay(new Date())
      if (result.result === loadingStateEnum.success && result.event !== undefined){
        console.log(result.event.paulyEventData)
        const outputIds: schoolDayDataCompressedType = JSON.parse(result.event.paulyEventData)
        console.log(outputIds)
        const eventResult = await getEvent(outputIds.schoolYearEventId)
        if (eventResult.result === loadingStateEnum.success && eventResult.data !== undefined){
          console.log("Timetable")
          const timetableResult = await getTimetable(eventResult.data?.paulyEventData)
          console.log(timetableResult)
          if (timetableResult.result === loadingStateEnum.success && timetableResult.timetable !== undefined){
            console.log(timetableResult)
            const schoolDay = timetableResult.timetable.days.find((e) => {return e.id === outputIds.schoolDayId})
            const schedule = timetableResult.timetable.schedules.find((e) => {return e.id === outputIds.scheduleId})
            const dressCode = timetableResult.timetable.dressCode.dressCodeData.find((e) => {return e.id === outputIds.dressCodeId})
            const dressCodeIncentive = timetableResult.timetable.dressCode.dressCodeIncentives.find((e) => {return e.id === outputIds?.dressCodeIncentiveId})
            setSchoolDayData({
              schoolDay: schoolDay,
              schedule: schedule,
              dressCode: dressCode,
              dressCodeIncentive: dressCodeIncentive
            })
          }
        }
      }


      //Insights
      const insightResult = await getInsightData()
      setTrendingData(insightResult.trendingData)
      setTrendingState(insightResult.trendingState)
      setUserData(insightResult.userData)
      setUserState(insightResult.userState)

      //Pauly Data
      const dataResult = await getCurrentPaulyData(siteId)

      //List Data 
      const taskResult = await getUsersTasks()
      if (taskResult.result === loadingStateEnum.success && taskResult.data !== undefined) {
        setUserTasks(taskResult.data)
      }
    }
  }

  useEffect(() => {
    loadData()
  }, [siteId])

  useEffect(() => {
    dispatch(statusBarColorSlice.actions.setStatusBarColor("white"))
  }, []) 

  return (
    <View style={{width: width, height: height, backgroundColor: "white"}}>
      { (currentBreakPoint === 0) ?
        <Link to="/profile/">
          <Text>Back</Text>
        </Link>:null
      }
      <View style={{width: width, height: height * 0.1}}>
        <View style={{width: width * 0.8, height: height * 0.07, borderRadius: 15, backgroundColor: "#444444", margin: "auto"}}>
          <Text>{message}</Text>
        </View>
      </View>
      <View>
        { (powerpointBlob !== "") ?
          <View>
            {
              (Platform.OS === 'web') ?
                <embed src={powerpointBlob} width={width * 0.5 + 'px'} height={height * 0.2 + 'px'}/>:
                <WebView
                  style={{width: width * 0.5, height: height * 0.2}}
                  source={{ html: '<embed src="' + powerpointBlob + "#page=2"+ '" width="' + width * 0.5 + 'px" height="' +  height * 0.2 + 'px" />' }}
                />
            }
          </View>:
          <View>
            <ProgressView width={100} height={100}/>
            <Text>Loading</Text>
          </View>
        }
      </View>
      <View style={{shadowColor: "black", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 10, borderRadius: 15}}>
        <View style={{margin: 10}}>
          <Text>Tasks</Text>
          {userTasks.map((task) => (
            <TaskItem task={task} key={"User_Task_" + task.id} excessItem={false}/>
          ))}
        </View>
      </View>
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
      <View style={{height: height * 0.1, width: width * 0.5}}>
        <Text>Popular Files</Text>
        { (trendingState === loadingStateEnum.loading) ?
          <Text>Loading</Text>:
          <ScrollView  style={{height: height * 0.1-14}}>
            { (trendingState === loadingStateEnum.success) ?
              <View>
                { trendingData.map((data) => (
                  <Pressable key={"User_Insight_" + data.id} onPress={() => {Linking.openURL(data.webUrl)}}>
                    <Text style={{margin: 10}}>{data.title}</Text>
                  </Pressable>
                ))}
              </View>:<Text>Failed</Text>
            }
          </ScrollView>
        }
      </View>
      <View style={{backgroundColor: "#793033", width: width * 0.3, height: height * 0.3, borderRadius: 15}}>
        <View>
          <Text style={{color: "white"}}>{new Date().toLocaleDateString("en-US", {weekday: "long"})}</Text>
        </View>
        <View style={{backgroundColor: "#444444", alignItems: "center", alignContent: "center", justifyContent: "center", width: width * 0.3, height: height * 0.075}}>
          <Text style={{color: "white"}}>{schoolDayData?.schedule.descriptiveName}</Text>
        </View>
        <Text style={{color: "white"}}>{schoolDayData?.schoolDay.shorthand}</Text>
      </View>
    </View>
  )
}

function TaskItem({task}:{task: taskType, excessItem: boolean}) {
  const [checked, setChecked] = useState<boolean>(false)
  const [taskName, setTaskName] = useState<string>(task.name)
  return (
    <View style={{flexDirection: "row"}}>
      <Pressable onPress={() => {setChecked(!checked)}}>
        <CustomCheckBox checked={checked} checkMarkColor={'blue'} checkedBorderColor={'black'} unCheckedBorderColor={'black'} checkedBackgroundColor={'white'} unCheckedBackgroundColor={'white'} height={50} width={50} />
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
