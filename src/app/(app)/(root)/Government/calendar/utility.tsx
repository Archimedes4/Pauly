/*
  Pauly
  Andrew Mainella
*/
// TODO make sure this page has aduquare warnings
import { View, Text, Modal } from 'react-native';
import React, { useState } from 'react';
import { Link } from 'expo-router';
import { useSelector } from 'react-redux';
import store, { RootState } from '@redux/store';
import { Colors, styles } from '@constants';
import StyledButton from '@components/StyledButton';
import callMsGraph from '@utils/ultility/microsoftAssests';
import { currentEventsSlice } from '@redux/reducers/currentEventReducer';

async function deleteEvents() {
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
  const [isShowingDelete, setIsShowingDelete] = useState<boolean>(false);
  return (
    <View style={{ width, height, backgroundColor: Colors.white }}>
      <Link href="/government/calendar/">
        <Text>Back</Text>
      </Link>
      <Text style={styles.headerText}>Calendar Ultility</Text>
      <Text>
        THIS IS A VERY DANGEROUS BUTTON BE CARFUL. THIS DELETES ALL EVENTS IN
        THE PAULY CALENDAR ONLY USE IN TESTING.
      </Text>
      <StyledButton
        text="Delete Calendar"
        onPress={() => setIsShowingDelete(true)}
      />
      <Modal visible={isShowingDelete}>
        <Text>DO NOT DELETE</Text>
        <StyledButton text="Delete Calendar" onPress={() => deleteEvents()} />
        <StyledButton text="Close" onPress={() => setIsShowingDelete(false)} />
      </Modal>
    </View>
  );
}
