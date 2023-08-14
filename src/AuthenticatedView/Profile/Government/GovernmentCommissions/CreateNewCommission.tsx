import { View, Text, Button, TextInput, Platform, Dimensions, ScrollView } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import Svg, { Path } from 'react-native-svg';
import Slider from '../../../../UI/Slider/Slider';
import { Link } from 'react-router-native'
import MapWeb from '../../../../UI/Map/Map.web';
// import {Calendar, LocaleConfig} from 'react-native-calendars';
import callMsGraph from '../../../../Functions/microsoftAssets';
import { pageDataContext } from '../../../../Redux/AccessTokenContext';
import create_UUID from '../../../../Functions/CreateUUID';
// import "./ReactCalendarCss.web.css"
import { useMsal } from '@azure/msal-react';
import { siteID } from '../../../../PaulyConfig';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../Redux/store';

export default function CreateNewCommission() {
    const pageData = useContext(pageDataContext);
    const {commissionListId} = useSelector((state: RootState) => state.paulyList)
    
    const [commissionName, setCommissionName] = useState<string>("")
    const [proximity, setProximity] = useState<number>(0)
    const [submitButtonText, setSubmitButtonText] = useState<string>("Create Commission")
    const [points, setPoints] = useState<number>(0)
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [selectedPositionIn, setSelectedPositionIn] = useState<{lat: number, lng: number}>({lat: 49.85663823299096, lng: -97.22659526509193})

    async function createCommission() {
        setSubmitButtonText("Loading")
        const newCommissionID = create_UUID()
        const data = {
            "fields": {
              Title: commissionName,
              "CoordinateLat": selectedPositionIn.lat,
              "CoordinateLng": selectedPositionIn.lng,
              "StartDate": startDate.toISOString().replace(/.\d+Z$/g, "Z"),
              "EndDate": endDate.toISOString().replace(/.\d+Z$/g, "Z"),
              "Points":points,
              "Proximity":proximity,
              "CommissionID": newCommissionID
            }
        }
        const listData = {
            "displayName":newCommissionID,
            "columns": [
                {
                    "name": "Submitted",
                    "text": { }
                },
                {
                    "name": "UserID",
                    "text": { }
                }
            ],
            "list":
            {
              "contentTypesEnabled": false,
              "hidden": false,
              "template": " genericList"
            }
        }
        const resultList = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + siteID +"/lists", "POST", false, JSON.stringify(listData))
        if (resultList.ok){
            const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists/" + commissionListId + "/items", "POST", false, JSON.stringify(data))//TO DO fix this id
            if (result.ok){
                setSubmitButtonText("Success")
            } else {
                setSubmitButtonText("Failed")
            }
        } else {
            setSubmitButtonText("Failed")
        }
    }

    return (
        <View style={{overflow: "hidden"}}>
            <ScrollView style={{height: pageData.dimensions.window.height}}>
                <Link to="/profile/government/commissions/">
                    <Text>Back</Text>
                </Link>
                <View style={{alignContent: "center", alignItems: "center", justifyContent: "center"}}>
                    <Text>Create New Commission</Text>
                </View>
                <Text>Commission Name</Text>
                <TextInput 
                value={commissionName}
                onChangeText={text => setCommissionName(text)}
                />
                <View style={{width: pageData.dimensions.window.width, height: pageData.dimensions.window.height * 0.3, alignContent: "center", justifyContent: "center", alignItems: "center"}}>
                    <MapWeb proximity={proximity} selectedPositionIn={selectedPositionIn} onSetSelectedPositionIn={setSelectedPositionIn} width={pageData.dimensions.window.width * 0.8} height={pageData.dimensions.window.height * 0.3}/>
                </View>
                <View style={{flexDirection: "row"}}>
                    <Text>Proximity</Text>
                    <TextInput 
                        keyboardType='numeric'
                        onChangeText={(text)=> setProximity(parseFloat(text))}
                        value={proximity.toString()}
                        maxLength={10}  //setting limit of input
                    />
                </View>
                <View style={{width: pageData.dimensions.window.width, alignContent: "center", alignItems: "center", justifyContent: "center"}}>
                    <Slider width={pageData.dimensions.window.width * 0.9} height={50} value={proximity/1000} onValueChange={(value) => {setProximity(value * 1000)}} containerWidth={pageData.dimensions.window.width}/>
                </View>
                <View style={{alignContent: "center", alignItems: "center", justifyContent: "center", width: pageData.dimensions.window.width}}>
                    <Text>Start Date</Text>
                    {/* <Calendar onClickDay={setStartDate} value={startDate} /> */}
                </View>
                <View style={{alignContent: "center", alignItems: "center", justifyContent: "center", width: pageData.dimensions.window.width}}>
                    <Text>End Date</Text>
                    {/* <Calendar onClickDay={setEndDate} value={endDate} /> */}
                </View>
                <View style={{flexDirection: "row"}}>
                    <Text>Points</Text>
                    <TextInput 
                        keyboardType='numeric'
                        onChangeText={(text)=> {
                            if (text === ""){
                                setPoints(0)
                            } else {
                                setPoints(parseFloat(text))
                                console.log(parseFloat(text))
                            }
                        }}
                        value={points.toString()}
                        maxLength={10}  //setting limit of input
                    />
                </View>
                <Button title={submitButtonText} onPress={() => {createCommission()}}/>
            </ScrollView>
        </View>
    )
}