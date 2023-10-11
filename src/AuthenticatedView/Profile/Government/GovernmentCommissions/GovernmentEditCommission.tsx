import { View, Text, Button, TextInput, Platform, Dimensions, ScrollView, Animated, Pressable, Switch, Image } from 'react-native'
import React, { useContext, useEffect, useRef, useState } from 'react'
import Slider from '../../../../UI/Slider/Slider';
import { Link, useParams } from 'react-router-native'
import MapWeb from '../../../../UI/Map/Map.web';
import callMsGraph from '../../../../Functions/Ultility/microsoftAssets';
import create_UUID from '../../../../Functions/Ultility/CreateUUID';
import { useSelector } from 'react-redux';
import store, { RootState } from '../../../../Redux/store';
import SegmentedPicker from "../../../../UI/Pickers/SegmentedPicker"
import { commissionTypeEnum, loadingStateEnum, submissionTypeEnum } from '../../../../types';
import DatePicker from '../../../../UI/DateTimePicker/DatePicker';
import TimePicker from '../../../../UI/DateTimePicker/TimePicker';
import TimePickerDate from '../../../../UI/DateTimePicker/TimePickerDate';
import ProgressView from '../../../../UI/ProgressView';
import { getChannels, getPosts, getTeams } from '../../../../Functions/groupsData';
import WebViewCross from '../../../../UI/WebViewCross';
import getCommission from '../../../../Functions/commissions/getCommission';
import getSubmissions from '../../../../Functions/commissions/getSubmissions';
import { CloseIcon } from '../../../../UI/Icons/Icons';
import BackButton from '../../../../UI/BackButton';
import getFileWithShareID from '../../../../Functions/Ultility/getFileWithShareID';
import { unlink } from 'fs';
import { FlatList } from 'react-native-gesture-handler';

enum datePickingMode {
  none,
  start,
  end
}

