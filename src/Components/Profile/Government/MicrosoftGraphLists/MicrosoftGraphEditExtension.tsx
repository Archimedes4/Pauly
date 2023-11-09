import { View, Text, Pressable } from 'react-native';
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-native';
import { useSelector } from 'react-redux';
import callMsGraph from '../../../../Functions/ultility/microsoftAssets';
import { Colors, loadingStateEnum } from '../../../../types';
import { RootState } from '../../../../Redux/store';
import { getTextState } from '../../../../Functions/ultility/createUUID';

export default function MicrosoftGraphEditExtension() {
  const { height, width } = useSelector((state: RootState) => state.dimentions);
  const { mode, id } = useParams();

  const [extensionLoadingState, setExtensionLoadingState] =
    useState<loadingStateEnum>(loadingStateEnum.loading);
  const [deleteExtensionLoadingState, setDeleteExtensionLoadingState] =
    useState<loadingStateEnum>(loadingStateEnum.notStarted);

  const [extensionDescription, setExtensionDescription] = useState<string>('');

  async function getExtension() {
    const result = await callMsGraph(
      `https://graph.microsoft.com/v1.0/schemaExtensions?$filter=id%20eq%20'${id}'`,
    );
    if (result.ok) {
      const data = await result.json();
      if (data.value.length === 1) {
        setExtensionDescription(data.value[0].description);
        setExtensionLoadingState(loadingStateEnum.success);
      } else {
        setExtensionLoadingState(loadingStateEnum.failed);
      }
    } else {
      setExtensionLoadingState(loadingStateEnum.failed);
    }
  }
  async function deleteExtension() {
    if (
      deleteExtensionLoadingState === loadingStateEnum.notStarted ||
      deleteExtensionLoadingState === loadingStateEnum.failed
    ) {
      setDeleteExtensionLoadingState(loadingStateEnum.loading);
      const result = await callMsGraph(
        `https://graph.microsoft.com/v1.0/schemaExtensions/${id}`,
        'DELETE',
      );
      if (result.ok) {
        setDeleteExtensionLoadingState(loadingStateEnum.success);
      } else {
        setDeleteExtensionLoadingState(loadingStateEnum.failed);
      }
    }
  }
  return (
    <View
      style={{
        overflow: 'hidden',
        height,
        width,
        backgroundColor: Colors.white,
      }}
    >
      <Link to={`/profile/government/graph/${mode}`}>
        <Text>Back</Text>
      </Link>
      <Text>MicrosoftGraphEditExtension</Text>
      <View />
      <Pressable
        onPress={() => {
          deleteExtension();
        }}
      >
        <Text>
          {getTextState(deleteExtensionLoadingState, {
            notStarted: 'Delete Extension',
            success: 'Successfully Deleted Extension',
            failed: 'Failed To Delete Extension',
          })}
        </Text>
      </Pressable>
    </View>
  );
}
