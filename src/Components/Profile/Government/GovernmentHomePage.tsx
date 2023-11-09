import { View, Text, Pressable, TextInput, Button, Switch } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-native';
import { useSelector } from 'react-redux';
import callMsGraph from '../../../Functions/ultility/microsoftAssets';
import MicrosoftFilePicker from '../../../UI/MicrosoftFilePicker';
import store, { RootState } from '../../../Redux/store';
import getCurrentPaulyData from '../../../Functions/notifications/getCurrentPaulyData';
import { Colors, loadingStateEnum } from '../../../types';

export default function GovernmentHomePage() {
  const { paulyDataListId, siteId } = useSelector(
    (state: RootState) => state.paulyList,
  );
  const { width, height } = useSelector((state: RootState) => state.dimentions);
  const navigate = useNavigate();

  // Loading States
  const [loadContentLoadingState, setLoadContentLoadingState] =
    useState<loadingStateEnum>(loadingStateEnum.loading);
  const [newMessageState, setNewMessageState] = useState<loadingStateEnum>(
    loadingStateEnum.notStarted,
  );

  // New Data
  const [newMessageText, setNewMessageText] = useState(
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
    const storeText = newMessageText;
    setTimeout(() => {
      if (isAutoUpdatingText && newMessageText === storeText) {
        updatePaulyData('message', newMessageText);
      }
    }, 2000);
  }, [newMessageText]);

  useEffect(() => {
    loadCurrentPaulyData();
  }, []);

  return (
    <View style={{ width, height, backgroundColor: Colors.white }}>
      <Pressable onPress={() => navigate('/profile/government')}>
        <Text>Back</Text>
      </Pressable>
      <Text style={{ marginLeft: 'auto', marginRight: 'auto' }}>Home Page</Text>
      <View>
        <View style={{ flexDirection: 'row' }}>
          <TextInput
            value={newMessageText}
            onChangeText={e => {
              setNewMessageText(e);
            }}
          />
        </View>
        {isAutoUpdatingText ? (
          <View style={{ height: 14 }} />
        ) : (
          <Pressable
            onPress={() => {
              updatePaulyData('message', newMessageText);
            }}
          >
            <Text>Update Text</Text>
          </Pressable>
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
      <View style={{ marginBottom: 20 }}>
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
        />
      </View>
      <Pressable
        onPress={async () => {
          if (selectedPowerpoint !== undefined) {
            const shareId = await createShareId(selectedPowerpoint);
            if (shareId !== undefined) {
              updatePaulyData('powerpointId', shareId);
            }
          }
        }}
      >
        <Text>Save Changes</Text>
      </Pressable>
    </View>
  );
}