export default function GovernmentEditCommission() {
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

  const [commissionItemId, setCommissionItemId] = useState<string>("")

  const [getCommissionResult, setGetCommissionResult] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const [deleteCommissionResult, setDeleteCommissionResult] = useState<loadingStateEnum>(loadingStateEnum.notStarted)
  const [selectedTeamId, setSelectedTeamId] = useState<string>("")
  const [selectedChannelId, setSelectedChannelId] = useState<string>("")
  const [selectedPostId, setSelectedPostId] = useState<string>("")

  const [isCreating, setIsCreating] = useState<boolean>(false)

  const {id} = useParams()

  async function loadData() {
    if (id !== undefined) {
      const result = await getCommission(id)
      if (result.result === loadingStateEnum.success && result.data !== undefined) {
        setCommissionItemId(result.data.itemId)
        setCommissionName(result.data.title)
        setAllowMultipleSubmissions(result.data.allowMultipleSubmissions)
        setIsHidden(result.data.hidden)
        setMaxNumberOfClaims(result.data.maxNumberOfClaims)
      }
      setGetCommissionResult(result.result) 
    }
  }

  async function deleteCommission() {
    if (commissionItemId === "" || deleteCommissionResult === loadingStateEnum.loading || deleteCommissionResult === loadingStateEnum.success) {return}
    setDeleteCommissionResult(loadingStateEnum.loading)
    const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + siteId + "/lists/" + commissionListId + "/items/" + commissionItemId, "DELETE")
    if (result.ok) {
      const deleteList = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + siteId + `/lists/${id}`, "DELETE")
      if (deleteList.ok){
        setDeleteCommissionResult(loadingStateEnum.success)
      } else {
        setDeleteCommissionResult(loadingStateEnum.failed)
      }
    } else {
      setDeleteCommissionResult(loadingStateEnum.failed)
    }
  }
  useEffect(() => {
    if (id !== "create") {
      loadData()
    } else {
      setIsCreating(true)
    }
  }, [])

  async function createCommission() {
    if (submitCommissionState === loadingStateEnum.failed || submitCommissionState === loadingStateEnum.notStarted){
      setSubmitCommissionState(loadingStateEnum.loading)
      const newCommissionID = create_UUID()
      const data: any = {
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
      if (selectedPostId !== "") {
        data["fields"]["postTeamId"] = selectedTeamId
        data["fields"]["postChannelId"] = selectedChannelId
        data["fields"]["postId"] = selectedPostId
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

      const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + siteId + "/lists/" + commissionListId + "/items", "POST", false, JSON.stringify(data))//TO DO fix this id
      if (result.ok){
        setSubmitCommissionState(loadingStateEnum.success)
      } else {
        const data = await result.json()
        setSubmitCommissionState(loadingStateEnum.failed)
      }
    }
  }

  return (
    <View style={{overflow: "hidden", width: width, height: height, backgroundColor: "white"}}>
      <ScrollView style={{height: height, width: width, zIndex: 1}}>
        <BackButton to="/profile/government/commissions"/>
        <View style={{alignContent: "center", alignItems: "center", justifyContent: "center"}}>
          <Text>{isCreating ? "Create New":"Edit"} Commission</Text>
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
        <Text>Post</Text>
        <PostSelectionContainer width={width} height={height * 0.4} selectedTeamId={selectedTeamId} setSelectedTeamId={setSelectedTeamId} selectedChannelId={selectedChannelId} setSelectedChannelId={setSelectedChannelId} setSelectedPostId={setSelectedPostId} />
        {
          (!isCreating && id !== undefined) ?
          <View style={{marginTop: 10, marginBottom: 10, height: height * 0.5}}>
            <CommissionSubmissions commissionId={id} width={width} height={height * 0.5} />
          </View>:null
        }
        <Pressable onPress={() => {createCommission()}}>
          <Text>{(submitCommissionState === loadingStateEnum.notStarted) ? "Create Commission":(submitCommissionState === loadingStateEnum.loading) ? "Loading":(submitCommissionState === loadingStateEnum.success) ? "Success":"Failed"}</Text>
        </Pressable>
        { (!isCreating) ?
          <Pressable onPress={() => {deleteCommission()}}>
            <Text>{(deleteCommissionResult === loadingStateEnum.notStarted) ? "Delete Commission":(deleteCommissionResult === loadingStateEnum.loading) ? "Loading":(deleteCommissionResult === loadingStateEnum.success) ? "Deleted Commission":"Failed to Delete Commission"}</Text>
          </Pressable>:null
        }
      </ScrollView>
    
      <View style={{height: height * 0.8, width: width * 0.8, position: "absolute", left: width * 0.1, top: height * 0.1, zIndex: 2, backgroundColor: (currentDatePickingMode === datePickingMode.start || currentDatePickingMode === datePickingMode.end) ? "white":"transparent", borderRadius: 15, shadowColor: (currentDatePickingMode === datePickingMode.start || currentDatePickingMode === datePickingMode.end) ? "black":"transparent", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 10, alignItems: "center", justifyContent: "center", alignContent: "center"}} pointerEvents={(currentDatePickingMode === datePickingMode.start || currentDatePickingMode === datePickingMode.end) ? 'auto':'none'}>
        { (currentDatePickingMode === datePickingMode.start || currentDatePickingMode === datePickingMode.end) ?
          <DatePicker 
            selectedDate={(currentDatePickingMode === datePickingMode.start) ? startDate:endDate} 
            onSetSelectedDate={(date) => {if (currentDatePickingMode === datePickingMode.end) {setEndDate(date)} else if (currentDatePickingMode === datePickingMode.start) {setStartDate(date)}}}
            width={width * 0.7} height={height * 0.7} onCancel={() => {setCurrentDatePickingMode(datePickingMode.none)}}
          />:null
        }
      </View>
    </View>
  )
}

enum postPickingMode {
  team,
  channel,
  post
}

function PostSelectionContainer({width, height, selectedChannelId, selectedTeamId, setSelectedChannelId, setSelectedPostId, setSelectedTeamId}:{width: number, height: number, selectedTeamId: string, setSelectedTeamId: (item: string) => void, selectedChannelId: string, setSelectedChannelId: (item: string) => void, setSelectedPostId: (item: string) => void}) {
  const [currentPostPickingMode, setCurrentPostPickingMode] =  useState<postPickingMode>(postPickingMode.team)
  return (
    <>
      { (currentPostPickingMode === postPickingMode.team) ?
        <GroupSelection width={width} height={height} onSelect={(e) => {setSelectedTeamId(e); setCurrentPostPickingMode(postPickingMode.channel)}}/>:null
      }
      { (currentPostPickingMode === postPickingMode.channel) ?
        <ChannelSelection width={width} height={height} teamId={selectedTeamId} 
        onSelect={(e) => {setSelectedChannelId(e); setCurrentPostPickingMode(postPickingMode.post)}}
        onBack={() => {setSelectedChannelId(""); setSelectedTeamId(""); setCurrentPostPickingMode(postPickingMode.team)}}/>:null
      }
      { (currentPostPickingMode === postPickingMode.post) ?
        <PostSelection width={width} height={height} teamId={selectedTeamId} channelId={selectedChannelId} onSelect={setSelectedPostId} onBack={() => {setSelectedPostId(""); setSelectedChannelId(""); setCurrentPostPickingMode(postPickingMode.channel)}}/>:null
      }
    </>
  )
}

