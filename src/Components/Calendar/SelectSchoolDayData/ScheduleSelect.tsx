import StyledButton from "@src/components/StyledButton";
import { loadingStateEnum } from "@src/constants";
import { getTimetable } from "@src/redux/reducers/timetableReducer";
import store, { RootState } from "@src/redux/store";
import React from "react";
import { useEffect, useState } from "react";
import { Pressable, View, Text, FlatList } from "react-native";
import { useSelector } from "react-redux";

export default function ScheduleSelect({
  onSelect,
  onBack
}: {
  onSelect: (item: scheduleType) => void;
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
      <FlatList
        data={timetable.schedules}
        renderItem={(schedule) => (
          <StyledButton
            key={`Schedule_${schedule.item.id}`}
            onPress={() => {
              onSelect(schedule.item);
            }}
            text={schedule.item.properName}
          />
        )}
      />
    )
  }

  return (
    <View>
      <Text>Failed</Text>
    </View>
  );
}