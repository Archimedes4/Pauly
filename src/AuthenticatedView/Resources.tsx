import { View, Text, ScrollView, TextInput, Platform, Pressable } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-native'
import { getResourceFromJson, getResources } from '../Functions/getResources'
import { useSelector } from 'react-redux'
import { RootState } from '../Redux/store'
import { SearchIcon } from '../UI/Icons/Icons'
import WebView from 'react-native-webview'
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import WebViewCross from '../UI/WebViewCross'

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
  const {height, width} = useSelector((state: RootState) => state.dimentions)
  const resources = useSelector((state: RootState) => state.resources)
  const [selectedResourceMode, setSelectedResourceMode] = useState<resourceMode>(resourceMode.home)
  const [searchValue, setSearchValue] = useState<string>("")
  async function loadData() {
    const result = await getResources()
  }
  useEffect(() => {
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
      <View style={{height: height * 0.1, backgroundColor: "#444444"}}>
        <Link to="/profile/">
          <Text>Back</Text>
        </Link>
        <Text>Resources</Text>
      </View>
      <SearchBox searchValue={searchValue} setSearchValue={setSearchValue}/>
      <View style={{width: width, height: height * 0.05, backgroundColor: "#ededed"}}/>
      <ScrollView style={{height: height * 0.75 + ((height >= 1000) ? ((height - 1000) * 0.05):0), backgroundColor: "#ededed"}}>
        {resources.map((resource) => (
          <View key={"Resource_"+getResourceFromJson(resource)?.id} style={{width: width * 0.8, marginLeft: "auto", marginRight: "auto", backgroundColor: "white", borderRadius: 15, marginBottom: height * 0.01}}>
            <WebViewCross html={getResourceFromJson(resource)?.body}/>
          </View>
        ))}
      </ScrollView>
      <ScrollView horizontal={true} style={{height: height * 0.01 - ((height >= 1000) ? ((height - 1000) * 0.05):0), width: width, backgroundColor: "white"}} showsHorizontalScrollIndicator={false}>
        <PickerPiece text='Home' item={resourceMode.home} onPress={setSelectedResourceMode}/>
        <PickerPiece text='Sports' item={resourceMode.sports} onPress={setSelectedResourceMode}/>
        <PickerPiece text='Advancement' item={resourceMode.advancement} onPress={setSelectedResourceMode}/>
        <PickerPiece text='School Events' item={resourceMode.schoolEvents} onPress={setSelectedResourceMode}/>
        <PickerPiece text='Annoucments' item={resourceMode.annoucments} onPress={setSelectedResourceMode}/>
        <PickerPiece text='Fitness' item={resourceMode.fitness} onPress={setSelectedResourceMode}/>
        <PickerPiece text='Files' item={resourceMode.files} onPress={setSelectedResourceMode}/>
      </ScrollView>
    </View>
  )
}

function PickerPiece({text}:{text: string, item: resourceMode, onPress: (item: resourceMode) => void}) {
  const {height, width, currentBreakPoint} = useSelector((state: RootState) => state.dimentions)
  return (
    <Pressable style={{height: height * 0.01 - ((height >= 1000) ? ((height - 1000) * 0.05):0), width: (currentBreakPoint >= 2) ? (width*0.2):width * 0.4, backgroundColor: "#444444", borderRadius: 15}}>
      <Text>{text}</Text>
    </Pressable>
  )
}

function SearchBox({searchValue, setSearchValue}:{searchValue: string, setSearchValue: (item: string) => void}) {
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  const [isOverflowing, setIsOverflowing] = useState<boolean>(false)
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
          <TextInput placeholder='Search' placeholderTextColor={"Black"} value={searchValue} onChangeText={setSearchValue} style={{width: isOverflowing ? width * 0.8 - 20:width * 0.8 - 50, height: 20, margin: 10, borderWidth: 0, outlineStyle: 'none'}} enterKeyHint='search' returnKeyType='search' inputMode='search'/>
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
