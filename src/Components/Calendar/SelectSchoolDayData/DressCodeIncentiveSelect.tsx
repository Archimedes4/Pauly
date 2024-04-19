import { loadingStateEnum } from "@src/constants";
import { getTimetable } from "@src/redux/reducers/timetableReducer";
import store, { RootState } from "@src/redux/store";
import React, { useEffect, useState } from "react";
import { Pressable, View, Text } from "react-native";
import { useSelector } from "react-redux";

export default function DressCodeIncentivesSelect({
  onBack,
}: {
  onSelect: (item: dressCodeIncentiveType) => void;
  onBack: () => void;
}) {
  const { selectedSchoolYear } = useSelector(
    (state: RootState) => state.addEvent,
  );
  const [timetableState, setTimetableState] = useState<loadingStateEnum>(loadingStateEnum.notStarted)
  const [timetable, setTimetable] = useState<timetableType | undefined>(undefined)
  
  async function loadData() {
    if (selectedSchoolYear === undefined || selectedSchoolYear.paulyEventType !== 'schoolYear') {
      return
    }
    setTimetableState(loadingStateEnum.loading)
    const result = await getTimetable(selectedSchoolYear.timetableId, store)
    if (result.result === loadingStateEnum.success) {
      setTimetable(result.data)
    }
    setTimetableState(result.result)
  }

  useEffect(() => {
    loadData()
  }, [])

  if (timetableState === loadingStateEnum.loading) {
    return (
      <View>
        <Text>Loading</Text>
      </View>
    )
  }

  if (timetableState === loadingStateEnum.success && timetable !== undefined) {
    return (
      <View>
        <Pressable onPress={() => onBack()}>
          <Text>Back</Text>
        </Pressable>
        {timetable.dressCode.dressCodeIncentives.map(incentive => (
          <View>
            <Text>{incentive.name}</Text>
          </View>
        ))}
        <Text>None</Text>
      </View>
    );
  }
  return (
    <View>
      <Text>Failed</Text>
    </View>
  )
}