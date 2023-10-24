import { orgWideGroupID } from '../../PaulyConfig';
import store from '../../Redux/store';
import { Colors, loadingStateEnum } from '../../types';
import callMsGraph from '../ultility/microsoftAssets';

export default async function getSchoolYears(nextLink?: string): Promise<{
  result: loadingStateEnum;
  events?: eventType[];
  nextLink?: string;
}> {
  const result = await callMsGraph(
    nextLink ||
      `https://graph.microsoft.com/v1.0/groups/${orgWideGroupID}/calendar/events?$expand=singleValueExtendedProperties($filter=id%20eq%20'${
        store.getState().paulyList.eventTypeExtensionId
      }'%20or%20id%20eq%20'${
        store.getState().paulyList.eventDataExtensionId
      }')&$filter=singleValueExtendedProperties/Any(ep:%20ep/id%20eq%20'${
        store.getState().paulyList.eventTypeExtensionId
      }'%20and%20ep/value%20eq%20'schoolDay')`,
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
      const eventTypeExtensionID =
        store.getState().paulyList.eventTypeExtensionId;
      const eventDataExtensionID =
        store.getState().paulyList.eventDataExtensionId;
      if (data.value[index].singleValueExtendedProperties !== undefined) {
        const eventData: { id: string; value: string }[] =
          data.value[index].singleValueExtendedProperties;
        if (
          eventData.find(e => {
            return e.id === eventTypeExtensionID;
          })?.value === 'schoolYear'
        ) {
          newEvents.push({
            id: data.value[index].id,
            name: data.value[index].subject,
            startTime: data.value[index].start.dateTime,
            endTime: data.value[index].end.dateTime,
            allDay: data.value[index].isAllDay,
            eventColor: Colors.white,
            paulyEventType:
              eventData.find(e => {
                return e.id === eventTypeExtensionID;
              })?.value === 'schoolYear'
                ? 'schoolYear'
                : undefined,
            paulyEventData: eventData.find(e => {
              return e.id === eventDataExtensionID;
            })?.value,
            microsoftEvent: true,
            microsoftReference: `https://graph.microsoft.com/v1.0/groups/${orgWideGroupID}/calendar/events/${data.value[index].id}`,
          });
        }
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
