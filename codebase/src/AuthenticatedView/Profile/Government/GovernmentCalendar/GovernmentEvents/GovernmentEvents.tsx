import { View, Text } from 'react-native'
import React, { useContext, useEffect } from 'react'
import callMsGraph from '../../../../../Functions/microsoftAssets';
import { accessTokenContent } from '../../../../../App';
import { Link } from 'react-router-native';
import { siteID } from '../../../../../PaulyConfig';

export default function GovernmentEvents({}:{isCreatingEvent: boolean}) {
    const microsoftAccessToken = useContext(accessTokenContent);
    async function getCalendar() {
        const result = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists/d60ef458-c8a5-4562-9fb7-f48b2d355f8b/items?expand=fields")
        console.log(result)
        const data = await result.json()
        console.log(data)
    }
    useEffect(() => {
        getCalendar()
    }, [])
  return (
    <View>
        <Link to="/profile/government/calendar">
            <Text>Back</Text>
        </Link>
        <Text>GovernmentEvents Normie</Text>
        
    </View>
   
  )
}