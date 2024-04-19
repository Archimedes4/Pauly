/*
  Pauly
  Andrew Mainella
  November 10 2023
  SelectSchoolDayData.tsx
  This is for selecting school day data 
*/
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addEventSlice } from '@redux/reducers/addEventReducer';
import store, { RootState } from '@redux/store';
import { loadingStateEnum, semesters } from '@constants';
import { getTimetable } from '@redux/reducers/timetableReducer';
import SchoolYearsSelect from './SchoolYearsSelect';
import SchoolDaySelect from './SchoolDaySelect';
import StyledButton from '@components/StyledButton';
import ScheduleSelect from './ScheduleSelect';
import DressCodeSelect from './DressCodeSelect';
import DressCodeIncentivesSelect from './DressCodeIncentiveSelect';

enum pickSchoolDayMode {
  overview,
  schoolYear,
  schoolDay,
  schedule,
  dressCode,
  semester,
  dressCodeIncentives,
}

export default function SelectSchoolDayData() {
  const [schoolDayMode, setSchoolDayMode] = useState<pickSchoolDayMode>(
    pickSchoolDayMode.schoolYear,
  );
  const { selectedSchoolYear, selectedEvent } = useSelector(
    (state: RootState) => state.addEvent,
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (selectedEvent.paulyEventType !== 'schoolDay') {
      return
    }
    const newSelectedSchoolYear = store.getState().currentEvents.find((e) => {
      if (e.paulyEventType === 'schoolYear'){
        return e.paulyId === selectedEvent.schoolDayData.schoolYearEventId
      }
      return false
    })
    if (selectedEvent.paulyEventType === 'schoolDay' && selectedEvent.schoolDayData.schoolYearEventId !== "" && selectedEvent.schoolDayData.schoolDay.id !== '' && selectedEvent.schoolDayData.dressCode.id !== "" && selectedEvent.schoolDayData.schedule.id !== "" && newSelectedSchoolYear !== undefined) {
      store.dispatch(addEventSlice.actions.setSelectedSchoolYear(newSelectedSchoolYear))
      setSchoolDayMode(pickSchoolDayMode.overview)
    }
  }, [])

  if (selectedEvent.paulyEventType !== 'schoolDay') {
    return (
      <View>
        <Text>Something went wrong</Text>
      </View>
    );
  }

  if (schoolDayMode === pickSchoolDayMode.overview) {
    return (
      <ScrollView style={{
        padding: 10
      }}>
        <StyledButton
          text={`School Year: ${selectedSchoolYear?.name}`}
          onPress={() => {
            setSchoolDayMode(pickSchoolDayMode.schoolYear)
          }}
          style={{marginVertical: 5}}
        />
        <StyledButton
          text={`School Day: ${selectedEvent.schoolDayData.schoolDay.name}`}
          onPress={() => {
            setSchoolDayMode(pickSchoolDayMode.schoolDay)
          }}
          style={{marginVertical: 5}}
        />
        <StyledButton
          text={`Schedule: ${selectedEvent.schoolDayData.schedule.properName}`}
          onPress={() => {
            setSchoolDayMode(pickSchoolDayMode.schedule)
          }}
          style={{marginVertical: 5}}
        />
        <StyledButton
          text={`Dress Code: ${selectedEvent.schoolDayData.dressCode.name}`}
          onPress={() => {
            setSchoolDayMode(pickSchoolDayMode.dressCode)
          }}
          style={{marginVertical: 5}}
        />
        <StyledButton
          text={`Semester: ${(selectedEvent.schoolDayData.semester === semesters.semesterOne) ? "One":"Two"}`}
          onPress={() => {
            setSchoolDayMode(pickSchoolDayMode.semester)
          }}
          style={{marginVertical: 5}}
        />
        <StyledButton
          text={`Dress Code Incentive: ${selectedEvent.schoolDayData.dressCodeIncentive ? selectedEvent.schoolDayData.dressCodeIncentive.name:"None"}`}
          onPress={() => {
           setSchoolDayMode(pickSchoolDayMode.dressCodeIncentives)
          }}
          style={{marginVertical: 5}}
        />
      </ScrollView>
    )
  }

  if (
    schoolDayMode === pickSchoolDayMode.schoolYear ||
    selectedSchoolYear === undefined ||
    selectedSchoolYear.paulyEventType !== 'schoolYear'
  ) {
    return (
      <SchoolYearsSelect
        onSelect={() => setSchoolDayMode(pickSchoolDayMode.schoolDay)}
      />
    );
  }

  if (schoolDayMode === pickSchoolDayMode.schoolDay) {
    return (
      <SchoolDaySelect
        onSelect={() => {
          setSchoolDayMode(pickSchoolDayMode.schedule);
        }}
        onBack={() => {
          setSchoolDayMode(pickSchoolDayMode.schoolYear);
        }}
      />
    );
  }

  if (schoolDayMode === pickSchoolDayMode.schedule) {
    return (
      <ScheduleSelect
        onSelect={e => {
          dispatch(
            addEventSlice.actions.setSelectedSchoolDayData({
              schoolYearEventId: selectedSchoolYear.id,
              schoolDay: selectedEvent.schoolDayData.schoolDay,
              schedule: e,
              dressCode: selectedEvent.schoolDayData.dressCode,
              semester: selectedEvent.schoolDayData.semester,
              dressCodeIncentive: selectedEvent.schoolDayData.dressCodeIncentive
            }),
          );
          // The dress code semester and dress code incentive can stay the same b/c in same timetable
          setSchoolDayMode(pickSchoolDayMode.dressCode);
        }}
        onBack={() => {
          setSchoolDayMode(pickSchoolDayMode.schoolDay);
        }}
      />
    );
  }

  if (
    schoolDayMode === pickSchoolDayMode.dressCode
  ) {
    return (
      <DressCodeSelect
        onSelect={e => {
          dispatch(
            addEventSlice.actions.setSelectedSchoolDayData({
              schoolDay: selectedEvent.schoolDayData.schoolDay,
              schedule: selectedEvent.schoolDayData.schedule,
              dressCode: e,
              semester: selectedEvent.schoolDayData.semester,
              schoolYearEventId: selectedSchoolYear.id,
            }),
          );
          setSchoolDayMode(pickSchoolDayMode.semester);
        }}
        onBack={() => {
          setSchoolDayMode(pickSchoolDayMode.schedule);
        }}
      />
    );
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
                schoolYearEventId: selectedSchoolYear.id,
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
                schoolYearEventId: selectedSchoolYear.id,
              }),
            );
            setSchoolDayMode(pickSchoolDayMode.dressCodeIncentives);
          }}
        >
          <Text>Semester Two</Text>
        </Pressable>
      </View>
    );
  }

  if (
    schoolDayMode === pickSchoolDayMode.dressCodeIncentives
  ) {
    return (
      <DressCodeIncentivesSelect
        onSelect={e => {
          dispatch(
            addEventSlice.actions.setSelectedSchoolDayData({
              schoolDay: selectedEvent.schoolDayData.schoolDay,
              schedule: selectedEvent.schoolDayData.schedule,
              dressCode: selectedEvent.schoolDayData.dressCode,
              semester: selectedEvent.schoolDayData.semester,
              dressCodeIncentive: e,
              schoolYearEventId: selectedSchoolYear.id,
            }),
          );
        }}
        onBack={() => {
          setSchoolDayMode(pickSchoolDayMode.semester);
        }}
      />
    );
  }

  return (
    <View>
      <Text>Something went wrong.</Text>
    </View>
  );
}
