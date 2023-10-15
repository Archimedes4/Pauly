import { View, Text, TextInput, Button, Pressable, Modal } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-native'
import callMsGraph from '../../../../../Functions/Ultility/microsoftAssets'
import create_UUID from '../../../../../Functions/Ultility/CreateUUID'
import { useSelector } from 'react-redux'
import store, { RootState } from '../../../../../Redux/store'
import { Colors, loadingStateEnum } from '../../../../../types'
import { CloseIcon, WarningIcon } from '../../../../../UI/Icons/Icons'
import { TimePickerModal, he } from 'react-native-paper-dates';
import { ScrollView } from 'react-native-gesture-handler'
import Animated, { interpolateColor, useAnimatedStyle } from "react-native-reanimated"
import ColorPicker, {Preview, Panel1, HueSlider, OpacitySlider, Swatches, RenderThumbProps, InputWidget} from "reanimated-color-picker"
import ProgressView from '../../../../../UI/ProgressView'
import { getSchedule } from '../../../../../Functions/calendar/calendarFunctionsGraph'

function isValidHexaCode(input: string) {
  // Define the regular expression pattern for a valid hexadecimal color code
  // It matches either a 6-character or 3-character code, preceded by a #
  var hexaPattern = /^#(?:[0-9a-fA-F]{3,4}){1,2}$/;

  // Test the input against the pattern using the test() method
  return hexaPattern.test(input);
}

