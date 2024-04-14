import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  FlatList,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { TimePickerModal } from 'react-native-paper-dates';
import { ScrollView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import ColorPicker, {
  Preview,
  Panel1,
  HueSlider,
  RenderThumbProps,
  InputWidget,
} from 'reanimated-color-picker';
import callMsGraph from '@utils/ultility/microsoftAssests';
import createUUID, { getTextState } from '@utils/ultility/createUUID';
import store, { RootState } from '@redux/store';
import { Colors, loadingStateEnum, styles } from '@constants';
import { CloseIcon, WarningIcon } from '@components/Icons';
import ProgressView from '@components/ProgressView';
import { Link, useGlobalSearchParams } from 'expo-router';
import SecondStyledButton from '@components/StyledButton';
import { getSchedule } from '@utils/calendar/calendarFunctionsGraphNoStore';

function isValidHexaCode(input: string) {
  // Define the regular expression pattern for a valid hexadecimal color code
  // It matches either a 6-character or 3-character code, preceded by a #
  const hexaPattern = /^#(?:[0-9a-fA-F]{3,4}){1,2}$/;

  // Test the input against the pattern using the test() method
  return hexaPattern.test(input);
}

// NOTE: period length cannot be longer than 20
export function GovernmentSchedule({ create }: { create: boolean }) {
  const { id } = useGlobalSearchParams();
  const { width, height } = useSelector((state: RootState) => state.dimensions);

  const [scheduleListId, setScheduleListId] = useState<string | undefined>(
    undefined,
  );

  const [scheduleProperName, setScheduleProperName] = useState<string>('');
  const [scheduleDescriptiveName, setScheduleDescriptiveName] =
    useState<string>('');
  const [newPeriods, setNewPeriods] = useState<periodType[]>([]);
  const [color, setColor] = useState<string>(Colors.white);

  const [isPickingColor, setIsPickingColor] = useState<boolean>(false);

  const [createScheduleLoadingState, setCreateScheduleLoadingState] =
    useState<loadingStateEnum>(loadingStateEnum.notStarted);
  const [loadScheduleState, setLoadScheduleState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [deleteState, setDeleteState] = useState<loadingStateEnum>(
    loadingStateEnum.notStarted,
  );
  const textRef: React.LegacyRef<TextInput> = useRef(null);

  async function submitSchedule() {
    setCreateScheduleLoadingState(loadingStateEnum.loading);
    if (create) {
      const data = {
        fields: {
          Title: scheduleProperName,
          scheduleId: createUUID(),
          scheduleProperName,
          scheduleDescriptiveName,
          scheduleColor: color,
          scheduleData: JSON.stringify(newPeriods),
        },
      };
      const result = await callMsGraph(
        `https://graph.microsoft.com/v1.0/sites/${
          store.getState().paulyList.siteId
        }/lists/${store.getState().paulyList.scheduleListId}/items`,
        'POST',
        JSON.stringify(data),
      );
      if (result.ok) {
        setCreateScheduleLoadingState(loadingStateEnum.success);
      } else {
        setCreateScheduleLoadingState(loadingStateEnum.failed);
      }
    } else if (scheduleListId !== undefined) {
      const data = {
        fields: {
          Title: scheduleProperName,
          scheduleProperName,
          scheduleDescriptiveName,
          scheduleColor: color,
          scheduleData: JSON.stringify(newPeriods),
        },
      };
      const result = await callMsGraph(
        `https://graph.microsoft.com/v1.0/sites/${
          store.getState().paulyList.siteId
        }/lists/${
          store.getState().paulyList.scheduleListId
        }/items/${scheduleListId}`,
        'PATCH',
        JSON.stringify(data),
      );
      if (result.ok) {
        setCreateScheduleLoadingState(loadingStateEnum.success);
      } else {
        setCreateScheduleLoadingState(loadingStateEnum.failed);
      }
    } else {
      setCreateScheduleLoadingState(loadingStateEnum.failed);
    }
  }

  async function deleteFunction() {
    if (scheduleListId !== undefined) {
      setDeleteState(loadingStateEnum.loading);
      const result = await callMsGraph(
        `https://graph.microsoft.com/v1.0/sites/${
          store.getState().paulyList.siteId
        }/lists/${
          store.getState().paulyList.scheduleListId
        }/items/${scheduleListId}`,
        'DELETE',
      );
      if (result.ok) {
        setDeleteState(loadingStateEnum.success);
      } else {
        setDeleteState(loadingStateEnum.failed);
      }
    } else {
      setDeleteState(loadingStateEnum.failed);
    }
  }

  const loadFunction = useCallback(async () => {
    if (typeof id === 'string') {
      const result = await getSchedule(id, store);
      if (result.result === loadingStateEnum.success) {
        setScheduleProperName(result.schedule.properName);
        setScheduleDescriptiveName(result.schedule.descriptiveName);
        setColor(result.schedule.color);
        setNewPeriods(result.schedule.periods);
        setScheduleListId(result.listItemId);
      }
      setLoadScheduleState(result.result);
    } else {
      setLoadScheduleState(loadingStateEnum.failed);
    }
  }, [id]);

  useEffect(() => {
    if (!create) {
      loadFunction();
    }
  }, [id]);

  if (deleteState === loadingStateEnum.success) {
    return (
      <View
        style={{
          width,
          height,
          backgroundColor: Colors.white,
          justifyContent: 'center',
          alignContent: 'center',
          alignItems: 'center',
        }}
      >
        <Link
          href="/government/calendar/schedule"
          style={{ position: 'absolute', left: 0, top: 0 }}
        >
          <Text>Back</Text>
        </Link>
        <Text>Schedule Deleted</Text>
      </View>
    );
  }

  if (create || loadScheduleState === loadingStateEnum.success) {
    return (
      <ScrollView
        style={{
          width,
          height,
          backgroundColor: Colors.white,
        }}
      >
        <Link href="/government/calendar/schedule">
          <Text>Back</Text>
        </Link>
        <Text
          style={{
            marginLeft: 'auto',
            marginRight: 'auto',
            fontFamily: 'Comfortaa-Regular',
            marginBottom: 5,
            fontSize: 25,
          }}
        >
          {create ? 'Create' : 'Edit'} Schedule
        </Text>
        <Text style={{ fontFamily: 'Roboto', marginLeft: 25, marginBottom: 2 }}>
          Proper Name
        </Text>
        <TextInput
          style={styles.textInputStyle}
          value={scheduleProperName}
          onChangeText={e => setScheduleProperName(e)}
          placeholder="Proper Name ex. Schedule One"
          ref={textRef}
        />
        <Text style={{ fontFamily: 'Roboto', marginLeft: 25, marginTop: 5 }}>
          Descriptive Name
        </Text>
        <TextInput
          style={styles.textInputStyle}
          value={scheduleDescriptiveName}
          onChangeText={e => setScheduleDescriptiveName(e)}
          placeholder="Descriptive Name ex. Regular Schedule"
        />
        <View
          style={{
            margin: 5,
            marginLeft: 15,
            marginRight: 15,
            borderRadius: 5,
            backgroundColor: '#FF6700',
          }}
        >
          <View style={{ margin: 10, flexDirection: 'row' }}>
            <WarningIcon width={14} height={14} />
            <Text>
              Keep descriptive name short as it is used in the calendar widget
            </Text>
          </View>
        </View>
        <Text style={{ marginLeft: 15 }}>New Periods</Text>
        <FlatList
          data={newPeriods}
          renderItem={period => (
            <PeriodBlock
              period={period.item}
              periods={newPeriods}
              onSetNewPeriods={out => {
                setNewPeriods([...out]);
              }}
            />
          )}
          style={{ height: height * 0.5 }}
        />
        {newPeriods.length < 20 ? (
          <SecondStyledButton
            text="Add Period"
            onPress={() => {
              setNewPeriods([
                ...newPeriods,
                {
                  startHour: new Date().getHours(),
                  startMinute: new Date().getMinutes(),
                  endHour: new Date().getHours(),
                  endMinute: new Date().getMinutes(),
                  id: createUUID(),
                },
              ]);
            }}
            style={{ marginLeft: 15, marginRight: 15 }}
          />
        ) : null}
        <Pressable
          onPress={() => setIsPickingColor(true)}
          style={{
            margin: 15,
            backgroundColor: Colors.white,
            shadowColor: Colors.black,
            shadowOffset: { width: 1, height: 1 },
            shadowOpacity: 1,
            shadowRadius: 5,
            borderRadius: 15,
          }}
        >
          <View style={{ margin: 10 }}>
            <Text>Color</Text>
            <View style={{ flexDirection: 'row', marginTop: 10 }}>
              <View
                style={{
                  width: 32.4,
                  height: 32.4,
                  backgroundColor: color,
                  borderRadius: 7,
                  borderWidth: 2,
                  borderColor: Colors.black,
                }}
              />
              <Pressable
                style={{ marginLeft: 5, width: width - 92.4, height: 16.5 }}
              >
                <ColorPicker
                  style={{ width: width - 100, height: 16.5 }}
                  value={color}
                  onComplete={e => setColor(e.hex)}
                >
                  <InputWidget
                    disableAlphaChannel
                    defaultFormat="HEX"
                    formats={['HEX']}
                    inputTitleStyle={{ display: 'none' }}
                  />
                </ColorPicker>
              </Pressable>
              <Modal visible={isPickingColor} animationType="slide">
                <View
                  style={{
                    alignContent: 'center',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width,
                    height,
                  }}
                >
                  <Pressable
                    onPress={() => setIsPickingColor(false)}
                    style={{
                      position: 'absolute',
                      top: height * 0.1,
                      left: width * 0.1,
                    }}
                  >
                    <CloseIcon width={14} height={14} />
                  </Pressable>
                  <ColorPicker
                    style={{ width: width * 0.7 }}
                    value={color}
                    onComplete={e => setColor(e.hex)}
                  >
                    <View style={{ flexDirection: 'row' }}>
                      <Preview
                        hideText
                        hideInitialColor
                        style={{
                          width: width * 0.1,
                          height: height * 0.5,
                          borderTopRightRadius: 0,
                          borderBottomRightRadius: 0,
                        }}
                      />
                      <View
                        style={{
                          borderTopRightRadius: 5,
                          borderBottomRightRadius: 5,
                          overflow: 'hidden',
                        }}
                      >
                        <Panel1
                          style={{
                            width: width * 0.6,
                            height: height * 0.5,
                            borderRadius: 0,
                          }}
                          renderThumb={e => (
                            <CustomColorThumb e={e} diameter={15} />
                          )}
                        />
                      </View>
                    </View>
                    <HueSlider
                      renderThumb={e => (
                        <CustomColorThumb e={e} diameter={10} />
                      )}
                      style={{ height: 30, marginTop: 10 }}
                    />
                  </ColorPicker>
                  <Pressable
                    style={{
                      marginTop: 10,
                      backgroundColor: Colors.darkGray,
                      borderRadius: 15,
                      width: width * 0.5,
                      alignContent: 'center',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onPress={() => setIsPickingColor(false)}
                  >
                    <Text style={{ margin: 10, color: Colors.white }}>OK</Text>
                  </Pressable>
                </View>
              </Modal>
            </View>
          </View>
        </Pressable>
        <SecondStyledButton
          text={
            !isValidHexaCode(color)
              ? 'Cannot Start'
              : getTextState(createScheduleLoadingState, {
                  notStarted: `${create ? 'Create' : 'Save'} Schedule`,
                })
          }
          onPress={() => {
            if (
              createScheduleLoadingState === loadingStateEnum.notStarted || createScheduleLoadingState === loadingStateEnum.failed &&
              isValidHexaCode(color)
            ) {
              submitSchedule();
            }
          }}
          second
          style={{
            padding: 15,
            height: 46.4,
            marginLeft: 15,
            marginRight: 15,
            marginBottom: 10,
          }}
        />
        {!create ? (
          <Pressable
            onPress={() => deleteFunction()}
            style={{
              margin: 10,
              backgroundColor: Colors.danger,
              borderRadius: 15,
            }}
          >
            <Text style={{ margin: 10 }}>
              {getTextState(deleteState, {
                notStarted: 'DELETE',
              })}
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
    );
  }

  if (loadScheduleState === loadingStateEnum.loading) {
    return (
      <View
        style={{
          width,
          height,
          backgroundColor: Colors.white,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Link href="/government/calendar/schedule">
          <View style={{ position: 'absolute', top: 0, left: 0 }}>
            <Text>Back</Text>
          </View>
        </Link>
        <ProgressView width={width * 0.1} height={height * 0.1} />
        <Text>Loading</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        width,
        height,
        backgroundColor: Colors.white,
      }}
    >
      <Link href="/government/calendar/schedule">
        <Text>Back</Text>
      </Link>
      <Text>Failed</Text>
    </View>
  );
}

function PeriodBlock({
  period,
  periods,
  onSetNewPeriods,
}: {
  period: periodType;
  periods: periodType[];
  onSetNewPeriods: (item: periodType[]) => void;
}) {
  const [isSelectingStartTime, setIsSelectingStartTime] =
    useState<boolean>(false);
  const [isSelectingEndTime, setIsSelectingEndTime] = useState<boolean>(false);

  function deleteItem(deletePeriod: periodType) {
    const newNewPeriodsArray: periodType[] = periods;
    if (newNewPeriodsArray.length === 1) {
      onSetNewPeriods([]);
    } else {
      onSetNewPeriods(
        newNewPeriodsArray.filter(e => {
          return e.id !== deletePeriod.id;
        }),
      );
    }
  }

  return (
    <View
      key={`Period_${period.id}`}
      style={{
        margin: 10,
        backgroundColor: Colors.white,
        shadowColor: Colors.black,
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 5,
        borderRadius: 15,
        marginLeft: 15,
        marginRight: 15,
      }}
    >
      <View style={{ margin: 10 }}>
        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          <Text>
            {period.startHour}:{period.startMinute}
          </Text>
          <Pressable
            style={{ marginLeft: 'auto' }}
            onPress={() => {
              setIsSelectingStartTime(true);
            }}
          >
            <Text>Pick start time</Text>
          </Pressable>
        </View>
        <TimePickerModal
          hours={period.startHour}
          minutes={period.startMinute}
          visible={isSelectingStartTime}
          onDismiss={() => setIsSelectingStartTime(false)}
          onConfirm={e => {
            const newPeriods: periodType[] = periods;
            const update = newPeriods.findIndex(testIndex => {
              return testIndex.id === period.id;
            });
            if (update !== -1) {
              newPeriods[update].startHour = e.hours;
              newPeriods[update].startMinute = e.minutes;
              onSetNewPeriods([...newPeriods]);
              setIsSelectingStartTime(false);
            } else {
              // TO DO failed
              setIsSelectingStartTime(false);
            }
          }}
        />
        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          <Text>
            {period.endHour}:{period.endMinute}
          </Text>
          <Pressable
            style={{ marginLeft: 'auto' }}
            onPress={() => setIsSelectingEndTime(true)}
          >
            <Text>Pick end time</Text>
          </Pressable>
        </View>
        <TimePickerModal
          hours={period.endHour}
          minutes={period.endMinute}
          visible={isSelectingEndTime}
          onDismiss={() => setIsSelectingEndTime(false)}
          onConfirm={e => {
            const newPeriods: periodType[] = periods;
            const update = newPeriods.findIndex(testIndex => {
              return testIndex.id === period.id;
            });
            if (update !== -1) {
              newPeriods[update].endHour = e.hours;
              newPeriods[update].endMinute = e.minutes;
              onSetNewPeriods([...newPeriods]);
              setIsSelectingEndTime(false);
            } else {
              // TO DO failed
              setIsSelectingEndTime(false);
            }
          }}
        />
        <Pressable
          onPress={() => deleteItem(period)}
          style={{ backgroundColor: 'red', borderRadius: 15 }}
        >
          <Text style={{ margin: 10 }}>Remove</Text>
        </Pressable>
      </View>
    </View>
  );
}

function CustomColorThumb({
  e,
  diameter = undefined,
}: {
  e: RenderThumbProps;
  diameter: number | undefined;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: e.currentColor.value,
    };
  });

  return (
    <Animated.View
      style={[
        {
          width: diameter || 35,
          height: diameter || 35,
          borderRadius: diameter ? diameter / 2 : 20,
          borderWidth: 2,
          borderColor: 'white',
        },
        animatedStyle,
        e.positionStyle,
      ]}
    />
  );
}

export default function GovernmentScheduleMain() {
  return <GovernmentSchedule create={false} />;
}
