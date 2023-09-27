import { View, Text, ScrollView, TextInput, Platform, Pressable, ViewStyle } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-native'
import { getResourceFromJson, getResources } from '../Functions/getResources'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../Redux/store'
import { SearchIcon } from '../UI/Icons/Icons'
import WebView from 'react-native-webview'
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import WebViewCross from '../UI/WebViewCross'
import { safeAreaColorsSlice } from '../Redux/reducers/safeAreaColorsReducer'
import BackButton from '../UI/BackButton'
import { loadingStateEnum } from '../types'
import ProgressView from '../UI/ProgressView'

//Resources
// -> Sports
// -> Advancement Board
// -> Schedule Annoucments
// -> School Events
// -> Annoucments

enum resourceMode {
  home,
  sports,
  advancement,
  schoolEvents,
  annoucments,
  fitness,
  files
}

export default function Resources() {
  const {height, width, currentBreakPoint} = useSelector((state: RootState) => state.dimentions)
  const resources = useSelector((state: RootState) => state.resources)
  const [selectedResourceMode, setSelectedResourceMode] = useState<resourceMode>(resourceMode.home)
  const [isHoverPicker, setIsHoverPicker] = useState<boolean>(false)
  const [searchValue, setSearchValue] = useState<string>("")
  const navigate = useNavigate()
  const dispatch = useDispatch()

  async function loadData() {
    await getResources()
  }
  useEffect(() => {
    dispatch(safeAreaColorsSlice.actions.setSafeAreaColors({top: "#444444", bottom: "white"}))
    loadData()
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
    <View style={{height: height, width: width}}>
      <View style={{height: height * 0.1, width: width, backgroundColor: "#444444", alignContent: "center", alignItems: "center", justifyContent: "center"}}>
        { (currentBreakPoint <= 0) ?
          <BackButton to='/'/>:null
        }
        <Text style={{fontFamily: "BukhariScript"}}>Resources</Text>
      </View>
      <SearchBox searchValue={searchValue} setSearchValue={setSearchValue}/>
      <View style={{width: width, height: height * 0.05, backgroundColor: "#ededed"}}/>
      <ScrollView style={{height: (isHoverPicker) ? height * 0.75:height * 0.8, backgroundColor: "#ededed"}}>
        <>
          { (resources.loadingState === loadingStateEnum.loading) ?
            <View style={{width: width, height: (isHoverPicker) ? height * 0.75:height * 0.8, alignContent: "center", alignItems: "center", justifyContent: "center"}}>
              <ProgressView width={(width < height) ? width * 0.05:height * 0.05} height={(width < height) ? width * 0.05:height * 0.05}/>
              <Text>Loading</Text>
            </View>:
            <>
              { (resources.loadingState === loadingStateEnum.success) ?
                <>
                  {resources.resources.map((resource) => (
                    <View key={"Resource_"+resource.id} style={{width: width * 0.8, marginLeft: "auto", marginRight: "auto", backgroundColor: "white", borderRadius: 15, marginBottom: height * 0.01}}>
                      <WebViewCross html={(resource.html) ? resource.body:`<div><div>${resource.body}</div></div>`}/>
                    </View>
                  ))}
                </>:<Text>Failed</Text>
              }
            </>
          }
        </>
      </ScrollView>
      <Pressable style={{height: (isHoverPicker) ? height * 0.1:height * 0.05}} onHoverIn={() => {setIsHoverPicker(true)}} onHoverOut={() => {setIsHoverPicker(false)}}>
        <ScrollView horizontal={true} style={{height: (isHoverPicker) ? height * 0.1:height * 0.05, width: width, backgroundColor: "white"}} showsHorizontalScrollIndicator={false}>
          <PickerPiece text='Home' item={resourceMode.home} onPress={setSelectedResourceMode} isHoverPicker={isHoverPicker} setIsHoverPicker={setIsHoverPicker}/>
          <PickerPiece text='Sports' item={resourceMode.sports} onPress={setSelectedResourceMode} isHoverPicker={isHoverPicker} setIsHoverPicker={setIsHoverPicker}/>
          <PickerPiece text='Advancement' item={resourceMode.advancement} onPress={setSelectedResourceMode} isHoverPicker={isHoverPicker} setIsHoverPicker={setIsHoverPicker}/>
          <PickerPiece text='School Events' item={resourceMode.schoolEvents} onPress={setSelectedResourceMode} isHoverPicker={isHoverPicker} setIsHoverPicker={setIsHoverPicker}/>
          <PickerPiece text='Annoucments' item={resourceMode.annoucments} onPress={setSelectedResourceMode} isHoverPicker={isHoverPicker} setIsHoverPicker={setIsHoverPicker}/>
          <PickerPiece text='Fitness' item={resourceMode.fitness} onPress={setSelectedResourceMode} isHoverPicker={isHoverPicker} setIsHoverPicker={setIsHoverPicker}/>
          <PickerPiece text='Files' item={resourceMode.files} onPress={setSelectedResourceMode} isHoverPicker={isHoverPicker} setIsHoverPicker={setIsHoverPicker}/>
        </ScrollView>
      </Pressable>
    </View>
  )
}

function PickerPiece({text, isHoverPicker, setIsHoverPicker}:{text: string, item: resourceMode, onPress: (item: resourceMode) => void, isHoverPicker: boolean, setIsHoverPicker: (item: boolean) => void}) {
  const {height, width, currentBreakPoint} = useSelector((state: RootState) => state.dimentions)
  const [isSelected, setIsSelected] = useState<boolean>(false)
  return (
    <Pressable onHoverIn={() => {setIsHoverPicker(true); setIsSelected(true)}} onHoverOut={() => setIsSelected(false)} style={{height: (isHoverPicker) ? height * 0.1:height * 0.05, width: (isSelected) ?  ((currentBreakPoint >= 2) ? (width*0.3):width * 0.6):((currentBreakPoint >= 2) ? (width*0.2):width * 0.4), alignContent: "center", alignItems: "center", justifyContent: "center"}}>
      <View style={{height: (isHoverPicker) ? height * 0.06:height * 0.03, width: (isSelected) ? ((currentBreakPoint >= 2) ? (width*0.28):width * 0.46):((currentBreakPoint >= 2) ? (width*0.18):width * 0.36), marginLeft: (currentBreakPoint >= 2) ? (width*0.01):width*0.02, marginRight: (currentBreakPoint >= 2) ? (width*0.01):width*0.02, backgroundColor: "#444444", borderRadius: 15, alignContent: "center", alignItems: "center", justifyContent: "center"}}>
        <Text style={{color: "white"}}>{text}</Text>
      </View>
    </Pressable>
  )
}

function SearchBox({searchValue, setSearchValue}:{searchValue: string, setSearchValue: (item: string) => void}) {
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  const [isOverflowing, setIsOverflowing] = useState<boolean>(false)
  const style: ViewStyle = (Platform.OS === "web") ? {outlineStyle: "none"}:{}
  return (
    <View style={{width: width, alignContent: "center", alignItems: "center", justifyContent: "center", position: "absolute", top: height * 0.1 - 19, zIndex: 2}}>
      <View style={{width: width * 0.8, shadowColor: "black", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 10, borderRadius: 25, flexDirection: "row", backgroundColor: "white"}}>
        { isOverflowing ?
          null:
          <View style={{width: 20, height: 40, alignContent: "center", alignItems: "center", justifyContent: "center", marginLeft: 10}}>
            <SearchIcon width={15} height={15}/>
          </View>
        }
        <View>
          <TextInput placeholder='Search' placeholderTextColor={"black"} value={searchValue} onChangeText={setSearchValue} style={[{width: isOverflowing ? width * 0.8 - 20:width * 0.8 - 50, height: 20, margin: 10, borderWidth: 0}, style]} enterKeyHint='search' returnKeyType='search' inputMode='search'/>
          <View
            style={{height: 0, alignSelf: 'flex-start', overflow: "hidden"}}
            onLayout={e => {
              if (e.nativeEvent.layout.width > width * 0.8 - 20) {
                setIsOverflowing(true)
                console.log("True")
              } else {
                console.log("FALSR")
                setIsOverflowing(false)
              }
            }}>
            <Text style={{color: 'white'}}>{searchValue}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
