import { View, Text, Pressable, TextInput, ViewStyle, Platform } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { Colors, loadingStateEnum } from '../types'
import { useDispatch, useSelector } from 'react-redux'
import store, { RootState } from '../Redux/store'
import ProgressView from '../UI/ProgressView'
import { FlatList } from 'react-native-gesture-handler'
import { useNavigate } from 'react-router-native'
import { SearchIcon } from '../UI/Icons/Icons'
import { studentSearchSlice } from '../Redux/reducers/studentSearchReducer'
import BackButton from '../UI/BackButton'
import create_UUID from '../Functions/Ultility/CreateUUID'
import getUsers from '../Functions/getUsers'
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

export default function Students() {
  const {height, width, currentBreakPoint} = useSelector((state: RootState) => state.dimentions)
  const {usersState, users, nextLink} = useSelector((state: RootState) => state.studentSearch)
  
  const navigate = useNavigate()
  const dispatch = useDispatch()

  async function loadUsers() {
    getUsers()
  }

  useEffect(() => {
    loadUsers()
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
    <>
      { (usersState === loadingStateEnum.loading) ?
        <View style={{width: width, height: height, backgroundColor: (currentBreakPoint === 0) ? Colors.maroon:"#FFFFFF", alignContent: "center", alignItems: "center", justifyContent: "center"}}>
          <ProgressView width={14} height={14} />
          <Text>Loading</Text>
        </View>:
        <>
          { (usersState === loadingStateEnum.success) ?
            <View style={{width: width, height: height, backgroundColor: (currentBreakPoint === 0) ? Colors.maroon:"#FFFFFF"}}>
              <View style={{height: height * 0.15, width: width, alignContent: "center", alignItems: "center", justifyContent: "center", backgroundColor: Colors.darkGray}}>
                <BackButton to='/profile'/>
                <Text style={{fontFamily: 'BukhariScript'}}>Students</Text>
              </View>
              <SearchBox getUsers={(e) => {
                if (e !== "") {
                  getUsers(undefined, e)
                  dispatch(studentSearchSlice.actions.setNextLink(undefined))
                } else {
                  getUsers()
                }
              }}/>
              <View style={{height: height * 0.8}}>
                <FlatList 
                  key={`FlatList_${create_UUID()}`}
                  data={users}
                  renderItem={(user) => (
                    <View key={`StudentBlock_${user.item.id}_${create_UUID()}`} style={{height: 150, width: 150, marginTop: 25, marginBottom: 25, marginLeft: "auto", marginRight: "auto", backgroundColor: "#FFFFFF", shadowColor: "black", shadowOffset: {width: 1, height: 1}, shadowOpacity: 1, shadowRadius: 5, borderRadius: 15}}>
                      <View style={{margin: 10}}>
                        <Text>{user.item.name}</Text>
                        { (user.item.student) ?
                          <Text>{user.item.grade}</Text>:null
                        }
                      </View>
                    </View>
                  )}
                  numColumns={(Math.floor(width/200) !== 0) ? Math.floor(width/200):1}
                  onEndReached={() => {
                    if (nextLink !== undefined) {
                      getUsers(nextLink)
                    }
                  }}
                />
              </View>
            </View>:
            <View style={{width: width, height: height, backgroundColor: (currentBreakPoint === 0) ? Colors.maroon:"#FFFFFF"}}>
              <Pressable onPress={() => {navigate("/")}}>
                <Text>Back</Text>
              </Pressable>
              <Text>Something went wrong</Text>
            </View>
          }
        </> 
      }
    </>
  )
}

function SearchBox({getUsers}:{getUsers: (item: string) => void}) {
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  const {searchText} = useSelector((state: RootState) => state.studentSearch)
  const [isOverflowing, setIsOverflowing] = useState<boolean>(false)
  const style: ViewStyle = (Platform.OS === "web") ? {outlineStyle: "none"}:{}
  const [mounted, setMounted] = useState<boolean>(false)
  const dispatch = useDispatch()

  useEffect(() => {
    if (mounted) {
      const searchValueSave = searchText
      setTimeout(() => {
        if (store.getState().studentSearch.searchText === searchValueSave) {
          getUsers(store.getState().studentSearch.searchText)
        }
      }, 1500)
    } else {
      setMounted(true)
    }
  }, [searchText])

  return (
    <View key={"Search_View_Top"} style={{width: width, alignContent: "center", alignItems: "center", justifyContent: "center", position: "absolute", top: height * 0.15 - 19, zIndex: 2}}>
      <View key={"Search_View_Mid"} style={{width: width * 0.8, shadowColor: "black", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 10, borderRadius: 25, flexDirection: "row", backgroundColor: Colors.white}}>
        { isOverflowing ?
          null:
          <View key={"Search_View_Search_Icon"} style={{width: 20, height: 40, alignContent: "center", alignItems: "center", justifyContent: "center", marginLeft: 10}}>
            <SearchIcon key={"Search_Icon"} width={15} height={15}/>
          </View>
        }
        <View key={"Search_View_Input"}>
          <TextInput key={"Search_TextInput"} placeholder='Search' placeholderTextColor={"black"} value={searchText} 
          onChangeText={(e) => {dispatch(studentSearchSlice.actions.setStudentSearch(e))}} style={[{width: isOverflowing ? width * 0.8 - 20:width * 0.8 - 50, height: 20, margin: 10, borderWidth: 0}, style]} enterKeyHint='search' inputMode='search'/>
          <View
            style={{height: 0, alignSelf: 'flex-start', overflow: "hidden"}}
            onLayout={e => {
              if (e.nativeEvent.layout.width > width * 0.8 - 20) {
                setIsOverflowing(true)
              } else {
                setIsOverflowing(false)
              }
            }} key={"Search_View_Text"}>
            <Text style={{color: 'white'}}>{searchText}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
