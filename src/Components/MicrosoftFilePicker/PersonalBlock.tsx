import { Colors, loadingStateEnum } from "@constants";
import { getUserMicrosoftFiles } from "@src/utils/microsoftFilePickerFunctions";
import React from "react";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import MimeTypeIcon from "../Icons/MimeTypeIcon";
import createUUID from "@utils/ultility/createUUID";
import ProgressView from "../ProgressView";

function PersonalBlockBody({
  getFilesState,
  width,
  height,
  usersFiles,
  setMicrosoftPath,
  loadGetUserMicrosoftFiles,
  setFilesBackAvaliable,
  onSelectedFile,
  allowedTypes
}:{
  getFilesState: loadingStateEnum;
  width: number;
  height: number;
  usersFiles: microsoftFileType[];
  setMicrosoftPath: (item: string) => void;
  loadGetUserMicrosoftFiles: (item: string) => void;
  setFilesBackAvaliable: (item: boolean) => void;
  onSelectedFile: (item: microsoftFileType) => void;
  allowedTypes?: string[];
}) {
  if (getFilesState === loadingStateEnum.loading) {
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
        <ProgressView width={14} height={14} />
        <Text>Loading</Text>
      </View> 
    )
  }

  if (getFilesState === loadingStateEnum.success) {
    return (
      <FlatList
        data={usersFiles}
        renderItem={file => {
          if (allowedTypes === undefined || allowedTypes.includes(file.item.type) || file.item.folder) {
            return (
              <Pressable
                onPress={() => {
                  if (file.item.folder) {
                    setMicrosoftPath(
                      `https://graph.microsoft.com/v1.0/drives/${file.item.parentDriveId}/items/${file.item.id}/children`,
                    );
                    loadGetUserMicrosoftFiles(
                      `https://graph.microsoft.com/v1.0/drives/${file.item.parentDriveId}/items/${file.item.id}/children`,
                    );
                    setFilesBackAvaliable(true);
                  } else {
                    onSelectedFile(file.item);
                  }
                }}
                key={`Users_${file.item.id}_${createUUID()}`}
              >
                <View style={{ flexDirection: 'row', margin: 5 }}>
                  <MimeTypeIcon
                    width={20}
                    height={20}
                    mimeType={file.item.type}
                  />
                  <Text style={{ padding: 0, marginLeft: 2, marginTop: 'auto', marginBottom: 'auto', textAlignVertical: 'center', fontFamily: 'Roboto' }}>
                    {file.item.name}
                  </Text>
                </View>
              </Pressable>
            )
          }
          return null
        }}
      />
    )
  }

  return (
    <View style={{
      width,
      height,
      backgroundColor: Colors.white,
      alignContent: 'center',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Text>Failed to Load</Text>
    </View>
  )
}

export default function PersonalBlock({
  height,
  width,
  onSelectedFile,
  allowedTypes
}: {
  height: number;
  width: number;
  onSelectedFile: (item: microsoftFileType) => void;
  allowedTypes?: string[]
}) {
  const [usersFiles, setUsersFies] = useState<microsoftFileType[]>([]);
  const [microsoftPath, setMicrosoftPath] = useState<string>(
    'https://graph.microsoft.com/v1.0/me/drive/root/children',
  );
  const [fileBackAvaliable, setFilesBackAvaliable] = useState<boolean>(false);
  const [getFilesState, setGetFilesState] = useState<loadingStateEnum>(
    loadingStateEnum.notStarted,
  );
  const [mounted, setMounted] = useState<boolean>(false);

  const loadGetUserMicrosoftFiles = useCallback(async (path: string) => {
    setGetFilesState(loadingStateEnum.loading);
    const result = await getUserMicrosoftFiles(path);
    if (
      result.result === loadingStateEnum.success &&
      result.data !== undefined
    ) {
      setUsersFies(result.data);
      setGetFilesState(loadingStateEnum.success);
    } else {
      setGetFilesState(loadingStateEnum.failed);
    }
  }, []);

  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      loadGetUserMicrosoftFiles(microsoftPath);
    }
  }, [loadGetUserMicrosoftFiles, mounted, microsoftPath]);

  return (
    <ScrollView style={{ height: height - 20 }}>
      {fileBackAvaliable ? (
        <Pressable
          onPress={() => {
            const microsftPathArray = microsoftPath.split('/');
            microsftPathArray.pop();
            microsftPathArray.pop();
            microsftPathArray.pop();
            let outputString = '';
            for (let index = 0; index < microsftPathArray.length; index += 11) {
              outputString += `${microsftPathArray[index]}/`;
            }
            outputString += '/items/root/children';
            setMicrosoftPath(outputString);
            loadGetUserMicrosoftFiles(outputString);
            setFilesBackAvaliable(false);
          }}
        >
          <Text>Back</Text>
        </Pressable>
      ) : null}
      <PersonalBlockBody
        getFilesState={getFilesState}
        width={width}
        height={height}
        usersFiles={usersFiles}
        setMicrosoftPath={setMicrosoftPath}
        loadGetUserMicrosoftFiles={loadGetUserMicrosoftFiles}
        setFilesBackAvaliable={setFilesBackAvaliable}
        onSelectedFile={onSelectedFile}
        allowedTypes={allowedTypes}
      />
    </ScrollView>
  );
}