function GroupSelection({width, height, onSelect}:{width: number, height: number, onSelect: (item: string) => void}) {
  const [backLink, setBackLink] = useState(undefined)
  const [nextLink, setNextLink] = useState(undefined)
  const [groupsState, setGroupsState] = useState(loadingStateEnum.loading)
  const [groups, setGroups] = useState<groupType[]>([])
  async function loadData() {
    const result = await getTeams()
    if (result.result === loadingStateEnum.success && result.data !== undefined){
      setGroups(result.data)
    }
    setGroupsState(result.result)
  }
  useEffect(() => {
    loadData()
  }, [])
  return (
    <>
      { (groupsState === loadingStateEnum.loading) ?
        <View style={{width: width, height: height, backgroundColor: "white", alignContent: "center", alignItems: "center", justifyContent: "center"}}>
          <ProgressView width={(width < height) ? width * 0.3:height * 0.3} height={(width < height) ? width * 0.3:height * 0.3}/>
          <Text>Loading</Text>
        </View>:
        <>
          { (groupsState === loadingStateEnum.success) ?
            <ScrollView style={{width: width, height: height}}>
              { groups.map((group) => (
                <Pressable key={"Group_"+group.id} onPress={() => {onSelect(group.id)}}>
                  <Text>{group.name}</Text>
                </Pressable>
              ))}
            </ScrollView>:
            <View style={{width: width, height: height}}>
              <Text>Failed To Get Groups</Text>
            </View>
          }
        </>
      }
    </>
  )
}

function ChannelSelection({width, height, teamId, onSelect, onBack}:{width: number, height: number, teamId: string, onSelect: (item: string) => void, onBack: () => void}) {
  const [backLink, setBackLink] = useState(undefined)
  const [nextLink, setNextLink] = useState(undefined)
  const [channelState, setChannelState] = useState(loadingStateEnum.loading)
  const [channels, setChannels] = useState<channelType[]>([])
  async function loadData() {
    const result = await getChannels(teamId)
    if (result.result === loadingStateEnum.success && result.data !== undefined){
      setChannels(result.data)
    }
    setChannelState(result.result)
  }
  useEffect(() => {
    loadData()
  }, [])
  return (
    <>
      { (channelState === loadingStateEnum.loading) ?
        <View style={{width: width, height: height, backgroundColor: "white", alignContent: "center", alignItems: "center", justifyContent: "center"}}>
          <ProgressView width={(width < height) ? width * 0.3:height * 0.3} height={(width < height) ? width * 0.3:height * 0.3}/>
          <Text>Loading</Text>
        </View>:
        <>
          { (channelState === loadingStateEnum.success) ?
            <ScrollView style={{width: width, height: height}}>
              <Pressable onPress={() => onBack()}>
                <Text>Back</Text>
              </Pressable>
              { channels.map((channel) => (
                <Pressable key={"Channel_"+channel.id} onPress={() => {onSelect(channel.id)}} style={{width: width, alignItems: "center"}}>
                  <Text>{channel.displayName}</Text>
                </Pressable>
              ))}
            </ScrollView>:
            <View style={{width: width, height: height}}>
              <Text>Failed To Get Channels</Text>
            </View>
          }
        </>
      }
    </>
  )
}

