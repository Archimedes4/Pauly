import { View, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FlatList } from 'react-native-gesture-handler';
import { RootState } from '@redux/store';
import { Colors, loadingStateEnum } from '@constants';
import ProgressView from '@components/ProgressView';
import { getSchedules } from '@utils/calendar/calendarFunctionsGraph';
import { Link } from 'expo-router';
import SecondStyledButton from '@components/StyledButton';

function GovernmentScheduleBody() {
  const { width, height } = useSelector((state: RootState) => state.dimentions);
  const [loadingState, setLoadingState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [loadedSchedules, setLoadedSchedules] = useState<scheduleType[]>([]);

  async function loadSchedules() {
    const result = await getSchedules();
    if (
      result.result === loadingStateEnum.success &&
      result.data !== undefined
    ) {
      setLoadedSchedules(result.data);
    }
    setLoadingState(result.result);
  }

  useEffect(() => {
    loadSchedules();
  }, []);

  if (loadingState === loadingStateEnum.loading) {
    return (
      <View
        style={{
          width,
          height: height * 0.8,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ProgressView width={15} height={15} />
        <Text>Loading</Text>
      </View>
    );
  }

  if (
    loadingState === loadingStateEnum.success &&
    loadedSchedules.length >= 1
  ) {
    return (
      <FlatList
        data={loadedSchedules}
        renderItem={schedule => (
          <Link href={`/government/calendar/schedule/${schedule.item.id}`}>
            <View
              style={{
                backgroundColor: Colors.white,
                shadowColor: Colors.black,
                shadowOffset: { width: 1, height: 1 },
                shadowOpacity: 1,
                shadowRadius: 5,
                margin: 10,
                marginBottom: 0,
                borderRadius: 15,
              }}
              key={schedule.item.id}
            >
              <Text style={{ margin: 10 }}>{schedule.item.properName}</Text>
            </View>
          </Link>
        )}
      />
    );
  }

  if (loadingState === loadingStateEnum.success) {
    return (
      <View
        style={{
          flex: 1,
          width,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text>No Schedules</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        width,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text>Failure</Text>
    </View>
  );
}

export default function GovernmentSchedule() {
  const { width, height } = useSelector((state: RootState) => state.dimentions);
  return (
    <View style={{ width, height, backgroundColor: Colors.white }}>
      <View style={{ height: height * 0.1 }}>
        <Link href="/government/calendar">
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
          Schedules
        </Text>
      </View>
      <GovernmentScheduleBody />
      <SecondStyledButton
        style={{ margin: 15 }}
        to="/government/calendar/schedule/create"
        text="Create New"
      />
    </View>
  );
}
