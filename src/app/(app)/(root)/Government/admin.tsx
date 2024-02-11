import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import {
  initializePaulyPartOne,
  initializePaulyPartThree,
  initializePaulyPartTwo,
} from '@utils/ﻩgovernment/initializePauly/initializePauly';
import { RootState } from '@redux/store';
import { addDataArray } from '@utils/ﻩgovernment/initializePauly/initializePaulyData';
import callMsGraph from '@utils/ultility/microsoftAssets';
import { Colors, loadingStateEnum, styles } from '@constants';
import { Link } from 'expo-router';
import StyledButton from '@components/StyledButton';
import { getTextState } from '@utils/ultility/createUUID';
import { getUsers } from '@utils/studentFunctions';

enum initStage {
  notStarted,
  partOne,
  partTwoLoad,
  partTwo,
  partThreeLoad,
  partThree,
  done,
}

export default function GovernmentAdmin() {
  const { width, height } = useSelector((state: RootState) => state.dimentions);

  const [selectedUser, setSelectedUser] = useState<
    microsoftUserType | undefined
  >(undefined);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [timeElapsed, setTimeElapsed] = useState<string>('Not Started');
  const [createdGroupId, setCreatedGroupId] = useState<string>('');
  const [selectedUpdates, setSelectedUpdates] = useState<string[]>([]);

  // Start Times
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [partOneStartTime, setPartOneStartTime] = useState<Date>(new Date());
  const [partTwoStartTime, setPartTwoStartTime] = useState<Date>(new Date());

  // Result
  const [initResult, setInitResult] = useState<loadingStateEnum>(
    loadingStateEnum.cannotStart,
  );
  const [initTwoResult, setInitTwoResult] = useState<loadingStateEnum>(
    loadingStateEnum.cannotStart,
  );
  const [initThreeResult, setInitThreeResult] = useState<loadingStateEnum>(
    loadingStateEnum.cannotStart,
  );
  const [currentInitStage, setCurrentInitStage] = useState<initStage>(
    initStage.notStarted,
  );

  async function initializePauly() {
    if (selectedUser !== undefined) {
      setStartTime(new Date());
      setCurrentInitStage(initStage.partOne);
      setInitResult(loadingStateEnum.loading);
      const partOneResult = await initializePaulyPartOne(selectedUser.id);
      if (
        partOneResult.result === loadingStateEnum.success &&
        partOneResult.groupId !== undefined
      ) {
        setCreatedGroupId(partOneResult.groupId);
        setCurrentInitStage(initStage.partTwoLoad);
        setPartOneStartTime(new Date());
        const partTwoResult = await new Promise<loadingStateEnum>(
          (resolve, reject) => {
            setTimeout(async () => {
              if (partOneResult.groupId !== undefined) {
                setCurrentInitStage(initStage.partTwo);
                const secondResult = await initializePaulyPartTwo(
                  partOneResult.groupId,
                );
                resolve(secondResult);
              } else {
                setCurrentInitStage(initStage.done);
                setInitResult(loadingStateEnum.failed);
                reject();
              }
            }, 900000);
          },
        );
        if (partTwoResult === loadingStateEnum.success) {
          setCurrentInitStage(initStage.partThreeLoad);
          setPartTwoStartTime(new Date());
          const partThreeResult = await new Promise<loadingStateEnum>(
            (resolve, reject) => {
              setTimeout(async () => {
                if (partOneResult.groupId !== undefined) {
                  setCurrentInitStage(initStage.partThree);
                  const thirdResult = await initializePaulyPartThree(
                    partOneResult.groupId,
                  );
                  resolve(thirdResult);
                } else {
                  setCurrentInitStage(initStage.done);
                  setInitResult(loadingStateEnum.failed);
                  reject();
                }
              }, 900000);
            },
          );
          if (partThreeResult === loadingStateEnum.success) {
            setInitResult(loadingStateEnum.success);
            setCurrentInitStage(initStage.done);
          } else {
            setCurrentInitStage(initStage.done);
            setInitResult(loadingStateEnum.failed);
          }
        } else {
          setCurrentInitStage(initStage.done);
          setInitResult(loadingStateEnum.failed);
        }
      } else {
        setCurrentInitStage(initStage.done);
        setInitResult(loadingStateEnum.failed);
      }
    }
  }

  async function initializePaulyFromPartTwo() {
    if (
      createdGroupId !== '' &&
      initTwoResult === loadingStateEnum.notStarted
    ) {
      setInitTwoResult(loadingStateEnum.loading);
      const secondResult = await initializePaulyPartTwo(createdGroupId);
      if (secondResult === loadingStateEnum.success) {
        setInitTwoResult(loadingStateEnum.success);
      } else {
        setInitTwoResult(loadingStateEnum.failed);
      }
    }
  }

  async function initializePaulyFromPartThree() {
    if (
      createdGroupId !== '' &&
      initThreeResult === loadingStateEnum.notStarted
    ) {
      setStartTime(new Date());
      setCurrentInitStage(initStage.partThree);
      setInitThreeResult(loadingStateEnum.loading);
      const result = await initializePaulyPartThree(
        createdGroupId,
        selectedUpdates,
      );
      if (result === loadingStateEnum.success) {
        setInitThreeResult(loadingStateEnum.success);
        setCurrentInitStage(initStage.done);
      } else {
        setInitThreeResult(loadingStateEnum.failed);
        setCurrentInitStage(initStage.done);
      }
    }
  }

  useEffect(() => {
    if (
      currentInitStage === initStage.partTwoLoad ||
      currentInitStage === initStage.partThreeLoad
    ) {
      const interval: ReturnType<typeof setInterval> = setInterval(() => {
        let miliSecondsPassed = new Date().getTime() - startTime.getTime();
        if (currentInitStage === initStage.partTwoLoad) {
          miliSecondsPassed = new Date().getTime() - partOneStartTime.getTime();
        } else if (currentInitStage === initStage.partThreeLoad) {
          miliSecondsPassed = new Date().getTime() - partTwoStartTime.getTime();
        }

        const miliSecondsLeft = 900000 - miliSecondsPassed;
        const totalSecondsLeft = miliSecondsLeft / 1000;
        let minutesLeft: number = Math.floor(totalSecondsLeft / 60);
        let secondsLeft: number = Math.ceil(totalSecondsLeft % 60);
        if (secondsLeft === 60) {
          minutesLeft += 1;
          secondsLeft = 0;
        }
        let minutesLeftString: string = minutesLeft.toString();
        let secondsLeftString: string = secondsLeft.toString();
        if (minutesLeft <= 9) {
          minutesLeftString = `0${minutesLeftString}`;
        }
        if (secondsLeft <= 9) {
          secondsLeftString = `0${secondsLeft}`;
        }
        setTimeLeft(`${minutesLeftString}:${secondsLeftString}`);
        if (minutesLeft <= -1) {
          setTimeLeft('0:0');
          return clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [currentInitStage]);

  useEffect(() => {
    if (currentInitStage !== initStage.notStarted) {
      const interval = setInterval(() => {
        const miliSecondsPast = new Date().getTime() - startTime.getTime();

        const totalSecondsLeft = miliSecondsPast / 1000;
        const totalMinutesPast: number = Math.floor(totalSecondsLeft / 60);
        let minutesPast: number = Math.ceil(totalMinutesPast % 60);
        const hoursPast: number = Math.floor(totalMinutesPast / 60);
        let secondsPast: number = Math.ceil(totalSecondsLeft % 60);
        if (secondsPast === 60) {
          minutesPast += 1;
          secondsPast = 0;
        }
        let hoursLeftString: string = hoursPast.toString();
        let minutesLeftString: string = minutesPast.toString();
        let secondsLeftString: string = secondsPast.toString();
        if (minutesPast <= 9) {
          minutesLeftString = `0${minutesLeftString}`;
        }
        if (secondsPast <= 9) {
          secondsLeftString = `0${secondsPast}`;
        }
        if (hoursPast <= 9) {
          hoursLeftString = `0${hoursLeftString}`;
        }
        setTimeElapsed(
          `${hoursLeftString}:${minutesLeftString}:${secondsLeftString}`,
        );
      }, 1000);
      if (currentInitStage === initStage.done) {
        return clearInterval(interval);
      }
      return () => clearInterval(interval);
    }
  }, [currentInitStage]);

  useEffect(() => {
    if (
      createdGroupId !== '' &&
      (initResult === loadingStateEnum.notStarted ||
        initResult === loadingStateEnum.cannotStart ||
        initResult === loadingStateEnum.failed)
    ) {
      setInitTwoResult(loadingStateEnum.notStarted);
      setInitThreeResult(loadingStateEnum.notStarted);
    }
  }, [createdGroupId, initResult]);

  return (
    <View style={{ height, width, backgroundColor: Colors.white }}>
      <View>
        <Link href="/government">Back</Link>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <View>
          <View
            style={{
              height: height * 0.25,
              width: height * 0.1,
              alignContent: 'center',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                height: height * 0.05,
                width: height * 0.05,
                backgroundColor:
                  currentInitStage === initStage.partOne
                    ? 'blue'
                    : Colors.black,
                borderRadius: 50,
              }}
            />
            <View
              style={{
                height: height * 0.025,
                width: height * 0.05,
                alignItems: 'center',
                justifyContent: 'center',
                alignContent: 'center',
              }}
            >
              <View
                style={{
                  height: height * 0.025,
                  width: height * 0.005,
                  backgroundColor:
                    currentInitStage === initStage.partTwoLoad
                      ? 'blue'
                      : 'black',
                }}
              />
              {currentInitStage === initStage.partTwoLoad ? (
                <Text
                  style={{
                    position: 'absolute',
                    left: height * 0.03,
                    top: height * 0.01,
                  }}
                >
                  {timeLeft}
                </Text>
              ) : null}
            </View>
            <View
              style={{
                height: height * 0.05,
                width: height * 0.05,
                backgroundColor:
                  currentInitStage === initStage.partTwo
                    ? 'blue'
                    : Colors.black,
                borderRadius: 50,
              }}
            />
            <View
              style={{
                height: height * 0.025,
                width: height * 0.05,
                alignItems: 'center',
                justifyContent: 'center',
                alignContent: 'center',
              }}
            >
              <View
                style={{
                  height: height * 0.025,
                  width: height * 0.005,
                  backgroundColor:
                    currentInitStage === initStage.partThreeLoad
                      ? 'blue'
                      : Colors.black,
                }}
              />
              {currentInitStage === initStage.partThreeLoad ? (
                <Text
                  style={{
                    position: 'absolute',
                    left: height * 0.03,
                    top: height * 0.01,
                  }}
                >
                  {timeLeft}
                </Text>
              ) : null}
            </View>
            <View
              style={{
                height: height * 0.05,
                width: height * 0.05,
                backgroundColor:
                  currentInitStage === initStage.partThree
                    ? 'blue'
                    : Colors.black,
                borderRadius: 50,
              }}
            />
          </View>
        </View>
        <View>
          <UserBlock
            setSelectedUser={setSelectedUser}
            setInitResult={setInitResult}
          />
          <TextInput
            value={createdGroupId}
            onChangeText={setCreatedGroupId}
            placeholder="Group Id"
            style={styles.textInputStyle}
          />
          <Text>Time Elapsed: {timeElapsed}</Text>
          <StyledButton
            text={getTextState(initResult, {
              cannotStart: 'Please Pick a User',
              notStarted: 'Initialize Pauly on New Tenant',
            })}
            onPress={() => {
              if (initResult === loadingStateEnum.notStarted) {
                initializePauly();
              }
            }}
            second
          />
          {initTwoResult !== loadingStateEnum.cannotStart ? (
            <StyledButton
              onPress={() => {
                initializePaulyFromPartTwo();
              }}
              text={getTextState(initTwoResult, {
                notStarted: 'Start From Part Two',
              })}
            />
          ) : null}
          {initThreeResult !== loadingStateEnum.cannotStart ? (
            <>
              <FlatList
                data={[
                  ...addDataArray,
                  {
                    id: 'paulyList',
                    urlOne: '',
                    data: {},
                  },
                ]}
                renderItem={({ item }) => (
                  <StyledButton
                    key={`Add_Data_${item.id}`}
                    text={item.id}
                    selected={selectedUpdates.includes(item.id)}
                    style={styles.listStyle}
                    onPress={() => {
                      if (selectedUpdates.includes(item.id)) {
                        let newSelectedUpdates = [...selectedUpdates];
                        newSelectedUpdates = newSelectedUpdates.filter(e => {
                          return e !== item.id;
                        });
                        setSelectedUpdates([...newSelectedUpdates]);
                      } else {
                        setSelectedUpdates([...selectedUpdates, item.id]);
                      }
                    }}
                  />
                )}
                style={{ height: height * 0.3, width: width - height * 0.1 }}
              />
              <StyledButton
                second
                onPress={() => {
                  initializePaulyFromPartThree();
                }}
                text={getTextState(initThreeResult, {
                  notStarted: 'Start From Part Three',
                })}
              />
            </>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function UserBlock({
  setSelectedUser,
  setInitResult,
}: {
  setSelectedUser: (item: microsoftUserType) => void;
  setInitResult: (item: loadingStateEnum) => void;
}) {
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [loadedUsers, setLoadedUsers] = useState<microsoftUserType[]>([]);
  const [loadUsersResult, setLoadUsersResult] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [nextLink, setNextLink] = useState<string | undefined>(undefined);
  const { height, width } = useSelector((state: RootState) => state.dimentions);

  async function getUserId() {
    const result = await callMsGraph('https://graph.microsoft.com/v1.0/me');
    if (result.ok) {
      const data = await result.json();
      setCurrentUserId(data.id);
    }
  }

  async function loadUsers(nextLink?: string) {
    const userResult = await getUsers(nextLink);
    if (userResult.result === loadingStateEnum.success) {
      setNextLink(userResult.nextLink);
      if (nextLink) {
        setLoadedUsers([...loadedUsers, ...userResult.data]);
      } else {
        setLoadedUsers([...userResult.data]);
      }
      setLoadUsersResult(loadingStateEnum.success);
    } else {
      setLoadUsersResult(loadingStateEnum.failed);
    }
  }

  useEffect(() => {
    getUserId();
    loadUsers();
  }, []);

  if (loadUsersResult === loadingStateEnum.loading) {
    return (
      <View style={{ height: height * 0.4 }}>
        <Text>Loading</Text>
      </View>
    );
  }
  if (loadUsersResult === loadingStateEnum.success) {
    return (
      <FlatList
        data={loadedUsers}
        renderItem={user => {
          if (user.item.id !== currentUserId) {
            return (
              <StyledButton
                key={`User_${user.item.id}`}
                text={user.item.displayName}
                onPress={() => {
                  setSelectedUser(user.item);
                  setInitResult(loadingStateEnum.notStarted);
                }}
                style={{ margin: 15, marginBottom: 0 }}
              />
            );
          }
          return null;
        }}
        onEndReached={() => {
          if (nextLink !== undefined) {
            loadUsers(nextLink);
          }
        }}
        style={{ width: width - height * 0.1, height: height * 0.4 }}
      />
    );
  }
  return (
    <View style={{ height: height * 0.4 }}>
      <Text>Failed</Text>
    </View>
  );
}
