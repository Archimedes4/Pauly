import { StatusBar } from 'expo-status-bar';
import { FlatList, Text, TextInput, View, useWindowDimensions } from 'react-native';
import React, { useEffect, useState } from "react"
import { 
  AntDesign,
  Entypo,
  EvilIcons,
  Feather,
  FontAwesome,
  Fontisto,
  Foundation,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Octicons,
  SimpleLineIcons,
  Zocial
} from '@expo/vector-icons';
import { styles } from '@src/constants';

type iconType = {
  name: keyof typeof AntDesign.glyphMap,
  family: "AntDesign"
} | {
  name: keyof typeof Entypo.glyphMap,
  family: "Entypo"
} | {
  name: keyof typeof EvilIcons.glyphMap,
  family: "EvilIcons"
}| {
  name: keyof typeof Feather.glyphMap,
  family: "Feather"
}| {
  name: keyof typeof FontAwesome.glyphMap,
  family: "FontAwesome"
} | {
  name: keyof typeof Fontisto.glyphMap,
  family: "Fontisto"
}| {
  name: keyof typeof Foundation.glyphMap,
  family: "Foundation"
}| {
  name: keyof typeof Ionicons.glyphMap,
  family: "Ionicons"
}| {
  name: keyof typeof MaterialCommunityIcons.glyphMap,
  family: "MaterialCommunityIcons"
}| {
  name: keyof typeof MaterialIcons.glyphMap,
  family: "MaterialIcons"
}| {
  name: keyof typeof Octicons.glyphMap,
  family: "Octicons"
}| {
  name: keyof typeof SimpleLineIcons.glyphMap,
  family: "SimpleLineIcons"
}| {
  name: keyof typeof Zocial.glyphMap,
  family: "Zocial"
}

