import {
  View,
  Text,
  Pressable,
  TextInput,
  FlatList,
  Image,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-native';
import { useSelector } from 'react-redux';
import { ScrollView } from 'react-native-gesture-handler';
import { SegmentedButtons } from 'react-native-paper';
import MicrosoftFilePicker from '../../../../components/MicrosoftFilePicker';
import callMsGraph from '../../../../Functions/ultility/microsoftAssets';
import createUUID from '../../../../Functions/ultility/createUUID';
import store, { RootState } from '../../../../Redux/store';
import { Colors, loadingStateEnum, postType } from '../../../../types';
import {
  getSports,
  getSportsTeams,
} from '../../../../Functions/sports/sportsFunctions';
import ProgressView from '../../../../components/ProgressView';
import getYoutubeVideos from '../../../../Functions/youtubeFunctions';

function YoutubeVideosSelector({
  onSelect,
}: {
  onSelect: (item: string) => void;
}) {
  const { width } = useSelector((state: RootState) => state.dimentions);
  const [ytVideos, setytVideos] = useState<youtubeVideoType[]>([]);
  const [ytState, setytState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [nextPage, setNextPage] = useState<string | undefined>(undefined);

  async function loadData() {
    const result = await getYoutubeVideos(nextPage);
    if (result.result == loadingStateEnum.success) {
      setytVideos([...ytVideos, ...result.data]);
      setNextPage(result.nextPageToken);
      setytState(loadingStateEnum.success);
    } else {
      setytState(loadingStateEnum.failed);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (ytState === loadingStateEnum.loading) {
    return (
      <View>
        <ProgressView width={14} height={14} />
        <Text>Loading</Text>
      </View>
    );
  }

  if (ytState === loadingStateEnum.success) {
    return (
      <FlatList
        data={ytVideos}
        renderItem={video => (
          <Pressable
            onPress={() => {
              onSelect(video.item.videoId);
            }}
          >
            <Image
              source={{ uri: video.item.thumbnail }}
              style={{ width, height: (width / 16) * 9 }}
            />
            <Text>{video.item.title}</Text>
          </Pressable>
        )}
        style={{ width, height: 500 }}
        onEndReached={() => loadData()}
      />
    );
  }

  return (
    <View style={{ width, height: 500 }}>
      <Text>Something Went Wrong</Text>
    </View>
  );
}

export default function GovernmentSportsTeamAddPost() {
  const { width, height } = useSelector((state: RootState) => state.dimentions);
  const { siteId } = useSelector((state: RootState) => state.paulyList);
  const [fileId, setFileId] = useState<string>('');
  const [postName, setPostName] = useState<string>('');
  const [postSubmissionState, setPostSubmissionState] =
    useState<loadingStateEnum>(loadingStateEnum.notStarted);
  const navigate = useNavigate();
  const [selectedSportId, setSelectedSportId] = useState<string>('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [postMode, setPostMode] = useState(postType.microsoftFile);

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
        setFileId(dataOut.shareId);
      }
    }
  }
  async function createFileSubmission() {
    if (fileId !== '' && selectedTeamId !== '') {
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
            fileId,
            fileType: postMode, // This is the post mode Type
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
        );
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
      <SegmentedButtons
        value={postMode.toString()}
        onValueChange={e => setPostMode(parseInt(e))}
        buttons={[
          {
            value: postType.microsoftFile.toString(),
            label: 'Microsoft File',
          },
          {
            value: postType.youtubeVideo.toString(),
            label: 'Youtube Video',
          },
        ]}
      />
      {postMode === postType.microsoftFile ? (
        <MicrosoftFilePicker
          onSelectedFile={(item: microsoftFileType) => {
            getShareLink(item);
          }}
          height={500}
          width={width}
        />
      ) : null}
      {postMode === postType.youtubeVideo ? (
        <YoutubeVideosSelector onSelect={setFileId} />
      ) : null}
      {fileId !== '' ? (
        <Pressable
          onPress={() => {
            if (
              postSubmissionState === loadingStateEnum.notStarted &&
              fileId !== '' &&
              selectedTeamId !== ''
            ) {
              createFileSubmission();
            }
          }}
        >
          <Text>
            {fileId !== '' && selectedTeamId !== '' ? 'Submit' : 'Select Team'}
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
