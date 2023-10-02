import { View, Text, ScrollView, TextInput, Platform, Pressable, ViewStyle } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-native'
import { getResources, getResourcesSearch } from '../Functions/getResources'
import { useDispatch, useSelector } from 'react-redux'
import store, { RootState } from '../Redux/store'
import { AddIcon, CloseIcon, SearchIcon } from '../UI/Icons/Icons'
import WebView from 'react-native-webview'
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import WebViewCross from '../UI/WebViewCross'
import { safeAreaColorsSlice } from '../Redux/reducers/safeAreaColorsReducer'
import BackButton from '../UI/BackButton'
import { loadingStateEnum, resourceMode } from '../types'
import ProgressView from '../UI/ProgressView'
import { resourcesSlice } from '../Redux/reducers/resourcesReducer'
import create_UUID from '../Functions/Ultility/CreateUUID'
import callMsGraph from '../Functions/Ultility/microsoftAssets'

//Resources
// -> Sports
// -> Advancement Board
// -> Schedule Annoucments
// -> School Events
// -> Annoucments

export default function Resources() {
  const {height, width, currentBreakPoint} = useSelector((state: RootState) => state.dimentions)
  const {resources, loadingState, searchValue, selectedResourceMode} = useSelector((state: RootState) => state.resources)
  const {siteId} = useSelector((state: RootState) => state.paulyList)
  const [isHoverPicker, setIsHoverPicker] = useState<boolean>(false)
  const isGovernmentMode = useSelector((state: RootState) => state.isGovernmentMode)
  const [isShowingCategoryView, setIsShowingCategoryView] = useState<boolean>(false)
  const [selectedPost, setSelectedPost] = useState<undefined | {teamId: string, conversationId: string, messageId: string}>(undefined)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  async function loadData() {
    await getResources(selectedResourceMode)
  }

  useEffect(() => {
    dispatch(safeAreaColorsSlice.actions.setSafeAreaColors({top: "#444444", bottom: "white"}))
  }, [])

  useEffect(() => {
    if (siteId !== "") {
      loadData()
    }
  }, [siteId, selectedResourceMode])


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
      <View style={{height: height, width: width}}>
        <View style={{height: height * 0.1, width: width, backgroundColor: "#444444", alignContent: "center", alignItems: "center", justifyContent: "center"}}>
          { (currentBreakPoint <= 0) ?
            <BackButton to='/'/>:null
          }
          <Text style={{fontFamily: "BukhariScript"}}>Resources</Text>
        </View>
        <SearchBox />
        <View style={{width: width, height: height * 0.05, backgroundColor: "#ededed"}}/>
        <ScrollView style={{height: (isHoverPicker) ? height * 0.75:height * 0.8, backgroundColor: "#ededed"}}>
          <>
            { (loadingState === loadingStateEnum.loading) ?
              <View style={{width: width, height: (isHoverPicker) ? height * 0.75:height * 0.8, alignContent: "center", alignItems: "center", justifyContent: "center"}}>
                <ProgressView width={(width < height) ? width * 0.05:height * 0.05} height={(width < height) ? width * 0.05:height * 0.05}/>
                <Text>Loading</Text>
              </View>:
              <>
                { (loadingState === loadingStateEnum.success) ?
                  <>
                    {resources.map((resource) => (
                      <>
                        { isGovernmentMode ?
                          <Pressable onPress={() => {setIsShowingCategoryView(true); setSelectedPost({teamId: resource.teamId, conversationId: resource.conversationId, messageId: resource.id})}} key={"Resource_"+resource.id+"_"+create_UUID()} style={{width: width * 0.8, marginLeft: "auto", marginRight: "auto", backgroundColor: "white", borderRadius: 15, marginBottom: height * 0.01}}>
                            <WebViewCross width={width * 0.8 - 20} html={(resource.html) ? resource.body:`<div><div>${resource.body}</div></div>`}/>
                          </Pressable>:
                          <View key={"Resource_"+resource.id+"_"+create_UUID()} style={{width: width * 0.8, marginLeft: "auto", marginRight: "auto", backgroundColor: "white", borderRadius: 15, marginBottom: height * 0.01}}>
                            <WebViewCross width={width * 0.8 - 20} html={(resource.html) ? resource.body:`<div><div>${resource.body}</div></div>`}/>
                          </View>
                        }
                      </>
                    ))}
                  </>:<Text>Failed</Text>
                }
              </>
            }
          </>
        </ScrollView>
        <Pressable style={{height: (isHoverPicker) ? height * 0.1:height * 0.05}} onHoverIn={() => {setIsHoverPicker(true)}} onHoverOut={() => {setIsHoverPicker(false)}}>
          <ScrollView horizontal={true} style={{height: (isHoverPicker) ? height * 0.1:height * 0.05, width: width, backgroundColor: "white"}} showsHorizontalScrollIndicator={false}>
            <PickerPiece key={"Button_"+create_UUID()} text='Home' item={resourceMode.home} isHoverPicker={isHoverPicker} setIsHoverPicker={setIsHoverPicker}/>
            <PickerPiece key={"Button_"+create_UUID()} text='Sports' item={resourceMode.sports} isHoverPicker={isHoverPicker} setIsHoverPicker={setIsHoverPicker}/>
            <PickerPiece key={"Button_"+create_UUID()} text='Advancement' item={resourceMode.advancement} isHoverPicker={isHoverPicker} setIsHoverPicker={setIsHoverPicker}/>
            <PickerPiece key={"Button_"+create_UUID()} text='School Events' item={resourceMode.schoolEvents} isHoverPicker={isHoverPicker} setIsHoverPicker={setIsHoverPicker}/>
            <PickerPiece key={"Button_"+create_UUID()} text='Annoucments' item={resourceMode.annoucments} isHoverPicker={isHoverPicker} setIsHoverPicker={setIsHoverPicker}/>
            <PickerPiece key={"Button_"+create_UUID()} text='Fitness' item={resourceMode.fitness} isHoverPicker={isHoverPicker} setIsHoverPicker={setIsHoverPicker}/>
            <PickerPiece key={"Button_"+create_UUID()} text='Files' item={resourceMode.files} isHoverPicker={isHoverPicker} setIsHoverPicker={setIsHoverPicker}/>
          </ScrollView>
        </Pressable>
      </View>
      { (isGovernmentMode && isShowingCategoryView && selectedPost !== undefined) ?
        <GovernmentCategoryView teamId={selectedPost.teamId} channelId={selectedPost.conversationId} messageId={selectedPost.messageId} onClose={() => setIsShowingCategoryView(false)}/>:null
      }
    </>
  )
}

