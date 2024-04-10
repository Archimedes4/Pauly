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
  Switch,
  Modal,
  Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import store, { RootState } from '@redux/store';
import {
  Colors,
  commissionCompetitionType,
  commissionTypeEnum,
  loadingStateEnum,
  styles,
} from '@constants';
import SegmentedPicker from '@components/Pickers/SegmentedPicker';
import ProgressView from '@components/ProgressView';
import Map from '@components/Map';
import BackButton from '@components/BackButton';
import {getCommission} from  '@redux/reducers/commissionsReducer';
import callMsGraph from '@utils/ultility/microsoftAssests';
import createUUID, { getTextState } from '@utils/ultility/createUUID';
import {
  updateCommission,
} from '@utils/commissions/updateCommissionFunctions';
import Slider from '@react-native-community/slider';
import { useGlobalSearchParams } from 'expo-router';
import StyledButton from '@components/StyledButton';
import CommissionsPostComponent from '@components/government/comissions/CommissionsPostComponent';
import CommissionsQRCodeComponent from '@components/government/comissions/CommissionsQRCodeComponent';
import AddCommissionSubmission from '@components/government/comissions/CommissionsAddSubmission';
import CommissionsTimeComponent from '@components/government/comissions/CommissionsTimeComponent';
import CommissionSubmissions from '@components/government/comissions/CommissionSubmissions';

function commissionTypeText(commissionType: commissionTypeEnum) {
  if (commissionType === commissionTypeEnum.Issued) {
    return "Issued"
  }
  if (commissionType === commissionTypeEnum.Image) {
    return "Image"
  }
  if (commissionType === commissionTypeEnum.ImageLocation) {
    return "Image and location"
  }
  if (commissionType === commissionTypeEnum.Location) {
    return "Location"
  }
  if (commissionType === commissionTypeEnum.QRCode) {
    return "QR code"
  }
}

