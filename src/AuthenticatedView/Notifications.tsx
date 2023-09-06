import React, { useState, useEffect, useContext } from 'react'
import { View, Text, Dimensions, Platform, Pressable } from 'react-native'
import { getEvent, getSchoolDay, getTimetable } from '../Functions/Calendar/calendarFunctionsGraph';
import { useSelector } from 'react-redux';
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
  const [messageText, setMessageText] = useState<string>("")
  const [powerpointBlob, setPowerpointBlob] = useState<string>("")
  const [userTasks, setUserTasks] = useState<taskType[]>([])
  const [trendingData, setTrendingData] = useState<resourceType[]>()
  const [userData, setUserData] = useState<resourceType[]>([])
  const [trendingState, setTrendingState] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const [userState, setUserState] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const [schoolDayData, setSchoolDayData] = useState<schoolDayDataType | undefined>(undefined)

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
      if (dataResult.result === loadingStateEnum.success) {
        setMessageText(dataResult.data.message)
        const fileResult = await callMsGraph("https://graph.microsoft.com/v1.0/shares/" + dataResult.data.powerpointId + "/driveItem/content?format=pdf")
        if (fileResult.ok){
          const dataBlob = await fileResult.blob()
          const urlOut = URL.createObjectURL(dataBlob)
          console.log(urlOut)
          setPowerpointBlob(urlOut)
        } else {

        }
      } else {

      }

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
  return (
    <View style={{width: width, height: height, backgroundColor: "white"}}>
      { (currentBreakPoint === 0) ?
        <Link to="/profile/">
          <Text>Back</Text>
        </Link>:null
      }
      <View>
        <Text>{messageText}</Text>
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
            <TaskItem task={task} key={"User_Task_" + task.id}/>
          ))}
        </View>
      </View>
      <View>
        <Text>Recent Files</Text>
        <View>
          { (userState === loadingStateEnum.loading) ?
            <Text>Loading</Text>:
            <View>
              { (userState === loadingStateEnum.success) ?
                <View>
                  { userData.map((data) => (
                    <View key={"User_Insight_" + data.id}>
                      <Text>{data.title}</Text>
                    </View>
                  ))}
                </View>:<Text>Failed</Text>
              }
            </View>
          }
        </View>
        <Text>Popular Files</Text>
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

function TaskItem({task}:{task: taskType}) {
  const [checked, setChecked] = useState<boolean>(false)
  return (
    <View style={{flexDirection: "row"}}>
      <Pressable onPress={() => {setChecked(!checked)}}>
        <CustomCheckBox checked={checked} checkMarkColor={'blue'} checkedBorderColor={'black'} unCheckedBorderColor={'black'} checkedBackgroundColor={'white'} unCheckedBackgroundColor={'white'} height={50} width={50} />
      </Pressable>
      <Text>{task.name}</Text>
    </View>
  ) 
}