function PostSelection({width, height, teamId, channelId, onSelect, onBack}:{width: number, height: number, teamId: string, channelId: string, onSelect: (item: string) => void, onBack: () => void}) {
  const [backLink, setBackLink] = useState(undefined)
  const [nextLink, setNextLink] = useState(undefined)
  const [postsState, setPostsState] = useState(loadingStateEnum.loading)
  const [posts, setPosts] = useState<resourceDataType[]>([])
  async function loadData() {
    const result = await getPosts(teamId, channelId)
    if (result.result === loadingStateEnum.success && result.data !== undefined){
      setPosts(result.data)
    }
    setPostsState(result.result)
  }
  useEffect(() => {
    loadData()
  }, [])
  return (
    <>
      { (postsState === loadingStateEnum.loading) ?
        <View style={{width: width, height: height, backgroundColor: "white", alignContent: "center", alignItems: "center", justifyContent: "center"}}>
          <ProgressView width={(width < height) ? width * 0.3:height * 0.3} height={(width < height) ? width * 0.3:height * 0.3}/>
          <Text>Loading</Text>
        </View>:
        <>
          { (postsState === loadingStateEnum.success) ?
            <ScrollView style={{width: width, height: height}}>
              <Pressable onPress={() => onBack()}>
                <Text>Back</Text>
              </Pressable>
              { posts.map((post) => (
                <>
                  { (post.body !== "<systemEventMessage/>") ?
                    <Pressable key={"Post_"+post.id+"_"+create_UUID()} onPress={() => {onSelect(post.id)}}>
                      <WebViewCross html={post.body} width={width * 0.9}/>
                    </Pressable>:null
                  }
                </>
              ))}
            </ScrollView>:
            <View style={{width: width, height: height}}>
              <Text>Failed To Get Posts</Text>
            </View>
          }
        </>
      }
    </>
  )
}

