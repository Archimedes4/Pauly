/*
  Pauly
  Andrew Mainella
  October 18 2023
  AddEvent.tsx
*/
import React, { useEffect, useState } from 'react';
import {
  Pressable,
  View,
  Text,
  Switch,
  TextInput,
  Platform,
} from 'react-native';
import { TimePickerModal, DatePickerModal } from 'react-native-paper-dates';
import { useDispatch, useSelector } from 'react-redux';
import store, { RootState } from '@redux/store';
import { currentEventsSlice } from '@redux/reducers/currentEventReducer';
import { addEventSlice } from '@redux/reducers/addEventReducer';
import callMsGraph from '@utils/ultility/microsoftAssests';
import { Colors, loadingStateEnum, semesters, styles } from '@constants';
import updateEvent from '@utils/calendar/updateEvent';
import { getTextState } from '@utils/ultility/createUUID';
import calculateFontSize from '@utils/ultility/calculateFontSize';
import SelectSchoolDayData from './SelectSchoolDayData';
import SelectTimetable from './SelectTimetable';
import { CalendarIcon, CloseIcon, TimeIcon } from '../Icons';
import PickerWrapper from '../Pickers/Picker';
import SecondStyledButton from '../StyledButton';

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

function GovernmentCalendarOptions({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  const { selectedEvent, selectedTimetable, selectedSchoolYear } = useSelector(
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
      {selectedEvent.paulyEventType === 'schoolDay' ? (
        <View style={{ width, height: 100 }}>
          <Text>
            Selected School Year:{' '}
            {selectedSchoolYear ? selectedSchoolYear.name : 'None selected'}
          </Text>
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

function DateAndTimeSection({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  const { selectedEvent, isPickingStartDate, isPickingEndDate } = useSelector(
    (state: RootState) => state.addEvent,
  );
  const dispatch = useDispatch();
  const [endDatePickerVisable, setEndDatePickerVisable] =
    useState<boolean>(false);
  const [startDatePickerVisable, setStartDatePickerVisable] =
    useState<boolean>(false);
  return (
    <View>
      <DatePickerModal
        locale="en"
        mode="single"
        label="Select Date"
        visible={isPickingStartDate}
        onDismiss={() =>
          dispatch(addEventSlice.actions.setIsPickingStartDate(false))
        }
        date={new Date(selectedEvent.startTime)}
        onConfirm={e => {
          if (e.date !== undefined) {
            const oldDate = new Date(selectedEvent.startTime);
            dispatch(
              addEventSlice.actions.setStartDate(
                new Date(
                  e.date.getFullYear(),
                  e.date.getMonth(),
                  e.date.getDate(),
                  oldDate.getHours(),
                  oldDate.getMinutes(),
                ).toISOString(),
              ),
            );
          }
          dispatch(addEventSlice.actions.setIsPickingStartDate(false));
        }}
      />
      <DatePickerModal
        locale="en"
        mode="single"
        label="Select Date"
        visible={isPickingEndDate}
        onDismiss={() =>
          dispatch(addEventSlice.actions.setIsPickingEndDate(false))
        }
        date={new Date(selectedEvent.endTime)}
        onConfirm={e => {
          if (e.date !== undefined) {
            const oldDate = new Date(selectedEvent.endTime);
            const newDate = new Date(
              e.date.getFullYear(),
              e.date.getMonth(),
              e.date.getDate(),
              oldDate.getHours(),
              oldDate.getMinutes(),
            ).toISOString();
            dispatch(addEventSlice.actions.setEndDate(newDate));
          }
          dispatch(addEventSlice.actions.setIsPickingEndDate(false));
        }}
      />
      {selectedEvent.paulyEventType === 'schoolDay' ||
      selectedEvent.paulyEventType === 'schoolYear' ? null : (
        <View style={{ flexDirection: 'row', marginTop: 7, marginBottom: 7 }}>
          <Text>All Day</Text>
          <Switch
            trackColor={{ false: Colors.lightGray, true: Colors.darkGray }}
            thumbColor={selectedEvent.allDay ? Colors.maroon : Colors.darkGray}
            {...Platform.select({
              web: {
                activeThumbColor: Colors.maroon,
              },
            })}
            ios_backgroundColor={Colors.lightGray}
            onValueChange={e => {
              dispatch(addEventSlice.actions.setAllDay(e));
            }}
            value={selectedEvent.allDay}
            style={{ marginLeft: 10 }}
          />
        </View>
      )}
      <Text>
        {selectedEvent.paulyEventType === 'schoolDay' ? '' : 'Start '}Date
      </Text>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flexDirection: 'row', margin: 10 }}>
          <Pressable
            onPress={() => {
              dispatch(addEventSlice.actions.setIsPickingStartDate(true));
            }}
          >
            <Text>
              {new Date(selectedEvent.startTime).toLocaleString('en-us', {
                month: 'long',
              })}{' '}
              {new Date(selectedEvent.startTime).getDate()}{' '}
              {new Date(selectedEvent.startTime).getFullYear()}{' '}
            </Text>
          </Pressable>
          {!selectedEvent.allDay ? (
            <Pressable
              onPress={() => {
                setStartDatePickerVisable(true);
              }}
            >
              <Text>
                {new Date(selectedEvent.startTime).getHours() % 12 || 12}:
                {new Date(selectedEvent.startTime).getMinutes().toString()
                  .length === 1
                  ? `0${new Date(selectedEvent.startTime).getMinutes()}`
                  : new Date(selectedEvent.startTime).getMinutes()}{' '}
                {new Date(selectedEvent.startTime).getHours() >= 12
                  ? 'pm'
                  : 'am'}
              </Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={() => {
              dispatch(addEventSlice.actions.setIsPickingStartDate(true));
            }}
          >
            <CalendarIcon width={24} height={15} />
          </Pressable>
        </View>
        {selectedEvent.allDay ? null : (
          <View style={{ margin: 5 }}>
            <Pressable
              onPress={() => {
                setStartDatePickerVisable(true);
              }}
              style={{
                height: 26.4,
                alignContent: 'center',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TimeIcon width={15} height={15} />
            </Pressable>
            <TimePickerModal
              hours={new Date(selectedEvent.startTime).getHours()}
              minutes={new Date(selectedEvent.startTime).getMinutes()}
              visible={startDatePickerVisable}
              onDismiss={() => setStartDatePickerVisable(false)}
              onConfirm={e => {
                const newDate = new Date(selectedEvent.startTime);
                newDate.setHours(e.hours);
                newDate.setMinutes(e.minutes);
                dispatch(
                  addEventSlice.actions.setStartDate(newDate.toISOString()),
                );
                setStartDatePickerVisable(false);
              }}
            />
          </View>
        )}
      </View>
      {selectedEvent.paulyEventType === 'schoolDay' ? null : (
        <View>
          <Text>End Date</Text>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flexDirection: 'row', margin: 10 }}>
              <Pressable
                onPress={() => {
                  dispatch(addEventSlice.actions.setIsPickingEndDate(true));
                }}
              >
                <Text>
                  {new Date(selectedEvent.endTime).toLocaleString('en-us', {
                    month: 'long',
                  })}{' '}
                  {new Date(selectedEvent.endTime).getDate()}{' '}
                  {new Date(selectedEvent.endTime).getFullYear()}{' '}
                </Text>
              </Pressable>
              {!selectedEvent.allDay ? (
                <Pressable
                  onPress={() => {
                    setEndDatePickerVisable(true);
                  }}
                >
                  <Text>
                    {new Date(selectedEvent.endTime).getHours() % 12 || 12}:
                    {new Date(selectedEvent.endTime).getMinutes().toString()
                      .length === 1
                      ? `0${new Date(selectedEvent.endTime).getMinutes()}`
                      : new Date(selectedEvent.endTime).getMinutes()}{' '}
                    {new Date(selectedEvent.endTime).getHours() >= 12
                      ? 'pm'
                      : 'am'}
                  </Text>
                </Pressable>
              ) : null}
              <Pressable
                onPress={() => {
                  dispatch(addEventSlice.actions.setIsPickingEndDate(true));
                }}
              >
                <CalendarIcon width={24} height={15} />
              </Pressable>
            </View>
            {selectedEvent.allDay ? null : (
              <View style={{ margin: 5 }}>
                <Pressable
                  onPress={() => {
                    setEndDatePickerVisable(true);
                  }}
                  style={{
                    height: 26.4,
                    alignContent: 'center',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TimeIcon width={15} height={15} />
                </Pressable>
                <TimePickerModal
                  hours={new Date(selectedEvent.endTime).getHours()}
                  minutes={new Date(selectedEvent.endTime).getMinutes()}
                  visible={endDatePickerVisable}
                  onDismiss={() => setEndDatePickerVisable(false)}
                  onConfirm={e => {
                    const newDate = new Date(selectedEvent.endTime);
                    newDate.setHours(e.hours);
                    newDate.setMinutes(e.minutes);
                    dispatch(
                      addEventSlice.actions.setEndDate(newDate.toISOString()),
                    );
                    setEndDatePickerVisable(false);
                  }}
                />
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

export default function AddEvent({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  const currentEvents = useSelector((state: RootState) => state.currentEvents);
  const isGovernmentMode = useSelector(
    (state: RootState) => state.isGovernmentMode,
  );
  const { selectedEvent, createEventState } = useSelector(
    (state: RootState) => state.addEvent,
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (
      selectedEvent.paulyEventType === 'schoolDay' ||
      selectedEvent.paulyEventType === 'schoolYear'
    ) {
      dispatch(addEventSlice.actions.setAllDay(true));
    }
  }, [dispatch, selectedEvent.paulyEventType]);

  async function deleteEvent() {
    if (
      selectedEvent !== undefined &&
      selectedEvent.microsoftEvent &&
      selectedEvent.microsoftReference !== undefined
    ) {
      const deleteEventResult = await callMsGraph(
        selectedEvent.microsoftReference,
        'DELETE',
      );
      if (deleteEventResult.ok) {
        const index = currentEvents.findIndex(e => {
          return e.id === selectedEvent.id;
        });
        dispatch(currentEventsSlice.actions.removeCurrentEvent(index));
        dispatch(addEventSlice.actions.setIsShowingAddDate(false));
      } else {
        // TO DO throw error
      }
    }
  }

  if (
    !isGovernmentMode &&
    ['schoolDay', 'schoolYear', 'regular', 'studentCouncil'].includes(
      selectedEvent.paulyEventType,
    )
  ) {
    return (
      <View
        style={{
          backgroundColor: Colors.white,
          width: width + 30,
          height,
          borderRadius: 5,
          borderWidth: 5,
        }}
      >
        <Pressable
          onPress={() => {
            dispatch(addEventSlice.actions.setIsShowingAddDate(false));
            dispatch(
              addEventSlice.actions.setCreateEventState(
                loadingStateEnum.notStarted,
              ),
            );
          }}
          style={{ marginLeft: 5, marginTop: 5 }}
        >
          <CloseIcon width={20} height={20} />
        </Pressable>
        <Text
          style={{
            marginLeft: 15,
            marginRight: 'auto',
            height:
              calculateFontSize(width, height * 0.1, selectedEvent.name) + 10,
            width,
            fontSize: calculateFontSize(
              width,
              height * 0.1,
              selectedEvent.name,
            ),
            fontFamily: 'Comfortaa-Regular',
          }}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {selectedEvent.name}
        </Text>
        <Text
          style={{
            margin: 15,
            fontSize: height * 0.025,
            fontFamily: 'Roboto-Bold',
          }}
        >
          {new Date(selectedEvent.startTime).toLocaleString('en-us', {
            month: 'long',
          })}{' '}
          {new Date(selectedEvent.startTime).getDate()}{' '}
          {new Date(selectedEvent.startTime).getFullYear()}{' '}
          {new Date(selectedEvent.startTime).getHours() % 12 || 12}:
          {new Date(selectedEvent.startTime).getMinutes().toString().length ===
          1
            ? `0${new Date(selectedEvent.startTime).getMinutes()}`
            : new Date(selectedEvent.startTime).getMinutes()}{' '}
          {new Date(selectedEvent.startTime).getHours() >= 12 ? 'pm' : 'am'}
        </Text>
        <Text
          style={{
            margin: 15,
            fontSize: height * 0.025,
            fontFamily: 'Roboto-Bold',
          }}
        >
          {new Date(selectedEvent.endTime).toLocaleString('en-us', {
            month: 'long',
          })}{' '}
          {new Date(selectedEvent.endTime).getDate()}{' '}
          {new Date(selectedEvent.endTime).getFullYear()}{' '}
          {new Date(selectedEvent.endTime).getHours() % 12 || 12}:
          {new Date(selectedEvent.endTime).getMinutes().toString().length === 1
            ? `0${new Date(selectedEvent.endTime).getMinutes()}`
            : new Date(selectedEvent.endTime).getMinutes()}{' '}
          {new Date(selectedEvent.endTime).getHours() >= 12 ? 'pm' : 'am'}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: Colors.white,
        width: width + 30,
        height,
        borderRadius: 5,
        borderWidth: 5,
      }}
    >
      <View style={{ margin: 10, width }}>
        <Pressable
          onPress={() => {
            dispatch(addEventSlice.actions.setIsShowingAddDate(false));
            dispatch(
              addEventSlice.actions.setCreateEventState(
                loadingStateEnum.notStarted,
              ),
            );
          }}
        >
          <CloseIcon width={20} height={20} />
        </Pressable>
        <Text
          style={{ fontFamily: 'BukhariScript', marginBottom: 5, marginTop: 5 }}
        >
          {selectedEvent.id !== 'create' ? 'Edit' : 'Add'} Event
        </Text>
        <TextInput
          value={selectedEvent.name}
          onChangeText={e => {
            dispatch(addEventSlice.actions.setEventName(e));
          }}
          placeholder="Event Name"
          style={styles.textInputStyle}
        />
        <DateAndTimeSection width={width} height={height} />
        {isGovernmentMode ? (
          <GovernmentCalendarOptions width={width} height={height} />
        ) : null}
        <SecondStyledButton
          onPress={() => {
            dispatch(
              addEventSlice.actions.setCreateEventState(
                loadingStateEnum.loading,
              ),
            );
            updateEvent();
          }}
          text={getTextState(createEventState, {
            notStarted: selectedEvent.id !== 'create' ? 'Save' : 'Create',
          })}
          style={{ marginBottom: 15, marginTop: 15 }}
        />
        {selectedEvent.id !== 'create' ? (
          <SecondStyledButton
            onPress={() => {
              dispatch(addEventSlice.actions.setIsShowingAddDate(false));
              deleteEvent();
            }}
            text="Delete"
          />
        ) : null}
      </View>
    </View>
  );
}
