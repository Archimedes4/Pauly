/*
  Pauly
  Andrew Mainella
  October 2 2023
  getEvents.ts
*/

import { currentEventsSlice } from '../../redux/reducers/currentEventReducer';
import store from '../../redux/store';
import { loadingStateEnum } from '../../constants';
import { getGraphEvents } from './calendarFunctionsGraph';

export default async function getEvents() {
  // date the user picks
  const selectedDate = new Date(store.getState().selectedDate);
  // Start of month that the selected date is in
  const startDate = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    1,
  );
  // End of month that the selected date is in
  const endDate = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth() + 1,
    1,
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
  // @ts-expect-error
  let url: string = `https://graph.microsoft.com/v1.0/groups/${process.env.EXPO_PUBLIC_ORGWIDEGROUPID}/calendar/events?$filter=start/dateTime%20ge%20'${startDate.toISOString()}'%20and%20end/dateTime%20le%20'${endDate.toISOString()}'`;
  while (url !== '') {
    const furtherResult = await getGraphEvents(
      url,
      // @ts-expect-error
      `https://graph.microsoft.com/v1.0/groups/${process.env.EXPO_PUBLIC_ORGWIDEGROUPID}/calendar/events/`,
    );
    if (
      furtherResult.result === loadingStateEnum.success &&
      furtherResult.events !== undefined
    ) {
      outputEvents = [... new Set([...outputEvents, ...furtherResult.events])];
      url = furtherResult.nextLink !== undefined ? furtherResult.nextLink : '';
    } else {
      url = '';
    }
  }

  store.dispatch(currentEventsSlice.actions.setCurrentEvents(outputEvents));
}
