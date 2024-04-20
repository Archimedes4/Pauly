import store, { RootState } from "@redux/store";
import { useDispatch, useSelector } from "react-redux";
import PickerWrapper from "../Pickers/Picker";
import React, { useState } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import SelectSchoolDayData from "./SelectSchoolDayData";
import SelectTimetable from "./SelectTimetable";
import { addEventSlice } from "@redux/reducers/addEventReducer";
import { Colors, semesters } from "@src/constants";
import { Switch } from "react-native";
import calculateFontSize from "@src/utils/ultility/calculateFontSize";

function setSelectedEventType(e: number) {
  const { selectedEvent } = store.getState().addEvent;
  if (selectedEvent.id === 'create' && selectedEvent.microsoftEvent === true) {
    switch (e) {
      case 0:
        store.dispatch(
          addEventSlice.actions.setSelectedEvent({
            ...selectedEvent,
            paulyEventType: 'personal',
          }),
        );
        break;
      case 1:
        store.dispatch(
          addEventSlice.actions.setSelectedEvent({
            ...selectedEvent,
            paulyEventType: 'regular',
          }),
        );
        break;
      case 2:
        store.dispatch(
          addEventSlice.actions.setSelectedEvent({
            ...selectedEvent,
            paulyEventType: 'schoolDay',
            schoolDayData: {
              schoolDay: {
                name: '',
                shorthand: '',
                id: '',
                order: 0,
              },
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
              schoolYearEventId: '',
            },
          }),
        );
        break;
      case 3:
        store.dispatch(
          addEventSlice.actions.setSelectedEvent({
            ...selectedEvent,
            paulyEventType: 'schoolYear',
            timetableId: '',
            paulyId: '',
          }),
        );
        break;
      case 4:
        store.dispatch(
          addEventSlice.actions.setSelectedEvent({
            ...selectedEvent,
            paulyEventType: 'studentCouncil',
          }),
        );
        break;
    }
  } else if (selectedEvent.microsoftEvent === true) {
    switch (e) {
      case 0:
        store.dispatch(
          addEventSlice.actions.setSelectedEvent({
            ...selectedEvent,
            paulyEventType: 'regular',
          }),
        );
        break;
      case 1:
        store.dispatch(
          addEventSlice.actions.setSelectedEvent({
            ...selectedEvent,
            paulyEventType: 'schoolDay',
            schoolDayData: {
              schoolDay: {
                name: '',
                shorthand: '',
                id: '',
                order: 0,
              },
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
              schoolYearEventId: '',
            },
          }),
        );
        break;
      case 2:
        store.dispatch(
          addEventSlice.actions.setSelectedEvent({
            ...selectedEvent,
            paulyEventType: 'schoolYear',
            timetableId: '',
            paulyId: '',
          }),
        );
        break;
      case 3:
        store.dispatch(
          addEventSlice.actions.setSelectedEvent({
            ...selectedEvent,
            paulyEventType: 'studentCouncil',
          }),
        );
    }
  }
}

function SpecialEvent() {
  const selectedEvent = useSelector(
    (state: RootState) => state.addEvent.selectedEvent,
  );
  const dispatch = useDispatch()
  if (selectedEvent.paulyEventType !== 'regular') {
    return (
      <View>
        <Text>Something went wrong</Text>
      </View>
    )
  }
  return (
    <View>
      <Text>Please Add Event Data </Text>
      <Text>Special Event</Text>
      <Switch
        trackColor={{ false: Colors.lightGray, true: Colors.darkGray }}
        thumbColor={(selectedEvent.eventData === undefined) ? Colors.maroon : Colors.darkGray}
        {...Platform.select({
          web: {
            activeThumbColor: Colors.maroon,
          },
        })}
        ios_backgroundColor={Colors.lightGray}
        onValueChange={(e) => {
          if (e) {
            dispatch(addEventSlice.actions.setSelectedEvent({
              ...selectedEvent,
              eventData: {
                mandatory: false,
                grade: 'all'
              }
            }))
          } else {
            dispatch(addEventSlice.actions.setSelectedEvent({
              ...selectedEvent,
              eventData: undefined
            }))
          }
        }}
        value={selectedEvent.eventData !== undefined}
        style={{ marginLeft: 10 }}
      />
    </View> 
  )
}

function RegularOptionsGradeButton({
  grade,
  width,
  margin,
  end
}:{
  grade: grade,
  width: number,
  margin: number,
  end?: boolean
}) {
  const selectedEvent = useSelector(
    (state: RootState) => state.addEvent.selectedEvent,
  );
  if (selectedEvent.paulyEventType !== 'regular' || selectedEvent.eventData === undefined) {
    return <Text>Error</Text>
  }
  return (
    <Pressable
      onPress={() => {
        if (selectedEvent.eventData !== undefined) {
          let grades = selectedEvent.eventData.grade
          if (grades === 'all') {
            grades = []
          }
          if (grades.includes(grade)) {
            grades = grades.filter((e) => {
              return e !== grade;
            })
            if (grades.length === 0) {
              grades = "all"
            }
          } else {
            grades = [...grades, grade]
          }
          store.dispatch(addEventSlice.actions.setSelectedEvent({
            ...selectedEvent,
            eventData: {
              grade: grades,
              mandatory: selectedEvent.eventData.mandatory
            }
          }))
        }
      }}
      style={{
        backgroundColor: selectedEvent.eventData.grade.includes(grade) ? Colors.darkGray:Colors.white,
        borderRadius: 10,
        marginLeft: margin,
        marginRight: (end === true) ? 0:margin,
        width: width,
        overflow: 'hidden',
        justifyContent: 'center'
      }}
    >
      <Text
        style={{
          color: selectedEvent.eventData.grade.includes(grade) ? Colors.white:Colors.black,
          margin: 10,
          textAlign: 'center',
          fontSize: calculateFontSize(width - 15, 12, "Grade 11"),
          textAlignVertical: 'center'
        }}
      >Grade {grade}</Text>
    </Pressable>
  )
}

