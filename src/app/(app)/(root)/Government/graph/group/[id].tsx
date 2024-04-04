import { View, Text, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { useSelector } from 'react-redux';
import callMsGraph from '@utils/ultility/microsoftAssests';
import { CopyIcon } from '@components/Icons';
import { Colors, loadingStateEnum } from '@constants';
import { RootState } from '@redux/store';
import { getTextState } from '@utils/ultility/createUUID';
import { Link, useGlobalSearchParams } from 'expo-router';
import StyledButton from '@components/StyledButton';

export default function MicrosoftGraphEditGroup() {
  const { height, width } = useSelector((state: RootState) => state.dimensions);

  const { id } = useGlobalSearchParams();

  const [isCoppiedToClipboard, setIsCoppiedToClipboard] =
    useState<boolean>(false);
  const [groupLoadingState, setGroupLoadingState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );

  const [deleteGroupLoadingState, setDeleteGroupLoadingState] =
    useState<loadingStateEnum>(loadingStateEnum.notStarted);

  async function getListItems() {
    const result = await callMsGraph(
      `https://graph.microsoft.com/v1.0/groups/${id}`,
    );
    if (result.ok) {
      const data = await result.json();
      setGroupLoadingState(loadingStateEnum.success);
    } else {
      setGroupLoadingState(loadingStateEnum.failed);
    }
  }

  async function deleteGroup() {
    setDeleteGroupLoadingState(loadingStateEnum.loading);
    const deleteGroupResult = await callMsGraph(
      `https://graph.microsoft.com/v1.0/groups/${id}`,
      'DELETE',
    );
    if (deleteGroupResult.ok) {
      setDeleteGroupLoadingState(loadingStateEnum.success);
    } else {
      setDeleteGroupLoadingState(loadingStateEnum.failed);
    }
  }

  useEffect(() => {
    getListItems();
  }, []);
  return (
    <View
      style={{
        overflow: 'hidden',
        height,
        width,
        backgroundColor: Colors.white,
      }}
    >
      <Link href="/government/graph">
        <Text>Back</Text>
      </Link>
      <Text
        style={{
          marginLeft: 'auto',
          marginRight: 'auto',
          fontFamily: 'Comfortaa-Regular',
          marginBottom: 5,
          fontSize: 25,
        }}
      >
        Microsoft Graph Edit Group
      </Text>
      <View style={{ flexDirection: 'row' }}>
        <Text style={{ marginLeft: 15 }}>{id}</Text>
        {id !== undefined && typeof id === 'string' ? (
          <>
            {isCoppiedToClipboard ? (
              <Pressable
                onPress={async () => {
                  await Clipboard.setStringAsync(id);
                }}
              >
                <Text>Copied To Clipboard!</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={async () => {
                  await Clipboard.setStringAsync(id);
                  setIsCoppiedToClipboard(true);
                }}
              >
                <CopyIcon width={14} height={14} />
              </Pressable>
            )}
          </>
        ) : null}
      </View>
      <StyledButton
        text={getTextState(deleteGroupLoadingState, {
          notStarted: 'Delete Group',
        })}
        onPress={() => {
          deleteGroup();
        }}
        second
        style={{ margin: 15 }}
      />
    </View>
  );
}
