import { View, Text, TextInput, Pressable, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../../Redux/store'
import create_UUID from '../../../../../Functions/Ultility/CreateUUID'
import { Link } from 'react-router-native'
import callMsGraph from '../../../../../Functions/Ultility/microsoftAssets'
import { Colors, loadingStateEnum } from '../../../../../types'
import DressCodeBlock from './DressCodeBlock'

export default function GovernmentDressCodeCreate() {
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  const {siteId, dressCodeListId} = useSelector((state: RootState) => state.paulyList)
  const [dressCodeName, setDressCodeName] = useState<string>("")
  const [dressCodeData, setDressCodeData] = useState<dressCodeDataType[]>([{name: "", description: "", id: create_UUID()}])
  const [selectedDressCodeId, setSelectedDressCodeId] = useState<string>("")

  const [createDressCodeState, setCreateDressCodeState] = useState<loadingStateEnum>(loadingStateEnum.notStarted)
  async function createDressCode() {
    setCreateDressCodeState(loadingStateEnum.loading)
    const dressCodeId = create_UUID()
    const data = {
      "fields":{
        "Title":dressCodeId,
        "dressCodeId":dressCodeId,
        "dressCodeName":dressCodeName,
        "dressCodeData":JSON.stringify(dressCodeData),
        "dressCodeIncentivesData": "[]"
      }
    }
    const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + siteId + "/lists/" + dressCodeListId +"/items", "POST", JSON.stringify(data))//TO DO fix site id
    if (result.ok){
      setCreateDressCodeState(loadingStateEnum.success)
    } else {
      setCreateDressCodeState(loadingStateEnum.failed)
    }
  }
  return (
    <View style={{width: width, height: height, backgroundColor: Colors.white}}>
      <Link to="/profile/government/calendar/dresscode">
        <Text>Back</Text>
      </Link>
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
        setDressCodeData([...dressCodeData, {name: "", description: "", id: create_UUID()}])
      }}>
        <Text>Add</Text>
      </Pressable>
      <Pressable onPress={() => {createDressCode()}}>
        <Text>{(createDressCodeState === loadingStateEnum.notStarted) ? "Create Dress Code":(createDressCodeState === loadingStateEnum.loading) ? "Loading":(createDressCodeState === loadingStateEnum.success) ? "Created Dress Code":"Failed"}</Text>
      </Pressable>
    </View>
  )
}