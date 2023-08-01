import { View, Text, TextInput, Button } from 'react-native'
import React, { useContext, useState } from 'react'
import callMsGraph from '../../../../../Functions/microsoftAssets'
import { accessTokenContent } from '../../../../../App';
import { siteID } from '../../../../../PaulyConfig';

export default function GovernmentTimetableCreate() {
    const microsoftAccessToken = useContext(accessTokenContent);
    const [timetableName, setTimetableName] = useState<string>("")
    const [selectedSchedules, setSelectedSchedules] = useState<string[]>([])
    async function createTimetable() {
        const result = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists/72367e66-6d0f-4beb-8b91-bb6e9be9b433/items?expand=fields")//TO DO fix site id
    }
  return (
    <View>
      <Text>GovernmentTimetableCreate</Text>
      <TextInput value={timetableName} onChangeText={(e) => {setTimetableName(e)}}/>

      <Button title="Create Timetable" onPress={() => {}}/>
    </View>
  )
}