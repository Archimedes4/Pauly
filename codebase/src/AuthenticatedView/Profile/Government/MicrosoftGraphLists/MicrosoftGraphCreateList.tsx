// import { View, Text } from 'react-native'
// import React from 'react'

// export default function MicrosoftGraphOverview() {
//   return (
//     <View>
//       <Text>MicrosoftGraphOverview</Text>
//     </View>
//   )
// }

import { View, Text, Button, TextInput, Pressable, Dimensions } from 'react-native'
import React, { useContext, useState, useEffect } from 'react'
import callMsGraph from '../../../../Functions/microsoftAssets'
import { accessTokenContent } from '../../../../../App';
import NavBarComponent from '../../../../UI/NavComponent';
import { Link } from 'react-router-native';

type MicrosoftGraphColumnDefinitions = "text" | "number" | "boolean" | "calculated" | "choice" | "columnGroup" | "contentApprovalStatus" | "currency" | "dateTime" | "defaultValue" | "description" | "displayName" | "enforceUniqueValues" | "geolocation" | "hidden"  

type ColumnItem = {
  name: string
  key: MicrosoftGraphColumnDefinitions
  data: any
}

const windowDimensions = Dimensions.get('window');
const screenDimensions = Dimensions.get('screen');

export default function MicrosoftGraphCreateList() {
  const [dimensions, setDimensions] = useState({
    window: windowDimensions,
    screen: screenDimensions,
  });

  useEffect(() => {
      const subscription = Dimensions.addEventListener(
        'change',
        ({window, screen}) => {
          setDimensions({window, screen});
        },
      );
      return () => subscription?.remove();
  });

  const microsoftAccessToken = useContext(accessTokenContent);
  const [columns, setColumns] = useState<ColumnItem[]>([])

  const [listName, setListName] = useState<string>("")
  const [isListHidden, setIsListHidden] = useState<boolean>(false)
  const [isShowingTypeWindow, setIsShowingTypeWindow] = useState<boolean>(false)
  
  //Colum Properties
  const [selectedColumnType, setSelectedColumnType] = useState<MicrosoftGraphColumnDefinitions>("text")
  const [enforceUniqueValues, setEnforceUniqueValues] = useState<boolean>(false)
  const [isHidden, setIsHidden] = useState<boolean>(false)
  const [columnDescription, setColumnDescription] = useState<string>("")
  const [newColumnName, setNewColumnName] = useState<string>("")

  async function getUser(){
      const result = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/8td1tk.sharepoint.com,b2ef509e-4511-48c3-b607-a8c2cddc0e35,091feb8c-a978-4e3f-a60f-ecdc319b2304")//sites/8td1tk.onmicrosoft.com/sites
      console.log(result)
  }
  async function createList(){
    var columnData: object[] = []

    for(let index = 0; index < columns.length; index++){
      const key: string = columns[index].key
      var newData: object = {
        name: columns[index].name,
        text:{}
      }
      columnData.push(newData)
    }

    const listData = {
      "displayName":listName,
      "columns": columnData,
      "list":
      {
        "contentTypesEnabled": false,
        "hidden": false,
        "template": " genericList"
      }
    }
    const result = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/8td1tk.sharepoint.com,b2ef509e-4511-48c3-b607-a8c2cddc0e35,091feb8c-a978-4e3f-a60f-ecdc319b2304/lists", "POST", JSON.stringify(listData))//sites/8td1tk.onmicrosoft.com/sites
    console.log(result)
  }
  return (
    <View style={{width: (dimensions.window.width > 576) ? dimensions.window.width * 0.9:dimensions.window.width}}>
      <Link to="/profile/government/graph">
        <Text>Back</Text>
      </Link>
      <Text>Microsoft Graph Create</Text>
      <Text>List Name</Text>
      <TextInput 
        value={listName}
        onChangeText={text => setListName(text)}
      />
      <View style={{height: dimensions.window.height * 0.75}}>
        <View style={{flexDirection: "row"}}>
          <Text>Name</Text>
          <Text>Type</Text>
        </View>
        { columns.map((item: ColumnItem) => (
          <View style={{flexDirection: "row"}}>
            <Text>{item.name}  </Text>
            <Text>{item.key}</Text>
          </View>
        ))
        }
      </View>
      { (isShowingTypeWindow) ?
        <View style={{height: 100, position: "absolute", zIndex: 2}}>
          <Button title='Text' onPress={() => {setSelectedColumnType("text"); setIsShowingTypeWindow(false)}}/>
          <Button title='Number' onPress={() => {setSelectedColumnType("number"); setIsShowingTypeWindow(false)}}/>
          <Button title='Boolean' onPress={() => {setSelectedColumnType("boolean"); setIsShowingTypeWindow(false)}}/>
          <Button title='Calculated' onPress={() => {setSelectedColumnType("calculated"); setIsShowingTypeWindow(false)}}/>
          <Button title='Location' onPress={() => {setSelectedColumnType("geolocation"); setIsShowingTypeWindow(false)}}/>
          <Button title='Choice' onPress={() => {setSelectedColumnType("choice"); setIsShowingTypeWindow(false)}}/>
          <Button title='Column Group' onPress={() => {setSelectedColumnType("columnGroup"); setIsShowingTypeWindow(false)}}/>
          <Button title='Content Approval Status' onPress={() => {setSelectedColumnType("contentApprovalStatus"); setIsShowingTypeWindow(false)}}/>
          <Button title='Currency' onPress={() => {setSelectedColumnType("currency"); setIsShowingTypeWindow(false)}}/>
          <Button title='Date' onPress={() => {setSelectedColumnType("dateTime"); setIsShowingTypeWindow(false)}}/>
        </View>:null
      }
      <View style={{flexDirection: "row"}}>
        <Text>Hidden: </Text>
        <Pressable onPress={() => {setIsHidden(!isHidden)}}>
          <Text>{(isHidden) ? "X":"O"}</Text>
        </Pressable>
        <TextInput 
          value={newColumnName}
          onChangeText={text => setNewColumnName(text)}
        />
      </View>
      <Button title={selectedColumnType} onPress={() => {setIsShowingTypeWindow(!isShowingTypeWindow)}}/>
      <Button title='Add Column' onPress={() => {
        var columnData = {}
        if (selectedColumnType === "text"){
          columnData = {
            "allowMultipleLines": true,
            "appendChangesToExistingText": false,
            "linesForEditing": 6,
            "maxLength": 300,
            "textType": "richText"
          }
        }
        const newColumn = {
          name: newColumnName,
          key: selectedColumnType,
          data: columnData
        }
        setNewColumnName("")
        setColumns([...columns, newColumn])
      }}/>
      <Button title="Create List" onPress={() => {createList()}} />
      <View style={{flexDirection: "row"}}>
        <Text>List Hidden: </Text>
        <Pressable onPress={() => {setIsListHidden(!isListHidden)}}>
          <Text>{(isListHidden) ? "X":"O"}</Text>
        </Pressable>
      </View>
    </View>
  )
}
