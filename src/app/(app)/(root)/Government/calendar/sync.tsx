import { View, Text, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Link } from 'expo-router';
import { useSelector } from 'react-redux';
import store, { RootState } from '@redux/store';
import { Colors, loadingStateEnum } from '@constants';
import useSyncCalendar from '@hooks/useSyncCalendar';
import callMsGraph from '@utils/ultility/microsoftAssets';
import StyledButton from '@components/StyledButton';
import ProgressView from '@components/ProgressView';

async function getPastCalendarSyncs(): Promise<
  | {
      result: loadingStateEnum.success;
      data: calendarSyncState[];
    }
  | {
      result: loadingStateEnum.failed;
    }
> {
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${
      store.getState().paulyList.siteId
    }/lists/${
      store.getState().paulyList.calendarSyncStateListId
    }/items?$expand=fields($select=startTime,endTime,invocationId,state,stage,nextPoll)&$select=id,fields`,
  );
  if (result.ok) {
    const data = await result.json();
    const resultData: calendarSyncState[] = [];
    for (let index = 0; index < data.value.length; index += 1) {
      resultData.push({
        startTime: data.value[index].fields.startTime,
        endTime: data.value[index].fields.endTime,
        invocationId: data.value[index].fields.invocationId,
        state: data.value[index].fields.state,
        stage: data.value[index].fields.stage,
        nextPoll: data.value[index].fields.nextPoll,
      });
    }
    return {
      result: loadingStateEnum.success,
      data: resultData,
    };
  }
  return {
    result: loadingStateEnum.failed,
  };
}

function CalendarSyncBody({
  loadState,
  setLoadState,
  syncStates,
  setSyncStates,
}: {
  loadState: loadingStateEnum;
  setLoadState: (item: loadingStateEnum) => void;
  syncStates: calendarSyncState[];
  setSyncStates: (item: calendarSyncState[]) => void;
}) {
  function getText(item: calendarSyncState): string {
    if (item.endTime === 'running') {
      return `${new Date(item.startTime).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      })}: ${item.state}`;
    }
    return `${item.startTime} -> ${item.endTime}: ${item.state}`;
  }

  async function loadData() {
    const result = await getPastCalendarSyncs();
    if (result.result === loadingStateEnum.success) {
      setSyncStates(result.data);
    }
    setLoadState(result.result);
  }

  useEffect(() => {
    setLoadState(loadingStateEnum.loading);
    loadData();
  }, []);

  if (loadState === loadingStateEnum.loading) {
    return (
      <View
        style={{
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
        }}
      >
        <ProgressView width={14} height={14} />
        <Text>Loading</Text>
      </View>
    );
  }

  if (loadState === loadingStateEnum.success) {
    return (
      <FlatList
        data={syncStates}
        renderItem={e => (
          <StyledButton
            text={`${getText(e.item)} ${e.item.stage}`}
            caption={e.item.invocationId}
            style={{ margin: 15 }}
          />
        )}
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Text>Failed</Text>
    </View>
  );
}

export default function CalendarSync() {
  const { width, height } = useSelector((state: RootState) => state.dimensions);
  const syncCalendar = useSyncCalendar();
  const [loadState, setLoadState] = useState<loadingStateEnum>(
    loadingStateEnum.notStarted,
  );
  const [syncStates, setSyncStates] = useState<calendarSyncState[]>([]);

  return (
    <View style={{ width, height, backgroundColor: Colors.white }}>
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
        Calendar Sync
      </Text>
      <StyledButton text='Refresh' onPress={async () => {
        const result = await getPastCalendarSyncs();
        if (result.result === loadingStateEnum.success) {
          setSyncStates(result.data);
        }
        setLoadState(result.result);
      }} second style={{margin: 15}}/>
      <CalendarSyncBody
        loadState={loadState}
        setLoadState={setLoadState}
        syncStates={syncStates}
        setSyncStates={setSyncStates}
      />
      <StyledButton
        second
        text="Sync Calendar"
        onPress={() => {
          syncCalendar();
          new Promise<void>(resolve => {
            setTimeout(async () => {
              const result = await getPastCalendarSyncs();
              if (result.result === loadingStateEnum.success) {
                setSyncStates(result.data);
              }
              setLoadState(result.result);
              resolve();
            }, 15000);
          });
        }}
        style={{ margin: 15 }}
      />
    </View>
  );
}
