import { View, Text, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-native';
import * as Clipboard from 'expo-clipboard';
import { useSelector } from 'react-redux';
import callMsGraph from '../../../../../../Functions/ultility/microsoftAssets';
import { CopyIcon } from '../../../../../../components/Icons';
import { Colors, loadingStateEnum } from '../../../../../../types';
import { RootState } from '../../../../../../Redux/store';
import { getTextState } from '../../../../../../Functions/ultility/createUUID';

export default function MicrosoftGraphEditGroup() {
  const { height, width } = useSelector((state: RootState) => state.dimentions);

  const { id } = useParams();

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
      <Link to="/profile/government/graph/group">
        <Text>Back</Text>
      </Link>
      <Text>MicrosoftGraphEditList</Text>
      <View style={{ flexDirection: 'row' }}>
        <Text>{id}</Text>
        {id !== undefined ? (
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
      <Pressable
        onPress={() => {
          deleteGroup();
        }}
      >
        <Text>
          {getTextState(deleteGroupLoadingState, {
            notStarted: 'Delete Group',
          })}
        </Text>
      </Pressable>
    </View>
  );
}
