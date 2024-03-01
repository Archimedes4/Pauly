import { View, Text, TextInput, Pressable, ScrollView, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import callMsGraph from '@src/utils/ultility/microsoftAssests';
import store, { RootState } from '@redux/store';
import { Colors, loadingStateEnum, semesters } from '@constants';
import getSchoolYears from '@utils/calendar/getSchoolYears';
import { getEvent } from '@utils/calendar/calendarFunctionsGraph';
import { CloseIcon, WarningIcon } from '@components/Icons';
import Dropdown from '@components/Dropdown';
import { getRoom, getRooms } from '@utils/classesFunctions';
import { Link, useGlobalSearchParams } from 'expo-router';
import ProgressView from '@components/ProgressView';
import SecondStyledButton from '@components/StyledButton';
import { getTextState } from '@utils/ultility/createUUID';
import StyledButton from '@components/StyledButton';
import { getTimetable } from '@src/redux/reducers/timetableReducer';

function PeriodBlock({
  selectedSchoolYear,
  periods,
  setPeriods
}:{
  selectedSchoolYear: eventType | undefined,
  periods: number[],
  setPeriods: (item: number[]) => void
}) { 
  const { height } = useSelector((state: RootState) => state.dimensions);
  const [timetableState, setTimetableState] = useState<loadingStateEnum>(
    loadingStateEnum.notStarted,
  );
  const [selectedTimetable, setSelectedTimetable] = useState<
    timetableType | undefined
  >(undefined);
  async function loadTimetable() {
    if (
      selectedSchoolYear !== undefined && selectedSchoolYear.paulyEventType === 'schoolYear'
    ) {
      setTimetableState(loadingStateEnum.loading);
      const result = await getTimetable(selectedSchoolYear.timetableId, store);
      if (
        result.result === loadingStateEnum.success
      ) {
        if (result.data.days.length !== periods.length) {
          const newArray = Array.from(Array(result.data.days.length));
          newArray.fill(0, 0, newArray.length);
          setPeriods(newArray);
        }
        setSelectedTimetable(result.data);
      }
      setTimetableState(result.result);
    }
  }
  useEffect(() => {
    loadTimetable();
  }, [selectedSchoolYear]);

  if (timetableState === loadingStateEnum.notStarted) {
    return (
      <View style={{ height: height * 0.3, marginBottom: height * 0.1 }}>
        <Text>Please pick a school year</Text>
      </View>
    )
  }

  if (timetableState === loadingStateEnum.loading) {
    return (
      <View style={{ height: height * 0.3, marginBottom: height * 0.1 }}>
        <Text>Periods</Text>
        <Text>{periods.toString()}</Text>
        <ProgressView width={14} height={14}/>
        <Text>Loading</Text>
      </View>
    )
  }

  if (timetableState === loadingStateEnum.success && selectedTimetable?.days.length === periods.length) {
    return (
      <View style={{ height: height * 0.3, marginBottom: height * 0.1 }}>
        <Text>Periods</Text>
        <Text>{periods.toString()}</Text>
        <ScrollView
          style={{ height: height * 0.3, zIndex: 100 }}
        > 
          {selectedTimetable.days.map((day, dayIndex) => (
            <DayBlock
              key={day.id}
              day={day}
              dayIndex={dayIndex}
              periods={periods}
              setPeriods={setPeriods}
              selectedTimetable={selectedTimetable}
            />
          ))}
        </ScrollView>
      </View>
    )
  }
  
  return (
    <View>
      <Text>Failed</Text>
    </View>
  )
}

function RoomsBlock({
  selectedRoom,
  setSelectedRoom
}:{
  selectedRoom: roomType | undefined,
  setSelectedRoom: (item: roomType) => void
}) {
  const { width, height } = useSelector((state: RootState) => state.dimensions);
  // Rooms States
  const [roomSearchText, setRoomSearchText] = useState<string>('');
  const [roomsNextLink, setRoomsNextLink] = useState<string | undefined>(
    undefined,
  );
  const [rooms, setRooms] = useState<roomType[]>([]);
  const [roomsState, setRoomsState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  
  async function loadRooms() {
    // TO DO figure out if there will be performance issuses in continually getting next page
    const result = await getRooms(
      roomsNextLink,
      roomSearchText !== '' ? roomSearchText : undefined,
    );
    if (result.result === loadingStateEnum.success) {
      setRooms(result.data);
      setRoomsNextLink(result.nextLink);
    }
    setRoomsState(result.result);
  }

  useEffect(() => {
    loadRooms();
  }, [roomSearchText]);

  if (roomsState === loadingStateEnum.loading) {
    return (
      <View style={{flex: 1}}>
        <ProgressView width={14} height={14}/>
        <Text>Loading</Text>
      </View>
    )
  }

  if (roomsState === loadingStateEnum.success) {
    return (
      <View>
        <View style={{ flexDirection: 'row' }}>
          {selectedRoom === undefined ? (
            <WarningIcon width={12} height={12} outlineColor="red" />
          ) : null}
          <Text>Select Room</Text>
        </View>
        <FlatList
          data={rooms}
          renderItem={(room) => (
            <StyledButton
              text={room.item.name}
              onPress={() => {
                setSelectedRoom(room.item);
              }}
              style={{margin: 15, marginBottom: 5}}
              selected={room.item.id === selectedRoom?.id}
            />
          )}
          style={{ height: height * 0.3 }}
        />
      </View>
    )
  }

  return (
    <View>
      <Text>Failed</Text>
    </View>
  )
}

function SchoolYearBlock({
  selectedSchoolYear,
  setSelectedSchoolYear
}:{
  selectedSchoolYear: eventType | undefined
  setSelectedSchoolYear: (e: eventType) => void
}) {
  const { height } = useSelector((state: RootState) => state.dimensions);
  const [schoolYearState, setSchoolYearState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [schoolYearNextLink, setSchoolYearNextLink] = useState<
    string | undefined
  >(undefined);
  const [schoolYears, setSchoolYears] = useState<eventType[]>([]);

  async function loadSchoolYears() {
    const result = await getSchoolYears(schoolYearNextLink);
    if (result.result === loadingStateEnum.success) {
      setSchoolYears(result.events);
      setSchoolYearNextLink(result.nextLink);
    }
    setSchoolYearState(result.result);
  }

  useEffect(() => {
    loadSchoolYears()
  }, [])

  if (schoolYearState === loadingStateEnum.loading) {
    return (
      <View style={{height: height * 0.3}}>
        <Text>Loading</Text>
      </View>
    )
  }

  if (schoolYearState === loadingStateEnum.success) {
    return (
      <FlatList 
        data={schoolYears}
        renderItem={(e) => (
          <StyledButton 
            key={e.item.id}
            text={e.item.name}
            onPress={() => {
              setSelectedSchoolYear(e.item);
            }}
            style={{margin: 15, marginBottom: 5}}
            selected={e.item.id === selectedSchoolYear?.id}
          />
        )}
        style={{height: height * 0.3}}
      />
    )
  }

  return (
    <View>
      <Text>Failed</Text>
    </View>
  )
}

export default function GovernmentClassesEdit() {
  const { width, height } = useSelector((state: RootState) => state.dimensions);
  const { id } = useGlobalSearchParams();
  const [selectedSemester, setSelectedSemester] = useState<semesters[]>(
    [],
  );

  const [className, setClassName] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<roomType | undefined>(
    undefined,
  );

  // School Years State
  const [selectedSchoolYear, setSelectedSchoolYear] = useState<
    eventType | undefined
  >(undefined);

  const [classState, setClassState] = useState<loadingStateEnum>(
    loadingStateEnum.notStarted,
  );

  const [updateClassState, setUpdateClassState] = useState<loadingStateEnum>(
    loadingStateEnum.notStarted,
  );
  const [isShowingClassConfirmMenu, setIsShowingClassConfirmMenu] =
    useState<boolean>(false);

  const [periods, setPeriods] = useState<number[]>([]);
  const [isCreating, setIsCreating] = useState<boolean>(true);

  async function getClass() {
    setClassState(loadingStateEnum.loading);
    const result = await callMsGraph(
      `https://graph.microsoft.com/v1.0/groups/${id}?$select=${
        store.getState().paulyList.classExtensionId
      },displayName,${store.getState().paulyList.classExtensionId}`,
    ); // TO DO change to class
    if (result.ok) {
      const data = await result.json();
      const extensionData = data[store.getState().paulyList.classExtensionId];
      if (extensionData !== undefined) {
        setIsCreating(false)
        setClassName(extensionData.className);
        setSelectedSemester(JSON.parse(extensionData.semesterId));
        setPeriods(JSON.parse(extensionData.periodData));
        const eventResult = await getEvent(extensionData.schoolYearEventId);
        const roomResult = await getRoom(extensionData.roomId);
        if (
          eventResult.result === loadingStateEnum.success &&
          roomResult.result === loadingStateEnum.success
        ) {
          setSelectedRoom(roomResult.data);
          setSelectedSchoolYear(eventResult.data);
        } else {
          setClassState(loadingStateEnum.failed);
        }
      } else {
        setIsCreating(true)
        setClassName(data.displayName);
      }
      setClassState(loadingStateEnum.success);
    } else {
      setClassState(loadingStateEnum.failed);
    }
  }

  async function updateClass() {
    if (selectedRoom !== undefined && selectedSchoolYear !== undefined) {
      setUpdateClassState(loadingStateEnum.loading);
      let data: any = {};
      data[store.getState().paulyList.classExtensionId] = {
        className,
        schoolYearEventId: selectedSchoolYear.id,
        semesterId: JSON.stringify(selectedSemester),
        roomId: selectedRoom.id,
        periodData: JSON.stringify(periods),
      }

      const result = await callMsGraph(
        `https://graph.microsoft.com/v1.0/groups/${id}`,
        'PATCH',
        JSON.stringify(data),
      );
      if (result.ok) {
        setUpdateClassState(loadingStateEnum.success);
      } else {
        setUpdateClassState(loadingStateEnum.failed);
      }
    }
  }

  useEffect(() => {
    getClass();
  }, []);

  if (classState === loadingStateEnum.loading) {
    return (
      <View
        style={{
          width,
          height,
          backgroundColor: Colors.white,
          alignContent: 'center',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Link
          style={{ position: 'absolute', top: 0, left: 0 }}
          href="/government/classes"
        >
          Back
        </Link>
        <ProgressView width={14} height={14} />
        <Text>Loading</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={{ width, height, backgroundColor: Colors.white }}>
        <View>
          {classState === loadingStateEnum.success ? (
            <View
              style={{
                width,
                backgroundColor: Colors.white,
              }}
            >
              <Link href="/government/classes">Back</Link>
              <Text
                style={{
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  fontFamily: 'Comfortaa-Regular',
                  marginBottom: 5,
                  fontSize: 25,
                }}
              >
                Add Class Data
              </Text>
              <View>
                <Text style={{ marginLeft: 25 }}>Name</Text>
                <TextInput
                  value={className}
                  onChangeText={setClassName}
                  style={{
                    padding: 10,
                    borderWidth: 1,
                    borderColor: Colors.black,
                    borderRadius: 30,
                    marginLeft: 15,
                    marginRight: 15,
                  }}
                />
              </View>
              <Text>School Years</Text>
              <SchoolYearBlock selectedSchoolYear={selectedSchoolYear} setSelectedSchoolYear={setSelectedSchoolYear}/>
              <PeriodBlock selectedSchoolYear={selectedSchoolYear} periods={periods} setPeriods={setPeriods} />
              <View style={{ marginLeft: 'auto', marginRight: 'auto', flexDirection: 'row' }}>
                <StyledButton
                  text='Semester One' 
                  selected={selectedSemester.includes(semesters.semesterOne)}
                  onPress={() => {
                    if (selectedSemester.includes(semesters.semesterOne)) {
                      setSelectedSemester([...selectedSemester.filter((e) => {return e !== semesters.semesterOne})])
                    } else {
                      setSelectedSemester([...selectedSemester, semesters.semesterOne])
                    }
                  }}
                  style={{marginRight: 5}}
                />
                <StyledButton
                  text='Semester Two'
                  selected={selectedSemester.includes(semesters.semesterTwo)}
                  onPress={() => {
                    if (selectedSemester.includes(semesters.semesterTwo)) {
                      setSelectedSemester([...selectedSemester.filter((e) => {return e !== semesters.semesterTwo})])
                    } else {
                      setSelectedSemester([...selectedSemester, semesters.semesterTwo])
                    }
                  }}
                  style={{marginLeft: 5}}
                />
              </View>
              <RoomsBlock selectedRoom={selectedRoom} setSelectedRoom={setSelectedRoom}/>
              <SecondStyledButton
                text={`${isCreating ? 'Create':'Update'} Class`}
                onPress={() => {
                  setIsShowingClassConfirmMenu(true);
                }}
                style={{ marginBottom: 10, marginLeft: 15, marginRight: 15 }}
              />
            </View>
          ) : (
            <Text>Failed</Text>
          )}
        </View>
      </ScrollView>
      {isShowingClassConfirmMenu ? (
        <View
          style={{
            width: width * 0.8,
            height: height * 0.8,
            top: height * 0.1,
            left: width * 0.1,
            borderRadius: 15,
            backgroundColor: Colors.white,
            position: 'absolute',
            shadowColor: Colors.black,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.8,
            shadowRadius: 10,
          }}
        >
          <Pressable
            onPress={() => {
              setIsShowingClassConfirmMenu(false);
            }}
            style={{margin: 15}}
          >
            <CloseIcon width={14} height={14} />
          </Pressable>
          <Text>{isCreating ? "Create":"Update"} Class</Text>
          <Text>Name: {className}</Text>
          <Text>Room: {selectedRoom?.name}</Text>
          <Text>School Year: {selectedSchoolYear?.name}</Text>
          <Text>
            Semester:{' '} {selectedSemester.toString()}
          </Text>
          <StyledButton 
            text={getTextState(updateClassState, {
              cannotStart: 'Cannot Update Class',
              notStarted: 'Update Class',
              success: 'Updated Class',
              failed: 'Failed To Update Class',
            })}
            onPress={() => {
              updateClass();
            }}
            style={{margin: 15}}
          />
        </View>
      ) : null}
    </>
  );
}

function DayBlock({
  day,
  periods,
  dayIndex,
  setPeriods,
  selectedTimetable,
}: {
  day: schoolDayType;
  dayIndex: number;
  periods: number[];
  setPeriods: (item: number[]) => void;
  selectedTimetable: timetableType;
}) {
  const [selected, setSelected] = useState<boolean>(false);
  return (
    <View
      key={`Day_${day.id}`}
      style={{ flexDirection: 'row', margin: 10, zIndex: selected ? 200 : 100 }}
    >
      <Text>{day.name}</Text>
      <View>
        {selectedTimetable?.schedules.length >= 1 &&
        periods.length >= dayIndex ? (
          <Dropdown
            selectedIndex={periods[dayIndex]}
            onSetSelectedIndex={index => {
              if (periods.length >= dayIndex) {
                const newPeriods = periods;
                newPeriods[dayIndex] = index;
                setPeriods([...newPeriods]);
              }
            }}
            expanded={selected}
            setExpanded={e => {
              setSelected(e);
            }}
            style={{ backgroundColor: Colors.white, zIndex: -2 }}
            expandedStyle={{
              backgroundColor: 'white',
              zIndex: 101,
              position: 'absolute',
            }}
            options={[
              'unchosen',
              ...Array.from(selectedTimetable.schedules[0].periods).flatMap(
                (_item, index) => (index + 1).toString(),
              ),
            ]}
            children=""
          />
        ) : (
          <Text>Something went wrong please reload the page.</Text>
        )}
      </View>
    </View>
  );
}
