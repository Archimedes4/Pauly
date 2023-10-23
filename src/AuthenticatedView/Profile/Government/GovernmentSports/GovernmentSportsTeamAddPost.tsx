import { View, Text, Pressable, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-native';
import { useSelector } from 'react-redux';
import { ScrollView } from 'react-native-gesture-handler';
import MicrosoftFilePicker from '../../../../UI/MicrosoftFilePicker';
import callMsGraph from '../../../../Functions/Ultility/microsoftAssets';
import createUUID from '../../../../Functions/Ultility/createUUID';
import store, { RootState } from '../../../../Redux/store';
import { Colors, loadingStateEnum } from '../../../../types';
import {
  getSports,
  getSportsTeams,
} from '../../../../Functions/sports/sportsFunctions';
import ProgressView from '../../../../UI/ProgressView';

export default function GovernmentSportsTeamAddPost() {
  const { width, height } = useSelector((state: RootState) => state.dimentions);
  const { siteId } = useSelector((state: RootState) => state.paulyList);
  const [selectedShareID, setSelectedShareID] = useState<string>('');
  const [postName, setPostName] = useState<string>('');
  const [postSubmissionState, setPostSubmissionState] =
    useState<loadingStateEnum>(loadingStateEnum.notStarted);
  const navigate = useNavigate();
  const [selectedSportId, setSelectedSportId] = useState<string>('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');

  async function getShareLink(item: microsoftFileType) {
    const itemPathArray = item.itemGraphPath.split('/');
    if (itemPathArray[itemPathArray.length - 1] === 'children') {
      const data = {
        type: 'view',
        scope: 'organization',
      };
      const result = await callMsGraph(
        `https://graph.microsoft.com/v1.0/drives/${item.parentDriveId}/items/${item.id}/createLink`,
        'POST',
        JSON.stringify(data),
      );
      if (result.ok) {
        const dataOut = await result.json();
        setSelectedShareID(dataOut.shareId);
      } else {
      }
    }
  }
  async function createFileSubmission(fileID: string) {
    if (selectedShareID !== '' && selectedTeamId !== '') {
      setPostSubmissionState(loadingStateEnum.loading);
      const userIdResult = await callMsGraph(
        'https://graph.microsoft.com/v1.0/me',
      );
      if (userIdResult.ok) {
        const userData = await userIdResult.json();
        const submissionID = createUUID();
        const data = {
          fields: {
            Title: postName,
            fileId: fileID,
            accepted: false,
            user: userData.id,
            timeCreated: new Date().toISOString(),
            submissionId: submissionID,
            reviewed: false,
            selectedSportId,
            selectedTeamId,
          },
        };
        const result = await callMsGraph(
          `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${
            store.getState().paulyList.sportsSubmissionsListId
          }/items`,
          'POST',
          JSON.stringify(data),
        ); // TO DO fix id
        if (result.ok) {
          setPostSubmissionState(loadingStateEnum.success);
        } else {
          setPostSubmissionState(loadingStateEnum.failed);
        }
      } else {
        setPostSubmissionState(loadingStateEnum.failed);
      }
    }
  }
  return (
    <ScrollView style={{ width, height, backgroundColor: Colors.white }}>
      <Pressable
        onPress={() => {
          navigate('/profile/government/sports');
        }}
      >
        <Text>Back</Text>
      </Pressable>
      <Text>Add Sports Team Post</Text>
      <TextInput
        value={postName}
        onChangeText={e => {
          setPostName(e);
        }}
      />
      <PickSportTeam
        height={400}
        width={width}
        onSelect={e => {
          setSelectedSportId(e.sportId);
          setSelectedTeamId(e.teamId);
        }}
        onBack={() => {
          setSelectedSportId('');
          setSelectedTeamId('');
        }}
      />
      <MicrosoftFilePicker
        onSelectedFile={(item: microsoftFileType) => {
          getShareLink(item);
        }}
        height={500}
        width={width}
      />
      {selectedShareID !== '' ? (
        <Pressable
          onPress={() => {
            if (
              postSubmissionState === loadingStateEnum.notStarted &&
              selectedShareID !== '' &&
              selectedTeamId !== ''
            ) {
              createFileSubmission(selectedShareID);
            }
          }}
        >
          <Text>
            {selectedShareID !== '' && selectedTeamId !== ''
              ? 'Submit'
              : 'Select Team'}
          </Text>
        </Pressable>
      ) : null}
      {postSubmissionState === loadingStateEnum.loading ? (
        <Text>Loading</Text>
      ) : null}
      {postSubmissionState === loadingStateEnum.failed ? (
        <Text>Failure</Text>
      ) : null}
      {postSubmissionState === loadingStateEnum.success ? (
        <Text>Success</Text>
      ) : null}
    </ScrollView>
  );
}

function PickSportTeam({
  width,
  height,
  onSelect,
  onBack,
}: {
  width: number;
  height: number;
  onSelect: (item: { sportId: string; teamId: string }) => void;
  onBack: () => void;
}) {
  const [currentSports, setCurrentSports] = useState<sportType[]>([]);
  const [dataResult, setDataResult] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [selectedSport, setSelectedSport] = useState<sportType | undefined>(
    undefined,
  );
  const [sportsTeams, setSportTeams] = useState<sportTeamType[]>([]);
  const [sportTeamState, setSportTeamState] = useState<loadingStateEnum>(
    loadingStateEnum.notStarted,
  );

  async function loadData() {
    const result = await getSports();
    if (
      result.result === loadingStateEnum.success &&
      result.data !== undefined
    ) {
      setCurrentSports(result.data);
    }
    setDataResult(result.result);
  }

  async function loadTeams() {
    if (selectedSport !== undefined) {
      setSportTeamState(loadingStateEnum.loading);
      const result = await getSportsTeams(selectedSport.id);
      if (
        result.result === loadingStateEnum.success &&
        result.data !== undefined
      ) {
        setSportTeams(result.data);
      }
      setSportTeamState(result.result);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadTeams();
  }, [selectedSport]);

  return (
    <View style={{ width, height }}>
      <>
        {sportsTeams === undefined ||
        sportTeamState === loadingStateEnum.notStarted ? (
          <>
            {dataResult === loadingStateEnum.loading ? (
              <View
                style={{
                  width,
                  height,
                  alignContent: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ProgressView
                  width={width < height ? width * 0.1 : height * 0.1}
                  height={width < height ? width * 0.1 : height * 0.1}
                />
                <Text>Loading</Text>
              </View>
            ) : (
              <>
                {dataResult === loadingStateEnum.success ? (
                  <>
                    {currentSports.map((item, id) => (
                      <Pressable
                        key={id}
                        onPress={() => setSelectedSport(item)}
                      >
                        <View>
                          <Text>{item.name}</Text>
                        </View>
                      </Pressable>
                    ))}
                  </>
                ) : (
                  <View>
                    <Text>Error</Text>
                  </View>
                )}
              </>
            )}
          </>
        ) : (
          <>
            {sportTeamState === loadingStateEnum.loading ? (
              <View
                style={{
                  width,
                  height,
                  alignContent: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ProgressView
                  width={width < height ? width * 0.1 : height * 0.1}
                  height={width < height ? width * 0.1 : height * 0.1}
                />
                <Text>Loading</Text>
              </View>
            ) : (
              <>
                {sportTeamState === loadingStateEnum.success &&
                selectedSport !== undefined ? (
                  <View>
                    <Pressable
                      onPress={() => {
                        setSelectedSport(undefined);
                        setSportTeamState(loadingStateEnum.notStarted);
                        setSportTeams([]);
                        onBack();
                      }}
                    >
                      <Text>Back</Text>
                    </Pressable>
                    {sportsTeams.map((item, id) => (
                      <Pressable
                        key={id}
                        onPress={() =>
                          onSelect({
                            sportId: selectedSport.id,
                            teamId: item.teamId,
                          })
                        }
                      >
                        <View>
                          <Text>{item.teamName}</Text>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                ) : (
                  <View>
                    <Text>Error</Text>
                  </View>
                )}
              </>
            )}
          </>
        )}
      </>
    </View>
  );
}
