import { View, Text, Image, ScrollView, Pressable } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-native'
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../Redux/store'
import { dataContentTypeOptions, loadingStateEnum } from '../types'
import getSportsContent from '../Functions/sports/getSportsContent'
import { safeAreaColorsSlice } from '../Redux/reducers/safeAreaColorsReducer'
import ProgressView from '../UI/ProgressView'
import { ResizeMode, Video } from 'expo-av';
import BackButton from '../UI/BackButton'
import create_UUID from '../Functions/Ultility/CreateUUID'
import { getSports, getSportsTeams } from '../Functions/sports/sportsFunctions'

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
    const result = await getSportsContent()
    if (result.result === loadingStateEnum.success && result.sports !== undefined) {
      setSportsPosts(result.sports)
    }
    setLoadingResult(result.result)
  }

  useEffect(() => {
    dispatch(safeAreaColorsSlice.actions.setSafeAreaColors({top: "#444444", bottom: "white"}))
    loadSportsContent()
    loadSports()
  }, [])

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
    <View style={{height: height, width: width, backgroundColor: "white", overflow: "hidden"}}>
      <View style={{height: height * 0.1, width: width, backgroundColor: '#444444', alignContent: "center", alignItems: "center", justifyContent: "center"}}>
        { (currentBreakPoint <= 0) ?
          <BackButton to='/'/>:null
        }
        <Text style={{fontFamily: "BukhariScript"}}>Sports</Text>
      </View>
      <ScrollView style={{height: height * 0.1, width: width}} horizontal={true}>
        <View>
          <View style={{flexDirection: "row"}}>
            {sports.map((sport) => (
              <Pressable key={`SportButton_${sport.id}_${create_UUID()}`} onPress={() => {setSelectedSport(sport); loadTeams(sport); setIsShowingTeams(true)}} style={{backgroundColor:  "#444444", borderWidth: (selectedSport?.id === sport.id) ? 3:0, borderColor: "black", borderRadius: 15, alignContent: "center", alignItems: "center", justifyContent: "center", marginLeft: 3, marginTop: 3}}>
                <Text style={{margin: isShowingTeams ? 5:10, color: "white", marginBottom: (sport.id === selectedSport?.id && selectedTeam !== undefined && !isShowingTeams) ? 0:isShowingTeams ? 5:10}}>{sport.name}</Text>
                { (sport.id === selectedSport?.id && selectedTeam !== undefined && !isShowingTeams) ?
                  <View>
                    <Text style={{color: "white", marginBottom: 5, marginLeft: 10, marginRight: 10}}>{selectedTeam?.teamName}</Text>
                  </View>:null
                }
              </Pressable>
            ))}
          </View>
          <View style={{flexDirection: "row"}}>
            { isShowingTeams ? 
              <>
              {sportsTeams.map((team) => (
                <Pressable key={`SportTeam_${team.teamID}_${create_UUID()}`} onPress={() => {setSelectedTeam(team); setIsShowingTeams(false)}} style={{backgroundColor: "#444444", borderRadius: 15, alignContent: "center", alignItems: "center", justifyContent: "center", marginLeft: 3, marginTop: 3}}>
                  <Text style={{margin: 5, color: "white"}}>{team.teamName}</Text>
                </Pressable>
              ))}
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
              { sportsPosts.map((item) => (
                <View key={`Sport_${item.fileID}_${create_UUID()}`} style={{marginTop: height * 0.05}}>
                { (item.fileType === dataContentTypeOptions.image) ?
                  <Image style={{width: width * 0.9, height: height * 0.4, marginLeft: width * 0.05, marginRight: width * 0.05}} source={{uri: item.fileID}}/>:null
                }
                { (item.fileType === dataContentTypeOptions.video) ?
                  <Video useNativeControls source={{uri: item.fileID}} resizeMode={ResizeMode.COVER} style={{width: width * 0.9, height: height * 0.4, alignSelf: 'stretch', marginLeft: width * 0.05, marginRight: width * 0.05}} videoStyle={{width: width * 0.9, height: height * 0.4}}/>:null
                }
                </View>
              ))
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