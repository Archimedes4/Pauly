/*
  Pauly
  Andrew Mainella
  edit.tsx
  edits and creates commissions
*/
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Switch,
  Image,
} from 'react-native';
import { useSelector } from 'react-redux';
import { FlatList } from 'react-native-gesture-handler';
import { DatePickerModal, TimePickerModal } from 'react-native-paper-dates';
import store, { RootState } from '@redux/store';
import {
  Colors,
  commissionTypeEnum,
  loadingStateEnum,
  styles,
  submissionTypeEnum,
} from '@constants';
import SegmentedPicker from '@components/Pickers/SegmentedPicker';
import ProgressView from '@components/ProgressView';
import WebViewCross from '@components/WebViewCross';
import { CloseIcon } from '@components/Icons';
import Map from '@components/Map';
import BackButton from '@components/BackButton';
import {
  getChannels,
  getPosts,
  getTeams,
} from '@utils/microsoftGroupsFunctions';
import getCommission from '@utils/commissions/getCommission';
import getSubmissions from '@utils/commissions/getSubmissions';
import callMsGraph from '@utils/ultility/microsoftAssets';
import createUUID, { getTextState } from '@utils/ultility/createUUID';
import { getFileWithShareID } from '@utils/ultility/handleShareID';
import { updateCommission } from '@utils/commissions/updateCommissionFunctions';
import Slider from '@react-native-community/slider';
import { useGlobalSearchParams } from 'expo-router';
import StyledButton from '@components/StyledButton';

enum datePickingMode {
  none,
  startTime,
  endTime,
  startDate,
  endDate,
}

