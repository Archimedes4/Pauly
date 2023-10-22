import { View, Text, TextInput, Pressable, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../../Redux/store'
import create_UUID from '../../../../../Functions/Ultility/CreateUUID'
import { useNavigate } from 'react-router-native'
import { Colors, loadingStateEnum } from '../../../../../types'
import DressCodeBlock from './DressCodeBlock'
import { createDressCode } from '../../../../../Functions/calendar/calendarFunctionsGraph'

export default function GovernmentDressCodeCreate() {
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  const [dressCodeName, setDressCodeName] = useState<string>("")
  const [dressCodeData, setDressCodeData] = useState<dressCodeDataType[]>([{name: "", description: "", id: create_UUID()}])
  const [selectedDressCodeId, setSelectedDressCodeId] = useState<string>("")

  const [createDressCodeState, setCreateDressCodeState] = useState<loadingStateEnum>(loadingStateEnum.notStarted)
  
  const navigate = useNavigate()

  async function loadCreateDressCode() {
    const result = await createDressCode(dressCodeName, dressCodeData);
    setCreateDressCodeState(result);
  }

  return (
    <View style={{width: width, height: height, backgroundColor: Colors.white}}>
      <Pressable onPress={() => navigate("/profile/government/calendar/dresscode")}>
        <Text>Back</Text>
      </Pressable>
      <Text>Create Dress Code</Text>
      <Text>Dress Code Name:</Text>
      <TextInput 
        value={dressCodeName}
        onChangeText={setDressCodeName}
        placeholder='Dress Code Name'
      />
      <ScrollView style={{height: height * 0.7}}>
        { dressCodeData.map((dressCode, index) => (
          <DressCodeBlock dressCode={dressCode} dressCodeData={dressCodeData} index={index} setDressCodeData={setDressCodeData} selectedDressCodeId={selectedDressCodeId} setSelectedDressCodeId={setSelectedDressCodeId } />
        ))}
      </ScrollView>
      <Pressable onPress={() => {
        setDressCodeData([...dressCodeData, {name: '', description: '', id: create_UUID()}])
      }}>
        <Text>Add</Text>
      </Pressable>
      <Pressable onPress={() => loadCreateDressCode()}>
        <Text>{(createDressCodeState === loadingStateEnum.notStarted) ? "Create Dress Code":(createDressCodeState === loadingStateEnum.loading) ? "Loading":(createDressCodeState === loadingStateEnum.success) ? "Created Dress Code":"Failed"}</Text>
      </Pressable>
    </View>
  )
}