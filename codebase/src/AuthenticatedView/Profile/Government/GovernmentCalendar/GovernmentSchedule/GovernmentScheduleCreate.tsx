import { View, Text, TextInput, Button } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import TimePicker from '../../../../../UI/DateTimePicker/TimePicker'
import { Link } from 'react-router-native'
import callMsGraph from '../../../../../Functions/microsoftAssets'
import { accessTokenContent } from '../../../../../../App'
import create_UUID from '../../../../../Functions/CreateUUID'
import { siteID } from '../../../../../PaulyConfig'
import { useMsal } from '@azure/msal-react'

declare global{
    type periodType = {
        startHour: number
        startMinute: number
        endHour: number
        endMinute: number
        id: string
    }
    type scheduleType = {
        name: string
        periods: periodType[]
        id: string
    }
}

export default function GovernmentSchedule() {
    const microsoftAccessToken = useContext(accessTokenContent);
    const { instance, accounts } = useMsal();
    const [newPeriodHourStart, setNewPeriodHourStart] = useState<number>(12)
    const [newPeriodMinuteStart, setNewPeriodMinuteStart] = useState<number>(0)
    const [newPeriodHourEnd, setNewPeriodHourEnd] = useState<number>(12)
    const [newPeriodMinuteEnd, setNewPeriodMinuteEnd] = useState<number>(0)
    const [scheduleName, setScheduleName] = useState<string>("")
    const [newPeriods, setNewPeriods] = useState<periodType[]>([])
    async function submitSchedule() {
        const data = {
            "fields": {
                "Title":scheduleName,
                "scheduleId":create_UUID(),
                "name":scheduleName,
                "scheduleData":JSON.stringify(newPeriods)
            }
        }
        const result = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists/b2250d2c-0301-4605-87fe-0b65ccf635e9/items", instance, accounts, "POST", false, JSON.stringify(data))
        console.log(result)
        const dataResult = await result.json()
        console.log(dataResult)
    }
    useEffect(() => {console.log("This", newPeriods)}, [newPeriods])
  return (
        <View>
            <Link to="/profile/government/calendar">
                <Text>Back</Text>
            </Link>
            <Text>Government Schedule</Text>
            <TextInput value={scheduleName} onChangeText={setScheduleName}/>
            {newPeriods.map((period) => (
                <PeriodBlock period={period} newPeriods={newPeriods} onSetNewPeriods={(out) => {
                    console.log("This is out", out)
                    setNewPeriods([...out])
                }}/>
            ))}
            <TimePicker selectedHourMilitary={newPeriodHourStart} selectedMinuteMilitary={newPeriodMinuteStart} onSetSelectedHourMilitary={setNewPeriodHourStart} onSetSelectedMinuteMilitary={setNewPeriodMinuteStart}/>
            <TimePicker selectedHourMilitary={newPeriodHourEnd} selectedMinuteMilitary={newPeriodMinuteEnd} onSetSelectedHourMilitary={setNewPeriodHourEnd} onSetSelectedMinuteMilitary={setNewPeriodMinuteEnd}/>
            <Button title="add period" onPress={() => {setNewPeriods([...newPeriods, {startHour: newPeriodHourStart, startMinute: newPeriodMinuteStart, endHour: newPeriodHourEnd, endMinute: newPeriodMinuteEnd, id: create_UUID()}])}}/>
            <Button title="Post Schedule" onPress={() => {submitSchedule()}} />
        </View>
  )
}

function PeriodBlock({period, newPeriods, onSetNewPeriods}:{period: periodType, newPeriods: periodType[], onSetNewPeriods: (item: periodType[]) => void}) {
    function deleteItem(period: periodType) {
        var newNewPeriodsArray: periodType[] = newPeriods
        if (newNewPeriodsArray.length === 1){
            newNewPeriodsArray.pop()
            onSetNewPeriods(newNewPeriodsArray)
        } else {
            const indexToRemove = newNewPeriodsArray.findIndex((e) => {return e.id === period.id})
            if (indexToRemove !== -1) {
                newNewPeriodsArray.splice(indexToRemove, indexToRemove)
            } else {
                //TO DO something went wrong this should not be possible though
            }
            onSetNewPeriods(newNewPeriodsArray)
        }
    }
    return (
        <View key={period.id}>
            <Text>{period.startHour}:{period.startMinute}</Text>
            <Text>{period.endHour}:{period.endMinute}</Text>
            <Button title='remove' onPress={() => {
                deleteItem(period)
            }}/>
        </View>
    )
}