/*
  Pauly
  Andrew Mainella
  24 November 2023
*/
import { View, Text, TextInput, Pressable, ScrollView, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import createUUID, { getTextState } from '@utils/ultility/createUUID';
import { DownIcon, UpIcon, WarningIcon } from '@components/Icons';
import { Colors, loadingStateEnum, styles } from '@constants';
import { RootState } from '@redux/store';
import getDressCodeData from '@utils/notifications/getDressCodeData';
import { getSchedules } from '@utils/calendar/calendarFunctionsGraph';
import StyledButton from '@components/StyledButton';
import { createTimetable } from '@utils/calendar/timetableFunctions';
import ProgressView from '@components/ProgressView';
import { Link } from 'expo-router';

// TO DO longest amount of school days is 20 make sure this is enforced
export function GovernmentTimetableEdit({
  creating
}:{
  creating: boolean
}) {
  const { width, height } = useSelector((state: RootState) => state.dimentions);

  // Loading States
  const [createTimetableLoadingState, setCreateTimetableLoadingState] =
    useState<loadingStateEnum>(loadingStateEnum.notStarted);

  // New Table Data
  const [timetableName, setTimetableName] = useState<string>('');
  const [selectedSchedules, setSelectedSchedules] = useState<scheduleType[]>(
    [],
  );
  const [selectedDressCode, setSelectedDressCode] = useState<
    dressCodeType | undefined
  >(undefined);
  const [schoolDays, setSchoolDays] = useState<schoolDayType[]>([]);
  const [selectedDefaultSchedule, setSelectedDefaultSchedule] = useState<
    scheduleType | undefined
  >(undefined);

  return (
    <View
      style={{
        height,
        width,
        overflow: 'scroll',
        backgroundColor: Colors.white,
      }}
    >
      <Link href="/government/calendar/timetable/">
        <Text>Back</Text>
      </Link>
      <Text style={styles.headerText}>{creating ? "Create":"Edit"} Timetable</Text>
      <View style={{ backgroundColor: '#FF6700', borderRadius: 15, margin: 5 }}>
        <View style={{ margin: 10 }}>
          <Text>
            Warning: because of the way that timetables work some properties
            cannot be edited.
          </Text>
          <Text>The dress code you pick cannot change</Text>
          <Text>
            Schedules can be added but they have to have the same number of
            periods
          </Text>
          <Text>
            The number of days in a schedule cannot go up or down only the order
            and the name can be changed
          </Text>
        </View>
      </View>
      <View>
        <TextInput
          value={timetableName}
          onChangeText={e => {
            setTimetableName(e);
          }}
          placeholder="Timetable Name"
        />
      </View>
      <ScheduleBlock
        selectedSchedules={selectedSchedules}
        setSelectedSchedules={setSelectedSchedules}
        selectedDefaultSchedule={selectedDefaultSchedule}
        setSelectedDefaultSchedule={setSelectedDefaultSchedule}
      />
      <SchoolDays
        height={height}
        schoolDays={schoolDays}
        setSchoolDays={setSchoolDays}
      />
      <DressCodeBlock selectedDressCode={selectedDressCode} setSelectedDressCode={setSelectedDressCode}/>
      <StyledButton
        text={getTextState(createTimetableLoadingState, {
          notStarted: 'Create Timetable',
        })}
        onPress={() => {
          if (createTimetableLoadingState === loadingStateEnum.notStarted && selectedDefaultSchedule !== undefined && selectedDressCode !== undefined) {
            createTimetable(selectedDefaultSchedule, selectedSchedules, selectedDressCode, schoolDays, timetableName);
          }
        }}
        second
      />
    </View>
  );
}

function DressCodeBlock({
  selectedDressCode,
  setSelectedDressCode
}: {
  selectedDressCode: dressCodeType | undefined,
  setSelectedDressCode: (item: dressCodeType | undefined) => void
}) {
  const { height } = useSelector((state: RootState) => state.dimentions);
  const [dressCodeState, setDressCodeState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [dressCodes, setDressCodes] = useState<dressCodeType[]>([]);

  async function getDressCodes() {
    const result = await getDressCodeData();
    setDressCodeState(result.result);
    if (
      result.result === loadingStateEnum.success
    ) {
      setDressCodes(result.data);
    }
  }

  useEffect(() => {
    getDressCodes();
  }, []);
  if (dressCodeState === loadingStateEnum.loading) {
    return (
      <View>
        <Text>Dress Codes</Text>
        <View style={{height: height * 0.2, alignContent: 'center', alignItems: 'center', justifyContent: 'center'}}>
          <ProgressView width={14} height={14}/>
          <Text>Loading</Text>
        </View>
      </View>
    )
  }

  if (dressCodeState === loadingStateEnum.success) {
    return (
      <View style={{height: height * 0.2}}>
        <Text>Dress Codes</Text>
        {dressCodes.map(dressCode => (
          <StyledButton
            text={dressCode.name}
            onPress={() => {
              setSelectedDressCode(dressCode);
            }}
            style={{
              backgroundColor:
                selectedDressCode?.id === dressCode.id
                  ? 'blue'
                  : Colors.white,
            }}
          />
        ))}
      </View>
    )
  }
  //Failed
  return (
    <View>
      <Text>Dress Codes</Text>
      <View style={{height: height * 0.2, alignContent: 'center', alignItems: 'center', justifyContent: 'center'}}>
        <Text>Failed</Text>
      </View>
    </View>
  )
}

function SchoolDays({
  height,
  schoolDays,
  setSchoolDays,
}: {
  height: number;
  schoolDays: schoolDayType[];
  setSchoolDays: (item: schoolDayType[]) => void;
}) {
  return (
    <View>
      <Text>School Days</Text>
      <ScrollView style={{ height: height * 0.2 }}>
        {schoolDays.map((item, index) => (
          <SchoolDayItem
            item={item}
            index={index}
            schoolDays={schoolDays}
            setSchoolDays={setSchoolDays}
          />
        ))}
      </ScrollView>
      <StyledButton
        text="Add"
        onPress={() => {
          setSchoolDays([
            ...schoolDays,
            {
              name: '',
              shorthand: '',
              id: createUUID(),
              order:
                schoolDays.length === 0
                  ? 0
                  : schoolDays[schoolDays.length - 1].order + 1,
            },
          ]);
        }}
      />
    </View>
  );
}

function SchoolDayItem({
  item,
  index,
  schoolDays,
  setSchoolDays,
}: {
  item: schoolDayType;
  index: number;
  schoolDays: schoolDayType[];
  setSchoolDays: (item: schoolDayType[]) => void;
}) {
  const [selected, setSelected] = useState<boolean>(false);
  return (
    <Pressable
      style={{ flexDirection: 'row' }}
      onHoverIn={() => {
        setSelected(true);
      }}
      onHoverOut={() => {
        setSelected(false);
      }}
    >
      <View style={{ margin: 10, flexDirection: 'row' }}>
        <View style={{ marginRight: 'auto' }}>
          <View style={{ flexDirection: 'row' }}>
            {item.name === '' ? (
              <WarningIcon width={14} height={14} outlineColor="red" />
            ) : null}
            <Text>Name: </Text>
            {selected ? (
              <TextInput
                value={item.name}
                onChangeText={e => {
                  const newSchoolDays = schoolDays;
                  newSchoolDays[index].name = e;
                  setSchoolDays([...newSchoolDays]);
                }}
              />
            ) : (
              <Text>{item.name}</Text>
            )}
          </View>
          <View style={{ flexDirection: 'row' }}>
            {item.shorthand === '' ? (
              <WarningIcon width={14} height={14} outlineColor="red" />
            ) : null}
            <Text>Shorthand: </Text>
            {selected ? (
              <TextInput
                maxLength={1}
                value={item.shorthand}
                onChangeText={e => {
                  const newSchoolDays = schoolDays;
                  newSchoolDays[index].shorthand = e;
                  setSchoolDays([...newSchoolDays]);
                }}
              />
            ) : (
              <Text>{item.shorthand}</Text>
            )}
          </View>
        </View>
        <View>
          {item.order !== 0 ? (
            <Pressable
              onPress={() => {
                const newSchoolDays = schoolDays;
                newSchoolDays[index].order = newSchoolDays[index].order - 1;
                newSchoolDays[index - 1].order =
                  newSchoolDays[index - 1].order + 1;
                const saveCurrent = newSchoolDays[index];
                newSchoolDays[index] = newSchoolDays[index - 1];
                newSchoolDays[index - 1] = saveCurrent;
                setSchoolDays([...newSchoolDays]);
              }}
            >
              <UpIcon width={10} height={10} />
            </Pressable>
          ) : null}
          {item.order + 1 < schoolDays.length ? (
            <Pressable
              onPress={() => {
                const newSchoolDays = schoolDays;
                newSchoolDays[index].order = newSchoolDays[index].order + 1;
                newSchoolDays[index + 1].order =
                  newSchoolDays[index + 1].order - 1;
                const saveCurrent = newSchoolDays[index];
                newSchoolDays[index] = newSchoolDays[index + 1];
                newSchoolDays[index + 1] = saveCurrent;
                setSchoolDays([...newSchoolDays]);
              }}
            >
              <DownIcon width={10} height={10} />
            </Pressable>
          ) : null}
          <Pressable
            onPress={() => {
              const newSchoolDays = schoolDays;
              newSchoolDays.splice(index, 1);
              setSchoolDays([...newSchoolDays]);
            }}
          >
            <Text>X</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

function ScheduleBlock({
  selectedSchedules,
  setSelectedSchedules,
  selectedDefaultSchedule,
  setSelectedDefaultSchedule,
}: {
  selectedSchedules: scheduleType[];
  setSelectedSchedules: (item: scheduleType[]) => void;
  selectedDefaultSchedule: scheduleType | undefined;
  setSelectedDefaultSchedule: (item: scheduleType) => void;
}) {
  const { width, height } = useSelector((state: RootState) => state.dimentions);
  const [loadedSchedules, setLoadedSchedules] = useState<scheduleType[]>([]);
  const [scheduleState, setScheduleState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  async function loadSchedules() {
    const result = await getSchedules();
    if (
      result.result === loadingStateEnum.success
    ) {
      setLoadedSchedules(result.data);
    }
    setScheduleState(result.result);
  }
  useEffect(() => {
    loadSchedules();
  }, []);

  if (scheduleState === loadingStateEnum.loading) {
    return (
      <View>
        <Text>Loading</Text>
      </View>
    )
  }

  if (scheduleState === loadingStateEnum.success) {
    return (
      <View>
        <Text>Schedules</Text>
        <Text>Selected Schedules</Text>
        <FlatList 
          data={selectedSchedules}
          renderItem={(item) => (
            <StyledButton style={{ height: height * 0.03 + 16, margin: 15, marginBottom: 0 }} key={`SelectedSchedule_${item.item.id}`}>
              <Text>{item.item.properName}</Text>
              {selectedDefaultSchedule?.id !== item.item.id ? (
                <Pressable
                  onPress={() => {
                    setSelectedDefaultSchedule(item.item);
                  }}
                  style={{ backgroundColor: 'blue', height: 26.4, borderRadius: 15 }}
                >
                  <Text style={{margin: 5}}>Select As Default</Text>
                </Pressable>
              ) : null}
            </StyledButton>
          )}
          style={{ height: height * 0.4 }}
        />
        <View style={{ alignItems: 'center' }}>
          <Text>Other Schedules</Text>
        </View>
        <FlatList 
          data={loadedSchedules}
          renderItem={(item) => {
            if (selectedSchedules.length < 1 || selectedSchedules[0].periods.length === item.item.periods.length) {
              return (
                <StyledButton
                  key={`Timetable_${item.item.id}_${createUUID()}`}
                  onPress={() => {
                    setSelectedSchedules([...selectedSchedules, item.item]);
                    const newLoadedSchedules = loadedSchedules.filter(e => {
                      return e.id !== item.item.id;
                    });
                    setLoadedSchedules([...newLoadedSchedules]);
                    if (selectedDefaultSchedule === undefined) {
                      setSelectedDefaultSchedule(item.item);
                    }
                  }}
                  text={item.item.properName}
                  style={{margin: 15, marginBottom: 0}}
                />
              )
            }
            return null
          }}
          style={{ height: height * 0.4 }}
        />
      </View>
    );
  }

  return (
    <View>
      Failed
    </View>
  )
}


export default <GovernmentTimetableEdit creating={false}/>