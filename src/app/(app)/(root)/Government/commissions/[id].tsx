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
  Modal,
  Platform,
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
import { createCommissionSubmission, updateCommission } from '@utils/commissions/updateCommissionFunctions';
import Slider from '@react-native-community/slider';
import { useGlobalSearchParams } from 'expo-router';
import StyledButton from '@components/StyledButton';
import { getUsers } from '@utils/studentFunctions';
import * as Print from 'expo-print';
import QRCode from 'react-native-qrcode-svg';
import { url } from '@src/utils/ﻩgovernment/initializePauly/initializePaulyData';

const paulyLogo = `data:image/png;base64,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mCrPKvOMn+Ed/U8Vu+OPi9PrEcmleFC9rYn5JNQxtdx6RDsP9r8q8x2TSWcFncXc89rb/wCpgd/3adTkKOM8nnrUnSr5rKyONYeU5c9X7hkcaxJtQcdeeST6mn0UVB2JW0QUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH//2QAMfdg9AAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDIzLTA0LTE2VDE4OjU0OjAxKzAwOjAwEXxRYAAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyMy0wNC0xNlQxODo1NDowMSswMDowMGAh6dwAAAAodEVYdGRhdGU6dGltZXN0YW1wADIwMjMtMDQtMTZUMTg6NTQ6MjArMDA6MDDTZsTKAAAAGnRFWHRleGlmOkJpdHNQZXJTYW1wbGUAOCwgOCwgOBLtPicAAAAhdEVYdGV4aWY6RGF0ZVRpbWUAMjAyMzowNDoxNiAxMzo0MzowOdtBeHIAAAATdEVYdGV4aWY6RXhpZk9mZnNldAAxOTBMjvPCAAAAFXRFWHRleGlmOkltYWdlTGVuZ3RoADEwMjSxlxQcAAAAFHRFWHRleGlmOkltYWdlV2lkdGgAMTAyNCJNl5EAAAAZdEVYdGV4aWY6UGl4ZWxYRGltZW5zaW9uADEwMjTyxVYfAAAAGXRFWHRleGlmOlBpeGVsWURpbWVuc2lvbgAxMDI0Sz6N9wAAABp0RVh0ZXhpZjpTb2Z0d2FyZQBHSU1QIDIuMTAuMzLxBdavAAAAJHRFWHRleGlmOnRodW1ibmFpbDpCaXRzUGVyU2FtcGxlADgsIDgsIDggG/RTAAAAHHRFWHRleGlmOnRodW1ibmFpbDpDb21wcmVzc2lvbgA2+WVwVwAAAB50RVh0ZXhpZjp0aHVtYm5haWw6SW1hZ2VMZW5ndGgAMjU2UHAwAwAAAB10RVh0ZXhpZjp0aHVtYm5haWw6SW1hZ2VXaWR0aAAyNTaIBvoUAAAAKHRFWHRleGlmOnRodW1ibmFpbDpKUEVHSW50ZXJjaGFuZ2VGb3JtYXQAMzQwz0bOdQAAAC90RVh0ZXhpZjp0aHVtYm5haWw6SlBFR0ludGVyY2hhbmdlRm9ybWF0TGVuZ3RoADQ4MjPaldcpAAAAKnRFWHRleGlmOnRodW1ibmFpbDpQaG90b21ldHJpY0ludGVycHJldGF0aW9uADYSFYoaAAAAIHRFWHRleGlmOnRodW1ibmFpbDpTYW1wbGVzUGVyUGl4ZWwAM+HXzVoAAAA9dEVYdGljYzpjb3B5cmlnaHQAQ29weXJpZ2h0IDIwMDcgQXBwbGUgSW5jLiwgYWxsIHJpZ2h0cyByZXNlcnZlZC6eZtwpAAAAI3RFWHRpY2M6ZGVzY3JpcHRpb24AR2VuZXJpYyBSR0IgUHJvZmlsZRqnOI4AAAAJdEVYdHVua25vd24AMdohVXwAAAAASUVORK5CYII=`

enum datePickingMode {
  none,
  startTime,
  endTime,
  startDate,
  endDate,
}