export default function App() {
  function getIcons(): iconType[] {
    let result: iconType[] = []
    let AntDesignKeys: (keyof typeof AntDesign.glyphMap)[] = Object.keys(AntDesign.glyphMap) as (keyof typeof AntDesign.glyphMap)[]
    AntDesignKeys.map((key) => {
      result.push({
        name: key,
        family: 'AntDesign'
      })
    })

    let EntypoKeys: (keyof typeof Entypo.glyphMap)[] = Object.keys(Entypo.glyphMap) as (keyof typeof Entypo.glyphMap)[]
    EntypoKeys.map((key) => {
      result.push({
        name: key,
        family: 'Entypo'
      })
    })

    let EvilIconsKeys: (keyof typeof EvilIcons.glyphMap)[] = Object.keys(EvilIcons.glyphMap) as (keyof typeof EvilIcons.glyphMap)[]
    EvilIconsKeys.map((key) => {
      result.push({
        name: key,
        family: 'EvilIcons'
      })
    })

    let FeatherKeys: (keyof typeof Feather.glyphMap)[] = Object.keys(Feather.glyphMap) as (keyof typeof Feather.glyphMap)[]
    FeatherKeys.map((key) => {
      result.push({
        name: key,
        family: 'Feather'
      })
    })

    let FontAwesomeKeys: (keyof typeof FontAwesome.glyphMap)[] = Object.keys(FontAwesome.glyphMap) as (keyof typeof FontAwesome.glyphMap)[]
    FontAwesomeKeys.map((key) => {
      result.push({
        name: key,
        family: 'FontAwesome'
      })
    })

    let FoundationKeys: (keyof typeof Foundation.glyphMap)[] = Object.keys(Foundation.glyphMap) as (keyof typeof Foundation.glyphMap)[]
    FoundationKeys.map((key) => {
      result.push({
        name: key,
        family: 'Foundation'
      })
    })

    let FontistoKeys: (keyof typeof Fontisto.glyphMap)[] = Object.keys(Fontisto.glyphMap) as (keyof typeof Fontisto.glyphMap)[]
    FontistoKeys.map((key) => {
      result.push({
        name: key,
        family: 'Fontisto'
      })
    })

    let IoniconsKeys: (keyof typeof Ionicons.glyphMap)[] = Object.keys(Ionicons.glyphMap) as (keyof typeof Ionicons.glyphMap)[]
    IoniconsKeys.map((key) => {
      result.push({
        name: key,
        family: 'Ionicons'
      })
    })

    let MaterialCommunityIconsKeys: (keyof typeof MaterialCommunityIcons.glyphMap)[] = Object.keys(MaterialCommunityIcons.glyphMap) as (keyof typeof MaterialCommunityIcons.glyphMap)[]
    MaterialCommunityIconsKeys.map((key) => {
      result.push({
        name: key,
        family: 'MaterialCommunityIcons'
      })
    })

    let MaterialIconsKeys: (keyof typeof MaterialIcons.glyphMap)[] = Object.keys(MaterialIcons.glyphMap) as (keyof typeof MaterialIcons.glyphMap)[]
    MaterialIconsKeys.map((key) => {
      result.push({
        name: key,
        family: 'MaterialIcons'
      })
    })

    let OcticonsKeys: (keyof typeof Octicons.glyphMap)[] = Object.keys(Octicons.glyphMap) as (keyof typeof Octicons.glyphMap)[]
    OcticonsKeys.map((key) => {
      result.push({
        name: key,
        family: 'Octicons'
      })
    })

    let SimpleLineIconsKeys: (keyof typeof SimpleLineIcons.glyphMap)[] = Object.keys(SimpleLineIcons.glyphMap) as (keyof typeof SimpleLineIcons.glyphMap)[]
    SimpleLineIconsKeys.map((key) => {
      result.push({
        name: key,
        family: 'SimpleLineIcons'
      })
    })

    let ZocialKeys: (keyof typeof Zocial.glyphMap)[] = Object.keys(Zocial.glyphMap) as (keyof typeof Zocial.glyphMap)[]
    ZocialKeys.map((key) => {
      result.push({
        name: key,
        family: 'Zocial'
      })
    })

    return result
  }
  let SIZE = 40
  const [results, setResults] = useState<iconType[]>([])
  const [search, setSearch] = useState<string>("")
  const data = getIcons()
  const {width} = useWindowDimensions()

  function getSearch() {
    let newResults: iconType[] = []
    data.forEach((e) => {
      if (e.name.toLowerCase().includes(search.toLowerCase())) {
        newResults.push(e)
      }
    })
    setResults(newResults)
  }

  useEffect(() => {
    getSearch()
  }, [search])

  return (
    <View>
      <TextInput
        value={search}
        onChangeText={setSearch}
        style={[styles.headerText, {width}]}
      />
      <FlatList
        data={results}
        renderItem={(icon) => (
          <View style={{backgroundColor: "#d3d3d3", padding: 15, margin: 5, borderRadius: 15, flexDirection: 'row'}}>
            {icon.item.family === 'AntDesign' ?
              <AntDesign
                name={icon.item.name}
                style={{
                  width: SIZE,
                  height: SIZE
                }}
                size={SIZE}
              />:null
            }
            {icon.item.family === 'Entypo' ?
              <Entypo
                name={icon.item.name}
                style={{
                  width: SIZE,
                  height: SIZE
                }}
                size={SIZE}
              />:null
            }
            {icon.item.family === 'EvilIcons' ?
              <EvilIcons
                name={icon.item.name}
                style={{
                  width: SIZE,
                  height: SIZE
                }}
                size={SIZE}
              />:null
            }
            {icon.item.family === 'Feather' ?
              <Feather
                name={icon.item.name}
                style={{
                  width: SIZE,
                  height: SIZE
                }}
                size={SIZE}
              />:null
            }
            {icon.item.family === 'FontAwesome' ?
              <FontAwesome
                name={icon.item.name}
                style={{
                  width: SIZE,
                  height: SIZE
                }}
                size={SIZE}
              />:null
            }
            {icon.item.family === 'Fontisto' ?
              <Fontisto
                name={icon.item.name}
                style={{
                  width: SIZE,
                  height: SIZE
                }}
                size={SIZE}
              />:null
            }
            {icon.item.family === 'Foundation' ?
              <Foundation
                name={icon.item.name}
                style={{
                  width: SIZE,
                  height: SIZE
                }}
                size={SIZE}
              />:null
            }
            {icon.item.family === 'Ionicons' ?
              <Ionicons
                name={icon.item.name}
                style={{
                  width: SIZE,
                  height: SIZE
                }}
                size={SIZE}
              />:null
            }
            {icon.item.family === 'MaterialCommunityIcons' ?
              <MaterialCommunityIcons
                name={icon.item.name}
                style={{
                  width: SIZE,
                  height: SIZE
                }}
                size={SIZE}
              />:null
            }
            {icon.item.family === 'MaterialIcons' ?
              <MaterialIcons
                name={icon.item.name}
                style={{
                  width: SIZE,
                  height: SIZE
                }}
                size={SIZE}  
              />:null
            }
            {icon.item.family === 'Octicons' ?
              <Octicons
                name={icon.item.name}
                style={{
                  width: SIZE,
                  height: SIZE
                }}
                size={SIZE}
              />:null
            }
             {icon.item.family === 'SimpleLineIcons' ?
              <SimpleLineIcons
                name={icon.item.name}
                style={{
                  width: SIZE,
                  height: SIZE
                }}
                size={SIZE}
              />:null
            }
            {icon.item.family === 'Zocial' ?
              <Zocial
                name={icon.item.name}
                style={{
                  width: SIZE,
                  height: SIZE
                }}
                size={SIZE}
              />:null
            }
          </View>
        )}
        key={Math.random() * 100}
        numColumns={Math.floor(width/60)}
        style={{width: "100%"}}
      />
    </View>
  );
}
