/*
  Pauly
  Andrew Mainella
  2 December 2023
*/
import { View, Text, Pressable, TextInput, Switch } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import callMsGraph from '@Functions/ultility/microsoftAssets';
import MicrosoftFilePicker from '@components/MicrosoftFilePicker';
import store, { RootState } from '@Redux/store';
import getCurrentPaulyData from '@Functions/notifications/getCurrentPaulyData';
import { Colors, loadingStateEnum } from '@src/types';
import { Link } from 'expo-router';
import SecondStyledButton from '@src/components/SecondStyledButton';

export default function GovernmentHomePage() {
  const { paulyDataListId, siteId } = useSelector(
    (state: RootState) => state.paulyList,
  );
  const { width, height } = useSelector((state: RootState) => state.dimentions);

  // Loading States
  const [loadContentLoadingState, setLoadContentLoadingState] =
    useState<loadingStateEnum>(loadingStateEnum.loading);
  const [newMessageState, setNewMessageState] = useState<loadingStateEnum>(
    loadingStateEnum.notStarted,
  );

  // New Data
  const [newText, setNewText] = useState(
    store.getState().paulyData.message,
  );
  const [serverText, setServerText] = useState(
    store.getState().paulyData.message,
  );
  const [newAnimationSpeed, setNewAnnimationSpeed] = useState(
    store.getState().paulyData.animationSpeed,
  );
  const [selectedPowerpoint, setSelectedPowerpoint] = useState<
    microsoftFileType | undefined
  >(undefined);
  const [isAutoUpdatingText, setIsAutoUpdatingText] = useState<boolean>(false);

  async function loadCurrentPaulyData() {
    await getCurrentPaulyData();
    setLoadContentLoadingState(loadingStateEnum.success);
  }
  async function createShareId(
    item: microsoftFileType,
  ): Promise<string | undefined> {
    const data = {
      type: 'view',
      scope: 'organization',
    };
    const result = await callMsGraph(
      `${item.callPath}/createLink`,
      'POST',
      JSON.stringify(data),
    );
    if (result.ok) {
      const data = await result.json();
      return data.shareId;
    }
    return undefined;
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

  return (
    <View style={{ width, height, backgroundColor: Colors.white }}>
      <Link href="/government">
        <Text>Back</Text>
      </Link>
      <Text style={{ marginLeft: 'auto', marginRight: 'auto', fontFamily: 'Comfortaa-Regular', marginBottom: 5, fontSize: 25 }}>Home Page</Text>
      <View>
        <View style={{ flexDirection: 'row' }}>
          <TextInput
            value={newText}
            onChangeText={e => {
              setNewText(e);
            }}
            style={{padding: 10, paddingLeft: 15, paddingRight: 15, width: width - width * 0.1, marginLeft: 'auto', marginRight: 'auto', borderRadius: 30, borderWidth: 1}}
          />
        </View>
        {isAutoUpdatingText  ? (
          <View style={{ height: 14 }} />
        ) : (
          <SecondStyledButton onPress={() => updatePaulyData('message', newText)} text={'Update Text'} width={100} style={{marginTop: 10, marginBottom: 10}} />
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
      <View style={{ marginBottom: 20, paddingLeft: 5, paddingRight: 5 }}>
        <View>
          <Text style={{ margin: 5 }}>
            Select Powerpoint: {selectedPowerpoint?.name}
          </Text>
        </View>
        <MicrosoftFilePicker
          height={height * 0.6 - 15}
          width={width}
          onSelectedFile={selectedFile => {
            setSelectedPowerpoint(selectedFile);
          }}
          onSetIsShowingUpload={undefined}
          onSetIsShowingMicrosoftUpload={undefined}
        />
      </View>
      <SecondStyledButton
        onPress={async () => {
          if (selectedPowerpoint !== undefined) {
            const shareId = await createShareId(selectedPowerpoint);
            if (shareId !== undefined) {
              updatePaulyData('powerpointId', shareId);
            }
          }
        }}
        text='Save Changes'
        width={100}
      />
    </View>
  );
}
