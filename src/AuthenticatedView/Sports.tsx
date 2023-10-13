import { View, Text, Image, ScrollView, Pressable } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-native'
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../Redux/store'
import { Colors, dataContentTypeOptions, loadingStateEnum } from '../types'
import getSportsContent from '../Functions/sports/getSportsContent'
import { safeAreaColorsSlice } from '../Redux/reducers/safeAreaColorsReducer'
import ProgressView from '../UI/ProgressView'
import { ResizeMode, Video } from 'expo-av';
import BackButton from '../UI/BackButton'
import create_UUID from '../Functions/Ultility/CreateUUID'
import { getSports, getSportsTeams } from '../Functions/sports/sportsFunctions'
import getRoster from '../Functions/sports/getRoster';
import { FlatList } from 'react-native-gesture-handler';

export default function Sports() {
  const {width, height, currentBreakPoint} = useSelector((state: RootState) => state.dimentions)
  const [sportsPosts, setSportsPosts] = useState<sportPost[]>([])
  const [loadingResult, setLoadingResult] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const [sportsState, setSportsState] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const [teamsState, setTeamsState] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const [selectedSport, setSelectedSport] = useState<sportType | undefined>(undefined)
  const [selectedTeam, setSelectedTeam] = useState<sportTeamType | undefined>(undefined)
  const [isShowingTeams, setIsShowingTeams] = useState<boolean>(false)
  const [sports, setSports] = useState<sportType[]>([])
  const [isShowingRoster, setIsShowingRoster] = useState<boolean>(false)
  const [sportsTeams, setSportsTeams] = useState<sportTeamType[]>([])
  const dispatch = useDispatch()
  const navigate = useNavigate()

  async function loadSports() {
    const result = await getSports()
    if (result.result === loadingStateEnum.success && result.data !== undefined) {
      setSports(result.data)
    }
    setSportsState(result.result)
  }

  async function loadTeams(sport: sportType) {
    const result = await getSportsTeams(sport.id)
    if (result.result === loadingStateEnum.success && result.data !== undefined) {
      setSportsTeams(result.data)
    }
    setTeamsState(result.result)
  }

  async function loadSportsContent() {
    const result = await getSportsContent(selectedTeam?.teamId)
    if (result.result === loadingStateEnum.success && result.sports !== undefined) {
      setSportsPosts(result.sports)
    }
    setLoadingResult(result.result)
  }

  useEffect(() => {
    dispatch(safeAreaColorsSlice.actions.setSafeAreaColors({top: Colors.darkGray, bottom: Colors.white}))
    loadSports()
  }, [])

  useEffect(() => {
    loadSportsContent()
  }, [selectedTeam])

  const [fontsLoaded] = useFonts({
    'BukhariScript': require('../../assets/fonts/BukhariScript.ttf'),
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
    <View style={{height: height, width: width, backgroundColor: Colors.white, overflow: "hidden"}}>
      <View style={{height: height * 0.1, width: width, backgroundColor: Colors.darkGray, alignContent: "center", alignItems: "center", justifyContent: "center"}}>
        { (currentBreakPoint <= 0) ?
          <BackButton to='/'/>:null
        }
        <Text style={{fontFamily: "BukhariScript"}}>Sports</Text>
      </View>
      <ScrollView style={{height: height * 0.1, width: width}} horizontal={true}>
        <View>
          <View style={{flexDirection: "row"}}>
            <>
              { (sportsState === loadingStateEnum.loading) ?
                <View style={{width: (isShowingTeams) ? height * 0.05:height * 0.1, alignContent: "center", alignItems: "center", justifyContent: "center"}}>
                  <ProgressView width={15} height={15}/>
                </View>:
                <>
                  { (sportsState === loadingStateEnum.success) ?
                    <>
                      <Pressable style={{backgroundColor:  Colors.darkGray, borderWidth: (selectedSport === undefined) ? 3:0, borderColor: "black", borderRadius: 15, alignContent: "center", alignItems: "center", justifyContent: "center", marginLeft: 3, marginTop: 3}} onPress={() => {setSelectedTeam(undefined); setSelectedSport(undefined); setIsShowingRoster(false)}}>
                        <Text style={{margin: isShowingTeams ? 5:10, color: Colors.white, marginBottom: isShowingTeams ? 5:10}}>{"Highlights"}</Text>
                      </Pressable>
                      {sports.map((sport) => (
                        <Pressable key={`SportButton_${sport.id}_${create_UUID()}`} onPress={() => {setSelectedSport(sport); loadTeams(sport); setIsShowingTeams(true); setIsShowingRoster(false)}} style={{backgroundColor:  Colors.darkGray, borderWidth: (selectedSport?.id === sport.id) ? 3:0, borderColor: "black", borderRadius: 15, alignContent: "center", alignItems: "center", justifyContent: "center", marginLeft: 3, marginTop: 3}}>
                          <Text style={{margin: isShowingTeams ? 5:10, color: Colors.white, marginBottom: (sport.id === selectedSport?.id && selectedTeam !== undefined && !isShowingTeams) ? 0:isShowingTeams ? 5:10}}>{sport.name}</Text>
                          { (sport.id === selectedSport?.id && selectedTeam !== undefined && !isShowingTeams) ?
                            <View>
                              <Text style={{color: Colors.white, marginBottom: 5, marginLeft: 10, marginRight: 10}}>{selectedTeam?.teamName}</Text>
                            </View>:null
                          }
                        </Pressable>
                      ))}
                    </>:
                    <View>
                      <Text>Failed</Text>
                    </View>
                  }
                </>
              }
            </>
          </View>
          <View style={{flexDirection: "row"}}>
            { isShowingTeams ? 
              <>
                { (sportsState === loadingStateEnum.loading) ?
                  <View style={{width: width, height: height * 0.05, alignContent: "center", alignItems: 'center', justifyContent: "center"}}>
                    <ProgressView width={15} height={15} />
                  </View>:
                  <>
                    { (sportsState === loadingStateEnum.success) ?
                      <>
                        {sportsTeams.map((team) => (
                          <Pressable key={`SportTeam_${team.teamId}_${create_UUID()}`} onPress={() => {setSelectedTeam(team); setIsShowingTeams(false); setIsShowingRoster(false)}} style={{backgroundColor: Colors.darkGray, borderRadius: 15, alignContent: "center", alignItems: "center", justifyContent: "center", marginLeft: 3, marginTop: 3}}>
                            <Text style={{margin: 5, color: Colors.white}}>{team.teamName}</Text>
                          </Pressable>
                        ))}
                      </>:
                      <Text>Failed to load Sports</Text>
                    }
                  </>
                }
              </>:null
            }
          </View>
        </View>
      </ScrollView>
      {(loadingResult === loadingStateEnum.loading) ?
        <View style={{width: width, height: height * 0.7, alignContent: "center", alignItems: "center", justifyContent: "center"}}>
          <ProgressView width={(width < height) ? width * 0.25:height * 0.25} height={(width < height) ? width * 0.5:height * 0.5}/>
          <Text>Loading</Text>
        </View>:
        <> 
          {(loadingResult === loadingStateEnum.success) ?
            <ScrollView style={{height: height * 0.7}}>
              { (selectedTeam !== undefined) ?
                <Pressable onPress={() => setIsShowingRoster(true)}>
                  <Text>Roster</Text>
                </Pressable>:null
              }
              { (isShowingRoster && selectedTeam !== undefined) ?
                <RosterView teamId={selectedTeam.teamId} width={width} height={height * 0.7} />:
                <>
                  { sportsPosts.map((item) => (
                    <View key={`Sport_${item.fileID}_${create_UUID()}`} style={{marginTop: height * 0.05}}>
                    { (item.fileType === dataContentTypeOptions.image) ?
                      <View style={{width: width * 0.9, height: height * 0.4, backgroundColor: "#FFFFFF", shadowColor: "black", shadowOffset: {width: 1, height: 1}, shadowOpacity: 1, shadowRadius: 5, marginLeft: width * 0.05, marginRight: width * 0.05, borderRadius: 15}}>
                        <Text style={{position: "absolute", left: 5, bottom: 5, zIndex: 100}}>{item.caption}</Text>
                        <Image style={{width: width * 0.9, height: height * 0.4, marginLeft: width * 0.05, marginRight: width * 0.05, borderRadius: 15}} source={{uri: item.fileID}}/>
                      </View>:null
                    }
                    { (item.fileType === dataContentTypeOptions.video) ?
                      <View style={{width: width * 0.9, height: height * 0.4, backgroundColor: "#FFFFFF", shadowColor: "black", shadowOffset: {width: 1, height: 1}, shadowOpacity: 1, shadowRadius: 5, marginLeft: width * 0.05, marginRight: width * 0.05, borderRadius: 15}}>
                        <Text style={{position: "absolute", left: 5, bottom: 5, zIndex: 100}}>{item.caption}</Text>
                        <Video useNativeControls source={{uri: item.fileID}} resizeMode={ResizeMode.COVER} style={{width: width * 0.9, height: height * 0.4, alignSelf: 'stretch', borderRadius: 15}} videoStyle={{width: width * 0.9, height: height * 0.4}}/>
                      </View>:null
                    }
                    </View>
                  ))}
                </>
              }
            </ScrollView>:
            <View>  
              <Text>Something went wrong</Text>
            </View>
          }
        </>
      }
    </View>
  )
}

function RosterView({teamId, width, height}:{teamId: string, width: number, height: number}) {
  const [rosterLoadingState, setRosterLoadingState] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const [roster, setRoster] = useState<rosterType[]>([])
  
  async function loadRoster() {
    const result = await getRoster(teamId)
    if (result.result === loadingStateEnum.success && result.data !== undefined) {
      setRoster(result.data)
    }
    setRosterLoadingState(result.result)
  }

  useEffect(() => {
    loadRoster()
  }, [])

  return (
    <>
      { (rosterLoadingState === loadingStateEnum.loading) ?
        <View style={{width: width, height: height, alignContent: "center", justifyContent: "center", alignItems: "center"}}>
          <ProgressView width={width * 0.1} height={height * 0.1}/>
          <Text>Loading</Text>
        </View>:
        <>
          { (rosterLoadingState === loadingStateEnum.success) ?
            <View>
              <FlatList 
                data={roster}
                renderItem={(item) => (
                  <View style={{backgroundColor: "#FFFFFF", shadowColor: "black", shadowOffset: {width: 1, height: 1}, shadowOpacity: 1, shadowRadius: 5}}>
                    <View style={{flexDirection: "row"}}>
                      <Text>{item.item.name}</Text>
                      {(item.item.playerNumber !== undefined) ?
                        <Text>{item.item.playerNumber}</Text>:null
                      }
                      {(item.item.position !== undefined) ?
                        <Text>{item.item.playerNumber}</Text>:null
                      }
                      {(item.item.imageShareId !== undefined) ?
                        <Image source={{uri: item.item.playerNumber}} style={{width: 20, height: 20}}/>:null
                      }
                    </View> 
                  </View>
                )}
              />
            </View>:
            <View>
              <Text>Something went wrong loading the roster</Text>
            </View>
          }
        </>
      }
    </>
  )
}