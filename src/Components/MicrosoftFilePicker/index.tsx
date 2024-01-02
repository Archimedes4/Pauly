/*
  Pauly
  Andrew Mainella
  25 December 2023
  MicrosoftFilePicker.tsx
  Can select file from one drive a share point link or a teams channel that the user is in.
*/
import React, { useEffect, useState } from 'react';
import {
  Pressable,
  View,
  Text,
  TextInput,
  FlatList,
} from 'react-native';
import Picker from '../Pickers/Picker';
import callMsGraph from '@utils/ultility/microsoftAssets';
import {
  getUserTeams,
} from '@utils/microsoftFilePickerFunctions';
import { loadingStateEnum } from '@constants';
import PersonalBlock from './PersonalBlock';

enum MicrosoftUploadModeType {
  ShareLink,
  Personal,
  Site,
}

export default function MicrosoftFilePicker({
  onSetIsShowingUpload = undefined,
  onSetIsShowingMicrosoftUpload = undefined,
  onSelectedFile,
  height,
  width,
  allowedTypes,
}: {
  height: number;
  width: number;
  onSetIsShowingUpload?: ((item: boolean) => void) | undefined;
  onSetIsShowingMicrosoftUpload?: ((item: boolean) => void) | undefined;
  onSelectedFile: (item: microsoftFileType) => void;
  allowedTypes?: string[];
}) {
  const [usersTeams, setUsersTeams] = useState<teamsGroupType[]>([]);
  const [selectedMicrosoftUploadMode, setSelectedMicrosoftUploadMode] =
    useState<MicrosoftUploadModeType>(MicrosoftUploadModeType.Personal);
  const [shareLinkString, setShareLinkString] = useState<string>('');

  async function loadUserTeams() {
    const result = await getUserTeams();
    if (result.result === loadingStateEnum.success) {
      setUsersTeams(result.data);
    }
  }

  useEffect(() => {
    loadUserTeams();
  }, []);

  async function getShareFile(shareLink: string) {
    const result = await callMsGraph(
      `https://graph.microsoft.com/v1.0/shares/${shareLink}/driveItem?$select=content.downloadUrl`,
    );
    if (result.ok) {
      const data = await result.json();
      onSelectedFile({
        name: '',
        id: '',
        lastModified: '',
        folder: false,
        parentDriveId: '',
        parentPath: '',
        itemGraphPath: '',
        callPath: '',
        type: '',
      });
    }
  }

  return (
    <View style={{ height, width }}>
      <View style={{ flexDirection: 'row' }}>
        <Text style={{ textAlign: 'left' }}>Upload File From Microsoft</Text>
        {onSetIsShowingMicrosoftUpload === undefined ||
        onSetIsShowingUpload === undefined ? null : (
          <Pressable
            onPress={() => {
              onSetIsShowingUpload(false);
              onSetIsShowingMicrosoftUpload(false);
            }}
          >
            <View>
              <Text>Back</Text>
            </View>
          </Pressable>
        )}
      </View>
      <View>
        <View style={{ width }}>
          <Picker
            selectedIndex={
              selectedMicrosoftUploadMode === MicrosoftUploadModeType.Personal
                ? 0
                : selectedMicrosoftUploadMode ===
                    MicrosoftUploadModeType.ShareLink
                  ? 1
                  : 2
            }
            onSetSelectedIndex={(item: number) => {
              item === 0
                ? setSelectedMicrosoftUploadMode(
                    MicrosoftUploadModeType.Personal,
                  )
                : item === 1
                  ? setSelectedMicrosoftUploadMode(
                      MicrosoftUploadModeType.ShareLink,
                    )
                  : setSelectedMicrosoftUploadMode(
                      MicrosoftUploadModeType.Site,
                    );
            }}
            width={width}
            height={30}
          >
            <Text style={{ margin: 0, padding: 0, fontFamily: 'Roboto' }}>Personal</Text>
            <Text style={{ margin: 0, padding: 0, fontFamily: 'Roboto' }}>Link</Text>
            <Text style={{ margin: 0, padding: 0, fontFamily: 'Roboto' }}>Teams</Text>
          </Picker>
        </View>
        {selectedMicrosoftUploadMode === MicrosoftUploadModeType.Personal ? (
          <PersonalBlock
            height={height}
            width={width}
            onSelectedFile={onSelectedFile}
            allowedTypes={allowedTypes}
          />
        ) : null}
        {selectedMicrosoftUploadMode === MicrosoftUploadModeType.ShareLink ? (
          <View>
            <View>
              <Text>Share Link</Text>
              <TextInput
                placeholder="Share Link"
                value={shareLinkString}
                onChangeText={e => {
                  setShareLinkString(e);
                }}
              />
            </View>
            <Pressable
              onPress={() => {
                // TO DO make this work
                let base64Value = btoa(shareLinkString);
                base64Value.replace('/', '_');
                base64Value.replace('+', '-');
                base64Value.trimEnd();
                base64Value = `u!${base64Value}`;
                getShareFile(base64Value);
              }}
            >
              <Text>Submit</Text>
            </Pressable>
          </View>
        ) : null}
        {selectedMicrosoftUploadMode === MicrosoftUploadModeType.Site ? (
          <TeamsBlock userTeams={usersTeams} height={height} />
        ) : null}
      </View>
    </View>
  );
}

function TeamsBlock({
  userTeams,
  height,
}: {
  userTeams: teamsGroupType[];
  height: number;
}) {
  return (
    <FlatList
      data={userTeams}
      renderItem={team => (
        <View>
          {team.item.teamName !== 'Student Password Policy' &&
          team.item.teamName !== "St Paul's High School" &&
          team.item.teamName !== 'Adobe_Student' &&
          team.item.teamName !== 'O365 Student A3 License Assignment' &&
          team.item.teamName !== 'Student' ? (
            <View>
              <Text>{team.item.teamName}</Text>
            </View>
          ) : null}
        </View>
      )}
      style={{ height: height * 0.8 }}
    />
  );
}