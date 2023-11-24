import { View, Text, Pressable, TextInput } from 'react-native';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-native';
import { useSelector } from 'react-redux';
import store, { RootState } from '@/Redux/store';
import { Colors, loadingStateEnum } from '@/types';
import { WarningIcon } from '@/components/Icons/Icons';
import callMsGraph from '@/Functions/ultility/microsoftAssets';
import createUUID, {
  getTextState,
} from '@/Functions/ultility/createUUID';

export default function GovermentRoomsCreate() {
  const { width, height } = useSelector((state: RootState) => state.dimentions);
  const [createRoomState, setCreateRoomState] = useState<loadingStateEnum>(
    loadingStateEnum.notStarted,
  );
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState<string>('');

  async function createRoom() {
    if (
      roomName !== '' &&
      (createRoomState === loadingStateEnum.notStarted ||
        createRoomState === loadingStateEnum.failed ||
        createRoomState === loadingStateEnum.success)
    ) {
      setCreateRoomState(loadingStateEnum.loading);
      const id = createUUID();
      const items = {
        fields: {
          Title: id,
          roomId: id,
          roomName,
        },
      };
      const result = await callMsGraph(
        `https://graph.microsoft.com/v1.0/sites/${
          store.getState().paulyList.siteId
        }/lists/${store.getState().paulyList.roomListId}/items?expand=fields`,
        'POST',
        JSON.stringify(items),
      );
      if (result.ok) {
        setCreateRoomState(loadingStateEnum.success);
      } else {
        setCreateRoomState(loadingStateEnum.failed);
      }
    }
  }

  return (
    <View style={{ width, height, backgroundColor: Colors.white }}>
      <Pressable
        onPress={() => {
          navigate('/profile/government/classes/room');
        }}
      >
        <Text>Back</Text>
      </Pressable>
      <View
        style={{
          justifyContent: 'center',
          alignContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text>Create Room</Text>
      </View>
      <View style={{ flexDirection: 'row' }}>
        {roomName === '' ? (
          <WarningIcon width={14} height={14} outlineColor="red" />
        ) : null}
        <TextInput
          value={roomName}
          onChangeText={e => {
            setRoomName(e);
          }}
          placeholder="Room Name"
        />
      </View>
      <Pressable
        onPress={() => {
          createRoom();
        }}
      >
        <Text>
          {getTextState(createRoomState, {
            notStarted: 'Create Room',
            success: 'Room Created',
          })}
        </Text>
      </Pressable>
    </View>
  );
}
