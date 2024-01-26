/*
  Pauly
  Andrew Mainella
  October 18 2023
  AddEvent.tsx
*/
import React, { useEffect, useState } from 'react';
import { Pressable, View, Text, Switch, TextInput } from 'react-native';
import { TimePickerModal, DatePickerModal } from 'react-native-paper-dates';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { currentEventsSlice } from '@redux/reducers/currentEventReducer';
import { addEventSlice } from '@src/redux/reducers/addEventReducer';
import callMsGraph from '@utils/ultility/microsoftAssets';
import { Colors, loadingStateEnum, paulyEventType, styles } from '@constants';
import updateEvent from '@utils/updateEvent';
import { getTextState } from '@utils/ultility/createUUID';
import SelectSchoolDayData from './SelectSchoolDayData';
import SelectTimetable from './SelectTimetable';
import { CalendarIcon, CloseIcon, TimeIcon } from '../Icons';
import PickerWrapper from '../Pickers/Picker';
import SecondStyledButton from '../StyledButton';

function GovernmentCalendarOptions({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  const { selectedEventType, selectedTimetable, selectedSchoolYear } =
    useSelector((state: RootState) => state.addEvent);
  const dispatch = useDispatch();
  return (
    <>
      <View>
        <PickerWrapper
          selectedIndex={selectedEventType}
          onSetSelectedIndex={e => {
            dispatch(addEventSlice.actions.setSelectedEventType(e));
          }}
          width={width}
          height={height * 0.05}
        >
          <Text numberOfLines={1} style={{ fontSize: 8 }} key="Personal">
            Personal
          </Text>
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
      </View>
      {selectedEventType === paulyEventType.schoolDay ? (
        <View style={{ width, height: 100 }}>
          <Text>
            Selected School Year:{' '}
            {selectedSchoolYear ? selectedSchoolYear.name : 'None selected'}
          </Text>
          <SelectSchoolDayData width={width} height={100} />
        </View>
      ) : null}
      {selectedEventType === paulyEventType.schoolYear ? (
        <View>
          <Text>
            Selected Timetable:{' '}
            {selectedTimetable ? selectedTimetable.name : 'Unselected'}
          </Text>
          <SelectTimetable
            governmentMode={false}
            onSelect={e => {
              dispatch(addEventSlice.actions.setSelectedTimetable(e));
            }}
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
  const {
    selectedEventType,
    eventName,
    allDay,
    startDate,
    endDate,
    isPickingStartDate,
    isPickingEndDate,
  } = useSelector((state: RootState) => state.addEvent);
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
        date={new Date(startDate)}
        onConfirm={e => {
          if (e.date !== undefined) {
            const oldDate = new Date(startDate);
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
        locale=""
        mode="single"
        label="Select Date"
        visible={isPickingEndDate}
        onDismiss={() =>
          dispatch(addEventSlice.actions.setIsPickingEndDate(false))
        }
        date={new Date(endDate)}
        onConfirm={e => {
          if (e.date !== undefined) {
            const oldDate = new Date(endDate);
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
      {selectedEventType === paulyEventType.schoolDay ? null : (
        <View>
          <TextInput
            value={eventName}
            onChangeText={e => {
              dispatch(addEventSlice.actions.setEventName(e));
            }}
            placeholder="Event Name"
            style={styles.textInputStyle}
          />
          {selectedEventType !== paulyEventType.schoolYear ? (
            <View
              style={{ flexDirection: 'row', marginTop: 7, marginBottom: 7 }}
            >
              <Text>All Day</Text>
              <Switch
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={allDay ? '#f5dd4b' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={e => {
                  dispatch(addEventSlice.actions.setAllDay(e));
                }}
                value={allDay}
                style={{ marginLeft: 10 }}
              />
            </View>
          ) : null}
        </View>
      )}
      <Text>
        {selectedEventType === paulyEventType.schoolDay ? '' : 'Start '}Date
      </Text>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flexDirection: 'row', margin: 10 }}>
          <Pressable
            onPress={() => {
              dispatch(addEventSlice.actions.setIsPickingStartDate(true));
            }}
          >
            <Text>
              {new Date(startDate).toLocaleString('en-us', { month: 'long' })}{' '}
              {new Date(startDate).getDate()}{' '}
              {new Date(startDate).getFullYear()}{' '}
            </Text>
          </Pressable>
          {!allDay ? (
            <Pressable
              onPress={() => {
                setStartDatePickerVisable(true);
              }}
            >
              <Text>
                {new Date(startDate).getHours() % 12 || 12}:
                {new Date(startDate).getMinutes().toString().length === 1
                  ? `0${new Date(startDate).getMinutes()}`
                  : new Date(startDate).getMinutes()}{' '}
                {new Date(startDate).getHours() >= 12 ? 'pm' : 'am'}
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
        {allDay ? null : (
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
              hours={new Date(startDate).getHours()}
              minutes={new Date(startDate).getMinutes()}
              visible={startDatePickerVisable}
              onDismiss={() => setStartDatePickerVisable(false)}
              onConfirm={e => {
                const newDate = new Date(startDate);
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
      {selectedEventType === paulyEventType.schoolDay ? null : (
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
                  {new Date(endDate).toLocaleString('en-us', { month: 'long' })}{' '}
                  {new Date(endDate).getDate()}{' '}
                  {new Date(endDate).getFullYear()}{' '}
                </Text>
              </Pressable>
              {!allDay ? (
                <Pressable
                  onPress={() => {
                    setEndDatePickerVisable(true);
                  }}
                >
                  <Text>
                    {new Date(endDate).getHours() % 12 || 12}:
                    {new Date(endDate).getMinutes().toString().length === 1
                      ? `0${new Date(endDate).getMinutes()}`
                      : new Date(endDate).getMinutes()}{' '}
                    {new Date(endDate).getHours() >= 12 ? 'pm' : 'am'}
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
            {allDay ? null : (
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
                  hours={new Date(endDate).getHours()}
                  minutes={new Date(endDate).getMinutes()}
                  visible={endDatePickerVisable}
                  onDismiss={() => setEndDatePickerVisable(false)}
                  onConfirm={e => {
                    const newDate = new Date(endDate);
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
  const { selectedEventType, isEditing, selectedEvent, createEventState } =
    useSelector((state: RootState) => state.addEvent);
  const dispatch = useDispatch();

  useEffect(() => {
    if (
      selectedEventType === paulyEventType.schoolDay ||
      selectedEventType === paulyEventType.schoolYear
    ) {
      dispatch(addEventSlice.actions.setAllDay(true));
    }
  }, [dispatch, selectedEventType]);

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
          <CloseIcon width={10} height={10} />
        </Pressable>
        <Text style={{ fontFamily: 'BukhariScript' }}>Add Event</Text>
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
            notStarted: isEditing ? 'Save' : 'Create',
          })}
          style={{ marginBottom: 15, marginTop: 15 }}
        />
        {isEditing ? (
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
