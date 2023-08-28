import { View, Text, Button, TextInput, Platform, Dimensions, ScrollView, Animated, Pressable } from 'react-native'
import React, { useContext, useEffect, useRef, useState } from 'react'
import Slider from '../../../../UI/Slider/Slider';
import { Link } from 'react-router-native'
import MapWeb from '../../../../UI/Map/Map.web';
import callMsGraph from '../../../../Functions/microsoftAssets';
import create_UUID from '../../../../Functions/CreateUUID';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../Redux/store';
import SegmentedPicker from "../../../../UI/Pickers/SegmentedPicker"
import { loadingStateEnum } from '../../../../types';

enum commissionTypeEnum {
    Issued,
    Location,
    Image,
    ImageLocation,
    QRCode
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
    const [selectedPositionIn, setSelectedPositionIn] = useState<{lat: number, lng: number}>({lat: 49.85663823299096, lng: -97.22659526509193})
    const [maxNumberOfClaims, setMaxNumberOfClaims] = useState<number>(1)
    const [allowMultipleSubmissions, setAllowMultipleSubmissions] = useState<boolean>(false)

    async function createCommission() {
        if (submitCommissionState === loadingStateEnum.failed || submitCommissionState === loadingStateEnum.notStarted){
            setSubmitCommissionState(loadingStateEnum.loading)
            const newCommissionID = create_UUID()
            const data = {
                "fields": {
                    "Title": commissionName,
                    "coordinateLat": selectedPositionIn.lat,
                    "coordinateLng": selectedPositionIn.lng,
                    "startDate": startDate.toISOString().replace(/.\d+Z$/g, "Z"),
                    "endDate": endDate.toISOString().replace(/.\d+Z$/g, "Z"),
                    "points":points,
                    "proximity":proximity,
                    "commissionID": newCommissionID
                }
            }
            const listData = {
                "displayName":newCommissionID,
                "columns": [
                    {
                        "name": "submitted",
                        "text": { }
                    },
                    {
                        "name": "userID",
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
            const resultList = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + siteId +"/lists", "POST", false, JSON.stringify(listData))
            if (resultList.ok){
                const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + siteId + "/lists/" + commissionListId + "/items", "POST", false, JSON.stringify(data))//TO DO fix this id
                if (result.ok){
                    setSubmitCommissionState(loadingStateEnum.success)
                } else {
                    setSubmitCommissionState(loadingStateEnum.failed)
                }
            } else {
                setSubmitCommissionState(loadingStateEnum.failed)
            }
        }
    }

    return (
        <View style={{overflow: "hidden", width: width, height: height, backgroundColor: "white"}}>
            <ScrollView style={{height: height}}>
                <Link to="/profile/government/commissions/">
                    <Text>Back</Text>
                </Link>
                <View style={{alignContent: "center", alignItems: "center", justifyContent: "center"}}>
                    <Text>Create New Commission</Text>
                </View>
                <SegmentedPicker selectedIndex={selectedCommissionType} setSelectedIndex={setSelectedCommissionType} options={["Issued", "Location", "Image", "Image and Location", "QRCode"]} width={width * 0.8} height={height * 0.1} />
                <Text>Commission Name</Text>
                <TextInput 
                    value={commissionName}
                    onChangeText={text => setCommissionName(text)}
                    placeholder='Commission Name'
                />
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
                <View style={{alignContent: "center", alignItems: "center", justifyContent: "center", width: width}}>
                    <Text>Start Date</Text>
                    {/* <Calendar onClickDay={setStartDate} value={startDate} /> */}
                </View>
                <View style={{alignContent: "center", alignItems: "center", justifyContent: "center", width: width}}>
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
                <Pressable onPress={() => {createCommission()}}>
                    <Text>{(submitCommissionState === loadingStateEnum.notStarted) ? "Create Commission":(submitCommissionState === loadingStateEnum.loading) ? "Loading":(submitCommissionState === loadingStateEnum.success) ? "Success":"Failed"}</Text>
                </Pressable>
            </ScrollView>
        </View>
    )
}