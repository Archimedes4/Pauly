import { loadingStateEnum } from "@src/constants";
import { getTimetable } from "@src/redux/reducers/timetableReducer";
import store, { RootState } from "@src/redux/store";
import React, { useEffect, useState } from "react";
import { Pressable, View, Text, FlatList } from "react-native";
import { useSelector } from "react-redux";

export default function DressCodeSelect({
  onSelect,
  onClose,
}: {
  onSelect: (item: dressCodeDataType) => void;
  onClose: () => void;
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
        <Pressable
          onPress={() => {
            onClose();
          }}
        >
          <Text>Back</Text>
        </Pressable>
        <FlatList
          data={timetable.dressCode.dressCodeData}
          renderItem={item => (
            <Pressable
              key={item.item.id}
              onPress={() => {
                onSelect(item.item);
              }}
            >
              <Text>{item.item.name}</Text>
            </Pressable>
          )}
        />
      </View>
    );
  }
  return (
    <View>
      <Text>Something went wrong</Text>
    </View>
  )
}