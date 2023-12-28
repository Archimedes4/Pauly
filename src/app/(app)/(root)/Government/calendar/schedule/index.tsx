import { View, Text, Pressable, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FlatList } from 'react-native-gesture-handler';
import { RootState } from '@redux/store';
import { Colors, loadingStateEnum } from '@constants';
import ProgressView from '@components/ProgressView';
import { getSchedules } from '@utils/calendar/calendarFunctionsGraph';
import { Link } from 'expo-router';

export default function GovernmentSchedule() {
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
  return (
    <ScrollView style={{ width, height, backgroundColor: Colors.white }}>
      <View style={{ height: height * 0.1 }}>
        <Link href="/government/calendar">
          <Text>Back</Text>
        </Link>
        <View
          style={{
            alignContent: 'center',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text>Schedules</Text>
        </View>
      </View>
      {loadingState === loadingStateEnum.loading ? (
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
      ) : null}
      {loadingState === loadingStateEnum.success ? (
        <View style={{ height: height * 0.8 }}>
          {loadedSchedules.length >= 1 ? (
            <FlatList
              data={loadedSchedules}
              renderItem={schedule => (
                <Link
                  href={`/government/calendar/schedule/${schedule.item.id}`}
                >
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
                    <Text style={{ margin: 10 }}>
                      {schedule.item.properName}
                    </Text>
                  </View>
                </Link>
              )}
            />
          ) : (
            <Text>No Schedule</Text>
          )}
        </View>
      ) : null}
      {loadingState === loadingStateEnum.failed ? <Text>Failure</Text> : null}
      <Link href="/government/calendar/schedule/create">
        <View
          style={{
            backgroundColor: Colors.white,
            shadowColor: Colors.black,
            shadowOffset: { width: 1, height: 1 },
            shadowOpacity: 1,
            shadowRadius: 5,
            borderRadius: 15,
            marginLeft: 5,
            marginRight: 5,
          }}
        >
          <Text style={{ margin: 10 }}>Create New</Text>
        </View>
      </Link>
    </ScrollView>
  );
}
