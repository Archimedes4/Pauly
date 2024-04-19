import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { loadingStateEnum } from '@constants'
import SegmentedPicker from './Pickers/SegmentedPicker';
import { useSelector } from 'react-redux';
import store, { RootState } from '@redux/store';
import { getPaulySettings, paulySettingsSlice } from '@redux/reducers/paulySettingsReducer';
import ProgressView from './ProgressView';
import { setCalendarSetting } from '@utils/calendar/paulySettingsFunctions';

export default function PaulySettingsComponent({
  margin,
  textColor
}: {
  margin: number,
  textColor: string
}) {
  const { width } = useSelector(
    (state: RootState) => state.dimensions,
  );
  const settingState = useSelector(
    (state: RootState) => state.paulySettings.loadingState,
  );
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedCalendarSetting, setSelectedCalendarSetting] = useState<number>(0)
  const [isCalsSettingLoading, setIsCalsSettingLoading] = useState<boolean>(false)

  async function loadPaulySettings() {
    const paulySettings = await getPaulySettings(store)
    if (paulySettings.result === loadingStateEnum.success) {
      setSelectedCalendarSetting(paulySettings.data.calendarViewingMode)
    }
    setLoading(false)
  }

  // Update Effect
  useEffect(() => {
    const abort = new AbortController();
    const currentViewMode = store.getState().paulySettings.calendarViewingMode
    if (selectedCalendarSetting !== currentViewMode) {
      setIsCalsSettingLoading(true)
      const updateCalendarSetting = async () => {
        const updateCalendar = await setCalendarSetting(store, selectedCalendarSetting, false)
        if (updateCalendar.result === loadingStateEnum.success) {
          store.dispatch(paulySettingsSlice.actions.setCalendarViewMode(selectedCalendarSetting))
          setIsCalsSettingLoading(false)
        } else {
          setIsCalsSettingLoading(false)
          setSelectedCalendarSetting(currentViewMode)
        }
      };
      updateCalendarSetting()
    }
    return () => {
      abort.abort()
      setIsCalsSettingLoading(false)
    }
  }, [selectedCalendarSetting])

  useEffect(() => {
    loadPaulySettings()
  }, [])

  if (settingState === loadingStateEnum.loading || settingState === loadingStateEnum.notStarted || loading) {
    return (
      <View style={{flex: 1}}>
        <ProgressView width={14} height={14}/>
        <Text>Loading</Text>
      </View>
    )
  }

  if (settingState === loadingStateEnum.failed) {
    <View>
      <Text>Something went wrong, loading the settings</Text>
    </View>
  }

  return (
    <View>
      <View style={{
        flexDirection: "row"
      }}>
        <Text style={{marginHorizontal: margin, fontSize: 20, fontFamily: "Roboto-Bold", marginBottom: 10, marginTop: 15, color: textColor}}>Calendar Type</Text>
        {isCalsSettingLoading ?
          <ProgressView width={14} height={14}/>:null
        }
      </View>
      <SegmentedPicker style={{marginHorizontal: margin}} width={width * 0.9} height={35} options={["Full", "Full Removed", "Collapsed", "Collapsed Removed"]} selectedIndex={selectedCalendarSetting} setSelectedIndex={setSelectedCalendarSetting}/>
    </View>
  )
}