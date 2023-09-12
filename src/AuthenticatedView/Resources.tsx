import { View, Text, ScrollView, TextInput, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-native'
import { getResourceFromJson, getResources } from '../Functions/getResources'
import { useSelector } from 'react-redux'
import { RootState } from '../Redux/store'
import { SearchIcon } from '../UI/Icons/Icons'
import WebView from 'react-native-webview'

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
  schedule,
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
  return (
    <View style={{height: height, width: width}}>
      <View style={{height: height * 0.1, backgroundColor: "#444444"}}>
        <Link to="/profile/">
          <Text>Back</Text>
        </Link>
        <Text>Resources</Text>
      </View>
      <SearchBox searchValue={searchValue} setSearchValue={setSearchValue}/>
      <ScrollView style={{height: height * 0.9}}>
        {resources.map((resource) => (
          <View key={"Resource_"+getResourceFromJson(resource).id}>
            { (Platform.OS !== "web") ?
              <WebView source={{html: getResourceFromJson(resource).body}}/>:
              <div dangerouslySetInnerHTML={{__html: getResourceFromJson(resource).body}}/>
            }
          </View>
        ))}
      </ScrollView>
    </View>
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
          <SearchIcon width={14} height={14}/>
        }
        <View>
          <TextInput placeholder='Search' placeholderTextColor={"Black"} value={searchValue} onChangeText={setSearchValue} style={{width: width * 0.8 - 20, height: 20, margin: 10}}/>
          <View
            style={{height: 0, alignSelf: 'flex-start', overflow: "hidden"}}
            onLayout={e => {
              if (e.nativeEvent.layout.width > width * 0.8 - 20) {
                setIsOverflowing(true)
              } else {
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