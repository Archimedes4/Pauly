import { View, Text, Pressable, TextInput } from 'react-native'
import React, { useContext, useState } from 'react'
import callMsGraph from '../../../../Functions/microsoftAssets'
import { accessTokenContent } from '../../../../../App';
import { siteID } from '../../../../PaulyConfig';
import create_UUID from '../../../../Functions/CreateUUID';
import { Link } from 'react-router-native';
import { useMsal } from '@azure/msal-react';

export default function GovernmentClassesCreate() {
  const microsoftAccessToken = useContext(accessTokenContent);
  const { instance, accounts } = useMsal();
  const [selectedGrades, setSelectedGrades] = useState<number[]>([])
  const [newClassName, setNewClassName] = useState<string>("")
  async function createRootClass() {
    const newClassId = create_UUID()
    const data = {
      "fields": {
        "Title": newClassId,
        "classId": newClassId,
        "className":newClassName,
        "gradeData":selectedGrades.toString()
      }
    }
    const result = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists/800202d8-1f51-4df4-ac39-08da7357ca89/items", instance, accounts, "POST", false, JSON.stringify(data))
    if (result.ok){
      //TO DO add success notifiation
      console.log("All Good")
    } else {
      //TO DO add error notification
    }
  }
  function setOnGrades(grade: 9 | 10 | 11 | 12) {
    if (selectedGrades.includes(grade)) {
      var newGradesValue = selectedGrades
      newGradesValue = newGradesValue.filter((e) => {return e !== grade})
      setSelectedGrades([...newGradesValue])
    } else {
      setSelectedGrades([...selectedGrades, grade])
    }
  }
  return (
    <View>
      <Link to="/profile/government/classes">
        <Text>Back</Text>
      </Link>
        <Text>Government Classes Create</Text>
        <View style={{flexDirection: "row"}}>
          <Text>Class Name</Text>
          <TextInput value={newClassName} onChangeText={(e) => {setNewClassName(e)}} />
        </View>
        <Pressable onPress={() => {setOnGrades(9)}}>
          <Text style={{color: (selectedGrades.includes(9)) ? "red":"black"}}>Grade 9</Text>
        </Pressable>
        <Pressable onPress={() => {setOnGrades(10)}}>
          <Text style={{color: (selectedGrades.includes(10)) ? "red":"black"}}>Grade 10</Text>
        </Pressable>
        <Pressable onPress={() => {setOnGrades(11)}}>
          <Text style={{color: (selectedGrades.includes(11)) ? "red":"black"}}>Grade 11</Text>
        </Pressable>
        <Pressable onPress={() => {setOnGrades(12)}}>
          <Text style={{color: (selectedGrades.includes(12)) ? "red":"black"}}>Grade 12</Text>
        </Pressable>
        <Pressable onPress={() => {createRootClass()}}>
          <Text>Create Class</Text>
        </Pressable>
    </View>
  )
}