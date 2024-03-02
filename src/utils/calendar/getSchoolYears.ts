/*
  Pauly
  Andrew Mainella
  November 10 2023
  getSchoolYears.ts
*/
import store from '@redux/store';
import { Colors, loadingStateEnum } from '@constants';
import callMsGraph from '../ultility/microsoftAssests';
import { getSingleValueProperties } from './calendarFunctionsGraph';

export default async function getSchoolYears(nextLink?: string): Promise<
  | {
      result: loadingStateEnum.success;
      events: eventType[];
      nextLink?: string;
    }
  | {
      result: loadingStateEnum.failed;
    }
> {
  const result = await callMsGraph(
    nextLink ||
      `https://graph.microsoft.com/v1.0/groups/${
        process.env.EXPO_PUBLIC_ORGWIDEGROUPID
      }/calendar/events?$expand=singleValueExtendedProperties($filter=id%20eq%20'${
        store.getState().paulyList.eventTypeExtensionId
      }'%20or%20id%20eq%20'${
        store.getState().paulyList.eventDataExtensionId
      }')&$filter=singleValueExtendedProperties/Any(ep:%20ep/id%20eq%20'${
        store.getState().paulyList.eventTypeExtensionId
      }'%20and%20ep/value%20eq%20'schoolYear')`,
    'GET',
    undefined,
    [
      {
        key: 'Prefer',
        value: 'outlook.timezone="Central America Standard Time"',
      },
    ],
  );
  if (result.ok) {
    const data = await result.json();
    const newEvents: eventType[] = [];
    for (let index = 0; index < data.value.length; index += 1) {
      const singleValue = getSingleValueProperties(data.value[index]);
      if (singleValue !== undefined && singleValue.eventType === 'schoolYear') {
        newEvents.push({
          id: data.value[index].id,
          name: data.value[index].subject,
          startTime: data.value[index].start.dateTime,
          endTime: data.value[index].end.dateTime,
          allDay: data.value[index].isAllDay,
          eventColor: Colors.white,
          paulyEventType: 'schoolYear',
          timetableId: singleValue.eventData,
          microsoftEvent: true,
          microsoftReference: `https://graph.microsoft.com/v1.0/groups/${process.env.EXPO_PUBLIC_ORGWIDEGROUPID}/calendar/events/${data.value[index].id}`,
        });
      }
    }
    return {
      result: loadingStateEnum.success,
      events: newEvents,
      nextLink: data['@odata.nextLink'],
    };
  }
  return { result: loadingStateEnum.failed };
}