function CommissionSubmissions({commissionId, width, height}:{commissionId: string, width: number, height: number}) {
  //Loading State
  const [submissiosState, setSubmissionsState] = useState<loadingStateEnum>(loadingStateEnum.loading)
 
  const [submissions, setSubmissions] = useState<submissionType[]>([])
  const [selectedSubmissionMode, setSelectedSubmissionMode] = useState<submissionTypeEnum>(submissionTypeEnum.unApproved)
  
  const [selectedSubmission, setSelectedSubmisson] = useState<submissionType | undefined>(undefined)

  async function loadData() {
    setSubmissionsState(loadingStateEnum.loading)
    const result = await getSubmissions(commissionId, selectedSubmissionMode)
    if (result.result === loadingStateEnum.success && result.data !== undefined) {
      setSubmissions(result.data)
      setSubmissionsState(result.result)
      if (result.count === 0) {
        const secondResult = await getSubmissions(commissionId, submissionTypeEnum.unApproved)
        if (secondResult.result === loadingStateEnum.success && secondResult.data !== undefined) {
          setSubmissions(result.data)
          setSubmissionsState(secondResult.result)
        }
      }
    } else {
      setSubmissionsState(result.result)
    }
  }
  useEffect(() => {
    loadData()
  } ,[selectedSubmissionMode])
  return (
    <>
      { (submissiosState === loadingStateEnum.loading) ?
        <View style={{width: width, height: height, backgroundColor: "white", alignContent: "center", alignItems: "center", justifyContent: "center"}}>
          <Text>Loading</Text>
        </View>:
        <>
          { (submissiosState === loadingStateEnum.success) ?
            <View style={{width: width, height: height}}>
              <View style={{flexDirection: "row"}}>
                <Pressable onPress={() => setSelectedSubmissionMode(submissionTypeEnum.all)} style={{marginLeft: "auto", marginRight: "auto"}}>
                  <Text>All</Text>
                </Pressable>
                <Pressable onPress={() => setSelectedSubmissionMode(submissionTypeEnum.unApproved)} style={{marginLeft: "auto", marginRight: "auto"}}>
                  <Text>Unapproved</Text>
                </Pressable>
                <Pressable onPress={() => setSelectedSubmissionMode(submissionTypeEnum.approved)} style={{marginLeft: "auto", marginRight: "auto"}}>
                  <Text>Approved</Text>
                </Pressable>
              </View>
              <FlatList
                data={undefined}
                renderItem={(submission) => 
                <Pressable style={{margin: 10}} onPress={() => setSelectedSubmisson(submission.item)}>
                  <Text>{submission.item.userName}</Text>
                  <Text>{new Date(submission.item.submissionTime).toLocaleDateString("en-US", {weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric"})}</Text>
                </Pressable>
                }              
              />
            </View>:
            <View>
              <Text>Failed To Load Submissions</Text>
            </View>
          }
        </>
      }
      { (selectedSubmission !== undefined) ?
        <SubmissionView width={width} height={height} setSubmissionData={() => {}} submissionData={selectedSubmission} onClose={() => setSelectedSubmisson(undefined)}/>:null
      }
    </>
  )
}

function SubmissionView({width, height, submissionData, onClose, setSubmissionData}:{width: number, height: number, submissionData: submissionType, onClose: () => void, setSubmissionData: (item: submissionType) => void}) {
  const [changeState, setChangeState] = useState<loadingStateEnum>(loadingStateEnum.notStarted)
  const [imageState, setImageState] = useState<loadingStateEnum>(loadingStateEnum.notStarted)
  const [imageUri, setImageUri] = useState<string>("")
  const [imageHeight, setImageHeight] = useState<number>(0)

  async function changeSubmissionApproved() {
    setChangeState(loadingStateEnum.loading)
    const data = {
      "fields":{
        "submissionApproved":!submissionData.approved,
        "submissionReviewed":true
      }
    }
    const result = await callMsGraph(`https://graph.microsoft.com/v1.0/sites/${store.getState().paulyList.siteId}/lists/${store.getState().paulyList.commissionSubmissionsListId}/items/${submissionData.itemId}`, "PATCH", undefined, JSON.stringify(data))
    if (result.ok) {
      setChangeState(loadingStateEnum.success)
    } else {
      setChangeState(loadingStateEnum.failed)
    }
  }

  async function loadImage() {
    if (submissionData.submissionImage !== undefined) {
      setImageState(loadingStateEnum.loading)
      const shareResult = await getFileWithShareID(submissionData.submissionImage)
      if (shareResult.result === loadingStateEnum.success && shareResult.url !== undefined) {
        setImageUri(shareResult.url)
        setImageState(shareResult.result)
        Image.getSize(shareResult.url, (imageMeasureWidth, imageMeasureHeight) => {
          const heightPerWidth = imageMeasureHeight/imageMeasureWidth
          setImageHeight((width * 0.7) * heightPerWidth)
        })
      }
      setImageState(shareResult.result)
    }
  }

  useEffect(() => {
    loadImage()
  }, [])

  return (
    <View style={{width: width * 0.8, height: height * 0.8, shadowColor: "black", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 10, borderRadius: 15, position: "absolute", left: width * 0.1, top: height * 0.1, zIndex: 2, backgroundColor: "white"}}>
      <Pressable onPress={() => onClose()} style={{margin: 10}}>
        <CloseIcon width={12} height={12}/>
      </Pressable>
      <View style={{width: width * 0.8, alignContent: "center", alignItems: "center"}}>
        <Text>Submission</Text>
        <Text>By: {submissionData.userName}</Text>
        <Text>Time: {new Date(submissionData.submissionTime).toLocaleDateString("en-US", {weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric"})}</Text>
        <Text>Approved: {submissionData.approved ? "TURE":"FALSE"}</Text>
        <Text>Reviewed: {submissionData.reviewed ? "TRUE":"FALSE"}</Text>
        <Text>Id: {submissionData.id}</Text>
        { submissionData.submissionImage ? 
          <>
            { (imageState === loadingStateEnum.loading) ?
              <View style={{width: width * 0.8, height: height * 0.8, alignContent: "center", alignItems: "center", justifyContent: "center"}}>
                <ProgressView width={((width * 0.8) < (height * 0.8)) ? width * 0.3:height*0.3} height={((width * 0.8) < (height * 0.8)) ? width * 0.3:height*0.3} />
                <Text>Loading</Text>
              </View>:
              <>
                { (imageState === loadingStateEnum.success) ? 
                  <Image source={{uri: imageUri}} width={width * 0.7} resizeMode='center' style={{width: width * 0.7, height: imageHeight, marginLeft: "auto", marginRight: "auto", alignContent: "center", alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 10, borderRadius: 15}}/>:<Text>Failed to load image</Text>
                }
              </>
            }
          </>:null
        }
      </View>
      <Pressable onPress={() => changeSubmissionApproved()}>
        <Text>{(changeState === loadingStateEnum.notStarted) ? ((submissionData.approved) ? "REMOVE APPROVAL":"APPROVE"):(changeState === loadingStateEnum.loading) ? "Loading":(changeState === loadingStateEnum.success) ? "Success":"Failed"}</Text>
      </Pressable>
    </View>
  )
}