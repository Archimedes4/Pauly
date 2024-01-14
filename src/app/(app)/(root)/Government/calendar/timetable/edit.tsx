/*
  Pauly
  Andrew Mainella
  24 November 2023
*/
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-native';
import { useSelector } from 'react-redux';
import callMsGraph from '@utils/ultility/microsoftAssets';
import createUUID, { getTextState } from '@utils/ultility/createUUID';
import { DownIcon, UpIcon, WarningIcon } from '@src/components/Icons';
import { Colors, loadingStateEnum } from '@constants';
import { RootState } from '@redux/store';
import getDressCodeData from '@utils/notifications/getDressCodeData';
import { getSchedules } from '@utils/calendar/calendarFunctionsGraph';
import StyledButton from '@src/components/StyledButton';

// TO DO longest amount of school days is 20 make sure this is enforced
export default function GovernmentTimetableEdit() {
  const { timetablesListId, siteId } = useSelector(
    (state: RootState) => state.paulyList,
  );
  const { width, height } = useSelector((state: RootState) => state.dimentions);

  // Loading States
  const [dressCodeState, setDressCodeState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [createTimetableLoadingState, setCreateTimetableLoadingState] =
    useState<loadingStateEnum>(loadingStateEnum.notStarted);

  // New Table Data
  const [timetableName, setTimetableName] = useState<string>('');
  const [selectedSchedules, setSelectedSchedules] = useState<scheduleType[]>(
    [],
  );
  const [dressCodes, setDressCodes] = useState<dressCodeType[]>([]);
  const [selectedDressCode, setSelectedDressCode] = useState<
    dressCodeType | undefined
  >(undefined);
  const [schoolDays, setSchoolDays] = useState<schoolDayType[]>([]);
  const [selectedDefaultSchedule, setSelectedDefaultSchedule] = useState<
    scheduleType | undefined
  >(undefined);

  async function createTimetable() {
    if (
      selectedDefaultSchedule !== undefined &&
      selectedDressCode !== undefined
    ) {
      // Check to make sure all have the same number of periods
      for (let index = 0; index < selectedSchedules.length; index += 1) {
        if (
          selectedSchedules[index].periods.length !==
          selectedDefaultSchedule.periods.length
        ) {
          setCreateTimetableLoadingState(loadingStateEnum.failed);
          return;
        }
      }

      // Create Timetable
      setCreateTimetableLoadingState(loadingStateEnum.loading);
      const scheduals = [];
      for (let index = 0; index < selectedSchedules.length; index += 1) {
        scheduals.push(selectedSchedules[index].id);
      }
      const data = {
        fields: {
          Title: timetableName,
          timetableName,
          timetableId: createUUID(),
          timetableDataSchedules: JSON.stringify(scheduals),
          timetableDataDays: JSON.stringify(schoolDays),
          timetableDefaultScheduleId: selectedDefaultSchedule.id,
          timetableDressCodeId: selectedDressCode.id,
        },
      };
      const result = await callMsGraph(
        `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${timetablesListId}/items?expand=fields`,
        'POST',
        JSON.stringify(data),
      ); // TO DO fix site id
      if (result.ok) {
        setCreateTimetableLoadingState(loadingStateEnum.success);
      } else {
        setCreateTimetableLoadingState(loadingStateEnum.failed);
      }
    }
  }

  async function getDressCodes() {
    const result = await getDressCodeData();
    setDressCodeState(result.result);
    if (
      result.result === loadingStateEnum.success &&
      result.data !== undefined
    ) {
      setDressCodes(result.data);
    }
  }

  useEffect(() => {
    getDressCodes();
  }, []);
  return (
    <View
      style={{
        height,
        width,
        overflow: 'scroll',
        backgroundColor: Colors.white,
      }}
    >
      <Link to="/government/calendar/timetable/">
        <Text>Back</Text>
      </Link>
      <Text>Create Timetable</Text>
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
      <Text>Dress Codes</Text>
      <View>
        {dressCodeState === loadingStateEnum.loading ? (
          <Text>Loading</Text>
        ) : (
          <View>
            {dressCodeState === loadingStateEnum.success ? (
              <View>
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
            ) : (
              <Text>Failed</Text>
            )}
          </View>
        )}
      </View>
      <StyledButton
        text={getTextState(createTimetableLoadingState, {
          notStarted: 'Create Timetable',
        })}
        onPress={() => {
          if (createTimetableLoadingState === loadingStateEnum.notStarted) {
            createTimetable();
          }
        }}
      />
    </View>
  );
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
      result.result === loadingStateEnum.success &&
      result.data !== undefined
    ) {
      setLoadedSchedules(result.data);
    }
    setScheduleState(result.result);
  }
  useEffect(() => {
    loadSchedules();
  }, []);
  return (
    <View>
      <Text>Scheduals</Text>
      <Text>Selected Schedules</Text>
      <ScrollView style={{ height: height * 0.4 }}>
        {selectedSchedules.map(item => (
          <View
            style={{ height: height * 0.03 + 16 }}
            key={`SelectedSchedule_${item.id}`}
          >
            <Text>{item.properName}</Text>
            {selectedDefaultSchedule?.id !== item.id ? (
              <Pressable
                onPress={() => {
                  setSelectedDefaultSchedule(item);
                }}
                style={{ backgroundColor: 'blue', height: 16 }}
              >
                <Text>Select As Default</Text>
              </Pressable>
            ) : null}
          </View>
        ))}
      </ScrollView>
      <View style={{ alignItems: 'center' }}>
        <Text>Other Schedules</Text>
      </View>
      <ScrollView style={{ height: height * 0.4 }}>
        {scheduleState === loadingStateEnum.loading ? (
          <Text>Loading</Text>
        ) : null}
        {scheduleState === loadingStateEnum.failed ? <Text>Failed</Text> : null}
        {scheduleState === loadingStateEnum.success ? (
          <>
            {loadedSchedules.map((item, index) => (
              <>
                {selectedSchedules.length <= 0 ? (
                  <Pressable
                    key={`Timetable_${item.id}_${createUUID()}`}
                    onPress={() => {
                      setSelectedSchedules([...selectedSchedules, item]);
                      const newLoadedSchedules = loadedSchedules.filter(e => {
                        return e.id !== item.id;
                      });
                      setLoadedSchedules([...newLoadedSchedules]);
                      if (selectedDefaultSchedule === undefined) {
                        setSelectedDefaultSchedule(item);
                      }
                    }}
                  >
                    <Text>{item.properName}</Text>
                  </Pressable>
                ) : (
                  <>
                    {selectedSchedules[0].periods.length ===
                    item.periods.length ? (
                      <Pressable
                        key={`Timetable_${item.id}_${createUUID()}`}
                        onPress={() => {
                          setSelectedSchedules([...selectedSchedules, item]);
                          const newLoadedSchedules = loadedSchedules.filter(
                            e => {
                              return e.id !== item.id;
                            },
                          );
                          setLoadedSchedules([...newLoadedSchedules]);
                          if (selectedDefaultSchedule === undefined) {
                            setSelectedDefaultSchedule(item);
                          }
                        }}
                      >
                        <Text>{item.properName}</Text>
                      </Pressable>
                    ) : null}
                  </>
                )}
              </>
            ))}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}
