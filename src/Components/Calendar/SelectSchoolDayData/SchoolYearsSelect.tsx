import { loadingStateEnum } from "@src/constants";
import { addEventSlice } from "@src/redux/reducers/addEventReducer";
import store from "@src/redux/store";
import { getGraphEvents } from "@src/utils/calendar/calendarFunctionsGraph";
import getSchoolYears from "@src/utils/calendar/getSchoolYears";
import createUUID from "@src/utils/ultility/createUUID";
import React, { useEffect } from "react";
import { useState } from "react";
import { Pressable, View, Text, FlatList } from "react-native";
import { useDispatch } from "react-redux";

export default function SchoolYearsSelect({ onSelect }: { onSelect: () => void }) {
  const [loadingState, setLoadingState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [currentEventsSchoolYear, setCurrentEventsSchoolYear] = useState<
    eventType[]
  >([]);
  const dispatch = useDispatch();

  async function getData() {
    const result = await getSchoolYears()
    if (
      result.result === loadingStateEnum.success
    ) {
      setCurrentEventsSchoolYear(result.events);
      setLoadingState(loadingStateEnum.success);
    } else {
      setLoadingState(loadingStateEnum.failed);
    }
  }

  useEffect(() => {
    getData();
  }, []);

  if (loadingState === loadingStateEnum.loading) {
    return (
      <View>
        <Text>Loading</Text>
      </View>
    )
  }

  if (loadingState === loadingStateEnum.success) {
    return (
      <FlatList
        data={currentEventsSchoolYear}
        renderItem={(event) => (
          <Pressable
              key={`School_Year_${createUUID()}`}
              onPress={() => {
                dispatch(
                  addEventSlice.actions.setSelectedSchoolYear(event.item),
                );
                onSelect();
              }}
            >
              <Text style={{ margin: 10 }}>{event.item.name}</Text>
            </Pressable>
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