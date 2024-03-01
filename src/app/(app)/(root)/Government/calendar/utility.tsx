/*
  Pauly
  Andrew Mainella
*/
// TODO make sure this page has aduquare warnings
import { View, Text } from 'react-native';
import React from 'react';
import { Link } from 'expo-router';
import { useSelector } from 'react-redux';
import store, { RootState } from '@redux/store';
import { Colors, styles } from '@constants';
import StyledButton from '@components/StyledButton';
import callMsGraph from '@src/utils/ultility/microsoftAssests';
import { currentEventsSlice } from '@redux/reducers/currentEventReducer';

async function deleteEvents() {
  let nextUrl: string | undefined = `https://graph.microsoft.com/v1.0/sites/${
    store.getState().paulyList.siteId
  }/lists/${'dd8557a0-4b77-41c3-8e3c-fe23661113a3'}/items?expand=fields(select=eventId)&select=fields,id`;
  while (nextUrl !== undefined) {
    const result = await callMsGraph(nextUrl);
    if (result.ok) {
      const data = await result.json();
      for (let index = 0; index < data.value.length; index += 1) {
        const deleteResult = await callMsGraph(
          `https://graph.microsoft.com/v1.0/groups/${process.env.EXPO_PUBLIC_ORGWIDEGROUPID}/calendar/events/${data.value[index].fields.eventId}`,
          'DELETE',
        );
        if (deleteResult.ok || deleteResult.status === 404) {
          const deleteResult = await callMsGraph(
            `https://graph.microsoft.com/v1.0/sites/${
              store.getState().paulyList.siteId
            }/lists/${'dd8557a0-4b77-41c3-8e3c-fe23661113a3'}/items/${
              data.value[index].id
            }`,
            'DELETE',
          );
        }
      }
      nextUrl = data['@odata.nextLink'];
    } else {
      nextUrl = undefined;
    }
  }
  let fullDeleteUrl: string | undefined =
    `https://graph.microsoft.com/v1.0/groups/${process.env.EXPO_PUBLIC_ORGWIDEGROUPID}/calendar/events`;
  while (fullDeleteUrl !== undefined) {
    const result = await callMsGraph(fullDeleteUrl);
    if (result.ok) {
      const data = await result.json();
      fullDeleteUrl = data['@odata.nextLink'];
      for (let index = 0; index < data.value.length; index += 1) {
        await callMsGraph(
          `https://graph.microsoft.com/v1.0/groups/${process.env.EXPO_PUBLIC_ORGWIDEGROUPID}/calendar/events/${data.value[index].id}`,
          'DELETE',
        );
      }
    } else {
      fullDeleteUrl = undefined;
    }
  }
  store.dispatch(currentEventsSlice.actions.setCurrentEvents([]));
}

export default function GovernmentClaendarUtility() {
  const { width, height } = useSelector((state: RootState) => state.dimensions);
  return (
    <View style={{ width, height, backgroundColor: Colors.white }}>
      <Link href="/government/calendar/">
        <Text>Back</Text>
      </Link>
      <Text style={styles.headerText}>Calendar Ultility</Text>
      <StyledButton text="Delete Calendar" onPress={() => deleteEvents()} />
    </View>
  );
}