export function GovernmentCommissionUpdate({
  isCreate,
}: {
  isCreate: boolean;
}) {
  const { width, height } = useSelector((state: RootState) => state.dimensions);
  const { commissionListId, siteId } = useSelector(
    (state: RootState) => state.paulyList,
  );

  const [submitCommissionState, setSubmitCommissionState] =
    useState<loadingStateEnum>(loadingStateEnum.notStarted);

  const [commissionData, setCommissionData] = useState<
    commissionType | undefined
  >(undefined);


  const [getCommissionResult, setGetCommissionResult] =
    useState<loadingStateEnum>(loadingStateEnum.notStarted);
  const [deleteCommissionResult, setDeleteCommissionResult] =
    useState<loadingStateEnum>(loadingStateEnum.notStarted);

  const [isAddingCommissionSubmission, setIsAddingCommissionSubmission] =
    useState<boolean>(false);

  const { id } = useGlobalSearchParams();

  async function loadData() {
    if (isCreate) {
      setCommissionData({
        itemId: 'create',
        title: '',
        points: 0,
        hidden: true,
        maxNumberOfClaims: 0,
        allowMultipleSubmissions: false,
        submissionsCount: 0,
        claimCount: 0,
        reviewedCount: 0,
        commissionId: createUUID(),
        timed: false,
        value: commissionTypeEnum.Issued,
        competitionType: commissionCompetitionType.individual,
      });
    } else if (typeof id === 'string') {
      setGetCommissionResult(loadingStateEnum.loading);
      const result = await getCommission(id, store);
      if (result.result === loadingStateEnum.success) {
        setCommissionData(result.data);
      }
      setGetCommissionResult(result.result);
    }
  }
  async function deleteCommission() {
    if (
      commissionData?.commissionId === '' ||
      deleteCommissionResult === loadingStateEnum.loading ||
      deleteCommissionResult === loadingStateEnum.success
    ) {
      return;
    }
    setDeleteCommissionResult(loadingStateEnum.loading);
    const result = await callMsGraph(
      `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${commissionListId}/items/${commissionData?.itemId}`,
      'DELETE',
    );
    if (result.ok) {
      setDeleteCommissionResult(loadingStateEnum.success);
    } else {
      setDeleteCommissionResult(loadingStateEnum.failed);
    }
  }
  useEffect(() => {
    loadData();
  }, []);

  async function loadUpdateCommission() {
    // checking that their is a commission to update and an operation is not in progress.
    if (
      submitCommissionState === loadingStateEnum.failed ||
      submitCommissionState === loadingStateEnum.notStarted
    ) {
      setSubmitCommissionState(loadingStateEnum.loading);
      if (commissionData !== undefined) {
        const result = await updateCommission(isCreate, commissionData);
        setSubmitCommissionState(result);
      } else {
        setSubmitCommissionState(loadingStateEnum.failed);
      }
    } else {
      setSubmitCommissionState(loadingStateEnum.failed);
    }
  }

  if (getCommissionResult === loadingStateEnum.loading) {
    return (
      <View
        style={{
          overflow: 'hidden',
          width,
          height,
          backgroundColor: Colors.white,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <BackButton to="/government/commissions" />
        <ProgressView width={14} height={14} />
        <Text>Loading</Text>
      </View>
    );
  }

  if ((typeof id !== 'string' && !isCreate) || commissionData === undefined) {
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
        backgroundColor: Colors.lightGray,
      }}
    >
      <ScrollView style={{ height, width, zIndex: 1 }}>
        <BackButton to="/government/commissions" />
        <Text
          style={[styles.headerText, {marginTop: 15, marginBottom: 5}]}
        >
          {isCreate ? 'Create New' : 'Edit'} Commission
        </Text>
        {isCreate ? (
          <View
            style={{
              width,
              height: 80,
              alignContent: 'center',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SegmentedPicker
              selectedIndex={commissionData.value}
              setSelectedIndex={e => {
                if (
                  (e === 1 || e === 3) &&
                  commissionData.value !== commissionTypeEnum.Location &&
                  commissionData.value !== commissionTypeEnum.ImageLocation
                ) {
                  setCommissionData({
                    ...commissionData,
                    value:
                      e === 1
                        ? commissionTypeEnum.Location
                        : commissionTypeEnum.ImageLocation,
                    proximity: 0,
                    coordinateLat: 49.85663823299096,
                    coordinateLng: -97.22659526509193,
                  });
                } else if (e === commissionTypeEnum.QRCode) {
                  setCommissionData({
                    ...commissionData,
                    value: e,
                    QRCodeData: [],
                  });
                } else {
                  setCommissionData({
                    ...commissionData,
                    value: e,
                  });
                }
              }}
              options={[
                'Issued',
                'Location',
                'Image',
                'Image and Location',
                'QRCode',
              ]}
              width={width - 30}
              height={35}
            />
            <SegmentedPicker
              options={['Individual', 'Home Room', 'Both']}
              selectedIndex={commissionData.competitionType}
              setSelectedIndex={e => {
                setCommissionData({
                  ...commissionData,
                  competitionType: e,
                });
              }}
              width={width - 30}
              height={35}
              style={{ marginTop: 10 }}
            />
          </View>
        ) : null}
        <Text style={{ marginLeft: 25, marginBottom: 2, marginTop: 5 }}>Commission Name</Text>
        <TextInput
          value={commissionData.title}
          onChangeText={text => {
            setCommissionData({ ...commissionData, title: text });
          }}
          placeholder="Commission Name"
          style={[styles.textInputStyle, {backgroundColor: Colors.white}]}
        />
        {!isCreate ?
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
              backgroundColor: Colors.white
            }}
          >
            <Text>Commission Type: {commissionTypeText(commissionData.value)}</Text>
          </View>:null
        }
        <CommissionsTimeComponent commission={commissionData} setCommissionData={setCommissionData} />
        {(commissionData.value === commissionTypeEnum.ImageLocation ||
          commissionData.value === commissionTypeEnum.Location) &&
        commissionData.proximity !== undefined ? (
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
                proximity={commissionData.proximity}
                onSetSelectedPositionIn={e => {
                  setCommissionData({
                    ...commissionData,
                    coordinateLat: e.lat,
                    coordinateLng: e.lng,
                  });
                }}
                coordinateLat={commissionData.coordinateLat}
                coordinateLng={commissionData.coordinateLng}
                width={width * 0.8}
                height={height * 0.3}
              />
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Text>Proximity</Text>
              <TextInput
                keyboardType="numeric"
                onChangeText={text => {
                  setCommissionData({
                    ...commissionData,
                    proximity: parseFloat(text),
                  });
                }}
                value={commissionData.proximity.toString()}
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
                value={
                  commissionData?.proximity
                    ? commissionData.proximity / 1000
                    : 0
                }
                onValueChange={value => {
                  setCommissionData({
                    ...commissionData,
                    proximity: value * 1000,
                  });
                }}
              />
            </View>
          </View>
        ) : null}
        {commissionData.value === commissionTypeEnum.QRCode ? (
          <CommissionsQRCodeComponent
            QRCodes={commissionData.QRCodeData}
            setQRCodes={e => {
              setCommissionData({ ...commissionData, QRCodeData: e });
            }}
          />
        ) : null}
      
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
            backgroundColor: Colors.white
          }}
        >
          <View style={{ flexDirection: 'row' }}>
            <Text>Points: </Text>
            <TextInput
              keyboardType="numeric"
              onChangeText={text => {
                if (text === '') {
                  setCommissionData({
                    ...commissionData,
                    points: 0,
                  });
                } else {
                  setCommissionData({
                    ...commissionData,
                    points: parseFloat(text),
                  });
                }
              }}
              value={commissionData.points.toString()}
              maxLength={10} // setting limit of input
            />
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text>Allow Multiple Submissions: </Text>
            <Switch
              trackColor={{ false: Colors.lightGray, true: Colors.darkGray }}
              thumbColor={commissionData.allowMultipleSubmissions ? Colors.maroon : Colors.darkGray}
              {...Platform.select({
                web: {
                  activeThumbColor: Colors.maroon,
                },
              })}
              ios_backgroundColor={Colors.lightGray}
              onValueChange={e => {
                setCommissionData({
                  ...commissionData,
                  allowMultipleSubmissions: e,
                });
              }}
              value={commissionData.allowMultipleSubmissions}
              style={{ marginLeft: 10 }}
            />
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text>Is Hidden: </Text>
            <Switch
              trackColor={{ false: Colors.lightGray, true: Colors.darkGray }}
              thumbColor={commissionData.hidden ? Colors.maroon : Colors.darkGray}
              {...Platform.select({
                web: {
                  activeThumbColor: Colors.maroon,
                },
              })}
              ios_backgroundColor={Colors.lightGray}
              onValueChange={e => {
                setCommissionData({
                  ...commissionData,
                  hidden: e,
                });
              }}
              value={commissionData.hidden}
              style={{ marginLeft: 10 }}
            />
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text>Max number of claims: </Text>
            <TextInput
              value={commissionData.maxNumberOfClaims.toString()}
              onChangeText={e => {
                if (e !== '') {
                  setCommissionData({
                    ...commissionData,
                    maxNumberOfClaims: parseFloat(e),
                  });
                } else {
                  setCommissionData({
                    ...commissionData,
                    maxNumberOfClaims: 0,
                  });
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
            backgroundColor: Colors.white
          }}
        >
          <Text>Post</Text>
          <CommissionsPostComponent
            width={width - 50}
            height={height * 0.4}
            selectedPost={commissionData.postData}
            setSelectedPost={e => {
              setCommissionData({
                ...commissionData,
                postData: e,
              });
            }}
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
              backgroundColor: Colors.white
              
            }}
          >
            <CommissionSubmissions
              commissionId={id}
              width={width - 50}
              height={height * 0.5}
            />
            <StyledButton
              text="Add Submission"
              onPress={() => setIsAddingCommissionSubmission(true)}
            />
          </View>
        ) : null}
        <StyledButton
          text={getTextState(submitCommissionState, {
            notStarted: isCreate ? 'Create Commission' : 'Save Changes',
          })}
          onPress={() => {
            loadUpdateCommission();
          }}
          second
          style={{ margin: 15 }}
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
            style={{ margin: 15 }}
          />
        ) : null}
      </ScrollView>
      {!isCreate && typeof id === 'string' ? (
        <Modal visible={isAddingCommissionSubmission} transparent>
          <AddCommissionSubmission
            commissionId={id}
            onClose={() => setIsAddingCommissionSubmission(false)}
          />
        </Modal>
      ) : null}
    </View>
  );
}

export default function GovernmentEditCommission() {
  return <GovernmentCommissionUpdate isCreate={false} />;
}
