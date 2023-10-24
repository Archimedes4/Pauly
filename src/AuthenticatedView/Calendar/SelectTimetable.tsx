import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigate } from 'react-router-native';
import { useSelector } from 'react-redux';
import callMsGraph from '../../Functions/ultility/microsoftAssets';
import { RootState } from '../../Redux/store';
import { loadingStateEnum } from '../../types';

export default function SelectTimetable({
  governmentMode,
  onSelect,
}: {
  governmentMode: boolean;
  onSelect?: (item: timetableStringType) => void;
}) {
  const { timetablesListId, siteId } = useSelector(
    (state: RootState) => state.paulyList,
  );
  const [loadingState, setLoadingState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [loadedTimetables, setLoadedTimetables] = useState<
    timetableStringType[]
  >([]);
  const navigate = useNavigate();

  async function getTimetables() {
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
  }

  useEffect(() => {
    getTimetables();
  }, []);

  return (
    <View>
      {loadingState === loadingStateEnum.loading ? <Text>Loading</Text> : null}
      {loadingState === loadingStateEnum.success ? (
        <View>
          {loadedTimetables.map(timetable => (
            <Pressable
              key={`Timetable_${timetable.id}`}
              onPress={() => {
                if (governmentMode) {
                  navigate(
                    `/profile/government/calendar/timetable/${timetable.id}`,
                  );
                } else if (onSelect !== undefined) {
                  onSelect(timetable);
                }
              }}
            >
              <View>
                <Text>{timetable.name}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      ) : null}
      {loadingState === loadingStateEnum.failed ? <Text>Failure</Text> : null}
    </View>
  );
}
