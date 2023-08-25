import React, { useState, useEffect, useContext } from 'react'
import { View, Text, Dimensions, Platform } from 'react-native'
import { getSchoolDayOnSelectedDay } from '../Functions/calendarFunctionsGraph';
import { useSelector } from 'react-redux';
import { RootState } from '../Redux/store';
import { Link } from 'react-router-native';
import getCurrentPaulyData from '../Functions/getCurrentPaulyData';
import { WebView } from 'react-native-webview';
import { loadingStateEnum } from '../types';
import getFileWithShareID from '../Functions/getFileWithShareID';
import callMsGraph from '../Functions/microsoftAssets';

export default function Notifications() {
  const {width, height, currentBreakPoint} = useSelector((state: RootState) => state.dimentions)
  const {siteId} = useSelector((state: RootState) => state.paulyList)
  const [messageText, setMessageText] = useState<string>("")
  const [powerpointBlob, setPowerpointBlob] = useState<string>("")

  async function loadData() {
    if (siteId !== ""){
      const result = await getSchoolDayOnSelectedDay(new Date())

      const dataResult = await getCurrentPaulyData(siteId)
      if (dataResult.result === loadingStateEnum.success) {
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
    }
  }

  useEffect(() => {
    console.log("Here", siteId)
    loadData()
  }, [siteId])
  return (
    <View style={{width: width, height: height, backgroundColor: "white"}}>
      { (currentBreakPoint === 0) ?
        <Link to="/profile/">
          <Text>Back</Text>
        </Link>:null
      }
      <Text>Notifications</Text>
      <View>
        <Text>
          Last Chat Message Channels Included
          Calendar Overview
          Calendar Widget
          Tasks
          Assignments
          Dress Code
          Overview Message
          Powerpoint
          Quick Access To files
        </Text>
        
      </View>
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
        </View>:<Text>Loading</Text>
      }
      <View>
        <Text>Recent Files</Text>
        <Text>Popular Files</Text>
      </View>
      <Link to="/WhatISTHISLINKGOINGTo">
        <Text>This is to no where</Text>
      </Link>
    </View>
  )
}
