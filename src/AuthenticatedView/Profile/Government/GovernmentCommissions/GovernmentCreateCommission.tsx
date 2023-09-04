import { View, Text, Button, TextInput, Platform, Dimensions, ScrollView, Animated, Pressable, Switch } from 'react-native'
import React, { useContext, useEffect, useRef, useState } from 'react'
import Slider from '../../../../UI/Slider/Slider';
import { Link } from 'react-router-native'
import MapWeb from '../../../../UI/Map/Map.web';
import callMsGraph from '../../../../Functions/Ultility/microsoftAssets';
import create_UUID from '../../../../Functions/Ultility/CreateUUID';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../Redux/store';
import SegmentedPicker from "../../../../UI/Pickers/SegmentedPicker"
import { commissionTypeEnum, loadingStateEnum } from '../../../../types';
import DatePicker from '../../../../UI/DateTimePicker/DatePicker';
import TimePicker from '../../../../UI/DateTimePicker/TimePicker';
import TimePickerDate from '../../../../UI/DateTimePicker/TimePickerDate';

enum datePickingMode {
    none,
    start,
    end
}

export default function CreateNewCommission() {
    const {width, height} = useSelector((state: RootState) => state.dimentions)
    const {commissionListId, siteId} = useSelector((state: RootState) => state.paulyList)

    const [submitCommissionState, setSubmitCommissionState] = useState<loadingStateEnum>(loadingStateEnum.notStarted)

    const [selectedCommissionType, setSelectedCommissionType] = useState<commissionTypeEnum>(commissionTypeEnum.Issued)
    
    const [commissionName, setCommissionName] = useState<string>("")
    const [proximity, setProximity] = useState<number>(0)
    const [points, setPoints] = useState<number>(0)
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    const [isHidden, setIsHidden] = useState<boolean>(false)

    const [currentDatePickingMode, setCurrentDatePickingMode] = useState<datePickingMode>(datePickingMode.none)

    const [selectedPositionIn, setSelectedPositionIn] = useState<{lat: number, lng: number}>({lat: 49.85663823299096, lng: -97.22659526509193})
    const [maxNumberOfClaims, setMaxNumberOfClaims] = useState<number>(1)
    const [allowMultipleSubmissions, setAllowMultipleSubmissions] = useState<boolean>(false)
    const [isTimed, setIsTimed] = useState<boolean>(true)

    async function createCommission() {
        if (submitCommissionState === loadingStateEnum.failed || submitCommissionState === loadingStateEnum.notStarted){
            setSubmitCommissionState(loadingStateEnum.loading)
            const newCommissionID = create_UUID()
            const data = {
                "fields": {
                    //All Commissions
                    "Title": commissionName,
                    "timed":isTimed,
                    "points":points,
                    "hidden":isHidden,
                    "maxNumberOfClaims":maxNumberOfClaims,
                    "allowMultipleSubmissions":allowMultipleSubmissions,
                    "commissionID": newCommissionID,
                    "value":selectedCommissionType + 1
                }
            }
            if (isTimed) {
                data["fields"]["startDate"] = startDate.toISOString().replace(/.\d+Z$/g, "Z")
                data["fields"]["endDate"] = endDate.toISOString().replace(/.\d+Z$/g, "Z")
            }
            if (selectedCommissionType === commissionTypeEnum.Location || selectedCommissionType === commissionTypeEnum.ImageLocation) {
                data["fields"]["proximity"] = proximity
                data["fields"]["coordinateLat"] = selectedPositionIn.lat
                data["fields"]["coordinateLng"] = selectedPositionIn.lng
            }
            if (selectedCommissionType === commissionTypeEnum.QRCode) {
                data["fields"]["qrCodeData"] = "[]"
            }
            const listData = {
                "displayName":newCommissionID,
                "columns": [
                    {
                        "name": "submittedTime",
                        "required": true,
                        "text": { }
                    },
                    {
                        "name": "userId",
                        "text": { },
                        "required": true,
                        "indexed":true
                    },
                    {
                        "name": "submissionId",
                        "text": {},
                        "required": true,
                        "indexed": true,
                        "enforceUniqueValues": true
                    },
                    {
                        "name":"submissionApproved",
                        "boolean": {},
                        "required": true,
                        "indexed": true
                    },
                    {
                        "name":"submissionData",
                        "text": {"allowMultipleLines": true}
                    }
                ],
                "list":
                {
                  "contentTypesEnabled": false,
                  "hidden": false,
                  "template": " genericList"
                }
            }
            const resultList = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + siteId +"/lists", "POST", false, JSON.stringify(listData))
            if (resultList.ok){
                const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + siteId + "/lists/" + commissionListId + "/items", "POST", false, JSON.stringify(data))//TO DO fix this id
                if (result.ok){
                    setSubmitCommissionState(loadingStateEnum.success)
                } else {
                    const data = await result.json()
                    console.log(data)
                    setSubmitCommissionState(loadingStateEnum.failed)
                }
            } else {
                setSubmitCommissionState(loadingStateEnum.failed)
            }
        }
    }

    return (
        <View style={{overflow: "hidden", width: width, height: height, backgroundColor: "white"}}>
            <View style={{height: height, width: width, zIndex: 1, overflow: "hidden"}}>
                <ScrollView style={{height: height, zIndex: 1}}>
                    <Link to="/profile/government/commissions/">
                        <Text>Back</Text>
                    </Link>
                    <View style={{alignContent: "center", alignItems: "center", justifyContent: "center"}}>
                        <Text>Create New Commission</Text>
                    </View>
                    <View style={{width: width, height: height * 0.15, alignContent: "center", alignItems: "center", justifyContent: "center"}}>
                        <SegmentedPicker selectedIndex={selectedCommissionType} setSelectedIndex={setSelectedCommissionType} options={["Issued", "Location", "Image", "Image and Location", "QRCode"]} width={width * 0.8} height={height * 0.1} />
                    </View>
                    <Text>Commission Name</Text>
                    <TextInput 
                        value={commissionName}
                        onChangeText={text => setCommissionName(text)}
                        placeholder='Commission Name'
                    />
                    { (selectedCommissionType === commissionTypeEnum.ImageLocation || selectedCommissionType === commissionTypeEnum.Location) ?
                        <View>
                            <View style={{width: width, height: height * 0.3, alignContent: "center", justifyContent: "center", alignItems: "center"}}>
                                <MapWeb proximity={proximity} selectedPositionIn={selectedPositionIn} onSetSelectedPositionIn={setSelectedPositionIn} width={width * 0.8} height={height * 0.3}/>
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
                            <View style={{width: width, alignContent: "center", alignItems: "center", justifyContent: "center"}}>
                                <Slider width={width * 0.9} height={50} value={proximity/1000} onValueChange={(value) => {setProximity(value * 1000)}} containerWidth={width}/>
                            </View>
                        </View>:null
                    }
                    <View style={{flexDirection: "row"}}>
                        <Text>Timed: </Text>
                        <Switch
                            trackColor={{false: '#767577', true: '#81b0ff'}}
                            thumbColor={isTimed ? '#f5dd4b' : '#f4f3f4'}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={(e) => {setIsTimed(e)}}
                            value={isTimed}
                        />
                    </View>
                    { isTimed ?
                        <View>
                            <View style={{alignContent: "center", alignItems: "center", justifyContent: "center", width: width}}>
                                <Text>Start Date</Text>
                                <TimePickerDate date={startDate} setDate={setStartDate} />
                                <Pressable onPress={() => {setCurrentDatePickingMode(datePickingMode.start)}}>
                                    <Text>Pick Start Date</Text>
                                </Pressable>
                            </View>
                            <View style={{alignContent: "center", alignItems: "center", justifyContent: "center", width: width}}>
                                <Text>End Date</Text>
                                <TimePickerDate date={endDate} setDate={setEndDate} />
                                <Pressable onPress={() => {setCurrentDatePickingMode(datePickingMode.end)}}><Text>Pick End Date</Text></Pressable>
                            </View>
                        </View>:null
                    }
                    <View style={{flexDirection: "row"}}>
                        <Text>Points: </Text>
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
                    <View style={{flexDirection: "row"}}>
                        <Text>Allow Multiple Submissions: </Text>
                        <Switch
                            trackColor={{false: '#767577', true: '#81b0ff'}}
                            thumbColor={allowMultipleSubmissions ? '#f5dd4b' : '#f4f3f4'}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={(e) => {setAllowMultipleSubmissions(e)}}
                            value={allowMultipleSubmissions}
                        />
                    </View>
                    <View style={{flexDirection: "row"}}>
                        <Text>Is Hidden: </Text>
                        <Switch
                            trackColor={{false: '#767577', true: '#81b0ff'}}
                            thumbColor={isHidden ? '#f5dd4b' : '#f4f3f4'}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={(e) => {setIsHidden(e)}}
                            value={isHidden}
                        />
                    </View>
                    <View style={{flexDirection: "row"}}>
                        <Text>Max number of claims: </Text>
                        <TextInput 
                        value={maxNumberOfClaims.toString()}
                        onChangeText={(e) => {
                            if (e !== "") {setMaxNumberOfClaims(parseFloat(e))} else {setMaxNumberOfClaims(0)}}}
                            inputMode='numeric'
                        />
                    </View>
                    <Pressable onPress={() => {createCommission()}}>
                        <Text>{(submitCommissionState === loadingStateEnum.notStarted) ? "Create Commission":(submitCommissionState === loadingStateEnum.loading) ? "Loading":(submitCommissionState === loadingStateEnum.success) ? "Success":"Failed"}</Text>
                    </Pressable>
                </ScrollView>
            </View>
            <View style={{height: height * 0.8, width: width * 0.8, position: "absolute", left: width * 0.1, top: height * 0.1, zIndex: 2, backgroundColor: (currentDatePickingMode === datePickingMode.start || currentDatePickingMode === datePickingMode.end) ? "white":"transparent", borderRadius: 15, shadowColor: (currentDatePickingMode === datePickingMode.start || currentDatePickingMode === datePickingMode.end) ? "black":"transparent", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 10, alignItems: "center", justifyContent: "center", alignContent: "center"}} pointerEvents={(currentDatePickingMode === datePickingMode.start || currentDatePickingMode === datePickingMode.end) ? 'auto':'none'}>
                { (currentDatePickingMode === datePickingMode.start || currentDatePickingMode === datePickingMode.end) ?
                    <DatePicker 
                        selectedDate={(currentDatePickingMode === datePickingMode.start) ? startDate:(currentDatePickingMode === datePickingMode.end) ? endDate:null} 
                        onSetSelectedDate={(date) => {if (currentDatePickingMode === datePickingMode.end) {setEndDate(date)} else if (currentDatePickingMode === datePickingMode.start) {setStartDate(date)}}}
                        width={width * 0.7} height={height * 0.7} onCancel={() => {setCurrentDatePickingMode(datePickingMode.none)}}
                    />:null
                }
            </View>
        </View>
    )
}