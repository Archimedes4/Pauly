/*
  Pauly
  Andrew Mainella
  November 10 2023
  SelectSchoolDayData.tsx
  This is for selecting school day data 
*/
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import createUUID from '@utils/ultility/createUUID';
import {
  getGraphEvents,
  getTimetable,
} from '@utils/calendar/calendarFunctionsGraph';
import { addEventSlice } from '@src/redux/reducers/addEventReducer';
import store, { RootState } from '@redux/store';
import { loadingStateEnum, semesters } from '@constants';

enum pickSchoolDayMode {
  schoolYear,
  schoolDay,
  schedule,
  dressCode,
  semester,
  dressCodeIncentives,
}

function SchoolYearsSelect({ onSelect }: { onSelect: () => void }) {
  const [loadingState, setLoadingState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [currentEventsSchoolYear, setCurrentEventsSchoolYear] = useState<
    eventType[]
  >([]);
  const dispatch = useDispatch();

  async function getData() {
    const result = await getGraphEvents(
      `https://graph.microsoft.com/v1.0/groups/${
        process.env.EXPO_PUBLIC_ORGWIDEGROUPID
      }/calendar/events?$expand=singleValueExtendedProperties($filter=id%20eq%20'${
        store.getState().paulyList.eventTypeExtensionId
      }'%20or%20id%20eq%20'${
        store.getState().paulyList.eventDataExtensionId
      }')&$filter=singleValueExtendedProperties/Any(ep:%20ep/id%20eq%20'${
        store.getState().paulyList.eventTypeExtensionId
      }'%20and%20ep/value%20eq%20'schoolYear')`,
    );
    if (
      result.result === loadingStateEnum.success &&
      result.events !== undefined
    ) {
      let outputEvents: eventType[] = result.events;
      let url: string = result.nextLink !== undefined ? result.nextLink : '';
      let notFound: boolean = result.nextLink !== undefined;
      while (notFound) {
        const furtherResult = await getGraphEvents(url);
        if (
          furtherResult.result === loadingStateEnum.success &&
          furtherResult.events !== undefined
        ) {
          outputEvents = [...outputEvents, ...furtherResult.events];
          url =
            furtherResult.nextLink !== undefined ? furtherResult.nextLink : '';
          notFound = furtherResult.nextLink !== undefined;
        } else {
          notFound = false;
        }
      }
      setCurrentEventsSchoolYear(outputEvents);
      setLoadingState(loadingStateEnum.success);
    } else {
      setLoadingState(loadingStateEnum.failed);
    }
  }

  useEffect(() => {
    getData();
  }, []);

  return (
    <View>
      <ScrollView>
        {loadingState === loadingStateEnum.loading ? (
          <Text>Loading</Text>
        ) : (
          <View>
            {loadingState === loadingStateEnum.success ? (
              <View>
                {currentEventsSchoolYear.map(event => (
                  <Pressable
                    key={`School_Year_${createUUID()}`}
                    onPress={() => {
                      dispatch(
                        addEventSlice.actions.setSelectedSchoolYear(event),
                      );
                      onSelect();
                    }}
                  >
                    <View>
                      <Text style={{ margin: 10 }}>{event.name}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : (
              <Text>Failed</Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function SchoolDaySelect({
  width,
  height,
  timetable,
  loadingState,
  onSelect,
  onBack,
}: {
  width: number;
  height: number;
  timetable: timetableType | undefined;
  loadingState: loadingStateEnum;
  onSelect: () => void;
  onBack: () => void;
}) {
  const dispatch = useDispatch();
  const { selectedSchoolYear } = useSelector(
    (state: RootState) => state.addEvent,
  );
  if (selectedSchoolYear === undefined) {
    return  (
      <View>
        <Text>Something went wrong</Text>
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
      {loadingState === loadingStateEnum.loading ? <Text>Loading</Text> : null}
      {loadingState !== loadingStateEnum.loading &&
      (loadingState !== loadingStateEnum.success || timetable === undefined) ? (
        <Text>Failed</Text>
      ) : null}
      {loadingState === loadingStateEnum.success && timetable !== undefined ? (
        <ScrollView style={{ width, height }}>
          {timetable.days.map(day => (
            <Pressable
              key={`Day_${day.id}`}
              onPress={() => {
                onSelect();
                dispatch(
                  addEventSlice.actions.setSelectedSchoolDayData({
                    schoolDay: day,
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
                    schoolYearEventId: selectedSchoolYear.id
                  }),
                );
              }}
            >
              <View>
                <Text>{day.name}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

function ScheduleSelect({
  schedules,
  onSelect,
}: {
  schedules: scheduleType[];
  onSelect: (item: scheduleType) => void;
  onBack: () => void;
}) {
  return (
    <View>
      {schedules.map(schedule => (
        <Pressable
          key={`Schedule_${schedule.id}`}
          onPress={() => {
            onSelect(schedule);
          }}
        >
          <View>
            <Text>{schedule.properName}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

function DressCodeSelect({
  dressCodeData,
  onSelect,
  onBack,
}: {
  dressCodeData: dressCodeDataType[];
  onSelect: (item: dressCodeDataType) => void;
  onBack: () => void;
}) {
  return (
    <View>
      <Pressable
        onPress={() => {
          onBack();
        }}
      >
        <Text>Back</Text>
      </Pressable>
      {dressCodeData.map(data => (
        <Pressable
          onPress={() => {
            onSelect(data);
          }}
        >
          <Text>{data.name}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function DressCodeIncentivesSelect({
  dressCodeIncentivesData,
  onBack,
}: {
  dressCodeIncentivesData: dressCodeIncentiveType[];
  onSelect: (item: dressCodeIncentiveType) => void;
  onBack: () => void;
}) {
  return (
    <View>
      <Pressable onPress={() => onBack()}>
        <Text>Back</Text>
      </Pressable>
      {dressCodeIncentivesData.map(incentive => (
        <View>
          <Text>{incentive.name}</Text>
        </View>
      ))}
      <Text>None</Text>
    </View>
  );
}

export default function SelectSchoolDayData({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  const [schoolDayMode, setSchoolDayMode] = useState<pickSchoolDayMode>(
    pickSchoolDayMode.schoolYear,
  );
  const [timetableState, setTimetableState] = useState<loadingStateEnum>(
    loadingStateEnum.notStarted,
  );
  const [timetable, setTimetable] = useState<timetableType | undefined>(
    undefined,
  );
  const { selectedSchoolYear, selectedEvent } = useSelector(
    (state: RootState) => state.addEvent,
  );
  const dispatch = useDispatch();

  const loadData = useCallback(async (id: string) => {
    setTimetableState(loadingStateEnum.loading);
    const result = await getTimetable(id);
    if (
      result.result === loadingStateEnum.success
    ) {
      setTimetable(result.timetable);
      setTimetableState(loadingStateEnum.success);
    } else {
      setTimetableState(loadingStateEnum.failed);
    }
  }, []);
  useEffect(() => {
    if (
      selectedSchoolYear !== undefined &&
      timetable === undefined &&
      selectedSchoolYear.paulyEventType === 'schoolYear'
    ) {
      loadData(selectedSchoolYear.timetableId);
    }
  }, [loadData, schoolDayMode, selectedSchoolYear, timetable]);

  if (selectedEvent.paulyEventType !== 'schoolDay') {
    return (
      <View>
        <Text>Something went wrong</Text>
      </View>
    )
  }

  if (schoolDayMode === pickSchoolDayMode.schoolYear || selectedSchoolYear === undefined || selectedSchoolYear.paulyEventType !== 'schoolYear') {
    return (
      <SchoolYearsSelect
        onSelect={() => setSchoolDayMode(pickSchoolDayMode.schoolDay)}
      />
    )
  }

  if (schoolDayMode === pickSchoolDayMode.schoolDay) {
    return (
      <SchoolDaySelect
        width={width}
        height={height}
        timetable={timetable}
        loadingState={timetableState}
        onSelect={() => {
          setSchoolDayMode(pickSchoolDayMode.schedule);
        }}
        onBack={() => {
          setSchoolDayMode(pickSchoolDayMode.schoolYear);
        }}
      />
    )
  }

  if ((schoolDayMode === pickSchoolDayMode.schedule && timetable !== undefined)) {
    return (
      <ScheduleSelect
        schedules={timetable.schedules}
        onSelect={e => {
          dispatch(
            addEventSlice.actions.setSelectedSchoolDayData({
              schoolDay: selectedEvent.schoolDayData.schoolDay,
              schedule: e,
              dressCode: selectedEvent.schoolDayData.dressCode,
              semester: selectedEvent.schoolDayData.semester,
              schoolYearEventId: selectedSchoolYear.id
            }),
          );
          setSchoolDayMode(pickSchoolDayMode.dressCode);
        }}
        onBack={() => {
          setSchoolDayMode(pickSchoolDayMode.schoolDay);
        }}
      />
    )
  }

  if (schoolDayMode === pickSchoolDayMode.dressCode && timetable !== undefined) {
    return (
      <DressCodeSelect
        dressCodeData={timetable.dressCode.dressCodeData}
        onSelect={e => {
          dispatch(
            addEventSlice.actions.setSelectedSchoolDayData({
              schoolDay: selectedEvent.schoolDayData.schoolDay,
              schedule: selectedEvent.schoolDayData.schedule,
              dressCode: e,
              semester: selectedEvent.schoolDayData.semester,
              schoolYearEventId: selectedSchoolYear.id
            }),
          );
          setSchoolDayMode(pickSchoolDayMode.semester);
        }}
        onBack={() => {
          setSchoolDayMode(pickSchoolDayMode.schedule);
        }}
      />
    )
  }

  if (schoolDayMode === pickSchoolDayMode.semester) {
    return (
      <View>
        <Pressable
          onPress={() => {
            setSchoolDayMode(pickSchoolDayMode.dressCode);
          }}
        >
          <Text>Back</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            dispatch(
              addEventSlice.actions.setSelectedSchoolDayData({
                schoolDay: selectedEvent.schoolDayData.schoolDay,
                schedule: selectedEvent.schoolDayData.schedule,
                dressCode: selectedEvent.schoolDayData.dressCode,
                semester: semesters.semesterOne,
                schoolYearEventId: selectedSchoolYear.id
              }),
            );
            setSchoolDayMode(pickSchoolDayMode.dressCodeIncentives);
          }}
        >
          <Text>Semester One</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            dispatch(
              addEventSlice.actions.setSelectedSchoolDayData({
                schoolDay: selectedEvent.schoolDayData.schoolDay,
                schedule: selectedEvent.schoolDayData.schedule,
                dressCode: selectedEvent.schoolDayData.dressCode,
                semester: semesters.semesterTwo,
                schoolYearEventId: selectedSchoolYear.id
              }),
            );
            setSchoolDayMode(pickSchoolDayMode.dressCodeIncentives);
          }}
        >
          <Text>Semester Two</Text>
        </Pressable>
      </View>
    )
  }

  if (schoolDayMode === pickSchoolDayMode.dressCodeIncentives && timetable !== undefined) {
    return (
      <DressCodeIncentivesSelect
        dressCodeIncentivesData={timetable.dressCode.dressCodeIncentives}
        onSelect={e => {
          dispatch(
            addEventSlice.actions.setSelectedSchoolDayData({
              schoolDay: selectedEvent.schoolDayData.schoolDay,
              schedule: selectedEvent.schoolDayData.schedule,
              dressCode: selectedEvent.schoolDayData.dressCode,
              semester: selectedEvent.schoolDayData.semester,
              dressCodeIncentive: e,
              schoolYearEventId: selectedSchoolYear.id
            }),
          );
        }}
        onBack={() => {
          setSchoolDayMode(pickSchoolDayMode.semester);
        }}
      />
    )
  }

  return (
    <View>
      <Text>Something went wrong.</Text>
    </View>
  )
}