function RegularOptions({
  width
}:{
  width: number
}) {
  console.log(width)
  const selectedEvent = useSelector(
    (state: RootState) => state.addEvent.selectedEvent,
  );
  if (selectedEvent.paulyEventType !== 'regular') {
    return (
      <View>
        <Text>Something went wrong!</Text>
      </View>
    )
  }

  if (selectedEvent.eventData === undefined) {
    return (
      <SpecialEvent />
    )
  }

  return (
    <View>
      <SpecialEvent />
      <Text>Mandatory</Text>
      <Switch
        trackColor={{ false: Colors.lightGray, true: Colors.darkGray }}
        thumbColor={selectedEvent.eventData.mandatory ? Colors.maroon : Colors.darkGray}
        {...Platform.select({
          web: {
            activeThumbColor: Colors.maroon,
          },
        })}
        ios_backgroundColor={Colors.lightGray}
        onValueChange={e => {
          const grade = selectedEvent.eventData?.grade
          if (grade === undefined) {
            return
          }
          store.dispatch(addEventSlice.actions.setSelectedEvent({
            ...selectedEvent,
            eventData: {
              grade: grade,
              mandatory: e
            }
          }))
        }}
        value={selectedEvent.eventData.mandatory}
        style={{ marginLeft: 10 }}
      />
      <Text>Grade</Text>
      <View style={{flexDirection: 'row', width: width, backgroundColor: Colors.lightGray, padding: 5, borderRadius: 15, marginTop: 2}}>
        <Pressable
          onPress={() => {
            if (selectedEvent.eventData !== undefined) {
              store.dispatch(addEventSlice.actions.setSelectedEvent({
                ...selectedEvent,
                eventData: {
                  grade: 'all',
                  mandatory: selectedEvent.eventData.mandatory
                }
              }))
            }
          }}
          style={{
            backgroundColor: (selectedEvent.eventData.grade === 'all') ? Colors.darkGray:Colors.white,
            width: (width - 30)/5,
            borderRadius: 10,
            marginRight: 2.5
          }}
        >
          <Text
            style={{
              margin: 10,
              textAlign: 'center',
              color: (selectedEvent.eventData.grade === 'all') ? Colors.white:Colors.black
            }}
          >All</Text>
        </Pressable>
        <View style={{flexDirection: 'row'}}>
          <RegularOptionsGradeButton grade="9" width={(width - 30)/5} margin={2.5}/>
          <RegularOptionsGradeButton grade="10" width={(width - 30)/5} margin={2.5}/>
          <RegularOptionsGradeButton grade="11" width={(width - 30)/5} margin={2.5}/>
          <RegularOptionsGradeButton grade="12" width={(width - 30)/5} margin={2.5} end/>
        </View>
      </View>
    </View> 
  )
}

export default function GovernmentCalendarOptions({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  const { selectedEvent, selectedTimetable } = useSelector(
    (state: RootState) => state.addEvent,
  );
  const dispatch = useDispatch();

  return (
    <>
      {(selectedEvent.id === 'create' ||
        selectedEvent.paulyEventType !== 'personal') &&
      selectedEvent.microsoftEvent === true ? (
        <PickerWrapper
          selectedIndex={
            selectedEvent.id === 'create'
              ? [
                  'personal',
                  'regular',
                  'schoolDay',
                  'schoolYear',
                  'studentCouncil',
                ].indexOf(selectedEvent.paulyEventType)
              : [
                  'regular',
                  'schoolDay',
                  'schoolYear',
                  'studentCouncil',
                ].indexOf(selectedEvent.paulyEventType)
          }
          onSetSelectedIndex={e => {
            setSelectedEventType(e);
          }}
          width={width}
          height={height * 0.05}
        >
          {selectedEvent.id === 'create' ? (
            <Text numberOfLines={1} style={{ fontSize: 8 }} key="Personal">
              Personal
            </Text>
          ) : null}
          <Text numberOfLines={1} style={{ fontSize: 8 }} key="Regular">
            Regular
          </Text>
          <Text numberOfLines={1} style={{ fontSize: 8 }} key="Day">
            School Day{' '}
          </Text>
          <Text numberOfLines={1} style={{ fontSize: 8 }} key="Year">
            School Year
          </Text>
          <Text numberOfLines={1} style={{ fontSize: 8 }} key="Council">
            Student Council
          </Text>
        </PickerWrapper>
      ) : null}
      {selectedEvent.paulyEventType === 'regular' ? (
        <RegularOptions width={width}/>
      ) : null}
      {selectedEvent.paulyEventType === 'schoolDay' ? (
        <View style={{ width: width + 20, marginLeft: -10, height: height * 0.5 }}>
          <SelectSchoolDayData />
        </View>
      ) : null}
      {selectedEvent.paulyEventType === 'schoolYear' ? (
        <View>
          <Text>
            Selected Timetable:{' '}
            {selectedTimetable ? selectedTimetable.name : 'Unselected'}
          </Text>
          <SelectTimetable
            governmentMode={false}
            onSelect={e => {
              dispatch(
                addEventSlice.actions.setSelectedEvent({
                  ...selectedEvent,
                  timetableId: e.id,
                }),
              );
            }}
            selectedTimetableId={selectedEvent.timetableId}
          />
        </View>
      ) : null}
    </>
  );
}