function QRCodeBlock({
  QRCodeItem
}: {
  QRCodeItem: commissionQRCode
}) {
  const { width, height } = useSelector((state: RootState) => state.dimentions);
  const [isEditing, setIsEditing] = useState<boolean>()
  async function print() {
    if (Platform.OS === 'ios') {
      // Print.printAsync({
      //   printerUrl
      // })
    } else {
      Print.printAsync({
        html: `
        
        `
      })
    }
  }

  return (
    <>
      <StyledButton onPress={() => setIsEditing(true)}>
        <Text>{QRCodeItem.code}</Text>
      </StyledButton>
      <Modal visible={isEditing}>
        <View style={{padding: height * 0.05 + 20}}>
          <Pressable
            onPress={() => setIsEditing(false)}
            style={{
              position: 'absolute',
              top: height * 0.05,
              left: height * 0.05,
            }}
          >
            <CloseIcon width={20} height={20} />
          </Pressable>
          {/* <QRCode
            value={`https://www.paulysphs.ca/commissions/${QRCodeItem.code}`}
            logo={paulyLogo}
            logoSize={30}
            logoBackgroundColor='transparent'
          /> */}
          <StyledButton text='Print' onPress={() => print()}/>
          <StyledButton text='Update' />
        </View>
      </Modal>
    </>
  )
}

