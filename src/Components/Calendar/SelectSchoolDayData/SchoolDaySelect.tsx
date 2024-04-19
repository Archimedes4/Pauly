import StyledButton from "@src/components/StyledButton";
import { loadingStateEnum, semesters } from "@src/constants";
import { addEventSlice } from "@src/redux/reducers/addEventReducer";
import { getTimetable } from "@src/redux/reducers/timetableReducer";
import store, { RootState } from "@src/redux/store";
import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, FlatList } from "react-native";
import { useDispatch, useSelector } from "react-redux";

export default function SchoolDaySelect({
  onSelect,
  onBack,
}: {
  onSelect: () => void;
  onBack: () => void;
}) {
  const dispatch = useDispatch();
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


  if (selectedSchoolYear === undefined) {
    return (
      <View>
        <Text>Something went wrong</Text>
      </View>
    );
  }

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
            onBack();
          }}
        >
          <Text>Back</Text>
        </Pressable>
        <FlatList
          data={timetable.days}
          renderItem={(day) => (
            <StyledButton 
              text={day.item.name}
              onPress={() => {
                onSelect();
                dispatch(
                  addEventSlice.actions.setSelectedSchoolDayData({
                    schoolDay: day.item,
                    schedule: {
                      properName: '',
                      descriptiveName: '',
                      periods: [],
                      id: '',
                      color: '',
                    },
                    dressCode: {
                      name: '',
                      description: '',
                      id: '',
                    },
                    semester: semesters.semesterOne,
                    schoolYearEventId: selectedSchoolYear.id,
                  }),
                );
              }}
              style={{margin: 5}}
            />
          )}
          style={{paddingVertical: 5}}
        />
      </View>
    )
  }

  return (
    <View>
      <Pressable
        onPress={() => {
          onBack();
        }}
      >
        <Text>Back</Text>
      </Pressable>
      <Text>Failed</Text>
    </View>
  );
}