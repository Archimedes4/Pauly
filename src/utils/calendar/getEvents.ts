/*
  Pauly
  Andrew Mainella
  October 2 2023
  getEvents.ts
*/

import { currentEventsSlice } from '@redux/reducers/currentEventReducer';
import store from '@redux/store';
import { loadingStateEnum } from '@constants';
import { selectedDateSlice } from '@src/redux/reducers/selectedDateReducer';
import { getGraphEvents } from './calendarFunctionsGraph';
import { getClassEventsFromDay } from '../classesFunctions';
import { findFirstDayinMonth, getDOW } from './calendarFunctions';

export function getEventInterval(selectedDateString: string) {
  if (selectedDateString === '') {
    selectedDateString = new Date().toISOString();
    store.dispatch(
      selectedDateSlice.actions.setSelectedDate(new Date().toISOString()),
    );
  }
  // date the user picks
  const selectedDate = new Date(selectedDateString);
  // Start of month that the selected date is in
  const firstDay = findFirstDayinMonth(selectedDate);
  const startDate = new Date(
    Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), 1 - firstDay),
  );
  // End of month that the selected date is in
  const endDate = new Date(
    Date.UTC(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 1,
      7 -
        new Date(
          Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth() + 1),
        ).getDay(),
    ),
  );

  return {
    startDate,
    endDate,
    selectedDate,
  };
}

export default async function getEvents() {
  const { startDate, endDate, selectedDate } = getEventInterval(
    store.getState().selectedDate,
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
  }')&$select=singleValueExtendedProperties,id,subject,start,end,isAllDay`;
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

  const days = getDOW(new Date(selectedDate));
  const pendingRequests = [];
  for (let index = 0; index < days.length; index += 1) {
    pendingRequests.push(getClassEventsFromDay(days[index]));
  }
  const results = await Promise.all(pendingRequests);
  for (let index = 0; index < days.length; index += 1) {
    const result = results[index];
    console.log(result);
    if (result.result === loadingStateEnum.success) {
      store.dispatch(currentEventsSlice.actions.addCurrentEvents(result.data));
    }
  }
}