function QRCodeMenu({
  QRCodes,
  setQRCodes
}:{
  QRCodes: commissionQRCode[],
  setQRCodes: (item: commissionQRCode[]) => void
}) {
  return (
    <View>
      <FlatList
        data={QRCodes}
        renderItem={(item) => (
          <QRCodeBlock QRCodeItem={item.item}/>
        )}
      />
      <StyledButton text='Add New QR Code' onPress={() => {
        setQRCodes([...QRCodes, {
          code: createUUID(),
          maxNumberOfClaims: 1,
          timed: false,
          timeOut: 0,
          active: false
        }])
      }}/>
    </View>
  )
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

  const [commissionData, setCommissionData] = useState<commissionType | undefined>(undefined)
  

  const [currentDatePickingMode, setCurrentDatePickingMode] =
    useState<datePickingMode>(datePickingMode.none);


  const [getCommissionResult, setGetCommissionResult] =
    useState<loadingStateEnum>(loadingStateEnum.loading);
  const [deleteCommissionResult, setDeleteCommissionResult] =
    useState<loadingStateEnum>(loadingStateEnum.notStarted);

  const [isAddingCommissionSubmission, setIsAddingCommissionSubmission] = useState<boolean>(false);

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
        value: commissionTypeEnum.Issued
      })
    } else if (typeof id === 'string') {
      const result = await getCommission(id);
      if (
        result.result === loadingStateEnum.success
      ) {
        setCommissionData(result.data)
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
      `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${commissionListId}/items/${commissionData?.commissionId}`,
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
    loadData();  
  }, []);

  async function loadUpdateCommission() {
    // checking that their is a commission to update and an operation is not in progress.
    if (
      submitCommissionState === loadingStateEnum.failed ||
      submitCommissionState === loadingStateEnum.notStarted
    ) {
      setSubmitCommissionState(loadingStateEnum.loading);
      if (commissionData !== undefined && commissionData.title && commissionData.timed && commissionData.points && commissionData.hidden && commissionData.maxNumberOfClaims && commissionData.allowMultipleSubmissions && commissionData.postData && commissionData.itemId ) {
        const result = await updateCommission(
          isCreate,
          commissionData
        );
        setSubmitCommissionState(result);
      }
    }
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
        { isCreate ?
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
              selectedIndex={commissionData.value}
              setSelectedIndex={(e) => {
                if ((e === 1 || e === 3) && commissionData.value !== commissionTypeEnum.Location && commissionData.value !== commissionTypeEnum.ImageLocation){
                  setCommissionData({
                    ...commissionData,
                    value: (e === 1) ? commissionTypeEnum.Location:commissionTypeEnum.ImageLocation,
                    proximity: 0,
                    coordinateLat: 49.85663823299096,
                    coordinateLng: -97.22659526509193
                  })
                } else if (e === commissionTypeEnum.QRCode) {
                  setCommissionData({
                    ...commissionData,
                    value: e,
                    QRCodeData: []
                  })
                } else {
                  setCommissionData({
                    ...commissionData,
                    value: e
                  })
                }
              }}
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
          </View>:null
        }
        <Text style={{marginLeft: 25, marginBottom: 2}}>Commission Name</Text>
        <TextInput
          value={commissionData.title}
          onChangeText={text => setCommissionData({...commissionData, title: text})}
          placeholder="Commission Name"
          style={styles.textInputStyle}
        />
        {(commissionData.value === commissionTypeEnum.ImageLocation ||
        commissionData.value === commissionTypeEnum.Location) && commissionData.proximity !== undefined ? (
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
                onSetSelectedPositionIn={(e) => {
                  setCommissionData({
                    ...commissionData,
                    coordinateLat: e.lat,
                    coordinateLng: e.lng
                  })
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
                    proximity: parseFloat(text)
                  })}}
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
                value={commissionData?.proximity ? commissionData.proximity / 1000:0}
                onValueChange={value => {
                  setCommissionData({
                    ...commissionData,
                    proximity: value * 1000
                  })
                }}
              />
            </View>
          </View>
        ) : null}
        { commissionData.value === commissionTypeEnum.QRCode ? 
          <QRCodeMenu QRCodes={commissionData.QRCodeData} setQRCodes={(e) => {console.log(e); setCommissionData({...commissionData, QRCodeData: e})}}            
          />:null
        }
        {commissionData.timed ? (
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
                thumbColor={commissionData.timed ? '#f5dd4b' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={e => {
                  if (e) {
                    setCommissionData({
                      ...commissionData,
                      timed: true,
                      startDate:  new Date().toISOString().replace(/.\d+Z$/g, 'Z'),
                      endDate: new Date().toISOString().replace(/.\d+Z$/g, 'Z')
                    })
                  }
                }}
                value={commissionData.timed}
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
                hours={new Date(commissionData.startDate).getHours()}
                minutes={new Date(commissionData.startDate).getMinutes()}
                visible={currentDatePickingMode === datePickingMode.startDate}
                onDismiss={() =>
                  setCurrentDatePickingMode(datePickingMode.none)
                }
                onConfirm={e => {
                  const newDate = new Date(commissionData.startDate);
                  newDate.setHours(e.hours);
                  newDate.setMinutes(e.minutes);
                  setCommissionData({
                    ...commissionData,
                    startDate: newDate.toISOString().replace(/.\d+Z$/g, 'Z')
                  })
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
                date={new Date(commissionData.startDate)}
                onConfirm={e => {
                  if (e.date !== undefined) {
                    const oldDate = new Date(commissionData.startDate);
                    const newDate = new Date(
                      e.date.getFullYear(),
                      e.date.getMonth(),
                      e.date.getDate(),
                      oldDate.getHours(),
                      oldDate.getMinutes(),
                    );
                    setCommissionData({
                      ...commissionData,
                      startDate: newDate.toISOString().replace(/.\d+Z$/g, 'Z')
                    })
            
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
                hours={new Date(commissionData.endDate).getHours()}
                minutes={new Date(commissionData.endDate).getMinutes()}
                visible={currentDatePickingMode === datePickingMode.endTime}
                onDismiss={() =>
                  setCurrentDatePickingMode(datePickingMode.none)
                }
                onConfirm={e => {
                  const newDate = new Date(commissionData.endDate);
                  newDate.setHours(e.hours);
                  newDate.setMinutes(e.minutes);
                  setCommissionData({
                    ...commissionData,
                    endDate: newDate.toISOString().replace(/.\d+Z$/g, 'Z')
                  })
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
                date={new Date(commissionData.endDate)}
                onConfirm={e => {
                  if (e.date !== undefined) {
                    const oldDate = new Date(commissionData.endDate);
                    const newDate = new Date(
                      e.date.getFullYear(),
                      e.date.getMonth(),
                      e.date.getDate(),
                      oldDate.getHours(),
                      oldDate.getMinutes(),
                    );
                    setCommissionData({
                      ...commissionData,
                      endDate: newDate.toISOString().replace(/.\d+Z$/g, 'Z')
                    })
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
              thumbColor={commissionData.timed ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={e => {
                if (e) {
                  setCommissionData({
                    ...commissionData,
                    timed: true,
                    startDate:  new Date().toISOString().replace(/.\d+Z$/g, 'Z'),
                    endDate: new Date().toISOString().replace(/.\d+Z$/g, 'Z')
                  })
                } else {
                  setCommissionData({
                    ...commissionData,
                    timed: false
                  })
                }
              }}
              value={commissionData.timed}
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
                  setCommissionData({
                    ...commissionData,
                    points: 0
                  })
                } else {
                  setCommissionData({
                    ...commissionData,
                    points: parseFloat(text)
                  })
                }
              }}
              value={commissionData.points.toString()}
              maxLength={10} // setting limit of input
            />
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text>Allow Multiple Submissions: </Text>
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={commissionData.allowMultipleSubmissions ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={e => {
                setCommissionData({
                  ...commissionData,
                  allowMultipleSubmissions: e
                })
              }}
              value={commissionData.allowMultipleSubmissions}
            />
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text>Is Hidden: </Text>
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={commissionData.hidden ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={e => {
                setCommissionData({
                  ...commissionData,
                  hidden: e
                })
              }}
              value={commissionData.hidden}
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
                    maxNumberOfClaims: parseFloat(e)
                  })
                } else {
                  setCommissionData({
                    ...commissionData,
                    maxNumberOfClaims: 0
                  })
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
            width={width - 50}
            height={height * 0.4}
            selectedPost={commissionData.postData}
            setSelectedPost={(e) => {
              setCommissionData({
                ...commissionData,
                postData: e
              })
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
          text={getTextState(submitCommissionState, {
            notStarted: isCreate ? 'Create Commission' : 'Save Changes'
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
      <Modal visible={isAddingCommissionSubmission}>
        <AddCommissionSubmission commissionId={''} />
      </Modal>
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
  selectedPost,
  setSelectedPost
}: {
  width: number;
  height: number;
  selectedPost?: {
    teamId: string;
    channelId: string;
    postId: string;
  }
  setSelectedPost: (item: {
    teamId: string;
    channelId: string;
    postId: string;
  } | undefined) => void
}) {
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [selectedChannelId, setSelectedChannelId] = useState<string>("");
  const [selectedPostId, setSelectedPostId] = useState<string>("");
  const [currentPostPickingMode, setCurrentPostPickingMode] =
    useState<postPickingMode>(postPickingMode.team);

  useEffect(() => {
    if (selectedPost) {
      setSelectedTeamId(selectedPost.teamId)
      setSelectedChannelId(selectedPost.channelId)
      setSelectedPostId(selectedPost.postId)
    } else {
      setSelectedPostId('');
      setSelectedChannelId('');
      setSelectedTeamId('');
    }
  }, [selectedPost])

  return (
    <>
      {currentPostPickingMode === postPickingMode.team ? (
        <GroupSelection
          width={width}
          height={height}
          onSelect={e => {
            setSelectedPost(undefined)
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
            setSelectedPost(undefined)
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
          onSelect={(e) => {
            setSelectedPostId(e)
            setSelectedPost({
              teamId: selectedTeamId,
              channelId: selectedChannelId,
              postId: e
            })
          }}
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
        <StyledButton text='Back' onPress={() => onBack()} second  style={{ marginLeft: 15, marginRight: 15, marginTop: 10, marginBottom: 10 }}/>
        <FlatList
          data={posts}
          renderItem={post => {
            if (post.item.body !== '<systemEventMessage/>') {
              return (
                <StyledButton
                  key={`Post_${post.item.id}`}
                  onPress={() => {
                    onSelect(post.item.id);
                  }}
                  style={{
                    padding: 5,
                    margin: 15,
                  }}
                  selected={selectedPostId === post.item.id}
                  altColor='white'
                >
                  <WebViewCross html={post.item.body} width={width * 0.9} />
                </StyledButton>
              )
            }
            return null
          }}
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

function PickUser({
  setSelectedUser,
  onBack,
  selectedUser
}: {
  setSelectedUser: (item: microsoftUserType) => void,
  onBack: () => void,
  selectedUser: undefined | microsoftUserType
}) {
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [loadedUsers, setLoadedUsers] = useState<microsoftUserType[]>([]);
  const [loadUsersResult, setLoadUsersResult] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [nextLink, setNextLink] = useState<string | undefined>(undefined);
  const { height, width } = useSelector((state: RootState) => state.dimentions);

  async function getUserId() {
    const result = await callMsGraph('https://graph.microsoft.com/v1.0/me');
    if (result.ok) {
      const data = await result.json();
      setCurrentUserId(data.id);
    }
  }

  async function loadUsers(nextLink?: string) {
    const userResult = await getUsers(nextLink);
    if (userResult.result === loadingStateEnum.success) {
      setNextLink(userResult.nextLink)
      if (nextLink) {
        setLoadedUsers([...loadedUsers, ...userResult.data]);
      } else {
        setLoadedUsers(userResult.data);
      }
      setLoadUsersResult(loadingStateEnum.success)
    } else {
      setLoadUsersResult(loadingStateEnum.failed)
    }
  }

  useEffect(() => {
    getUserId();
    loadUsers();
  }, []);

  if (loadUsersResult === loadingStateEnum.loading) {
    return (
      <View style={{ height: height * 0.4 }}>
        <StyledButton text='Back' onPress={() => onBack()}/>
        <Text>Loading</Text>
      </View>
    );
  }
  if (loadUsersResult === loadingStateEnum.success) {
    return (
      <>
        <StyledButton text='Back' onPress={() => onBack()}/>
        <FlatList
          data={loadedUsers}
          renderItem={user => {
            if (user.item.id !== currentUserId) {
              return (
                <StyledButton
                  key={`User_${user.item.id}`}
                  text={user.item.displayName}
                  onPress={() => {
                    setSelectedUser(user.item);
                  }}
                  selected={user.item.id === selectedUser?.id}
                  style={styles.listStyle}
                />
              );
            }
            return null;
          }}
          onEndReached={() => {
            if (nextLink !== undefined) {
              loadUsers(nextLink);
            }
          }}
          style={{ height: height * 0.4, width: width - height * 0.1 }}
        />
      </>
    );
  }
  return (
    <View style={{ height: height * 0.4 }}>
      <StyledButton text='Back' onPress={() => onBack()}/>
      <Text>Failed</Text>
    </View>
  );
}

function AddCommissionSubmission({
  commissionId
}:{
  commissionId: string
}) {
  const [isPickingUser, setIsPickingUser] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<undefined | microsoftUserType>(undefined)
  const [addSubmissionState, setAddSubmissionState] = useState<loadingStateEnum>(loadingStateEnum.cannotStart)
  const [submissionApproved, setSubmissionApproved] = useState<boolean>(false)
  const [submissionReviewed, setSubmissionReview] = useState<boolean>(false)

  async function loadCreateCommissionSubmission() {
    if (selectedUser !== undefined) {
      setAddSubmissionState(loadingStateEnum.loading)
      const result = await createCommissionSubmission(selectedUser.id, commissionId, submissionApproved, submissionReviewed)
      setAddSubmissionState(result)
    } else {
      setAddSubmissionState(loadingStateEnum.cannotStart)
    }
  }

  useEffect(() => {
    if (selectedUser !== undefined) {
      setAddSubmissionState(loadingStateEnum.notStarted)
    } else {
      setAddSubmissionState(loadingStateEnum.cannotStart)
    }
  }, [selectedUser])

  if (isPickingUser) {
    return <PickUser selectedUser={selectedUser} onBack={() => setIsPickingUser(false)} setSelectedUser={setSelectedUser}/>
  }

  return (
    <View>
      <StyledButton text='Select User' onPress={() => setIsPickingUser(true)}/>
      <StyledButton text={getTextState(addSubmissionState, {
        cannotStart: 'Please Pick a User',
        notStarted: 'Start',
        loading: 'Loading',
        success: 'Submission Created',
        failed: 'Failed to Create Submission'
      })} onPress={() => loadCreateCommissionSubmission()}/>
    </View>
  )
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