function GovernmentCategoryView({teamId, channelId, messageId, onClose}:{teamId: string, channelId: string, messageId: string, onClose: () => void}) {
  const {height, width} = useSelector((state: RootState) => state.dimentions)
  const [categoryState, setCategoryState] = useState<loadingStateEnum>(loadingStateEnum.notStarted)
  const [selectedCategory, setSelectedCategory] = useState<resourceMode>(resourceMode.home)
  async function addCategory() {
    setCategoryState(loadingStateEnum.loading)
    const data = 
    {"singleValueExtendedProperties":[
      {
        "id":store.getState().paulyList.resourceExtensionId,
        "value":(selectedCategory === resourceMode.sports) ? "sports":(selectedCategory === resourceMode.advancement) ? "advancement":(selectedCategory === resourceMode.schoolEvents) ? "schoolEvents":(selectedCategory === resourceMode.annoucments) ? "annoucments":(selectedCategory === resourceMode.fitness) ? "fitness":"files"
      }
    ]}
    const result = await callMsGraph(`https://graph.microsoft.com/v1.0/teams/${teamId}/channels/${channelId}/messages/${messageId}`, "PATCH", undefined, JSON.stringify(data))
    if (result.ok) {
      setCategoryState(loadingStateEnum.success)
    } else {
      setCategoryState(loadingStateEnum.failed)
    }
  }
  return (
    <View style={{height: height * 0.9, width: width * 0.8, position: "absolute", top: height * 0.05, left: width * 0.1, backgroundColor: "#FFFFFF", shadowColor: "black", shadowOffset: {width: 1, height: 1}, shadowOpacity: 1, shadowRadius: 5, borderRadius: 15}}>
      <Pressable onPress={() => onClose()}>
        <CloseIcon width={12} height={12}/>
      </Pressable>
      <View style={{width: width * 0.8, alignContent: "center", alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF"}}>
        <Text>Categories</Text>
      </View>
      <Pressable onPress={() => setSelectedCategory(resourceMode.sports)} style={{marginLeft: width * 0.05, width: width * 0.7, height: height * 0.05,  alignContent: "center", alignItems: "center", justifyContent: "center", backgroundColor: (selectedCategory === resourceMode.sports) ? "blue":"#FFFFFF", shadowColor: "black", shadowOffset: {width: 1, height: 1}, shadowOpacity: 1, shadowRadius: 5, borderRadius: 15}}>
        <Text>Sports</Text>
      </Pressable>
      <Pressable onPress={() => setSelectedCategory(resourceMode.advancement)} style={{marginLeft: width * 0.05, marginTop: height * 0.02, width: width * 0.7, height: height * 0.05, alignContent: "center", alignItems: "center", justifyContent: "center", backgroundColor: (selectedCategory === resourceMode.advancement) ? "blue":"#FFFFFF", shadowColor: "black", shadowOffset: {width: 1, height: 1}, shadowOpacity: 1, shadowRadius: 5, borderRadius: 15}}>
        <Text>Advancement</Text>
      </Pressable>
      <Pressable onPress={() => setSelectedCategory(resourceMode.schoolEvents)} style={{marginLeft: width * 0.05, marginTop: height * 0.02, width: width * 0.7, height: height * 0.05, alignContent: "center", alignItems: "center", justifyContent: "center", backgroundColor: (selectedCategory === resourceMode.schoolEvents) ? "blue":"#FFFFFF", shadowColor: "black", shadowOffset: {width: 1, height: 1}, shadowOpacity: 1, shadowRadius: 5, borderRadius: 15}}>
        <Text>School Events</Text>
      </Pressable>
      <Pressable onPress={() => setSelectedCategory(resourceMode.annoucments)} style={{marginLeft: width * 0.05, marginTop: height * 0.02, width: width * 0.7, height: height * 0.05, alignContent: "center", alignItems: "center", justifyContent: "center", backgroundColor: (selectedCategory === resourceMode.annoucments) ? "blue":"#FFFFFF", shadowColor: "black", shadowOffset: {width: 1, height: 1}, shadowOpacity: 1, shadowRadius: 5, borderRadius: 15}}>
        <Text>Annoucments</Text>
      </Pressable>
      <Pressable onPress={() => setSelectedCategory(resourceMode.fitness)} style={{marginLeft: width * 0.05, marginTop: height * 0.02, width: width * 0.7, height: height * 0.05, alignContent: "center", alignItems: "center", justifyContent: "center", backgroundColor: (selectedCategory === resourceMode.fitness) ? "blue":"#FFFFFF", shadowColor: "black", shadowOffset: {width: 1, height: 1}, shadowOpacity: 1, shadowRadius: 5, borderRadius: 15}}>
        <Text>Fitness</Text>
      </Pressable>
      <Pressable onPress={() => setSelectedCategory(resourceMode.files)} style={{marginLeft: width * 0.05, marginTop: height * 0.02, width: width * 0.7, height: height * 0.05, alignContent: "center", alignItems: "center", justifyContent: "center", backgroundColor: (selectedCategory === resourceMode.files) ? "blue":"#FFFFFF", shadowColor: "black", shadowOffset: {width: 1, height: 1}, shadowOpacity: 1, shadowRadius: 5, borderRadius: 15}}>
        <Text>Files</Text>
      </Pressable>
      <Pressable onPress={() => {addCategory()}} style={{marginLeft: width * 0.05, marginTop: height * 0.02, width: width * 0.7, height: height * 0.05, alignContent: "center", alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF", shadowColor: "black", shadowOffset: {width: 1, height: 1}, shadowOpacity: 1, shadowRadius: 5, borderRadius: 15}}>
        <Text>{(categoryState === loadingStateEnum.notStarted) ? "Confirm":(categoryState === loadingStateEnum.loading) ? "Loading":(categoryState === loadingStateEnum.success) ? "Success":"Failed"}</Text>
      </Pressable>
    </View>
  )
}

function PickerPiece({text, item, isHoverPicker, setIsHoverPicker}:{text: string, item: resourceMode, isHoverPicker: boolean, setIsHoverPicker: (item: boolean) => void}) {
  const {height, width, currentBreakPoint} = useSelector((state: RootState) => state.dimentions)
  const {selectedResourceMode} = useSelector((state: RootState) => state.resources)
  const [isSelected, setIsSelected] = useState<boolean>(false)
  const dispatch = useDispatch()
  return (
    <Pressable onPress={() => {dispatch(resourcesSlice.actions.setSelectedResourceMode(item))}} onHoverIn={() => {setIsHoverPicker(true); setIsSelected(true)}} onHoverOut={() => setIsSelected(false)} style={{height: (isHoverPicker) ? height * 0.1:height * 0.05, width: (isSelected) ?  ((currentBreakPoint >= 2) ? (width*0.3):width * 0.6):((currentBreakPoint >= 2) ? (width*0.2):width * 0.4), alignContent: "center", alignItems: "center", justifyContent: "center", backgroundColor: (item !== selectedResourceMode) ? "#FFFFFF":"blue"}}>
      <View style={{height: (isHoverPicker) ? height * 0.06:height * 0.03, width: (isSelected) ? ((currentBreakPoint >= 2) ? (width*0.28):width * 0.46):((currentBreakPoint >= 2) ? (width*0.18):width * 0.36), marginLeft: (currentBreakPoint >= 2) ? (width*0.01):width*0.02, marginRight: (currentBreakPoint >= 2) ? (width*0.01):width*0.02, backgroundColor: "#444444", borderRadius: 15, alignContent: "center", alignItems: "center", justifyContent: "center"}}>
        <Text style={{color: "white"}}>{text}</Text>
      </View>
    </Pressable>
  )
}

function SearchBox() {
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  const {searchValue} = useSelector((state: RootState) => state.resources)
  const [isOverflowing, setIsOverflowing] = useState<boolean>(false)
  const style: ViewStyle = (Platform.OS === "web") ? {outlineStyle: "none"}:{}
  const dispatch = useDispatch()
  const [mounted, setMounted] = useState<boolean>(false)

  async function getSearchData() {
    const result = await getResourcesSearch(searchValue)
  }

  useEffect(() => {
    if (mounted) {
      const searchValueSave = searchValue
      setTimeout(() => {
        if (store.getState().resources.searchValue === searchValueSave) {
          getSearchData()
          console.log("ran")
        } else {
          console.log("Not ran")
        }
      }, 1500)
    } else {
      setMounted(true)
    }
  }, [searchValue])

  return (
    <View key={"Search_View_Top"} style={{width: width, alignContent: "center", alignItems: "center", justifyContent: "center", position: "absolute", top: height * 0.1 - 19, zIndex: 2}}>
      <View key={"Search_View_Mid"} style={{width: width * 0.8, shadowColor: "black", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 10, borderRadius: 25, flexDirection: "row", backgroundColor: "white"}}>
        { isOverflowing ?
          null:
          <View key={"Search_View_Search_Icon"} style={{width: 20, height: 40, alignContent: "center", alignItems: "center", justifyContent: "center", marginLeft: 10}}>
            <SearchIcon key={"Search_Icon"} width={15} height={15}/>
          </View>
        }
        <View key={"Search_View_Input"}>
          <TextInput key={"Search_TextInput"} placeholder='Search' placeholderTextColor={"black"} value={searchValue} onChangeText={(e) => {dispatch(resourcesSlice.actions.setSearchValue(e))}} style={[{width: isOverflowing ? width * 0.8 - 20:width * 0.8 - 50, height: 20, margin: 10, borderWidth: 0}, style]} enterKeyHint='search' inputMode='search'/>
          <View
            style={{height: 0, alignSelf: 'flex-start', overflow: "hidden"}}
            onLayout={e => {
              if (e.nativeEvent.layout.width > width * 0.8 - 20) {
                setIsOverflowing(true)
              } else {
                setIsOverflowing(false)
              }
            }} key={"Search_View_Text"}>
            <Text style={{color: 'white'}}>{searchValue}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
