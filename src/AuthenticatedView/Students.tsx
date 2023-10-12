import { View, Text, Pressable, TextInput, ViewStyle, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import { loadingStateEnum } from '../types'
import { useDispatch, useSelector } from 'react-redux'
import store, { RootState } from '../Redux/store'
import callMsGraph from '../Functions/Ultility/microsoftAssets'
import ProgressView from '../UI/ProgressView'
import { FlatList } from 'react-native-gesture-handler'
import { useNavigate } from 'react-router-native'
import { SearchIcon } from '../UI/Icons/Icons'
import { studentSearchSlice } from '../Redux/reducers/studentSearchReducer'
import BackButton from '../UI/BackButton'
import create_UUID from '../Functions/Ultility/CreateUUID'

export default function Students() {
  const {height, width, currentBreakPoint} = useSelector((state: RootState) => state.dimentions)
  const {usersState, users, nextLink} = useSelector((state: RootState) => state.studentSearch)
  
  const navigate = useNavigate()
  const dispatch = useDispatch()

  function checkIfStudent(role: string): {result: boolean, grade?: "9"|"10"|"11"|"12"} {
    if (role.length >= 20) {
      const reversed = role.split("").reverse().join("");
      const slice = reversed.slice(0, 15);
      if (slice == "ac.sredasurcog@") {
        const getMonth = new Date().getMonth()
        var schoolYear = new Date().getFullYear()
        if (schoolYear.toString().length >= 4){
          if (getMonth > 6) {
            schoolYear++
          } 
          const reverseYearTwelve = schoolYear.toString().slice(2, 4).split("").reverse().join("");
          schoolYear++
          const reverseYearEleven = schoolYear.toString().slice(2, 4).split("").reverse().join("");
          schoolYear++
          const reverseYearTen = schoolYear.toString().slice(2, 4).split("").reverse().join("");
          schoolYear++
          const reverseYearNine = schoolYear.toString().slice(2, 4).split("").reverse().join("");
          if (reversed.slice(16, 17) === reverseYearTwelve) {
            return {result: true, grade: "12"}
          } else if (reversed.slice(16, 17) === reverseYearEleven) {
            return {result: true, grade: "11"}
          } else if (reversed.slice(16, 17) === reverseYearTen) {
            return {result: true, grade: "10"}
          } else if (reversed.slice(16, 17) === reverseYearNine) {
            return {result: true, grade: "9"}
          } else {
            return {result: false}
          }
        } else {
          return {result: false}
        }
      } else {
        return {result: false}
      }
    } else {
      return {result: false}
    }
  }

  async function getUsers(url?: string) {
    const result = await callMsGraph(url ? url:`https://graph.microsoft.com/v1.0/users`)
    if (result.ok) {
      const data = await result.json()
      var outputUsers: schoolUserType[] = []
      for (var index = 0; index < data["value"].length; index++) {
        outputUsers.push({
          name: data["value"][index]["displayName"],
          id: data["value"][index]["id"],
          mail: data["value"][index]["mail"],
          role: data["value"][index]["mail"],
          grade: checkIfStudent(data["value"][index]["mail"]).grade,
          student: checkIfStudent(data["value"][index]["mail"]).result
        })
      }
      dispatch(studentSearchSlice.actions.setStudentUsers(outputUsers))
      dispatch(studentSearchSlice.actions.setNextLink(data["@odata.nextLink"]))
      dispatch(studentSearchSlice.actions.setUsersState(loadingStateEnum.success))
    } else {
      dispatch(studentSearchSlice.actions.setUsersState(loadingStateEnum.failed))
    }
  }

  useEffect(() => {
    getUsers()
  }, [])
  
  return (
    <>
      { (usersState === loadingStateEnum.loading) ?
        <View style={{width: width, height: height, backgroundColor: (currentBreakPoint === 0) ? "#793033":"#FFFFFF", alignContent: "center", alignItems: "center", justifyContent: "center"}}>
          <ProgressView width={14} height={14} />
          <Text>Loading</Text>
        </View>:
        <>
          { (usersState === loadingStateEnum.success) ?
            <View style={{width: width, height: height, backgroundColor: (currentBreakPoint === 0) ? "#793033":"#FFFFFF"}}>
              <View style={{height: height * 0.15}}>
                <BackButton to='/profile'/>
                <Text>Students</Text>
              </View>
              <SearchBox getUsers={(e) => {
                if (e !== "") {
                  getUsers(e)
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
            <View style={{width: width, height: height, backgroundColor: (currentBreakPoint === 0) ? "#793033":"#FFFFFF"}}>
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
  const {searchValue} = useSelector((state: RootState) => state.resources)
  const [isOverflowing, setIsOverflowing] = useState<boolean>(false)
  const style: ViewStyle = (Platform.OS === "web") ? {outlineStyle: "none"}:{}
  const [mounted, setMounted] = useState<boolean>(false)


  useEffect(() => {
    if (mounted) {
      const searchValueSave = searchValue
      setTimeout(() => {
        if (store.getState().studentSearch.searchText === searchValueSave) {
          getUsers(store.getState().studentSearch.searchText)
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
          <TextInput key={"Search_TextInput"} placeholder='Search' placeholderTextColor={"black"} value={searchValue} onChangeText={(e) => {}} style={[{width: isOverflowing ? width * 0.8 - 20:width * 0.8 - 50, height: 20, margin: 10, borderWidth: 0}, style]} enterKeyHint='search' inputMode='search'/>
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
