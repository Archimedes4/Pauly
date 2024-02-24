/*
  Pauly
  Andrew Mainella
  October 2 2023
  getEvents.ts
*/

import { currentEventsSlice } from '@redux/reducers/currentEventReducer';
import store from '@redux/store';
import { loadingStateEnum } from '@constants';
import { getGraphEvents } from './calendarFunctionsGraph';
import { getClassEventsFromDay } from '../classesFunctions';
import { getDOW } from './calendarFunctions';

export default async function getEvents() {
  // date the user picks
  const selectedDate = new Date(store.getState().selectedDate);
  // Start of month that the selected date is in
  const startDate = new Date(
    Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
  );
  // End of month that the selected date is in
  const endDate = new Date(
    Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1),
  );

  // Personal Calendar
  let outputEvents: eventType[] = [];
  // This code is pulled from add events School Years Select
  let nextUrl: string = `https://graph.microsoft.com/v1.0/me/calendarView?startDateTime=${startDate.toISOString()}&endDateTime=${endDate.toISOString()}`;
  while (nextUrl !== '') {
    const furtherResult = await getGraphEvents(
      nextUrl,
      'https://graph.microsoft.com/v1.0/me/events/',
    );
    if (
      furtherResult.result === loadingStateEnum.success &&
      furtherResult.events !== undefined
    ) {
      outputEvents = [...outputEvents, ...furtherResult.events];
      if (furtherResult.nextLink === undefined) {
        nextUrl = '';
        break;
      } else {
        nextUrl = furtherResult.nextLink;
      }
    } else {
      nextUrl = '';
      break;
    }
  }

  // OrgWideEvents
  // This code is pulled from add events School Years Select
  let url: string = `https://graph.microsoft.com/v1.0/groups/${
    process.env.EXPO_PUBLIC_ORGWIDEGROUPID
  }/calendar/events?$filter=start/dateTime%20le%20'${endDate.toISOString()}'%20and%20end/dateTime%20ge%20'${startDate.toISOString()}'&$expand=singleValueExtendedProperties($filter=id%20eq%20'${
    store.getState().paulyList.eventTypeExtensionId
  }'%20or%20id%20eq%20'${
    store.getState().paulyList.eventDataExtensionId
  }')`;
  while (url !== '') {
    const furtherResult = await getGraphEvents(
      url,
      `https://graph.microsoft.com/v1.0/groups/${process.env.EXPO_PUBLIC_ORGWIDEGROUPID}/calendar/events/`,
    );
    if (furtherResult.result === loadingStateEnum.success) {
      outputEvents = [...new Set([...outputEvents, ...furtherResult.events])];
      url = furtherResult.nextLink !== undefined ? furtherResult.nextLink : '';
    } else {
      url = '';
    }
  }
  store.dispatch(currentEventsSlice.actions.addCurrentEvents(outputEvents));

  let days = getDOW(new Date(selectedDate))
  let pendingRequests = []
  for (let index = 0; index < days.length; index += 1) {
    pendingRequests.push(getClassEventsFromDay(days[index]))
  }
  const results = await Promise.all(pendingRequests)
  for (let index = 0; index < days.length; index += 1) {
    const result = results[index]
    console.log(result)
    if (result.result === loadingStateEnum.success) {
      store.dispatch(currentEventsSlice.actions.addCurrentEvents(result.data))
    }
  }
}
