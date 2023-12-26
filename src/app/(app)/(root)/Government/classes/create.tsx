import { View, Text, Pressable, TextInput } from 'react-native';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import store, { RootState } from '@Redux/store';
import { Colors, loadingStateEnum } from '@src/types';
import { WarningIcon } from '@src/components/Icons';
import callMsGraph from '@Functions/ultility/microsoftAssets';
import createUUID, { getTextState } from '@src/Functions/ultility/createUUID';
import { Link } from 'expo-router';

export default function GovermentRoomsCreate() {
  const { width, height } = useSelector((state: RootState) => state.dimentions);
  const [createRoomState, setCreateRoomState] = useState<loadingStateEnum>(
    loadingStateEnum.notStarted,
  );
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
      <Link href={'/profile/government/classes/room'}>
        Back
      </Link>
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
