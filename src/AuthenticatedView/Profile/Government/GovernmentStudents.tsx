import { View, Text, Pressable, ViewStyle, Platform, TextInput, Modal, FlatList, ListRenderItemInfo } from 'react-native'
import React, { useEffect, useState } from 'react'
import BackButton from '../../../UI/BackButton'
import MicrosoftFilePicker from '../../../UI/microsoftFilePicker'
import { useDispatch, useSelector } from 'react-redux'
import store, { RootState } from '../../../Redux/store'
import getUsers from '../../../Functions/getUsers'
import { CloseIcon, SearchIcon } from '../../../UI/Icons/Icons'
import { studentSearchSlice } from '../../../Redux/reducers/studentSearchReducer'
import { Colors, loadingStateEnum } from '../../../types'
import callMsGraph from '../../../Functions/Ultility/microsoftAssets'
import ProgressView from '../../../UI/ProgressView'

export default function GovernmentStudents() {
  const {height, width, currentBreakPoint} = useSelector((state: RootState) => state.dimentions)
  const {usersState, users, nextLink} = useSelector((state: RootState) => state.studentSearch)
  
  const dispatch = useDispatch()

  async function loadUsers() {
    getUsers()
  }

  useEffect(() => {
    loadUsers()
  }, [])

  return (
    <View style={{width: width, height: height, backgroundColor: Colors.white}}>
      <View style={{height: height * 0.1}}>
        <BackButton to='/profile/government/'/>
        <Text style={{marginTop: 14}}>Government Students</Text>
      </View>
      <SearchBox getUsers={() => {loadUsers()}} />
      <View style={{width: width, height: height * 0.05}}/>
      <View style={{height: height * 0.75}}>
        { (usersState === loadingStateEnum.loading) ?
          <View style={{width: width, height: height * 0.8, alignContent: "center", alignItems: "center", justifyContent: "center"}}>
            <ProgressView width={12} height={12}/>
            <Text>Loading</Text>
          </View>:
          <>
            { (usersState === loadingStateEnum.success) ?
              <FlatList
                data={users}
                renderItem={(e) => (
                  <StudentItem e={e} />
                )}
              />:<Text>Failed</Text>
            }
          </>
        }
      </View>
      <View style={{flexDirection: "row", height: height * 0.1}}>
        <Pressable>
          <Text>Select Folder</Text>
        </Pressable>
        <Pressable>
          <Text>Select Maping Keys</Text>
        </Pressable>
      </View>
    </View>
  )
}

function StudentItem({e}:{e: ListRenderItemInfo<schoolUserType>}) {
  const [isSelectingFile, setIsSelectingFile] = useState<boolean>(false)
  const {height, width, currentBreakPoint} = useSelector((state: RootState) => state.dimentions)
  return (
    <View style={{flexDirection: "row"}}>
      <Text>{e.item.name}</Text>
      <Pressable onPress={() => {setIsSelectingFile(true)}}>
        <Text>Choose File</Text>
      </Pressable>
      <Modal visible={isSelectingFile} animationType='slide' transparent={true} style={{width: width * 0.8}} onRequestClose={() => setIsSelectingFile(false)}>
        <Pressable onPress={() => setIsSelectingFile(false)} style={{position: "absolute", left: 0, height: height, zIndex: -1, width: width}}/>
        <StudentsSelectFile setIsSelectingFile={setIsSelectingFile} setSelectedFile={(e) => {}} />
      </Modal>
    </View>
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
    <View key={"Search_View_Top"} style={{width: width, alignContent: "center", alignItems: "center", justifyContent: "center", position: "absolute", top: height * 0.1 - 19, zIndex: 2}}>
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

function StudentsSelectFile({setIsSelectingFile, setSelectedFile}:{setIsSelectingFile: (item: boolean) => void, setSelectedFile: (item: string) => void}) {
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  const [isReviewing, setIsReviewing] = useState<boolean>(false)
  async function addImage() {

    const data = {
      "requests": [
        {
          "id":"1",
          "method":"POST",
          "url":`/sites/${store.getState().paulyList.siteId}/lists/${store.getState().paulyList.studentFilesListId}/items`,
          "body":"",
          "headers":{
            "Content-Type": "application/json"
          }
        },
        {
          "id":"2",
          "method":"POST",
          "url":`/sites/${store.getState().paulyList.siteId}/drive/root`,
          "dependsOn":["1"],
          "body":"",
          "headers":{
            "Content-Type": "application/json"
          }
        }
      ]
    }
  }
  return (
    <View style={{height: height, width: width, position: "absolute", zIndex: 200, top: 0, right: 0, alignContent: "center", alignItems: "center", justifyContent: "center", backgroundColor: Colors.lightGray}}>
      <Pressable onPress={() => {setIsSelectingFile(false)}} style={{position: "absolute", top: height * 0.05, left: height * 0.05}}>
        <CloseIcon width={20} height={20}/>
      </Pressable>
      <>
        {!isReviewing ?
          <View style={{height: height * 0.8, width: width * 0.8, shadowColor: "black", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 10, backgroundColor: Colors.white, borderRadius: 15}}>
            <View style={{margin: 10}}>
              <MicrosoftFilePicker height={height * 0.8 - 5} width={width * 0.8 - 5} onSelectedFile={async (file) => {
                const data = {
                  "type": "view",
                  "scope": "organization"
                }
                const result = await callMsGraph(file.callPath + "/createLink", "POST", false, JSON.stringify(data))
                if (result.ok){
                  const data = await result.json()
                  if (data["shareId"] !== undefined) {
                    setSelectedFile(data["shareId"])
                    setIsSelectingFile(false)
                  } else {
                    setIsSelectingFile(false)
                  }
                } else {
                  setIsSelectingFile(false)
                }
              }} />
            </View>
          </View>:
          <View style={{height: height * 0.8, width: width * 0.8, shadowColor: "black", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 10, backgroundColor: Colors.white, borderRadius: 15}}>
            <View style={{margin: 10}}>
              <Text>Confirm</Text>
            </View>
          </View>
        }
      </>
    </View>
  )
}