//NOTE: period length cannot be longer than 20
export default function GovernmentSchedule() {
  const {id} = useParams()
  const {width, height} = useSelector((state: RootState) => state.dimentions)

  const [scheduleProperName, setScheduleProperName] = useState<string>("")
  const [scheduleDescriptiveName, setScheduleDescriptiveName] = useState<string>("")
  const [newPeriods, setNewPeriods] = useState<periodType[]>([])
  const [color, setColor] = useState<string>("#ffffff")

  const [isPickingColor, setIsPickingColor] = useState<boolean>(false)
  const [isCreatingSchedule, setIsCreatingSchedule] = useState<boolean>(false)

  const [createScheduleLoadingState, setCreateScheduleLoadingState] = useState<loadingStateEnum>(loadingStateEnum.notStarted)
  const [loadScheduleState, setLoadScheduleState] = useState<loadingStateEnum>(loadingStateEnum.loading)

  const navigate = useNavigate()
  async function submitSchedule() {
    setCreateScheduleLoadingState(loadingStateEnum.loading)
    const data = {
      "fields": {
        "Title":scheduleProperName,
        "scheduleId":create_UUID(),
        "scheduleProperName":scheduleProperName,
        "scheduleDescriptiveName":scheduleDescriptiveName,
        "scheduleColor":color,
        "scheduleData":JSON.stringify(newPeriods)
      }
    }
    const result = await callMsGraph(`https://graph.microsoft.com/v1.0/sites/${store.getState().paulyList.siteId}/lists/${store.getState().paulyList.scheduleListId}/items`, "POST", false, JSON.stringify(data))
    if (result.ok){
      setCreateScheduleLoadingState(loadingStateEnum.success)
    } else {
      setCreateScheduleLoadingState(loadingStateEnum.failed)
    }
  }

  async function deleteFunction() {
    const result = await callMsGraph("", "DELETE")
    if (result.ok) {

    } else {

    }
  }

  async function loadFunction() {
    if (id !== undefined) {
      const result = await getSchedule(id)
      if (result.result === loadingStateEnum.success && result.schedule !== undefined) {
        setScheduleProperName(result.schedule.properName)
        setScheduleDescriptiveName(result.schedule.descriptiveName)
        setColor(result.schedule.color)
        setNewPeriods(result.schedule.periods)
      }
      setLoadScheduleState(result.result)
    } else {
      setLoadScheduleState(loadingStateEnum.failed)
    }
  }

  useEffect(() => {
    if (id === 'create') {
      setIsCreatingSchedule(true)
    } else {
      loadFunction()
    }
  }, [])

  return (
    <>
      { (isCreatingSchedule || loadScheduleState === loadingStateEnum.success) ?
        <ScrollView style={{width: width, height: height, backgroundColor: Colors.white}}>
          <Pressable onPress={() => {navigate("/profile/government/calendar/schedule")}}>
            <Text>Back</Text>
          </Pressable>
          <View style={{width: width, alignContent: "center", alignItems: "center", justifyContent: "center"}}>
            <Text>{isCreatingSchedule ? "Create":"Edit"} Schedule</Text>
          </View>
          <View style={{height: height * 0.2}}>
            <View style={{flexDirection: "row"}}>
              <Text>Proper Name:</Text>
              <TextInput style={{width: width}} value={scheduleProperName} onChangeText={setScheduleProperName} placeholder='Proper Name ex. Schedule One'/>
            </View>
            <View style={{flexDirection: "row"}}>
              <Text>Descriptive Name:</Text>
              <TextInput style={{width: width}} value={scheduleDescriptiveName} onChangeText={setScheduleDescriptiveName} placeholder='Descriptive Name ex. Regular Schedule'/>
            </View>
            <View style={{margin: 5, borderRadius: 5, backgroundColor: "#FF6700"}}>
              <View style={{margin: 10, flexDirection: "row"}}>
                <WarningIcon width={14} height={14} />
                <Text>Keep descriptive name short as it is used in the calendar widget</Text>
              </View>
            </View>
          </View>
          <Text>New Periods</Text>
          <ScrollView style={{height: height * 0.5}}>
          {newPeriods.map((period) => (
            <PeriodBlock period={period} periods={newPeriods} onSetNewPeriods={(out) => {
              setNewPeriods([...out])
            }}/>
          ))}
          </ScrollView>
          { (newPeriods.length < 20) ?
            <Pressable onPress={() => {setNewPeriods([...newPeriods, {startHour: new Date().getHours(), startMinute: new Date().getMinutes(), endHour: new Date().getHours(), endMinute: new Date().getMinutes(), id: create_UUID()}])}}>
              <Text>Add Period</Text>
            </Pressable>  
            :null
          }
          <Pressable onPress={() => setIsPickingColor(true)} style={{margin: 10, backgroundColor: "#FFFFFF", shadowColor: "black", shadowOffset: {width: 1, height: 1}, shadowOpacity: 1, shadowRadius: 5, borderRadius: 15}}>
            <View style={{margin: 10}}>
              <Text>Color</Text>
              <View style={{flexDirection: "row", marginTop: 10}}>
                <View style={{width: 32.4, height: 32.4, backgroundColor: color, borderRadius: 7, borderWidth: 2, borderColor: Colors.black}}/>
                <Pressable style={{marginLeft: 5}}>
                  <ColorPicker style={{ width: width - 77.4, height: 16.5}} value={color} onComplete={(e) => setColor(e.hex)}>
                    <InputWidget disableAlphaChannel={true} defaultFormat='HEX' formats={["HEX"]} inputTitleStyle={{display: "none"}}/>
                  </ColorPicker>
                </Pressable>
                <Modal visible={isPickingColor} animationType='slide'>
                  <View style={{alignContent: "center", justifyContent: "center", alignItems: "center", width: width, height: height}}>
                    <Pressable onPress={() => setIsPickingColor(false)} style={{position: "absolute", top: height * 0.1, left: width * 0.1}}>
                      <CloseIcon width={14} height={14}/>
                    </Pressable>
                    <ColorPicker style={{ width: width * 0.7 }} value={color} onComplete={(e) => setColor(e.hex)}>
                      <View style={{flexDirection: "row"}}>
                        <Preview hideText={true} hideInitialColor={true} style={{width: width * 0.1, height: height * 0.5, borderTopRightRadius: 0, borderBottomRightRadius: 0}}/>
                        <View style={{borderTopRightRadius: 5, borderBottomRightRadius: 5, overflow: "hidden"}}>
                          <Panel1  style={{width: width * 0.6, height: height * 0.5, borderRadius: 0}} renderThumb={(e) => (
                            <CustomColorThumb e={e} diameter={15}/>
                          )}/>
                        </View>
                      </View>
                      <HueSlider renderThumb={(e) => (
                        <CustomColorThumb e={e}/>
                      )} style={{height: 30, marginTop: 10}}/>
                    </ColorPicker>
                    <Pressable style={{marginTop: 10, backgroundColor: Colors.darkGray, borderRadius: 15, width: width * 0.5, alignContent: "center", alignItems: "center", justifyContent: "center"}}  onPress={() => setIsPickingColor(false)}>
                      <Text style={{margin: 10, color: Colors.white}}>OK</Text>
                    </Pressable>
                  </View>
                </Modal>
              </View>
            </View>
          </Pressable>
          <Pressable onPress={() => {
            if (createScheduleLoadingState === loadingStateEnum.notStarted && isValidHexaCode(color)) {
              submitSchedule()
            }
          }} disabled={!isValidHexaCode}>
            <Text>{(!isValidHexaCode(color)) ? "Cannot Start":(createScheduleLoadingState === loadingStateEnum.notStarted) ? "Create Schedule":(createScheduleLoadingState === loadingStateEnum.loading) ? "Loading":(createScheduleLoadingState === loadingStateEnum.success) ? "Success":"Failed"}</Text>
          </Pressable>
          { !isCreatingSchedule ? 
            <Pressable style={{margin: 10, backgroundColor: Colors.danger}}>
              <Text style={{margin: 10}}>DELETE</Text>
            </Pressable>:null
          }
        </ScrollView>:
        <>
          { (loadScheduleState === loadingStateEnum.loading) ?
            <View style={{width: width, height: height, backgroundColor: Colors.white, alignContent: "center", alignItems: "center", justifyContent: "center"}}>
              <Pressable onPress={() => {navigate("/profile/government/calendar/schedule")}} style={{position: "absolute", top: 0, left: 0}}>
                <Text>Back</Text>
              </Pressable>
              <ProgressView width={width * 0.1} height={height * 0.1}/>
              <Text>Loading</Text>
            </View>:
            <View style={{width: width, height: height, backgroundColor: Colors.white}}>
              <Pressable onPress={() => {navigate("/profile/government/calendar/schedule")}}>
                <Text>Back</Text>
              </Pressable>
              <Text>Failed</Text>
            </View>
          }
        </>
      }
    </>
  )
}

