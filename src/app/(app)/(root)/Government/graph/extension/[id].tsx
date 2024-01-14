import { View, Text, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import callMsGraph from '@utils/ultility/microsoftAssets';
import { Colors, loadingStateEnum } from '@constants';
import { RootState } from '@redux/store';
import { getTextState } from '@utils/ultility/createUUID';
import { Link, useGlobalSearchParams } from 'expo-router';
import ProgressView from '@src/components/ProgressView';

export default function MicrosoftGraphEditExtension() {
  const { height, width } = useSelector((state: RootState) => state.dimentions);
  const { id } = useGlobalSearchParams();

  const [extensionState, setExtensionState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
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
        setExtensionState(loadingStateEnum.success);
      } else {
        setExtensionState(loadingStateEnum.notFound);
      }
    } else {
      setExtensionState(loadingStateEnum.failed);
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

  useEffect(() => {
    getExtension();
  }, []);

  if (extensionState === loadingStateEnum.loading) {
    return (
      <View
        style={{
          overflow: 'hidden',
          height,
          width,
          backgroundColor: Colors.white,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Link
          href="/government/graph"
          style={{ position: 'absolute', left: 0, top: 0 }}
        >
          <Text>Back</Text>
        </Link>
        <ProgressView width={14} height={14} />
        <Text>Loading</Text>
      </View>
    );
  }

  if (extensionState === loadingStateEnum.success) {
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
          Microsoft Graph Edit Extension
        </Text>
        <Text>{extensionDescription}</Text>
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
  if (extensionState === loadingStateEnum.notFound) {
    return (
      <View>
        <Text>Extension Not Found</Text>
      </View>
    );
  }
  return (
    <View>
      <Text>Failed</Text>
    </View>
  );
}