export function GovernmentCommissionUpdate({
  isCreate,
}: {
  isCreate: boolean;
}) {
  const { width, height } = useSelector((state: RootState) => state.dimentions);
  const { commissionListId, siteId } = useSelector(
    (state: RootState) => state.paulyList,
  );

  const [submitCommissionState, setSubmitCommissionState] =
    useState<loadingStateEnum>(loadingStateEnum.notStarted);

  const [selectedCommissionType, setSelectedCommissionType] =
    useState<commissionTypeEnum>(commissionTypeEnum.Issued);

  const [commissionName, setCommissionName] = useState<string>('');
  const [proximity, setProximity] = useState<number>(0);
  const [points, setPoints] = useState<number>(0);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const [isHidden, setIsHidden] = useState<boolean>(false);

  const [currentDatePickingMode, setCurrentDatePickingMode] =
    useState<datePickingMode>(datePickingMode.none);

  const [selectedPositionIn, setSelectedPositionIn] = useState<{
    lat: number;
    lng: number;
  }>({ lat: 49.85663823299096, lng: -97.22659526509193 });
  const [maxNumberOfClaims, setMaxNumberOfClaims] = useState<number>(1);
  const [allowMultipleSubmissions, setAllowMultipleSubmissions] =
    useState<boolean>(false);
  const [isTimed, setIsTimed] = useState<boolean>(true);

  const [commissionItemId, setCommissionItemId] = useState<string>('');

  const [getCommissionResult, setGetCommissionResult] =
    useState<loadingStateEnum>(loadingStateEnum.loading);
  const [deleteCommissionResult, setDeleteCommissionResult] =
    useState<loadingStateEnum>(loadingStateEnum.notStarted);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedChannelId, setSelectedChannelId] = useState<string>('');
  const [selectedPostId, setSelectedPostId] = useState<string>('');

  const { id } = useGlobalSearchParams();

  async function loadData() {
    if (typeof id === 'string') {
      const result = await getCommission(id);
      if (
        result.result === loadingStateEnum.success &&
        result.data !== undefined
      ) {
        // TO DO add all values
        setCommissionItemId(result.data.itemId);
        setCommissionName(result.data.title);
        setAllowMultipleSubmissions(result.data.allowMultipleSubmissions);
        setIsHidden(result.data.hidden);
        setMaxNumberOfClaims(result.data.maxNumberOfClaims);
        setIsTimed(result.data.timed);
        setPoints(result.data.points);
      }
      setGetCommissionResult(result.result);
    }
  }
  async function deleteCommission() {
    if (
      commissionItemId === '' ||
      deleteCommissionResult === loadingStateEnum.loading ||
      deleteCommissionResult === loadingStateEnum.success
    ) {
      return;
    }
    setDeleteCommissionResult(loadingStateEnum.loading);
    const result = await callMsGraph(
      `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${commissionListId}/items/${commissionItemId}`,
      'DELETE',
    );
    if (result.ok) {
      const deleteList = await callMsGraph(
        `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${id}`,
        'DELETE',
      );
      if (deleteList.ok) {
        setDeleteCommissionResult(loadingStateEnum.success);
      } else {
        setDeleteCommissionResult(loadingStateEnum.failed);
      }
    } else {
      setDeleteCommissionResult(loadingStateEnum.failed);
    }
  }
  useEffect(() => {
    if (!isCreate) {
      loadData();
    }
  }, []);

  async function loadUpdateCommission() {
    // checking that their is a commission to update and an operation is not in progress.
    if (
      submitCommissionState === loadingStateEnum.failed ||
      submitCommissionState === loadingStateEnum.notStarted
    ) {
      setSubmitCommissionState(loadingStateEnum.loading);
      const result = await updateCommission(
        isCreate,
        commissionName,
        isTimed,
        points,
        isHidden,
        maxNumberOfClaims,
        allowMultipleSubmissions,
        selectedCommissionType,
        selectedPostId,
        selectedTeamId,
        selectedChannelId,
        startDate,
        endDate,
        typeof id === 'string' ? id : createUUID(),
        proximity,
        selectedPositionIn,
        commissionItemId,
      );
      setSubmitCommissionState(result);
    }
  }

  if (typeof id !== 'string' && !isCreate) {
    return (
      <View
        style={{
          overflow: 'hidden',
          width,
          height,
          backgroundColor: Colors.white,
        }}
      >
        <BackButton to="/government/commissions" />
        <Text>Something went wrong</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        overflow: 'hidden',
        width,
        height,
        backgroundColor: Colors.white,
      }}
    >
      <ScrollView style={{ height, width, zIndex: 1 }}>
        <BackButton to="/government/commissions" />
        <View
          style={{
            alignContent: 'center',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              marginLeft: 'auto',
              marginRight: 'auto',
              fontFamily: 'Comfortaa-Regular',
              marginBottom: 5,
              fontSize: 25,
            }}
          >
            {isCreate ? 'Create New' : 'Edit'} Commission
          </Text>
        </View>
        <View
          style={{
            width,
            height: height * 0.15,
            alignContent: 'center',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SegmentedPicker
            selectedIndex={selectedCommissionType}
            setSelectedIndex={setSelectedCommissionType}
            options={[
              'Issued',
              'Location',
              'Image',
              'Image and Location',
              'QRCode',
            ]}
            width={width * 0.8}
            height={height * 0.1}
          />
        </View>
        <Text>Commission Name</Text>
        <TextInput
          value={commissionName}
          onChangeText={text => setCommissionName(text)}
          placeholder="Commission Name"
          style={styles.textInputStyle}
        />
        {selectedCommissionType === commissionTypeEnum.ImageLocation ||
        selectedCommissionType === commissionTypeEnum.Location ? (
          <View>
            <View
              style={{
                width,
                height: height * 0.3,
                alignContent: 'center',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Map
                proximity={proximity}
                // selectedPositionIn={selectedPositionIn}
                onSetSelectedPositionIn={setSelectedPositionIn}
                width={width * 0.8}
                height={height * 0.3}
              />
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Text>Proximity</Text>
              <TextInput
                keyboardType="numeric"
                onChangeText={text => setProximity(parseFloat(text))}
                value={proximity.toString()}
                maxLength={10} // setting limit of input
              />
            </View>
            <View
              style={{
                width,
                alignContent: 'center',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Slider
                style={{ width: width * 0.9, height: 50 }}
                value={proximity / 1000}
                onValueChange={value => {
                  setProximity(value * 1000);
                }}
              />
            </View>
          </View>
        ) : null}
        {isTimed ? (
          <View
            style={{
              shadowColor: Colors.black,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.8,
              shadowRadius: 10,
              borderRadius: 15,
              padding: 10,
              margin: 15,
              marginBottom: 20,
            }}
          >
            <View style={{ flexDirection: 'row' }}>
              <Text>Timed: </Text>
              <Switch
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={isTimed ? '#f5dd4b' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={e => {
                  setIsTimed(e);
                }}
                value={isTimed}
              />
            </View>
            <View
              style={{
                alignContent: 'center',
                alignItems: 'center',
                justifyContent: 'center',
                width,
              }}
            >
              <Text>Start Date</Text>
              <Pressable
                style={{ margin: 5 }}
                onPress={() => {
                  setCurrentDatePickingMode(datePickingMode.startDate);
                }}
              >
                <Text>Pick Start Time</Text>
              </Pressable>
              <TimePickerModal
                hours={new Date(startDate).getHours()}
                minutes={new Date(startDate).getMinutes()}
                visible={currentDatePickingMode === datePickingMode.startDate}
                onDismiss={() =>
                  setCurrentDatePickingMode(datePickingMode.none)
                }
                onConfirm={e => {
                  const newDate = new Date(startDate);
                  newDate.setHours(e.hours);
                  newDate.setMinutes(e.minutes);
                  setStartDate(newDate);
                  setCurrentDatePickingMode(datePickingMode.none);
                }}
              />
              <Pressable
                style={{ margin: 5 }}
                onPress={() => {
                  setCurrentDatePickingMode(datePickingMode.startDate);
                }}
              >
                <Text>Pick Start Date</Text>
              </Pressable>
              <DatePickerModal
                locale="en"
                mode="single"
                label="Select Date"
                visible={currentDatePickingMode === datePickingMode.startDate}
                onDismiss={() =>
                  setCurrentDatePickingMode(datePickingMode.none)
                }
                date={new Date(endDate)}
                onConfirm={e => {
                  if (e.date !== undefined) {
                    const oldDate = new Date(endDate);
                    const newDate = new Date(
                      e.date.getFullYear(),
                      e.date.getMonth(),
                      e.date.getDate(),
                      oldDate.getHours(),
                      oldDate.getMinutes(),
                    );
                    setStartDate(newDate);
                  }
                  setCurrentDatePickingMode(datePickingMode.none);
                }}
              />
            </View>
            <View
              style={{
                alignContent: 'center',
                alignItems: 'center',
                justifyContent: 'center',
                width,
              }}
            >
              <Text>End Date</Text>
              <Pressable
                style={{ margin: 5 }}
                onPress={() => {
                  setCurrentDatePickingMode(datePickingMode.endDate);
                }}
              >
                <Text>Pick End Time</Text>
              </Pressable>
              <TimePickerModal
                hours={new Date(endDate).getHours()}
                minutes={new Date(endDate).getMinutes()}
                visible={currentDatePickingMode === datePickingMode.endTime}
                onDismiss={() =>
                  setCurrentDatePickingMode(datePickingMode.none)
                }
                onConfirm={e => {
                  const newDate = new Date(startDate);
                  newDate.setHours(e.hours);
                  newDate.setMinutes(e.minutes);
                  setEndDate(newDate);
                  setCurrentDatePickingMode(datePickingMode.none);
                }}
              />
              <Pressable
                style={{ margin: 5 }}
                onPress={() => {
                  setCurrentDatePickingMode(datePickingMode.endDate);
                }}
              >
                <Text>Pick End Date</Text>
              </Pressable>
              <DatePickerModal
                locale="en"
                mode="single"
                label="Select Date"
                visible={currentDatePickingMode === datePickingMode.endDate}
                onDismiss={() =>
                  setCurrentDatePickingMode(datePickingMode.none)
                }
                date={new Date(endDate)}
                onConfirm={e => {
                  if (e.date !== undefined) {
                    const oldDate = new Date(endDate);
                    const newDate = new Date(
                      e.date.getFullYear(),
                      e.date.getMonth(),
                      e.date.getDate(),
                      oldDate.getHours(),
                      oldDate.getMinutes(),
                    );
                    setEndDate(newDate);
                  }
                  setCurrentDatePickingMode(datePickingMode.none);
                }}
              />
            </View>
          </View>
        ) : (
          <View
            style={{
              flexDirection: 'row',
              shadowColor: Colors.black,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.8,
              shadowRadius: 10,
              borderRadius: 15,
              padding: 10,
              margin: 15,
              marginBottom: 20,
            }}
          >
            <Text>Timed: </Text>
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isTimed ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={e => {
                setIsTimed(e);
              }}
              value={isTimed}
            />
          </View>
        )}
        <View
          style={{
            marginLeft: 15,
            marginRight: 15,
            shadowColor: Colors.black,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.8,
            shadowRadius: 10,
            borderRadius: 15,
            padding: 10,
            marginBottom: 20,
          }}
        >
          <View style={{ flexDirection: 'row' }}>
            <Text>Points: </Text>
            <TextInput
              keyboardType="numeric"
              onChangeText={text => {
                if (text === '') {
                  setPoints(0);
                } else {
                  setPoints(parseFloat(text));
                }
              }}
              value={points.toString()}
              maxLength={10} // setting limit of input
            />
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text>Allow Multiple Submissions: </Text>
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={allowMultipleSubmissions ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={e => {
                setAllowMultipleSubmissions(e);
              }}
              value={allowMultipleSubmissions}
            />
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text>Is Hidden: </Text>
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isHidden ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={e => {
                setIsHidden(e);
              }}
              value={isHidden}
            />
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text>Max number of claims: </Text>
            <TextInput
              value={maxNumberOfClaims.toString()}
              onChangeText={e => {
                if (e !== '') {
                  setMaxNumberOfClaims(parseFloat(e));
                } else {
                  setMaxNumberOfClaims(0);
                }
              }}
              inputMode="numeric"
            />
          </View>
        </View>
        <View
          style={{
            marginLeft: 15,
            marginRight: 15,
            shadowColor: Colors.black,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.8,
            shadowRadius: 10,
            borderRadius: 15,
            padding: 10,
          }}
        >
          <Text>Post</Text>
          <PostSelectionContainer
            width={width - 45}
            height={height * 0.4}
            selectedTeamId={selectedTeamId}
            selectedPostId={selectedPostId}
            setSelectedTeamId={setSelectedTeamId}
            selectedChannelId={selectedChannelId}
            setSelectedChannelId={setSelectedChannelId}
            setSelectedPostId={setSelectedPostId}
          />
        </View>
        {!isCreate && typeof id === 'string' ? (
          <View
            style={{
              marginTop: 20,
              marginBottom: 15,
              marginLeft: 15,
              marginRight: 15,
              shadowColor: Colors.black,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.8,
              shadowRadius: 10,
              borderRadius: 15,
              padding: 10,
            }}
          >
            <CommissionSubmissions
              commissionId={id}
              width={width - 50}
              height={height * 0.5}
            />
          </View>
        ) : null}
        <StyledButton
          text={
            submitCommissionState === loadingStateEnum.notStarted
              ? isCreate
                ? 'Create Commission'
                : 'Save Changes'
              : submitCommissionState === loadingStateEnum.loading
                ? 'Loading'
                : submitCommissionState === loadingStateEnum.success
                  ? 'Success'
                  : 'Failed'
          }
          onPress={() => {
            loadUpdateCommission();
          }}
          second
          style={{ marginLeft: 15, marginRight: 15, marginBottom: 15 }}
        />
        {!isCreate ? (
          <StyledButton
            text={getTextState(deleteCommissionResult, {
              notStarted: 'Delete Commission',
              success: 'Deleted Commission',
              failed: 'Failed To Delete Commission',
            })}
            second
            onPress={() => {
              deleteCommission();
            }}
            style={{ marginLeft: 15, marginRight: 15, marginBottom: 15 }}
          />
        ) : null}
      </ScrollView>

      {/* <View style={{height: height * 0.8, width: width * 0.8, position: "absolute", left: width * 0.1, top: height * 0.1, zIndex: 2, backgroundColor: (currentDatePickingMode === datePickingMode.start || currentDatePickingMode === datePickingMode.end) ? Colors.white:"transparent", borderRadius: 15, shadowColor: (currentDatePickingMode === datePickingMode.start || currentDatePickingMode === datePickingMode.end) ? "black":"transparent", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 10, alignItems: "center", justifyContent: "center", alignContent: "center"}} pointerEvents={(currentDatePickingMode === datePickingMode.start || currentDatePickingMode === datePickingMode.end) ? 'auto':'none'}>
        { (currentDatePickingMode === datePickingMode.start || currentDatePickingMode === datePickingMode.end) ?
          <DatePicker 
            selectedDate={(currentDatePickingMode === datePickingMode.start) ? startDate:endDate} 
            onSetSelectedDate={(date) => {if (currentDatePickingMode === datePickingMode.end) {setEndDate(date)} else if (currentDatePickingMode === datePickingMode.start) {setStartDate(date)}}}
            width={width * 0.7} height={height * 0.7} onCancel={() => {setCurrentDatePickingMode(datePickingMode.none)}}
          />:null
        }
      </View> */}
    </View>
  );
}

enum postPickingMode {
  team,
  channel,
  post,
}

function PostSelectionContainer({
  width,
  height,
  selectedChannelId,
  selectedTeamId,
  selectedPostId,
  setSelectedChannelId,
  setSelectedPostId,
  setSelectedTeamId,
}: {
  width: number;
  height: number;
  selectedTeamId: string;
  selectedPostId: string;
  setSelectedTeamId: (item: string) => void;
  selectedChannelId: string;
  setSelectedChannelId: (item: string) => void;
  setSelectedPostId: (item: string) => void;
}) {
  const [currentPostPickingMode, setCurrentPostPickingMode] =
    useState<postPickingMode>(postPickingMode.team);
  return (
    <>
      {currentPostPickingMode === postPickingMode.team ? (
        <GroupSelection
          width={width}
          height={height}
          onSelect={e => {
            setSelectedTeamId(e);
            setCurrentPostPickingMode(postPickingMode.channel);
          }}
        />
      ) : null}
      {currentPostPickingMode === postPickingMode.channel ? (
        <ChannelSelection
          width={width}
          height={height}
          teamId={selectedTeamId}
          onSelect={e => {
            setSelectedChannelId(e);
            setCurrentPostPickingMode(postPickingMode.post);
          }}
          onBack={() => {
            setSelectedChannelId('');
            setSelectedTeamId('');
            setCurrentPostPickingMode(postPickingMode.team);
          }}
        />
      ) : null}
      {currentPostPickingMode === postPickingMode.post ? (
        <PostSelection
          width={width}
          height={height}
          teamId={selectedTeamId}
          channelId={selectedChannelId}
          selectedPostId={selectedPostId}
          onSelect={setSelectedPostId}
          onBack={() => {
            setSelectedPostId('');
            setSelectedChannelId('');
            setCurrentPostPickingMode(postPickingMode.channel);
          }}
        />
      ) : null}
    </>
  );
}

function GroupSelection({
  width,
  height,
  onSelect,
}: {
  width: number;
  height: number;
  onSelect: (item: string) => void;
}) {
  const [backLink, setBackLink] = useState(undefined);
  const [nextLink, setNextLink] = useState(undefined);
  const [groupsState, setGroupsState] = useState(loadingStateEnum.loading);
  const [groups, setGroups] = useState<groupType[]>([]);
  async function loadData() {
    const result = await getTeams();
    if (
      result.result === loadingStateEnum.success &&
      result.data !== undefined
    ) {
      setGroups(result.data);
    }
    setGroupsState(result.result);
  }
  useEffect(() => {
    loadData();
  }, []);

  if (groupsState === loadingStateEnum.loading) {
    return (
      <View
        style={{
          width,
          height,
          backgroundColor: Colors.white,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ProgressView
          width={width < height ? width * 0.3 : height * 0.3}
          height={width < height ? width * 0.3 : height * 0.3}
        />
        <Text>Loading</Text>
      </View>
    );
  }

  if (groupsState === loadingStateEnum.success) {
    return (
      <FlatList
        data={groups}
        style={{ width, height }}
        renderItem={group => (
          <StyledButton
            text={group.item.name}
            key={`Group_${group.item.id}`}
            onPress={() => {
              onSelect(group.item.id);
            }}
            style={{
              marginLeft: 15,
              marginRight: 15,
              marginBottom: 15,
              marginTop: group.index === 0 ? 15 : 0,
            }}
          />
        )}
      />
    );
  }

  return (
    <View style={{ width, height }}>
      <Text>Failed To Get Groups</Text>
    </View>
  );
}

function ChannelSelection({
  width,
  height,
  teamId,
  onSelect,
  onBack,
}: {
  width: number;
  height: number;
  teamId: string;
  onSelect: (item: string) => void;
  onBack: () => void;
}) {
  const [backLink, setBackLink] = useState(undefined);
  const [nextLink, setNextLink] = useState(undefined);
  const [channelState, setChannelState] = useState(loadingStateEnum.loading);
  const [channels, setChannels] = useState<channelType[]>([]);
  async function loadData() {
    const result = await getChannels(teamId);
    if (
      result.result === loadingStateEnum.success &&
      result.data !== undefined
    ) {
      setChannels(result.data);
    }
    setChannelState(result.result);
  }
  useEffect(() => {
    loadData();
  }, []);

  if (channelState === loadingStateEnum.loading) {
    return (
      <View
        style={{
          width,
          height,
          backgroundColor: Colors.white,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ProgressView
          width={width < height ? width * 0.3 : height * 0.3}
          height={width < height ? width * 0.3 : height * 0.3}
        />
        <Text>Loading</Text>
      </View>
    );
  }

  if (channelState === loadingStateEnum.success) {
    return (
      <View style={{ width, height }}>
        <StyledButton
          text="Back"
          onPress={() => onBack()}
          second
          style={{ marginLeft: 15, marginRight: 15, marginTop: 10 }}
        />
        <FlatList
          data={channels}
          renderItem={channel => (
            <StyledButton
              key={`Channel_${channel.item.id}`}
              onPress={() => {
                onSelect(channel.item.id);
              }}
              text={channel.item.displayName}
              style={{ marginLeft: 15, marginRight: 15, marginTop: 15 }}
            />
          )}
        />
      </View>
    );
  }

  return (
    <View style={{ width, height }}>
      <Text>Failed To Get Channels</Text>
    </View>
  );
}

function PostSelection({
  width,
  height,
  teamId,
  channelId,
  selectedPostId,
  onSelect,
  onBack,
}: {
  width: number;
  height: number;
  teamId: string;
  channelId: string;
  selectedPostId: string;
  onSelect: (item: string) => void;
  onBack: () => void;
}) {
  const [backLink, setBackLink] = useState(undefined);
  const [nextLink, setNextLink] = useState(undefined);
  const [postsState, setPostsState] = useState(loadingStateEnum.loading);
  const [posts, setPosts] = useState<resourceDataType[]>([]);
  async function loadData() {
    const result = await getPosts(teamId, channelId);
    if (
      result.result === loadingStateEnum.success &&
      result.data !== undefined
    ) {
      setPosts(result.data);
    }
    setPostsState(result.result);
  }
  useEffect(() => {
    loadData();
  }, []);

  if (postsState === loadingStateEnum.loading) {
    return (
      <View
        style={{
          width,
          height,
          backgroundColor: Colors.white,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ProgressView
          width={width < height ? width * 0.3 : height * 0.3}
          height={width < height ? width * 0.3 : height * 0.3}
        />
        <Text>Loading</Text>
      </View>
    );
  }

  if (postsState === loadingStateEnum.success) {
    return (
      <ScrollView style={{ width, height }}>
        <Pressable onPress={() => onBack()}>
          <Text>Back</Text>
        </Pressable>
        <FlatList
          data={posts}
          renderItem={post => (
            <>
              {post.item.body !== '<systemEventMessage/>' ? (
                <Pressable
                  key={`Post_${post.item.id}`}
                  onPress={() => {
                    onSelect(post.item.id);
                  }}
                  style={{
                    padding: 5,
                    margin: 5,
                    backgroundColor:
                      selectedPostId === post.item.id
                        ? Colors.lightGray
                        : Colors.white,
                  }}
                >
                  <WebViewCross html={post.item.body} width={width * 0.9} />
                </Pressable>
              ) : null}
            </>
          )}
        />
      </ScrollView>
    );
  }

  return (
    <View style={{ width, height }}>
      <Text>Failed To Get Posts</Text>
    </View>
  );
}

function CommissionSubmissions({
  commissionId,
  width,
  height,
}: {
  commissionId: string;
  width: number;
  height: number;
}) {
  // Loading State
  const [submissiosState, setSubmissionsState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );

  const [submissions, setSubmissions] = useState<submissionType[]>([]);
  const [selectedSubmissionMode, setSelectedSubmissionMode] =
    useState<submissionTypeEnum>(submissionTypeEnum.unApproved);

  const [selectedSubmission, setSelectedSubmisson] = useState<
    submissionType | undefined
  >(undefined);

  async function loadData() {
    setSubmissionsState(loadingStateEnum.loading);
    const result = await getSubmissions(commissionId, selectedSubmissionMode);
    if (
      result.result === loadingStateEnum.success &&
      result.data !== undefined
    ) {
      setSubmissions(result.data);
      setSubmissionsState(result.result);
      if (result.count === 0) {
        const secondResult = await getSubmissions(
          commissionId,
          submissionTypeEnum.unApproved,
        );
        if (
          secondResult.result === loadingStateEnum.success &&
          secondResult.data !== undefined
        ) {
          setSubmissions(result.data);
          setSubmissionsState(secondResult.result);
        }
      }
    } else {
      setSubmissionsState(result.result);
    }
  }
  useEffect(() => {
    loadData();
  }, [selectedSubmissionMode]);

  if (submissiosState === loadingStateEnum.loading) {
    return (
      <View
        style={{
          width,
          height,
          backgroundColor: Colors.white,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text>Loading</Text>
      </View>
    );
  }

  if (submissiosState === loadingStateEnum.success) {
    return (
      <>
        <View style={{ width, height }}>
          <View style={{ flexDirection: 'row' }}>
            <Pressable
              onPress={() => setSelectedSubmissionMode(submissionTypeEnum.all)}
              style={{ marginLeft: 'auto', marginRight: 'auto' }}
            >
              <Text>All</Text>
            </Pressable>
            <Pressable
              onPress={() =>
                setSelectedSubmissionMode(submissionTypeEnum.unApproved)
              }
              style={{ marginLeft: 'auto', marginRight: 'auto' }}
            >
              <Text>Unapproved</Text>
            </Pressable>
            <Pressable
              onPress={() =>
                setSelectedSubmissionMode(submissionTypeEnum.approved)
              }
              style={{ marginLeft: 'auto', marginRight: 'auto' }}
            >
              <Text>Approved</Text>
            </Pressable>
          </View>
          <FlatList
            data={submissions}
            renderItem={submission => (
              <Pressable
                style={{ margin: 10 }}
                onPress={() => setSelectedSubmisson(submission.item)}
              >
                <Text>{submission.item.userName}</Text>
                <Text>
                  {new Date(submission.item.submissionTime).toLocaleDateString(
                    'en-US',
                    {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric',
                      second: 'numeric',
                    },
                  )}
                </Text>
              </Pressable>
            )}
          />
        </View>
        {selectedSubmission !== undefined ? (
          <SubmissionView
            width={width}
            height={height}
            submissionData={selectedSubmission}
            onClose={() => setSelectedSubmisson(undefined)}
          />
        ) : null}
      </>
    );
  }

  return (
    <View>
      <Text>Failed To Load Submissions</Text>
    </View>
  );
}

function SubmissionView({
  width,
  height,
  submissionData,
  onClose,
}: {
  width: number;
  height: number;
  submissionData: submissionType;
  onClose: () => void;
}) {
  const [changeState, setChangeState] = useState<loadingStateEnum>(
    loadingStateEnum.notStarted,
  );
  const [imageState, setImageState] = useState<loadingStateEnum>(
    loadingStateEnum.notStarted,
  );
  const [imageUri, setImageUri] = useState<string>('');
  const [imgHeight, setImgHeight] = useState<number>(0);

  async function changeSubmissionApproved() {
    setChangeState(loadingStateEnum.loading);
    const data = {
      fields: {
        submissionApproved: !submissionData.approved,
        submissionReviewed: true,
      },
    };
    const result = await callMsGraph(
      `https://graph.microsoft.com/v1.0/sites/${
        store.getState().paulyList.siteId
      }/lists/${store.getState().paulyList.commissionSubmissionsListId}/items/${
        submissionData.itemId
      }`,
      'PATCH',
      JSON.stringify(data),
    );
    if (result.ok) {
      setChangeState(loadingStateEnum.success);
    } else {
      setChangeState(loadingStateEnum.failed);
    }
  }

  async function loadImage() {
    if (submissionData.submissionImage !== undefined) {
      setImageState(loadingStateEnum.loading);
      const shareResult = await getFileWithShareID(
        submissionData.submissionImage,
        0,
      );
      if (
        shareResult.result === loadingStateEnum.success &&
        shareResult.url !== undefined
      ) {
        setImageUri(shareResult.url);
        setImageState(shareResult.result);
        Image.getSize(
          shareResult.url,
          (imageMeasureWidth, imageMeasureHeight) => {
            const heightPerWidth = imageMeasureHeight / imageMeasureWidth;
            setImgHeight(width * 0.7 * heightPerWidth);
          },
        );
      }
      setImageState(shareResult.result);
    }
  }

  useEffect(() => {
    loadImage();
  }, []);

  return (
    <View
      style={{
        width: width * 0.8,
        height: height * 0.8,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        borderRadius: 15,
        position: 'absolute',
        left: width * 0.1,
        top: height * 0.1,
        zIndex: 2,
        backgroundColor: Colors.white,
      }}
    >
      <Pressable onPress={() => onClose()} style={{ margin: 10 }}>
        <CloseIcon width={12} height={12} />
      </Pressable>
      <View
        style={{
          width: width * 0.8,
          alignContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text>Submission</Text>
        <Text>By: {submissionData.userName}</Text>
        <Text>
          Time:{' '}
          {new Date(submissionData.submissionTime).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
          })}
        </Text>
        <Text>Approved: {submissionData.approved ? 'TURE' : 'FALSE'}</Text>
        <Text>Reviewed: {submissionData.reviewed ? 'TRUE' : 'FALSE'}</Text>
        <Text>Id: {submissionData.id}</Text>
        {submissionData.submissionImage ? (
          <>
            {imageState === loadingStateEnum.loading ? (
              <View
                style={{
                  width: width * 0.8,
                  height: height * 0.8,
                  alignContent: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ProgressView
                  width={
                    width * 0.8 < height * 0.8 ? width * 0.3 : height * 0.3
                  }
                  height={
                    width * 0.8 < height * 0.8 ? width * 0.3 : height * 0.3
                  }
                />
                <Text>Loading</Text>
              </View>
            ) : (
              <>
                {imageState === loadingStateEnum.success ? (
                  <Image
                    source={{ uri: imageUri }}
                    width={width * 0.7}
                    resizeMode="center"
                    style={{
                      width: width * 0.7,
                      height: imgHeight,
                      marginLeft: 'auto',
                      marginRight: 'auto',
                      alignContent: 'center',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: Colors.white,
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.8,
                      shadowRadius: 10,
                      borderRadius: 15,
                    }}
                  />
                ) : (
                  <Text>Failed to load image</Text>
                )}
              </>
            )}
          </>
        ) : null}
      </View>
      <Pressable onPress={() => changeSubmissionApproved()}>
        <Text>
          {getTextState(changeState, {
            notStarted: submissionData.approved ? 'REMOVE APPROVAL' : 'APPROVE',
          })}
        </Text>
      </Pressable>
    </View>
  );
}

export default function GovernmentEditCommission() {
  return <GovernmentCommissionUpdate isCreate={false} />;
}
