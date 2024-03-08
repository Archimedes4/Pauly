/*
  Andrew Mainella
  November 9 2023
  Sports.tsx
  Sports page renders the scroll view an content.
*/
import { ResizeMode, Video } from 'expo-av';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  FlatList,
  ListRenderItemInfo,
  StatusBar,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { safeAreaColorsSlice } from '@redux/reducers/safeAreaColorsReducer';
import {
  getRoster,
  getSports,
  getSportsContent,
  getSportsTeams,
} from '@utils/sports/sportsFunctions';
import { getFileWithShareID } from '@utils/ultility/handleShareID';
import SegmentedPicker from '@components/Pickers/SegmentedPicker';
import SVGXml from '@components/SVGXml';
import BackButton from '@components/BackButton';
import ProgressView from '@components/ProgressView';
import {
  Colors,
  dataContentTypeOptions,
  loadingStateEnum,
  postType,
} from '@constants';
import SportsYoutube from '@components/SportsYoutube';

function TeamPickerBar({
  isShowingTeams,
  setIsShowingTeams,
  selectedTeam,
  setSelectedTeam,
  setIsShowingRoster
}:{
  isShowingTeams: boolean;
  setIsShowingTeams: (item: boolean) => void;
  selectedTeam: undefined | sportTeamType;
  setSelectedTeam: (item: undefined | sportTeamType) => void;
  setIsShowingRoster: (item: boolean) => void;
}) {
  const { width, height } = useSelector(
    (state: RootState) => state.dimensions,
  );
  const [sportsTeams, setSportsTeams] = useState<sportTeamType[]>([]);
  const [sportsState, setSportsState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [teamsState, setTeamsState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [selectedSport, setSelectedSport] = useState<sportType | undefined>(
    undefined,
  );
  const [sports, setSports] = useState<sportType[]>([]);
  async function loadSports() {
    const result = await getSports();
    if (result.result === loadingStateEnum.success) {
      setSports(result.data);
    }
    setSportsState(result.result);
  }

  async function loadTeams(sport: sportType) {
    const result = await getSportsTeams(sport.id);
    if (result.result === loadingStateEnum.success) {
      setSportsTeams(result.data);
    }
    setTeamsState(result.result);
  }

  useEffect(() => {
    loadSports();
  }, [])

  return (
    <ScrollView
      style={{
        height: isShowingTeams ? height * 0.1 : 24,
        width,
      }}
      horizontal
    >
      <View>
        {sportsState === loadingStateEnum.loading ? (
          <View
            style={{
              width,
              height: isShowingTeams ? height * 0.05 : height * 0.1,
              alignContent: 'center',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ProgressView width={15} height={15} />
          </View>
        ) : (
          <>
            {sportsState === loadingStateEnum.success ? (
              <View
                style={{
                  flexDirection: 'row',
                  height: isShowingTeams ? height * 0.05 : 32,
                }}
              >
                <Pressable
                  style={{
                    backgroundColor: Colors.darkGray,
                    borderWidth: selectedSport === undefined ? 3 : 0,
                    borderColor: Colors.black,
                    borderRadius: 15,
                    alignContent: 'center',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 3,
                    marginTop: 3,
                    padding: isShowingTeams ? 5 : 10,
                    height: isShowingTeams ? 32 : 42,
                  }}
                  onPress={() => {
                    setSelectedTeam(undefined);
                    setSportsTeams([]);
                    setSelectedSport(undefined);
                    setIsShowingRoster(false);
                    setIsShowingTeams(false);
                  }}
                >
                  <Text
                    style={{
                      color: Colors.white,
                    }}
                  >
                    Highlights
                  </Text>
                </Pressable>
                {sports.map(sport => (
                  <Pressable
                    key={`SportButton_${sport.id}`}
                    onPress={() => {
                      setSelectedSport(sport);
                      loadTeams(sport);
                      setIsShowingTeams(true);
                      setIsShowingRoster(false);
                    }}
                    style={{
                      backgroundColor: Colors.darkGray,
                      borderWidth: selectedSport?.id === sport.id ? 3 : 0,
                      borderColor: Colors.black,
                      borderRadius: 15,
                      alignContent: 'center',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginLeft: 3,
                      marginTop: 3,
                      height: isShowingTeams ? 32 : 42,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignContent: 'center',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: 10,
                      }}
                    >
                      <SVGXml xml={sport.svgData} width={20} height={20} />
                      <Text
                        style={{
                          margin: isShowingTeams ? 5 : 10,
                          color: Colors.white,
                          marginBottom:
                            sport.id === selectedSport?.id &&
                            selectedTeam !== undefined &&
                            !isShowingTeams
                              ? 10
                              : isShowingTeams
                                ? 5
                                : 10,
                        }}
                      >
                        {sport.id === selectedSport?.id &&
                        selectedTeam !== undefined &&
                        !isShowingTeams
                          ? selectedTeam?.teamName
                          : ''}{' '}
                        {sport.name}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : (
              <View>
                <Text>Failed</Text>
              </View>
            )}
          </>
        )}
        {isShowingTeams ? (
          <View style={{ flexDirection: 'row' }}>
            {sportsState === loadingStateEnum.loading ? (
              <View
                style={{
                  width,
                  height: height * 0.05,
                  alignContent: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ProgressView width={15} height={15} />
              </View>
            ) : (
              <>
                {sportsState === loadingStateEnum.success ? (
                  <>
                    {sportsTeams.map(team => (
                      <Pressable
                        key={`SportTeam_${team.teamId}`}
                        onPress={() => {
                          setSelectedTeam(team);
                          setIsShowingTeams(false);
                          setIsShowingRoster(false);
                        }}
                        style={{
                          backgroundColor: Colors.darkGray,
                          borderRadius: 15,
                          alignContent: 'center',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginLeft: 3,
                          marginTop: 3,
                        }}
                      >
                        <Text style={{ margin: 5, color: Colors.white }}>
                          {team.teamName}
                        </Text>
                      </Pressable>
                    ))}
                  </>
                ) : (
                  <Text>Failed to load Sports</Text>
                )}
              </>
            )}
          </View>
        ) : null}
      </View>
    </ScrollView>
  )
}

function SportsBody({
  isShowingRoster,
  setIsShowingRoster,
  selectedTeam,
  isShowingTeams
}:{
  isShowingRoster: boolean;
  setIsShowingRoster: (item: boolean) => void
  selectedTeam: sportTeamType | undefined
  isShowingTeams: boolean
}) {
  const { width, height } = useSelector(
    (state: RootState) => state.dimensions,
  );
  const [loadingResult, setLoadingResult] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [sportsPosts, setSportsPosts] = useState<sportPost[]>([]);

  async function loadSportsContent() {
    const result = await getSportsContent(selectedTeam?.teamId);
    if (result.result === loadingStateEnum.success) {
      console.log(result)
      setSportsPosts(result.sports);
    }
    setLoadingResult(result.result);
  }

  useEffect(() => {
    loadSportsContent();
  }, [selectedTeam]);

  if (loadingResult === loadingStateEnum.loading)  {
    return (
      <View
        style={{
          width,
          height: height * 0.8 + (isShowingTeams ? 0 : height * 0.1 - 34),
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ProgressView
          width={width < height ? width * 0.25 : height * 0.25}
          height={width < height ? width * 0.5 : height * 0.5}
        />
        <Text>Loading</Text>
      </View>
    )
  }
  
  if (loadingResult === loadingStateEnum.success && selectedTeam === undefined) {
    return (
      <View style={{ height: height * 0.8 }}>
        <FlatList
          data={sportsPosts}
          renderItem={post => (<SportsPostBlock key={post.item.data.fileId} post={post} />)}
        />
      </View>
    )
  }

  if (loadingResult === loadingStateEnum.success && selectedTeam !== undefined) {
    return (
      <View style={{ height: height * 0.8 }}>
        <View style={{ marginLeft: 5, marginRight: 10, marginTop: 10 }}>
          <SegmentedPicker
            selectedIndex={isShowingRoster ? 1 : 0}
            setSelectedIndex={e => {
              if (e === 0) {
                setIsShowingRoster(false);
              } else if (e === 1) {
                setIsShowingRoster(true);
              }
            }}
            options={['Highlights', 'Roster']}
            width={width - 16}
            height={25}
          />
        </View>
        {isShowingRoster ? (
          <RosterView
            teamId={selectedTeam.teamId}
            width={width}
            height={height * 0.7}
          />
        ) : (
          <FlatList
            data={sportsPosts}
            renderItem={post => (<SportsPostBlock key={post.item.data.fileId} post={post} />)}
          />
        )}
      </View>
    )
  }
  return (
    <View>
      <Text>Something went wrong</Text>
    </View>
  )
}

export default function Sports() {
  const { width, height, currentBreakPoint } = useSelector(
    (state: RootState) => state.dimensions,
  );
  const [selectedTeam, setSelectedTeam] = useState<sportTeamType | undefined>(
    undefined,
  );

  const [isShowingTeams, setIsShowingTeams] = useState<boolean>(false);
  const [isShowingRoster, setIsShowingRoster] = useState<boolean>(false);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      safeAreaColorsSlice.actions.setSafeAreaColors({
        top: Colors.darkGray,
        bottom: Colors.lightGray
      }),
    );
  }, []);

  return (
    <View
      style={{
        height,
        width,
        backgroundColor: Colors.lightGray,
        overflow: 'hidden',
      }}
    >
      <StatusBar barStyle={'light-content'}/>
      <View
        style={{
          height: height * 0.1,
          width,
          backgroundColor: Colors.darkGray,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {currentBreakPoint <= 0 ? <BackButton to="/home" color={Colors.white}/> : null}
        <Text
          style={{
            fontFamily: 'BukhariScript',
            color: 'white',
            fontSize: height * 0.06,
          }}
        >
          Sports
        </Text>
      </View>
      <TeamPickerBar isShowingTeams={isShowingTeams} setIsShowingTeams={setIsShowingTeams} selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam} setIsShowingRoster={setIsShowingRoster} />
      <SportsBody isShowingRoster={isShowingRoster} setIsShowingRoster={setIsShowingRoster} selectedTeam={selectedTeam} isShowingTeams={isShowingTeams}/>
    </View>
  );
}

function SportsPostBlock({ post }: { post: ListRenderItemInfo<sportPost> }) {
  const { width, height } = useSelector((state: RootState) => state.dimensions);
  const [imageAspect, setImageAspect] = useState<number>(0);
  function getPostHeight(
    currentWidth: number,
    currentHeight: number,
    currentImageAspect: number,
  ) {
    console.log(currentHeight, currentWidth)
    if (
      post.item.data.postType === postType.microsoftFile &&
      post.item.data.fileType === dataContentTypeOptions.image
    ) {
      if (imageAspect == -1) {
        return (currentWidth * 9) / 16;
      }
      if (imageAspect == 0) {
        return currentWidth * 0.9
      }
      return (currentWidth * 0.9) / currentImageAspect;
    }
    if (post.item.data.postType === postType.youtubeVideo) {
      return ((currentWidth * 0.9) / 16) * 9;
    }
    return currentHeight * 0.4;
  }
  useEffect(() => {
    if (
      post.item.data.postType === postType.microsoftFile &&
      post.item.data.fileType === dataContentTypeOptions.image
    ) {
      Image.getSize(
        post.item.data.fileId,
        (srcWidth, srcHeight) => {
          const aspectRatio = srcWidth / srcHeight;
          setImageAspect(aspectRatio);
        },
        error => {
          // Fallback height
          setImageAspect(-1);
        },
      );
    }
  }, []);
  return (
    <View
      key={`Sport_${post.item.data.fileId}`}
      style={{
        width: width * 0.9,
        height: getPostHeight(width, height, imageAspect),
        backgroundColor: Colors.white,
        elevation: 2,
        shadowColor: Colors.black,
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 10,
        marginLeft: width * 0.05,
        marginRight: width * 0.05,
        marginTop: height * 0.05,
        marginBottom: height * 0.05,
        borderRadius: 15,
      }}
    >
      <View
        style={{
          overflow: 'hidden',
          width: width * 0.9,
          height: getPostHeight(width, height, imageAspect),
          borderRadius: 15,
        }}
      >
        {post.item.data.postType === postType.microsoftFile ? (
          <>
            {post.item.data.fileType === dataContentTypeOptions.image ? (
              <>
                <Text
                  style={{
                    position: 'absolute',
                    left: 5,
                    bottom: 5,
                    zIndex: 100,
                  }}
                >
                  {post.item.caption}
                </Text>
                <Image
                  style={{
                    width: width * 0.9,
                    height: getPostHeight(width, height, imageAspect),
                    borderRadius: 15,
                    position: 'absolute',
                  }}
                  source={{ uri: post.item.data.fileId }}
                />
              </>
            ) : null}
            {post.item.data.fileType === dataContentTypeOptions.video ? (
              <View>
                {/* <Text
                  style={{
                    position: 'absolute',
                    left: 5,
                    bottom: 5,
                    zIndex: 100,
                  }}
                >
                  {post.item.caption}
                </Text> */}
                <Video
                  useNativeControls
                  source={{ uri: post.item.data.fileId }}
                  resizeMode={ResizeMode.COVER}
                  style={{
                    width: width * 0.9,
                    height: height * 0.4,
                    alignSelf: 'stretch',
                    borderRadius: 15,
                  }}
                  videoStyle={{
                    width: width * 0.9,
                    height: height * 0.4,
                    borderRadius: 15,
                  }}
                />
              </View>
            ) : null}
          </>
        ) : null}
        {post.item.data.postType === postType.youtubeVideo ? (
          <SportsYoutube
            width={width * 0.9}
            videoId={post.item.data.fileId}
            height={height * 0.4}
          />
        ) : null}
      </View>
    </View>
  );
}

function RosterView({
  teamId,
  width,
  height,
}: {
  teamId: string;
  width: number;
  height: number;
}) {
  const [rosterLoadingState, setRosterLoadingState] =
    useState<loadingStateEnum>(loadingStateEnum.loading);
  const [roster, setRoster] = useState<rosterType[]>([]);

  async function loadRoster() {
    const result = await getRoster(teamId);
    if (
      result.result === loadingStateEnum.success &&
      result.data !== undefined
    ) {
      setRoster(result.data);
    }
    setRosterLoadingState(result.result);
  }

  useEffect(() => {
    loadRoster();
  }, []);

  if (rosterLoadingState === loadingStateEnum.loading) {
    return (
      <View
        style={{
          width,
          height,
          alignContent: 'center',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ProgressView width={width * 0.1} height={height * 0.1} />
        <Text>Loading</Text>
      </View>
    );
  }

  if (rosterLoadingState === loadingStateEnum.success) {
    return (
      <View>
        <View style={{ flexDirection: 'row', marginTop: 10, marginBottom: 5 }}>
          <Text style={{ marginLeft: 35, width: width * 0.4 }}>Player</Text>
          <Text style={{ width: width * 0.3 }}>Player Number</Text>
          <Text>Position</Text>
        </View>
        <FlatList
          data={roster}
          renderItem={item => (
            <View
              style={{
                backgroundColor:
                  item.index % 2 === 0 ? Colors.white : Colors.lightGray,
              }}
            >
              <View style={{ flexDirection: 'row', margin: 10 }}>
                <RosterImage id={item.item.imageShareId} />
                <Text style={{ marginLeft: 5, width: width * 0.4 }}>
                  {item.item.name}
                </Text>
                {item.item.playerNumber !== undefined ? (
                  <Text style={{ width: width * 0.3 }}>
                    {item.item.playerNumber}
                  </Text>
                ) : null}
                {item.item.position !== undefined ? (
                  <Text>{item.item.position}</Text>
                ) : null}
              </View>
            </View>
          )}
        />
      </View>
    );
  }

  return (
    <View>
      <Text>Something went wrong loading the roster</Text>
    </View>
  );
}

function RosterImage({ id }: { id?: string }) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageState, setImageState] = useState<loadingStateEnum>(
    loadingStateEnum.notStarted,
  );
  async function loadData(imageId: string) {
    setImageState(loadingStateEnum.loading);
    const result = await getFileWithShareID(imageId, 0);
    if (
      result.result === loadingStateEnum.success &&
      result.url !== undefined
    ) {
      setImageUrl(result.url);
      setImageState(loadingStateEnum.success);
    } else {
      setImageState(loadingStateEnum.failed);
    }
  }
  useEffect(() => {
    if (id !== undefined) {
      loadData(id);
    }
  }, [id]);

  if (imageState === loadingStateEnum.loading) {
    return (
      <View
        style={{
          width: 20,
          height: 20,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ProgressView width={14} height={14} />
      </View>
    );
  }

  if (imageState === loadingStateEnum.success) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={{ width: 20, height: 20, borderRadius: 10 }}
      />
    );
  }

  if (imageState === loadingStateEnum.notStarted) {
    return <View style={{ width: 20, height: 20 }} />;
  }

  return (
    <View>
      <Text>Failed</Text>
    </View>
  );
}