function PeriodBlock({period, periods, onSetNewPeriods}:{period: periodType, periods: periodType[], onSetNewPeriods: (item: periodType[]) => void}) {
  const [isSelectingStartTime, setIsSelectingStartTime] = useState<boolean>(false)
  const [isSelectingEndTime, setIsSelectingEndTime] = useState<boolean>(false)

  function deleteItem(period: periodType) {
    var newNewPeriodsArray: periodType[] = periods
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
    <View key={`Period_${period.id}_${create_UUID()}`} style={{margin: 10, backgroundColor: "#FFFFFF", shadowColor: "black", shadowOffset: {width: 1, height: 1}, shadowOpacity: 1, shadowRadius: 5, borderRadius: 15, marginLeft: 5, marginRight: 5}}>
      <View style={{margin: 10}}>
        <View style={{flexDirection: "row", marginBottom: 10}}>
          <Text>{period.startHour}:{period.startMinute}</Text>
          <Pressable onPress={() => setIsSelectingStartTime(true)}>
            <Text>Pick start time</Text>
          </Pressable>
        </View>
        <TimePickerModal
          hours={period.startHour}
          minutes={period.startMinute} 
          visible={isSelectingStartTime} 
          onDismiss={() => setIsSelectingStartTime(false)} 
          onConfirm={(e) => {
            var newPeriods: periodType[] = periods
            const update = newPeriods.findIndex((e) => {return e.id === period.id})
            if (update !== -1){
              newPeriods[update].startHour = e.hours
              newPeriods[update].startMinute = e.minutes
              onSetNewPeriods([...newPeriods])
              setIsSelectingStartTime(false)
              console.log("all good")
            } else {
              //TO DO failed
              console.log("failed")
              setIsSelectingStartTime(false)
            }
          }}
        />
        <View style={{flexDirection: "row", marginBottom: 10}}>
          <Text>{period.endHour}:{period.endMinute}</Text>
          <Pressable onPress={() => setIsSelectingEndTime(true)}>
            <Text>Pick end time</Text>
          </Pressable>
        </View>
        <TimePickerModal
          hours={period.endHour}
          minutes={period.endMinute} 
          visible={isSelectingEndTime} 
          onDismiss={() => setIsSelectingEndTime(false)} 
          onConfirm={(e) => {
            var newPeriods: periodType[] = periods
            const update = newPeriods.findIndex((e) => {return e.id === period.id})
            if (update !== -1){
              newPeriods[update].endHour = e.hours
              newPeriods[update].endMinute = e.minutes
              onSetNewPeriods([...newPeriods])
              setIsSelectingEndTime(false)
            } else {
              //TO DO failed
              setIsSelectingEndTime(false)
            }
          }}
        />
        <Pressable onPress={() => deleteItem(period)} style={{backgroundColor: "red", borderRadius: 15}}>
          <Text style={{margin: 10}}>Remove</Text>
        </Pressable>
      </View>
    </View>
  )
}

function CustomColorThumb({e, diameter}:{e: RenderThumbProps, diameter?: number}) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: e.currentColor.value
    };
  });

  return (
    <Animated.View  style={[{width: diameter ? diameter:35, height: diameter ? diameter: 35, borderRadius: diameter ? diameter/2:20, borderWidth: 2, borderColor: "white"}, animatedStyle, e.positionStyle]}/>
  )
}