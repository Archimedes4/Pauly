/*
  Pauly
  Andrew Mainella
  20 January 2024
  rooms/[id].tsx
  Screen for creating room data. Apart of Pauly classes.
*/
import { View, Text, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import store, { RootState } from '@redux/store';
import { Colors, loadingStateEnum, styles } from '@constants';
import { WarningIcon } from '@components/Icons';
import callMsGraph from '@utils/ultility/microsoftAssets';
import createUUID, { getTextState } from '@utils/ultility/createUUID';
import { Link, useGlobalSearchParams } from 'expo-router';
import StyledButton from '@components/StyledButton';
import BackButton from '@components/BackButton';
import ProgressView from '@components/ProgressView';

export function GovermentRoomsUpdate({ isCreate }: { isCreate: boolean }) {
  const { width, height } = useSelector((state: RootState) => state.dimensions);
  const [createRoomState, setCreateRoomState] = useState<loadingStateEnum>(
    loadingStateEnum.notStarted,
  );
  const [roomState, setRoomState] = useState<loadingStateEnum>(
    loadingStateEnum.notStarted,
  );

  const { id } = useGlobalSearchParams();

  const [roomName, setRoomName] = useState<string>('');
  const [roomListId, setRoomListId] = useState<string>('');

  async function updateRoom() {
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
        }/lists/${store.getState().paulyList.roomListId}/items/${roomListId}`,
        'PATCH',
        JSON.stringify(items),
      );
      if (result.ok) {
        setCreateRoomState(loadingStateEnum.success);
      } else {
        setCreateRoomState(loadingStateEnum.failed);
      }
    }
  }

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
        }/lists/${store.getState().paulyList.roomListId}/items`,
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

  async function loadRoom() {
    if (typeof id === 'string') {
      const result = await callMsGraph(
        `https://graph.microsoft.com/v1.0/sites/${
          store.getState().paulyList.siteId
        }/lists/${
          store.getState().paulyList.roomListId
        }/items?expand=fields($select=roomName,roomId)&$filter=fields/roomId%20eq%20'${id}'&$select=id,fields`,
      );
      if (result.ok) {
        const data = await result.json();
        if (data.value.length === 1) {
          setRoomListId(data.value[0].id);
          setRoomName(data.value[0].fields.roomName);
          setRoomState(loadingStateEnum.success);
        } else {
          // Not found or dup ids which is a really critical error and should not be possible.
          setRoomState(loadingStateEnum.notFound);
        }
      } else {
        setRoomState(loadingStateEnum.failed);
      }
    }
  }

  useEffect(() => {
    loadRoom();
  }, []);

  if (!isCreate && roomState === loadingStateEnum.loading) {
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
        <BackButton to="/government/classes/rooms" />
        <ProgressView width={14} height={14} />
        <Text>Loading</Text>
      </View>
    );
  }

  if (isCreate || roomState === loadingStateEnum.success) {
    return (
      <View style={{ width, height, backgroundColor: Colors.white }}>
        <Link href="/government/classes/rooms">Back</Link>
        <View
          style={{
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={styles.headerText}>
            {isCreate ? 'Create' : 'Edit'} Room
          </Text>
        </View>
        <View style={{ flexDirection: 'row', width }}>
          {roomName === '' ? (
            <WarningIcon width={14} height={14} outlineColor="red" />
          ) : null}
          <TextInput
            value={roomName}
            onChangeText={e => {
              setRoomName(e);
            }}
            placeholder="Room Name"
            style={styles.textInputStyle}
          />
        </View>
        <StyledButton
          onPress={() => {
            if (isCreate) {
              createRoom();
            } else {
              updateRoom();
            }
          }}
          second
          text={getTextState(createRoomState, {
            notStarted: isCreate ? 'Create Room' : 'Update Room',
            success: isCreate ? 'Room Created' : 'Room Updated',
          })}
          style={{
            margin: 15,
          }}
        />
      </View>
    );
  }

  if (roomState === loadingStateEnum.notFound) {
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
        <BackButton to="/government/classes/rooms" />
        <Text>Room not found!</Text>
      </View>
    );
  }

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
      <BackButton to="/government/classes/rooms" />
      <Text>Failed something went wrong!</Text>
    </View>
  );
}

export default function GovernmentRoomsCreate() {
  return <GovermentRoomsUpdate isCreate />;
}
