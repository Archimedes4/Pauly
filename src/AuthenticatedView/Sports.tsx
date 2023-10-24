import { ResizeMode, Video } from 'expo-av';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  FlatList,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-native';
import { RootState } from '../Redux/store';
import { safeAreaColorsSlice } from '../Redux/reducers/safeAreaColorsReducer';
import getSportsContent from '../Functions/sports/getSportsContent';
import createUUID from '../Functions/ultility/createUUID';
import { getSports, getSportsTeams } from '../Functions/sports/sportsFunctions';
import getRoster from '../Functions/sports/getRoster';
import getFileWithShareID from '../Functions/ultility/getFileWithShareID';
import SegmentedPicker from '../UI/Pickers/SegmentedPicker';
import SVGXml from '../UI/SVGXml/SVGXml';
import BackButton from '../UI/BackButton';
import ProgressView from '../UI/ProgressView';
import { Colors, dataContentTypeOptions, loadingStateEnum } from '../types';

export default function Sports() {
  const { width, height, currentBreakPoint } = useSelector(
    (state: RootState) => state.dimentions,
  );
  const [sportsPosts, setSportsPosts] = useState<sportPost[]>([]);
  const [loadingResult, setLoadingResult] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [sportsState, setSportsState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [teamsState, setTeamsState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [selectedSport, setSelectedSport] = useState<sportType | undefined>(
    undefined,
  );
  const [selectedTeam, setSelectedTeam] = useState<sportTeamType | undefined>(
    undefined,
  );
  const [isShowingTeams, setIsShowingTeams] = useState<boolean>(false);
  const [sports, setSports] = useState<sportType[]>([]);
  const [isShowingRoster, setIsShowingRoster] = useState<boolean>(false);
  const [sportsTeams, setSportsTeams] = useState<sportTeamType[]>([]);
  const [sportsSelectHeight, setSportsSelectHeight] = useState<number>(34);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function loadSports() {
    const result = await getSports();
    if (
      result.result === loadingStateEnum.success &&
      result.data !== undefined
    ) {
      setSports(result.data);
    }
    setSportsState(result.result);
  }

  async function loadTeams(sport: sportType) {
    const result = await getSportsTeams(sport.id);
    if (
      result.result === loadingStateEnum.success &&
      result.data !== undefined
    ) {
      setSportsTeams(result.data);
    }
    setTeamsState(result.result);
  }

  async function loadSportsContent() {
    const result = await getSportsContent(selectedTeam?.teamId);
    if (
      result.result === loadingStateEnum.success &&
      result.sports !== undefined
    ) {
      setSportsPosts(result.sports);
    }
    setLoadingResult(result.result);
  }

  useEffect(() => {
    dispatch(
      safeAreaColorsSlice.actions.setSafeAreaColors({
        top: Colors.darkGray,
        bottom: Colors.white,
      }),
    );
    loadSports();
  }, []);

  useEffect(() => {
    loadSportsContent();
  }, [selectedTeam]);

  const [fontsLoaded] = useFonts({
    BukhariScript: require('../../assets/fonts/BukhariScript.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View
      style={{
        height,
        width,
        backgroundColor: Colors.white,
        overflow: 'hidden',
      }}
    >
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
        {currentBreakPoint <= 0 ? <BackButton to="/" /> : null}
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
      <ScrollView
        style={{
          height: isShowingTeams ? height * 0.1 : sportsSelectHeight,
          width,
        }}
        horizontal
      >
        <View>
          <View style={{ flexDirection: 'row' }}>
            <>
              {sportsState === loadingStateEnum.loading ? (
                <View
                  style={{
                    width: isShowingTeams ? height * 0.05 : height * 0.1,
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
                      <Pressable
                        style={{
                          backgroundColor: Colors.darkGray,
                          borderWidth: selectedSport === undefined ? 3 : 0,
                          borderColor: 'black',
                          borderRadius: 15,
                          alignContent: 'center',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginLeft: 3,
                          marginTop: 3,
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
                            margin: isShowingTeams ? 5 : 10,
                            color: Colors.white,
                            marginBottom: isShowingTeams ? 5 : 10,
                          }}
                        >
                          Highlights
                        </Text>
                      </Pressable>
                      {sports.map(sport => (
                        <Pressable
                          key={`SportButton_${sport.id}`}
                          onLayout={e => {
                            setSportsSelectHeight(e.nativeEvent.layout.height);
                          }}
                          onPress={() => {
                            setSelectedSport(sport);
                            loadTeams(sport);
                            setIsShowingTeams(true);
                            setIsShowingRoster(false);
                          }}
                          style={{
                            backgroundColor: Colors.darkGray,
                            borderWidth: selectedSport?.id === sport.id ? 3 : 0,
                            borderColor: 'black',
                            borderRadius: 15,
                            alignContent: 'center',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: 3,
                            marginTop: 3,
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
                            <SVGXml
                              xml={sport.svgData}
                              width={20}
                              height={20}
                            />
                            <View style={{ marginLeft: 4 }}>
                              <Text
                                style={{
                                  margin: isShowingTeams ? 5 : 10,
                                  marginLeft: 2,
                                  color: Colors.white,
                                  marginBottom:
                                    sport.id === selectedSport?.id &&
                                    selectedTeam !== undefined &&
                                    !isShowingTeams
                                      ? 0
                                      : isShowingTeams
                                      ? 5
                                      : 10,
                                }}
                              >
                                {sport.name}
                              </Text>
                              {sport.id === selectedSport?.id &&
                              selectedTeam !== undefined &&
                              !isShowingTeams ? (
                                <View>
                                  <Text
                                    style={{
                                      color: Colors.white,
                                      marginBottom: 5,
                                      marginLeft: 2,
                                      marginRight: 10,
                                    }}
                                  >
                                    {selectedTeam?.teamName}
                                  </Text>
                                </View>
                              ) : null}
                            </View>
                          </View>
                        </Pressable>
                      ))}
                    </>
                  ) : (
                    <View>
                      <Text>Failed</Text>
                    </View>
                  )}
                </>
              )}
            </>
          </View>
          <View style={{ flexDirection: 'row' }}>
            {isShowingTeams ? (
              <>
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
              </>
            ) : null}
          </View>
        </View>
      </ScrollView>
      {loadingResult === loadingStateEnum.loading ? (
        <View
          style={{
            width,
            height:
              height * 0.8 +
              (isShowingTeams ? 0 : height * 0.1 - sportsSelectHeight),
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
      ) : (
        <>
          {loadingResult === loadingStateEnum.success ? (
            <ScrollView style={{ height: height * 0.8 }}>
              {selectedTeam !== undefined ? (
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
              ) : null}
              {isShowingRoster && selectedTeam !== undefined ? (
                <RosterView
                  teamId={selectedTeam.teamId}
                  width={width}
                  height={height * 0.7}
                />
              ) : (
                <>
                  {sportsPosts.map(item => (
                    <View
                      key={`Sport_${item.fileID}`}
                      style={{ marginTop: height * 0.05 }}
                    >
                      {item.fileType === dataContentTypeOptions.image ? (
                        <View
                          style={{
                            width: width * 0.9,
                            height: height * 0.4,
                            backgroundColor: '#FFFFFF',
                            shadowColor: 'black',
                            shadowOffset: { width: 1, height: 1 },
                            shadowOpacity: 1,
                            shadowRadius: 5,
                            marginLeft: width * 0.05,
                            marginRight: width * 0.05,
                            borderRadius: 15,
                          }}
                        >
                          <Text
                            style={{
                              position: 'absolute',
                              left: 5,
                              bottom: 5,
                              zIndex: 100,
                            }}
                          >
                            {item.caption}
                          </Text>
                          <Image
                            style={{
                              width: width * 0.9,
                              height: height * 0.4,
                              marginLeft: width * 0.05,
                              marginRight: width * 0.05,
                              borderRadius: 15,
                            }}
                            source={{ uri: item.fileID }}
                          />
                        </View>
                      ) : null}
                      {item.fileType === dataContentTypeOptions.video ? (
                        <View
                          style={{
                            width: width * 0.9,
                            height: height * 0.4,
                            backgroundColor: '#FFFFFF',
                            shadowColor: 'black',
                            shadowOffset: { width: 1, height: 1 },
                            shadowOpacity: 1,
                            shadowRadius: 5,
                            marginLeft: width * 0.05,
                            marginRight: width * 0.05,
                            borderRadius: 15,
                          }}
                        >
                          <Text
                            style={{
                              position: 'absolute',
                              left: 5,
                              bottom: 5,
                              zIndex: 100,
                            }}
                          >
                            {item.caption}
                          </Text>
                          <Video
                            useNativeControls
                            source={{ uri: item.fileID }}
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
                            }}
                          />
                        </View>
                      ) : null}
                    </View>
                  ))}
                </>
              )}
            </ScrollView>
          ) : (
            <View>
              <Text>Something went wrong</Text>
            </View>
          )}
        </>
      )}
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
    console.log(result);
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

  const [fontsLoaded] = useFonts({
    BukhariScript: require('../../assets/fonts/BukhariScript.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      {rosterLoadingState === loadingStateEnum.loading ? (
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
      ) : (
        <>
          {rosterLoadingState === loadingStateEnum.success ? (
            <View>
              <View
                style={{ flexDirection: 'row', marginTop: 10, marginBottom: 5 }}
              >
                <Text style={{ marginLeft: 35, width: width * 0.4 }}>
                  Player
                </Text>
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
          ) : (
            <View>
              <Text>Something went wrong loading the roster</Text>
            </View>
          )}
        </>
      )}
    </>
  );
}

function RosterImage({ id }: { id?: string }) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageState, setImageState] = useState<loadingStateEnum>(
    loadingStateEnum.notStarted,
  );
  async function loadData(imageId: string) {
    setImageState(loadingStateEnum.loading);
    const result = await getFileWithShareID(imageId);
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

  return (
    <>
      {imageState === loadingStateEnum.loading ? (
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
      ) : (
        <>
          {imageState === loadingStateEnum.success ? (
            <View>
              <Image
                source={{ uri: imageUrl }}
                style={{ width: 20, height: 20, borderRadius: 10 }}
              />
            </View>
          ) : (
            <>
              {imageState === loadingStateEnum.notStarted ? (
                <View style={{ width: 20, height: 20 }} />
              ) : (
                <View>
                  <Text>Failed</Text>
                </View>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
