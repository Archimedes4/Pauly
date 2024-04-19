import { Platform } from 'react-native';
import store from '@redux/store';
import { paulyListSlice } from '@redux/reducers/paulyListReducer';
import callMsGraph from './microsoftAssests';

export default async function getPaulyLists() {
  const getRootSiteIdResult = await callMsGraph(
    `https://graph.microsoft.com/v1.0/groups/${process.env.EXPO_PUBLIC_ORGWIDEGROUPID}/sites/root?$select=id`,
    'GET',
  );
  if (getRootSiteIdResult.ok) {
    const getRootSiteIdResultData = await getRootSiteIdResult.json();
    const paulyListResult = await callMsGraph(
      `https://graph.microsoft.com/v1.0/sites/${getRootSiteIdResultData.id}/lists/PaulyList/items?expand=fields&$select=id`,
      'GET',
    );
    if (paulyListResult.ok) {
      const paulyListResultData = await paulyListResult.json();
      if (paulyListResultData.value.length >= 1) {
        const paulyListData: paulyListType = {
          siteId: getRootSiteIdResultData.id,
          commissionListId:
            paulyListResultData.value[0].fields.commissionListId,
          commissionSubmissionsListId:
            paulyListResultData.value[0].fields.commissionSubmissionsListId,
          commissionQRCodeListId:
            paulyListResultData.value[0].fields.commissionQRCodeListId,
          paulyDataListId: paulyListResultData.value[0].fields.paulyDataListId,
          scheduleListId: paulyListResultData.value[0].fields.scheduleListId,
          timetablesListId:
            paulyListResultData.value[0].fields.timetablesListId,
          dressCodeListId: paulyListResultData.value[0].fields.dressCodeListId,
          eventTypeExtensionId:
            paulyListResultData.value[0].fields.eventTypeExtensionId,
          eventDataExtensionId:
            paulyListResultData.value[0].fields.eventDataExtensionId,
          classExtensionId:
            paulyListResultData.value[0].fields.classExtensionId,
          roomListId: paulyListResultData.value[0].fields.roomListId,
          calendarSyncStateListId:
            paulyListResultData.value[0].fields.calendarSyncStateListId,
        };
        store.dispatch(paulyListSlice.actions.setPaulyList(paulyListData));
        if (Platform.OS === 'web' && sessionStorage !== undefined) {
          sessionStorage.setItem('listStore', JSON.stringify(paulyListData));
        }
      }
    } else {
      await paulyListResult.json();
      // TO DO THIS IS A BIG PROBLEM SHUT DOWN APP BC most of it don't work lost connection to server
    }
  } else {
    // TO DO THIS IS A BIG PROBLEM SHUT DOWN APP BC most of it don't work lost connection to server
  }
}
