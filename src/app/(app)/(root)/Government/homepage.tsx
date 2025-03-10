/*
  Pauly
  Andrew Mainella
  2 December 2023
*/
import { View, Text, TextInput, Switch } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import callMsGraph from '@utils/ultility/microsoftAssests';
import MicrosoftFilePicker from '@components/MicrosoftFilePicker';
import store, { RootState } from '@redux/store';
import getCurrentPaulyData from '@utils/notifications/getCurrentPaulyData';
import { Colors, loadingStateEnum, styles } from '@constants';
import StyledButton from '@components/StyledButton';
import { powerpointTypes } from '@components/Icons/MimeTypeIcon';
import { getTextState } from '@utils/ultility/createUUID';
import {
  createShareId,
  getDataWithShareID,
} from '@utils/ultility/handleShareID';
import ProgressView from '@components/ProgressView';
import BackButton from '@components/BackButton';

export default function GovernmentHomePage() {
  const { paulyDataListId, siteId } = useSelector(
    (state: RootState) => state.paulyList,
  );
  const { width, height } = useSelector((state: RootState) => state.dimensions);

  // Loading States
  const [loadContentLoadingState, setLoadContentLoadingState] =
    useState<loadingStateEnum>(loadingStateEnum.loading);
  const [newMessageState, setNewMessageState] = useState<loadingStateEnum>(
    loadingStateEnum.notStarted,
  );
  const [powerpointState, setPowerpointState] = useState<loadingStateEnum>(
    loadingStateEnum.notStarted,
  );

  // New Data
  const [newText, setNewText] = useState(store.getState().paulyData.message);
  const [newAnimationSpeed, setNewAnnimationSpeed] = useState(
    store.getState().paulyData.animationSpeed,
  );
  const [selectedPowerpoint, setSelectedPowerpoint] = useState<
    microsoftFileType | undefined
  >(undefined);

  // Settings
  const [isAutoUpdatingText, setIsAutoUpdatingText] = useState<boolean>(false);

  async function loadCurrentPaulyData() {
    await getCurrentPaulyData();
    setNewText(store.getState().paulyData.message);
    setSelectedPowerpoint(
      await getDataWithShareID(store.getState().paulyData.powerpointShare),
    );
    setLoadContentLoadingState(loadingStateEnum.success);
  }

  async function updatePaulyData(key: string, data: string) {
    const dataOut: any = {};
    dataOut[key] = data;
    const result = await callMsGraph(
      `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${paulyDataListId}/items/1/fields`,
      'PATCH',
      JSON.stringify(dataOut),
    );
    if (result.ok) {
      setNewMessageState(loadingStateEnum.success);
    } else {
      setNewMessageState(loadingStateEnum.failed);
    }
  }

  useEffect(() => {
    const storeText = newText;
    setTimeout(() => {
      if (isAutoUpdatingText && newText === storeText) {
        updatePaulyData('message', newText);
      }
    }, 2000);
  }, [newText]);

  useEffect(() => {
    loadCurrentPaulyData();
  }, []);

  if (loadContentLoadingState === loadingStateEnum.loading) {
    return (
      <View
        style={{
          width,
          height,
          backgroundColor: Colors.lightGray,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <BackButton to="/government" />
        <ProgressView width={14} height={14} />
        <Text>Loading</Text>
      </View>
    );
  }

  return (
    <View style={{ width, height, backgroundColor: Colors.lightGray }}>
      <BackButton to="/government" />
      <Text style={[styles.headerText, { marginTop: 15 }]}>Home Page</Text>
      <View>
        <TextInput
          value={newText}
          onChangeText={e => {
            setNewText(e);
          }}
          style={[
            styles.textInputStyle,
            {
              backgroundColor: Colors.white,
            },
          ]}
          placeholder="Header Text"
        />
        {isAutoUpdatingText ? (
          <View style={{ height: 14 }} />
        ) : (
          <StyledButton
            second
            onPress={() => updatePaulyData('message', newText)}
            text="Update Text"
            style={{
              marginTop: 10,
              marginBottom: 10,
              marginLeft: 15,
              marginRight: 15,
            }}
          />
        )}
        <View style={{ flexDirection: 'row' }}>
          <Text>Is auto updating text: </Text>
          <Switch
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isAutoUpdatingText ? '#f5dd4b' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={setIsAutoUpdatingText}
            value={isAutoUpdatingText}
          />
        </View>
      </View>
      <View
        style={{
          marginBottom: 'auto',
          marginHorizontal: 5,
          backgroundColor: Colors.white,
          padding: 10,
          borderRadius: 15,
          overflow: 'hidden',
        }}
      >
        <Text style={{ margin: 5, marginLeft: 0 }}>
          Select Powerpoint: {selectedPowerpoint?.name}
        </Text>
        <MicrosoftFilePicker
          height={height * 0.6 - 15}
          width={width - 30}
          onSelectedFile={selectedFile => {
            setSelectedPowerpoint(selectedFile);
          }}
          onSetIsShowingUpload={undefined}
          onSetIsShowingMicrosoftUpload={undefined}
          allowedTypes={powerpointTypes}
          selectedFile={selectedPowerpoint?.id}
        />
      </View>
      <StyledButton
        second
        onPress={async () => {
          if (selectedPowerpoint !== undefined) {
            const shareId = await createShareId(selectedPowerpoint);
            if (shareId !== undefined) {
              updatePaulyData('powerpointId', shareId);
            }
          }
        }}
        style={{ marginLeft: 15, marginRight: 15 }}
        text={getTextState(newMessageState)}
      />
    </View>
  );
}
