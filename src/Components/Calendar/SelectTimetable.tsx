/*
  Pauly
  Andrew Mainella
  November 10 2023
  SelectTimetable.tsx
*/
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import callMsGraph from '@utils/ultility/microsoftAssets';
import { RootState } from '@redux/store';
import { loadingStateEnum } from '@constants';
import StyledButton from '../StyledButton';

export default function SelectTimetable({
  governmentMode,
  onSelect,
}: {
  governmentMode: boolean;
  onSelect?: (item: timetableStringType) => void;
}) {
  const router = useRouter();
  const { timetablesListId, siteId } = useSelector(
    (state: RootState) => state.paulyList,
  );
  const [loadingState, setLoadingState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [loadedTimetables, setLoadedTimetables] = useState<
    timetableStringType[]
  >([]);

  const getTimetables = useCallback(async () => {
    const result = await callMsGraph(
      `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${timetablesListId}/items?expand=fields`,
    );
    if (result.ok) {
      const dataResult = await result.json();
      if (
        dataResult.value.length !== undefined &&
        dataResult.value.length !== null
      ) {
        const newLoadedTimetables: timetableStringType[] = [];
        for (let index = 0; index < dataResult.value.length; index += 1) {
          try {
            newLoadedTimetables.push({
              name: dataResult.value[index].fields.timetableName,
              id: dataResult.value[index].fields.timetableId,
            });
          } catch (e) {
            // TO DO unimportant but this shouldn't be able to happen if this doesn't work most likly invalid data has somehow gotten into the schedule data column of the schedule list
          }
        }
        setLoadedTimetables(newLoadedTimetables);
        setLoadingState(loadingStateEnum.success);
      }
    } else {
      setLoadingState(loadingStateEnum.failed);
    }
  }, [siteId, timetablesListId]);

  useEffect(() => {
    getTimetables();
  }, [getTimetables]);

  if (loadingState === loadingStateEnum.loading) {
    return (
      <View style={{flex: 1, alignContent: 'center', alignItems: 'center', justifyContent: 'center'}}>
        <Text>Loading</Text>
      </View>
    )
  }

  if (loadingState === loadingStateEnum.success) {
    return  (
      <FlatList 
        data={loadedTimetables}
        renderItem={(timetable) => (
          <StyledButton
            key={`Timetable_${timetable.item.id}`}
            onPress={() => {
              if (governmentMode) {
                router.replace(
                  `/government/calendar/timetable/${timetable.item.id}`,
                );
              } else if (onSelect !== undefined) {
                onSelect(timetable.item);
              }
            }}
            text={timetable.item.name}
            style={{margin: 15}}
          />
        )}
      />
    )
  }

  return (
    <View>
      <Text>Failure</Text>
    </View>
  );
}
