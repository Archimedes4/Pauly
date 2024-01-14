import { View, Text } from 'react-native';
import React, { useEffect } from 'react';
import { Link } from 'expo-router';
import { useSelector } from 'react-redux';
import store, { RootState } from '@redux/store';
import { Colors } from '@constants';
import useSyncCalendar from '@hooks/useSyncCalendar';
import callMsGraph from '@utils/ultility/microsoftAssets';
import StyledButton from '@components/StyledButton';

async function getPastCalendarSyncs() {
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${
      store.getState().paulyList.siteId
    }/lists/${store.getState().paulyList.calendarSyncStateListId}/items`,
  );
  if (result.ok) {
    const data = await result.json();
    console.log(data);
  } else {
  }
}

export default function calendarSync() {
  const { width, height } = useSelector((state: RootState) => state.dimentions);
  const syncCalendar = useSyncCalendar();

  useEffect(() => {
    getPastCalendarSyncs();
  }, []);

  return (
    <View style={{ width, height, backgroundColor: Colors.white }}>
      <Link href="/government/calendar/">
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

      <StyledButton text="Sync Calendar" onPress={() => syncCalendar()} />
    </View>
  );
}
