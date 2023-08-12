import { View, Text, TextInput, Button } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import TimePicker from '../../../../../UI/DateTimePicker/TimePicker'
import { Link } from 'react-router-native'
import callMsGraph from '../../../../../Functions/microsoftAssets'
import { accessTokenContent } from '../../../../../../App'
import create_UUID from '../../../../../Functions/CreateUUID'
import { siteID } from '../../../../../PaulyConfig'
import { useMsal } from '@azure/msal-react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../../Redux/store'
import { loadingStateEnum } from '../../../../../types'

declare global{
    type periodType = {
        startHour: number
        startMinute: number
        endHour: number
        endMinute: number
        id: string
    }
    type scheduleType = {
        properName:string
        descriptiveName: string
        periods: periodType[]
        id: string
    }
}

export default function GovernmentSchedule() {
    const microsoftAccessToken = useContext(accessTokenContent);
    const { instance, accounts } = useMsal();
    const {scheduleListId} = useSelector((state: RootState) => state.paulyList)
    const [newPeriodHourStart, setNewPeriodHourStart] = useState<number>(12)
    const [newPeriodMinuteStart, setNewPeriodMinuteStart] = useState<number>(0)
    const [newPeriodHourEnd, setNewPeriodHourEnd] = useState<number>(12)
    const [newPeriodMinuteEnd, setNewPeriodMinuteEnd] = useState<number>(0)
    const [scheduleProperName, setScheduleProperName] = useState<string>("")
    const [scheduleDescriptiveName, setScheduleDescriptiveName] = useState<string>("")
    const [newPeriods, setNewPeriods] = useState<periodType[]>([])
    const [createScheduleLoadingState, setCreateScheduleLoadingState] = useState<loadingStateEnum>(loadingStateEnum.notStarted)
    async function submitSchedule() {
        setCreateScheduleLoadingState(loadingStateEnum.loading)
        const data = {
            "fields": {
                "Title":scheduleProperName,
                "scheduleId":create_UUID(),
                "scheduleProperName":scheduleProperName,
                "scheduleDescriptiveName":scheduleDescriptiveName,
                "scheduleData":JSON.stringify(newPeriods)
            }
        }
        const result = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists/" + scheduleListId + "/items", instance, accounts, "POST", false, JSON.stringify(data))
        if (result.ok){
            const dataResult = await result.json()
            console.log(dataResult)
            setCreateScheduleLoadingState(loadingStateEnum.success)
        } else {
            setCreateScheduleLoadingState(loadingStateEnum.failed)
        }
    }
    useEffect(() => {console.log("This", newPeriods)}, [newPeriods])
  return (
        <View>
            <Link to="/profile/government/calendar">
                <Text>Back</Text>
            </Link>
            <Text>Create Schedule</Text>
            <View style={{height: microsoftAccessToken.dimensions.window.height * 0.3}}>
                <View style={{flexDirection: "row"}}>
                    <Text>Proper Name:</Text>
                    <TextInput value={scheduleProperName} onChangeText={setScheduleProperName} placeholder='Proper Name ex. Schedule One'/>
                </View>
                <View style={{flexDirection: "row"}}>
                    <Text>Descriptive Name:</Text>
                    <TextInput value={scheduleDescriptiveName} onChangeText={setScheduleDescriptiveName} placeholder='Descriptive Name ex. Regular Schedule'/>
                </View>
                <Text>Keep descriptive name short as it is used in the calendar widget</Text>
            </View>
            <Text>New Periods</Text>
            <View style={{height: microsoftAccessToken.dimensions.window.height * 0.5}}>
            {newPeriods.map((period) => (
                <PeriodBlock period={period} newPeriods={newPeriods} onSetNewPeriods={(out) => {
                    console.log("This is out", out)
                    setNewPeriods([...out])
                }}/>
            ))}
            </View>
            <TimePicker selectedHourMilitary={newPeriodHourStart} selectedMinuteMilitary={newPeriodMinuteStart} onSetSelectedHourMilitary={setNewPeriodHourStart} onSetSelectedMinuteMilitary={setNewPeriodMinuteStart}/>
            <TimePicker selectedHourMilitary={newPeriodHourEnd} selectedMinuteMilitary={newPeriodMinuteEnd} onSetSelectedHourMilitary={setNewPeriodHourEnd} onSetSelectedMinuteMilitary={setNewPeriodMinuteEnd}/>
            <Button title="Add Period" onPress={() => {setNewPeriods([...newPeriods, {startHour: newPeriodHourStart, startMinute: newPeriodMinuteStart, endHour: newPeriodHourEnd, endMinute: newPeriodMinuteEnd, id: create_UUID()}])}}/>
            <Button title={(createScheduleLoadingState === loadingStateEnum.notStarted) ? "Create Schedule":(createScheduleLoadingState === loadingStateEnum.loading) ? "Loading":(createScheduleLoadingState === loadingStateEnum.success) ? "Success":"Failed"} onPress={() => {if (createScheduleLoadingState === loadingStateEnum.notStarted) {submitSchedule()}}} />
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