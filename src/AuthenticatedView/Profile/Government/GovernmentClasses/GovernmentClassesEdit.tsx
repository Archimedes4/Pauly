import { View, Text, TextInput, Pressable } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import callMsGraph from '../../../../Functions/Ultility/microsoftAssets'
import { RootState } from '../../../../Redux/store';
import { useSelector } from 'react-redux';
import { loadingStateEnum } from '../../../../types';
import { useParams } from 'react-router-native';
import { getRooms } from '../../../../Functions/getRooms';
import getSchoolYears from '../../../../Functions/Calendar/getSchoolYears';
import SegmentedPicker from '../../../../UI/Pickers/SegmentedPicker';

declare global {
  type microsoftUserType = {
    id: string
    displayName: string
  }
  type classType = {
    name: string,
    id: string
  }
}

enum semesters {
  semesterOne,
  semesterTwo
}

export default function GovernmentClassesEdit() {
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  const {id} = useParams()

  const [selectedSemester, setSelectedSemester] = useState<semesters>(semesters.semesterOne)

  //Rooms States
  const [roomSearchText, setRoomSearchText] = useState<string>("")
  const [roomsNextLink, setRoomsNextLink] = useState<string | undefined>(undefined)
  const [rooms, setRooms] = useState<roomType[]>([])
  const [roomsState, setRoomsState] = useState<loadingStateEnum>(loadingStateEnum.loading)

  //School Years State
  const [schoolYearState, setSchoolYearState] =  useState<loadingStateEnum>(loadingStateEnum.loading)
  const [schoolYearNextLink, setSchoolYearNextLink] = useState<string | undefined>(undefined)

  async function getGroup() {
    const result = await callMsGraph("")
  }

  async function loadRooms() {
    //TO DO figure out if there will be performance issuses in continually getting next page
    const result = await getRooms(roomsNextLink, (roomSearchText !== "") ? roomSearchText:undefined)
    if (result.result === loadingStateEnum.success && result.data !== undefined) {

    }
    setRoomsState(result.result)
    setRoomsNextLink(result.nextLink)
  }

  async function loadSchoolYears() {
    const result = await getSchoolYears(schoolYearNextLink) 
    if (result.result === loadingStateEnum.success && result.events !== undefined) {
      
    }
    setSchoolYearState(result.result)
    setSchoolYearNextLink(result.nextLink)
  }

  async function createClass() {
    
  }

  useEffect(() => {
    loadRooms()
  }, [roomSearchText])

  useEffect(() => {
    loadSchoolYears()
  }, [])

  return (
    <View style={{width: width, height: height, backgroundColor: "white"}}>
      <Text>Add Class Data</Text>
      <View>
        <Text>_Teacher:</Text>
        <Text>Name:</Text>
        <Text>School Years</Text>
        <View>

        </View>
        <Text>Periods: number[]</Text>
        <SegmentedPicker selectedIndex={selectedSemester} setSelectedIndex={setSelectedSemester} options={["Semester One", "Semester Two"]} width={width * 0.85} height={height * 0.1} />
        <Text>Room Id: string</Text>
        <Text>Select Room</Text>
        <View>
          { (roomsState === loadingStateEnum.loading) ?
            <Text>Loading</Text>:
            <View>
              { (roomsState === loadingStateEnum.success) ?
                <View>
                  { rooms.map((room) => (
                    <View>
                      <Text>{room.name}</Text>
                    </View>
                  ))}
                </View>:<Text>Failed</Text>
              }
            </View>
          }
        </View>
        <Pressable>
          <Text>Create Class</Text>
        </Pressable>
      </View>
    </View>
  )
}