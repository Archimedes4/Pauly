/*
  Pauly
  Andrew Mainella
  November 9 2023
  calendarFunctionsGraph.ts
  calender function that use microsoft grap
*/
import { Colors, loadingStateEnum } from '@constants';
import store from '@redux/store';
import { monthDataSlice } from '@redux/reducers/monthDataReducer';
import callMsGraph from '../ultility/microsoftAssets';
import batchRequest from '../ultility/batchRequest';
import createUUID from '../ultility/createUUID';
import {
  findFirstDayinMonth,
  isEventDuringInterval,
} from './calendarFunctions';
import { getDressCode } from './dressCodeFunctions';

export function getSingleValueProperties(data: any): undefined | {
  eventType: paulyEventTypes,
  eventData: string
} {
  // list constansts
  const paulyList = store.getState().paulyList
  const eventTypeExtensionID = paulyList.eventTypeExtensionId;
  const eventDataExtensionID = paulyList.eventDataExtensionId;
  // event data
  try {
    const singleValueExtendedProperties = data["singleValueExtendedProperties"];
    if (singleValueExtendedProperties !== undefined) {
      const eventType = singleValueExtendedProperties.find(
        (e: { id: string; value: string }) => {
          return e.id === eventTypeExtensionID;
        },
      )?.value
      const eventData = singleValueExtendedProperties.find(
        (e: { id: string; value: string }) => {
          return e.id === eventDataExtensionID;
        },
      )?.value
      if (eventType === undefined || eventData == undefined || !["personal", "regular", "schoolDay", "schoolYear", "studentCouncil"].includes(eventType)) {
        return
      } else {
        return {
          eventType,
          eventData
        }
      }
    }
    return
  } catch (e) {
    console.log(e)
    return
  }
}

// Defaults to org wide events
export async function getGraphEvents(
  url?: string,
  referenceUrl?: string,
): Promise<
  | {
      result: loadingStateEnum.success;
      events: eventType[];
      nextLink?: string;
    }
  | {
      result: loadingStateEnum.failed;
    }
> {
  const defaultUrl = `https://graph.microsoft.com/v1.0/groups/${process.env.EXPO_PUBLIC_ORGWIDEGROUPID}/calendar/events?$expand=singleValueExtendedProperties&$select=id,subject,start,end,isAllDay,singleValueExtendedProperties`;
  const result = await callMsGraph(
    (url !== undefined) ? url : defaultUrl,
    'GET',
    undefined,
    [
      {
        //America/Winnipeg
        key: 'Prefer',
        value: 'outlook.timezone="UTC"',
      },
    ],
  );
  if (result.ok) {
    const data = await result.json();
    const newEvents: eventType[] = [];
    for (let index = 0; index < data.value.length; index += 1) {
      const singleValueResult = getSingleValueProperties(data.value[index]);
      if (singleValueResult !== undefined && singleValueResult.eventType === 'schoolDay') {
        const schoolDayResult = await getSchoolDayData(JSON.parse(singleValueResult.eventData))
        if (schoolDayResult.result === loadingStateEnum.success) {
          newEvents.push({
            id: data.value[index].id,
            name: data.value[index].subject,
            startTime: data.value[index].start.dateTime,
            endTime: data.value[index].end.dateTime,
            allDay: data.value[index].isAllDay,
            eventColor: Colors.white,
            paulyEventType: singleValueResult.eventType,
            microsoftEvent: true,
            microsoftReference:
              referenceUrl !== undefined
                ? referenceUrl + data.value[index].id
                : `https://graph.microsoft.com/v1.0/groups/${process.env.EXPO_PUBLIC_ORGWIDEGROUPID}/calendar/events/${data.value[index].id}`,
            schoolDayData: schoolDayResult.data
          });
        }
        //TO DO handle error (alert user of error)
      } else if (singleValueResult !== undefined && singleValueResult.eventType === 'schoolYear'){
        newEvents.push({
          id: data.value[index].id,
          name: data.value[index].subject,
          startTime: data.value[index].start.dateTime,
          endTime: data.value[index].end.dateTime,
          allDay: data.value[index].isAllDay,
          eventColor: Colors.white,
          paulyEventType: singleValueResult.eventType,
          microsoftEvent: true,
          microsoftReference:
            referenceUrl !== undefined
              ? referenceUrl + data.value[index].id
              : `https://graph.microsoft.com/v1.0/groups/${process.env.EXPO_PUBLIC_ORGWIDEGROUPID}/calendar/events/${data.value[index].id}`,
          timetableId: singleValueResult.eventData
        });
      } else if (singleValueResult !== undefined && singleValueResult.eventType !== 'schoolYear' && singleValueResult.eventType !== 'schoolDay'){
        newEvents.push({
          id: data.value[index].id,
          name: data.value[index].subject,
          startTime: data.value[index].start.dateTime,
          endTime: data.value[index].end.dateTime,
          allDay: data.value[index].isAllDay,
          eventColor: Colors.white,
          paulyEventType: singleValueResult.eventType,
          paulyEventData: singleValueResult.eventData,
          microsoftEvent: true,
          microsoftReference:
            referenceUrl !== undefined
              ? referenceUrl + data.value[index].id
              : `https://graph.microsoft.com/v1.0/groups/${process.env.EXPO_PUBLIC_ORGWIDEGROUPID}/calendar/events/${data.value[index].id}`,
        });
      } else {
        newEvents.push({
          id: data.value[index].id,
          name: data.value[index].subject,
          startTime: data.value[index].start.dateTime,
          endTime: data.value[index].end.dateTime,
          allDay: data.value[index].isAllDay,
          eventColor: Colors.white,
          paulyEventType: 'regular',
          paulyEventData: undefined,
          microsoftEvent: true,
          microsoftReference:
            referenceUrl !== undefined
              ? referenceUrl + data.value[index].id
              : `https://graph.microsoft.com/v1.0/groups/${process.env.EXPO_PUBLIC_ORGWIDEGROUPID}/calendar/events/${data.value[index].id}`,
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

// Gets an event from paulys team
export async function getEvent(
  id: string,
): Promise<{ result: loadingStateEnum.success; data: eventType } | { result: loadingStateEnum.failed }> {
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/groups/${
      process.env.EXPO_PUBLIC_ORGWIDEGROUPID
    }/calendar/events/${id}?$expand=singleValueExtendedProperties($filter=id%20eq%20'${
      store.getState().paulyList.eventTypeExtensionId
    }'%20or%20id%20eq%20'${store.getState().paulyList.eventDataExtensionId}')`,
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
    const singleValueResult = getSingleValueProperties(data.value);
    if (singleValueResult !== undefined && singleValueResult.eventType === 'schoolDay') {
      const schoolDayResult = await getSchoolDayData(JSON.parse(singleValueResult.eventData))
      if (schoolDayResult.result === loadingStateEnum.success) {
        const event: eventType = {
          id: data.id,
          name: data.subject,
          startTime: data.start.dateTime,
          endTime: data.end.dateTime,
          allDay: data.isAllDay,
          eventColor: Colors.white,
          paulyEventType: 'schoolDay',
          microsoftEvent: true,
          microsoftReference: `https://graph.microsoft.com/v1.0/groups/${process.env.EXPO_PUBLIC_ORGWIDEGROUPID}/calendar/events/${data.id}`,
          schoolDayData: schoolDayResult.data
        };
        return { result: loadingStateEnum.success, data: event };
      }
      return { result: loadingStateEnum.failed };
    } else if (singleValueResult !== undefined && singleValueResult.eventType === 'schoolYear') {
      const event: eventType = {
        id: data.id,
        name: data.subject,
        startTime: data.start.dateTime,
        endTime: data.end.dateTime,
        allDay: data.isAllDay,
        eventColor: Colors.white,
        microsoftEvent: true,
        microsoftReference: `https://graph.microsoft.com/v1.0/groups/${process.env.EXPO_PUBLIC_ORGWIDEGROUPID}/calendar/events/${data.id}`,
        paulyEventType: 'schoolYear',
        timetableId: singleValueResult.eventData
      };
      return { result: loadingStateEnum.success, data: event };
    } else if (singleValueResult !== undefined && singleValueResult.eventType !== 'schoolYear' && singleValueResult.eventType !== 'schoolDay') {
      const event: eventType = {
        id: data.id,
        name: data.subject,
        startTime: data.start.dateTime,
        endTime: data.end.dateTime,
        allDay: data.isAllDay,
        eventColor: Colors.white,
        microsoftEvent: true,
        microsoftReference: `https://graph.microsoft.com/v1.0/groups/${process.env.EXPO_PUBLIC_ORGWIDEGROUPID}/calendar/events/${data.id}`,
        paulyEventType: singleValueResult.eventType
      };
      return { result: loadingStateEnum.success, data: event };
    }  else {
      const event: eventType = {
        id: data.id,
        name: data.subject,
        startTime: data.start.dateTime,
        endTime: data.end.dateTime,
        allDay: data.isAllDay,
        eventColor: Colors.white,
        microsoftEvent: true,
        microsoftReference: `https://graph.microsoft.com/v1.0/groups/${process.env.EXPO_PUBLIC_ORGWIDEGROUPID}/calendar/events/${data.id}`,
        paulyEventType: 'regular'
      };
      return { result: loadingStateEnum.success, data: event };
    }
  }
  return { result: loadingStateEnum.failed };
}

export async function getSchedule(id: string): Promise<
  | {
      result: loadingStateEnum.success;
      schedule: scheduleType;
      listItemId: string;
    }
  | {
      result: loadingStateEnum.failed;
    }
> {
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${
      store.getState().paulyList.siteId
    }/lists/${
      store.getState().paulyList.scheduleListId
    }/items?expand=fields($select=scheduleProperName,scheduleDescriptiveName,scheduleData,scheduleId,scheduleColor)&$filter=fields/scheduleId%20eq%20'${id}'&$select=id`,
  );
  if (result.ok) {
    const data = await result.json();
    if (data.value.length !== undefined) {
      if (data.value.length === 1) {
        const resultSchedule: scheduleType = {
          properName: data.value[0].fields.scheduleProperName,
          descriptiveName: data.value[0].fields.scheduleDescriptiveName,
          periods: JSON.parse(
            data.value[0].fields.scheduleData,
          ) as periodType[],
          id: data.value[0].fields.scheduleId,
          color: data.value[0].fields.scheduleColor,
        };
        return {
          result: loadingStateEnum.success,
          schedule: resultSchedule,
          listItemId: data.value[0].id,
        };
      }
      return { result: loadingStateEnum.failed };
    }
    return { result: loadingStateEnum.failed };
  }
  return { result: loadingStateEnum.failed };
}

export async function getSchedules(): Promise<
  | {
      result: loadingStateEnum.success;
      data: scheduleType[];
      nextLink?: string;
    }
  | {
      result: loadingStateEnum.failed;
    }
> {
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${
      store.getState().paulyList.siteId
    }/lists/${
      store.getState().paulyList.scheduleListId
    }/items?expand=fields&$select=id,fields`,
  );
  if (result.ok) {
    const dataResult = await result.json();
    if (
      dataResult.value.length !== undefined &&
      dataResult.value.length !== null
    ) {
      const newLoadedSchedules: scheduleType[] = [];
      for (let index = 0; index < dataResult.value.length; index += 1) {
        try {
          const scheduleData = JSON.parse(
            dataResult.value[index].fields.scheduleData,
          ) as periodType[];
          newLoadedSchedules.push({
            properName: dataResult.value[index].fields.scheduleProperName,
            descriptiveName:
              dataResult.value[index].fields.scheduleDescriptiveName,
            id: dataResult.value[index].fields.scheduleId,
            periods: scheduleData,
            color: dataResult.value[index].fields.scheduleColor,
          });
        } catch {
          return { result: loadingStateEnum.failed };
          // TO DO unimportant but this shouldn't be able to happen if this doesn't work most likly invalid data has somehow gotten into the schedule data column of the schedule list
        }
      }
      return {
        result: loadingStateEnum.success,
        data: newLoadedSchedules,
        nextLink: dataResult['@odata.nextLink'],
      };
    }
    return { result: loadingStateEnum.failed };
  }
  return { result: loadingStateEnum.failed };
}

export async function getTimetable(
  timetableId: string,
): Promise<{ result: loadingStateEnum.success; timetable: timetableType } | {
  result: loadingStateEnum.failed
}> {
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${
      store.getState().paulyList.siteId
    }/lists/${
      store.getState().paulyList.timetablesListId
    }/items?expand=fields&$filter=fields/timetableId%20eq%20'${timetableId}'`,
  );
  if (result.ok) {
    const data = await result.json();
    if (data.value.length !== undefined) {
      if (data.value.length === 1) {
        try {
          const scheduleData: string[] = JSON.parse(
            data.value[0].fields.timetableDataSchedules,
          );
          const newSchedules: scheduleType[] = [];
          for (let index = 0; index < scheduleData.length; index += 1) {
            const result = await getSchedule(scheduleData[index]);
            if (
              result.result === loadingStateEnum.success &&
              result.schedule !== undefined
            ) {
              newSchedules.push(result.schedule);
            } else {
              return { result: loadingStateEnum.failed };
            }
          }
          const dressCodeResult = await getDressCode(
            data.value[0].fields.timetableDressCodeId,
          );
          if (
            dressCodeResult.result === loadingStateEnum.success
          ) {
            const resultingTimetable: timetableType = {
              name: data.value[0].fields.timetableName,
              id: data.value[0].fields.timetableId,
              schedules: newSchedules,
              days: JSON.parse(data.value[0].fields.timetableDataDays),
              dressCode: dressCodeResult.data,
            };
            return {
              result: loadingStateEnum.success,
              timetable: resultingTimetable,
            };
          }
          return { result: loadingStateEnum.failed };
        } catch (e) {
          return { result: loadingStateEnum.failed };
        }
      } else {
        return { result: loadingStateEnum.failed };
      }
    } else {
      return { result: loadingStateEnum.failed };
    }
  } else {
    return { result: loadingStateEnum.failed };
  }
}

export async function getSchoolDay(
  selectedDate: Date,
): Promise<{ result: loadingStateEnum.success; event: eventType } | { result: loadingStateEnum.failed }> {
  const startDate: string = `${new Date(
    Date.UTC(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      0,
    ),
  )
    .toISOString()
    .slice(0, -1)}0000`;
  const endDate: string = `${new Date(
    Date.UTC(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate() + 1,
      0,
    ),
  )
    .toISOString()
    .slice(0, -1)}0000`;
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/groups/${
      process.env.EXPO_PUBLIC_ORGWIDEGROUPID
    }/calendar/events?$expand=singleValueExtendedProperties($filter=id%20eq%20'${
      store.getState().paulyList.eventTypeExtensionId
    }'%20or%20id%20eq%20'${
      store.getState().paulyList.eventDataExtensionId
    }')&$filter=singleValueExtendedProperties/Any(ep:%20ep/id%20eq%20'${
      store.getState().paulyList.eventTypeExtensionId
    }'%20and%20ep/value%20eq%20'schoolDay')%20and%20start/dateTime%20eq%20'${startDate}'%20and%20end/dateTime%20eq%20'${endDate}'`,
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
    for (let index = 0; index < data.value.length; index += 1) {
      const singleValueResult = getSingleValueProperties(data.value[index]);
      if (singleValueResult !== undefined && singleValueResult.eventType === 'schoolDay') {
        const schoolDayDataResult = await getSchoolDayData(JSON.parse(singleValueResult.eventData) as schoolDayDataCompressedType)
        if (schoolDayDataResult.result !== loadingStateEnum.success) {
          return { result: loadingStateEnum.failed };
        }
        const event: eventType = {
          id: data.value[index].id,
          name: data.value[index].subject,
          startTime: data.value[index].start.dateTime,
          endTime: data.value[index].end.dateTime,
          allDay: data.value[index].isAllDay,
          eventColor: Colors.white,
          microsoftEvent: true,
          microsoftReference: `https://graph.microsoft.com/v1.0/groups/${process.env.EXPO_PUBLIC_ORGWIDEGROUPID}/calendar/events/${data.value[index].id}`,
          paulyEventType: 'schoolDay',
          schoolDayData: schoolDayDataResult.data
        };
        return { result: loadingStateEnum.success, event };
      }
    }
    return { result: loadingStateEnum.failed };
  }
  return { result: loadingStateEnum.failed };
}

export async function getSchoolDays(date: Date): Promise<{
  result: loadingStateEnum;
  data?: eventType[];
  nextLink?: string;
}> {
  const firstDay = `${
    new Date(date.getFullYear(), date.getMonth(), 1)
      .toISOString()
      .replace(/.\d+Z$/g, 'Z')
      .split(/[T ]/i, 1)[0]
  }T00:00:00.0000000`;
  const lastDay = `${
    new Date(date.getFullYear(), date.getMonth() + 1, 1)
      .toISOString()
      .replace(/.\d+Z$/g, 'Z')
      .split(/[T ]/i, 1)[0]
  }T00:00:00.0000000`;
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/groups/${
      process.env.EXPO_PUBLIC_ORGWIDEGROUPID
    }/calendarView?startDateTime=${firstDay}&endDateTime=${lastDay}&$expand=singleValueExtendedProperties($filter=id%20eq%20'${
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
    const scheduleIds = new Map<string, number>();
    const schoolYearIds = new Map<string, number>();
    for (let index = 0; index < data.value.length; index += 1) {
      const outputIds: schoolDayDataCompressedType = JSON.parse(
        data.value[index].singleValueExtendedProperties.find(
          (e: { id: string; value: string }) => {
            return e.id === store.getState().paulyList.eventDataExtensionId;
          },
        ).value,
      );
      scheduleIds.set(outputIds.scheduleId, 0);
      schoolYearIds.set(outputIds.schoolYearEventId, 0);
    }
    // Get batch data

    const batchRequestResultSchedule = await batchRequest(undefined, {
      firstUrl: `/sites/${store.getState().paulyList.siteId}/lists/${
        store.getState().paulyList.scheduleListId
      }/items?expand=fields($select=scheduleProperName,scheduleDescriptiveName,scheduleColor,scheduleData,scheduleId)&$filter=fields/scheduleId%20eq%20'`,
      secondUrl: `'&$select=id`,
      method: 'GET',
      keys: {
        map: scheduleIds,
      },
    });

    if (
      batchRequestResultSchedule.result !== loadingStateEnum.success
    ) {
      return { result: loadingStateEnum.failed };
    }
    const schedules = new Map<string, scheduleType>();
    for (
      let scheudleIndex = 0;
      scheudleIndex < batchRequestResultSchedule.data.length;
      scheudleIndex += 1
    ) {
      const resultScheduleData =
        batchRequestResultSchedule.data[scheudleIndex].body;
      if (
        batchRequestResultSchedule.data[scheudleIndex].status === 200 &&
        resultScheduleData !== undefined
      ) {
        // TO DO fix status code
        if (resultScheduleData.value.length === 1) {
          const scheduleResponseData = resultScheduleData.value[0].fields;
          try {
            schedules.set(scheduleResponseData.scheduleId, {
              properName: scheduleResponseData.scheduleProperName,
              descriptiveName: scheduleResponseData.scheduleDescriptiveName,
              periods: JSON.parse(scheduleResponseData.scheduleData),
              id: scheduleResponseData.scheduleId,
              color: scheduleResponseData.scheduleColor,
            });
          } catch {
            return { result: loadingStateEnum.failed };
          }
        } else {
          return { result: loadingStateEnum.failed };
        }
      } else {
        return { result: loadingStateEnum.failed };
      }
    }

    const timetableResult = await getTimetablesFromSchoolYears(
      schoolYearIds,
      schedules,
    );
    if (
      timetableResult.result !== loadingStateEnum.success ||
      timetableResult.data === undefined
    ) {
      return { result: loadingStateEnum.failed };
    }

    const schoolDaysResult: eventType[] = [];
    for (let index = 0; index < data.value.length; index += 1) {
      const outputIds: schoolDayDataCompressedType = JSON.parse(
        data.value[index].singleValueExtendedProperties.find(
          (e: { id: string; value: string }) => {
            return e.id === store.getState().paulyList.eventDataExtensionId;
          },
        ).value,
      );
      const schedule = schedules.get(outputIds.scheduleId);
      const timetable = timetableResult.data.get(outputIds.schoolYearEventId);
      const dressCode = timetable?.dressCode.dressCodeData.find(e => {
        return e.id === outputIds.dressCodeId;
      });
      const schoolDay = timetable?.days.find(e => {
        return e.id === outputIds.schoolDayId;
      });
      if (
        schedule !== undefined &&
        timetable !== undefined &&
        dressCode !== undefined &&
        schoolDay !== undefined
      ) {
        schoolDaysResult.push({
          id: data.value[index].id,
          name: data.value[index].subject,
          startTime: data.value[index].start.dateTime,
          endTime: data.value[index].end.dateTime,
          eventColor: schedule.color,
          microsoftEvent: true,
          allDay: !!data.value[index].isAllDay,
          paulyEventType: 'schoolDay',
          schoolDayData: {
            schoolDay: schoolDay,
            schedule,
            dressCode,
            semester: outputIds.semester,
            dressCodeIncentive: outputIds.dressCodeIncentiveId as unknown as dressCodeIncentiveType,
            schoolYearEventId: outputIds.schoolYearEventId
          },
        });
      } else {
        return { result: loadingStateEnum.failed };
      }
    }
    return {
      result: loadingStateEnum.success,
      data: schoolDaysResult,
      nextLink: data['@odata.nextLink'],
    };
  }
  return { result: loadingStateEnum.failed };
}

// This function gets both school years and their timetable data
async function getTimetablesFromSchoolYears(
  schoolYearIds: Map<string, number>,
  schedules: Map<string, scheduleType>,
): Promise<{ result: loadingStateEnum; data?: Map<string, timetableType> }> {
  // Get School Years
  const batchRequestResultSchoolYear = await batchRequest(undefined, {
    firstUrl: `/groups/${process.env.EXPO_PUBLIC_ORGWIDEGROUPID}/calendar/events/`,
    secondUrl: `?$expand=singleValueExtendedProperties($filter=id%20eq%20'${
      store.getState().paulyList.eventTypeExtensionId
    }'%20or%20id%20eq%20'${store.getState().paulyList.eventDataExtensionId}')`,
    method: 'GET',
    keys: {
      map: schoolYearIds,
    },
  });

  if (batchRequestResultSchoolYear.result !== loadingStateEnum.success) {
    return { result: loadingStateEnum.failed };
  }

  const timetableIds = new Map<string, string[]>();
  for (
    let schoolYearIndex = 0;
    schoolYearIndex < batchRequestResultSchoolYear.data.length;
    schoolYearIndex += 1
  ) {
    if (batchRequestResultSchoolYear.data[schoolYearIndex].status === 200) {
      // TO DO fix status code
      const schoolYearResponseData: { id: string; value: string }[] =
        batchRequestResultSchoolYear.data[schoolYearIndex].body
          .singleValueExtendedProperties;
      const schoolYearData = schoolYearResponseData.find(e => {
        return e.id === store.getState().paulyList.eventDataExtensionId;
      });
      if (schoolYearData !== undefined) {
        try {
          const perviousTimetable = timetableIds.get(schoolYearData.value);
          if (perviousTimetable !== undefined) {
            timetableIds.set(schoolYearData.value, [
              ...perviousTimetable,
              batchRequestResultSchoolYear.data[schoolYearIndex].body.id,
            ]);
          } else {
            timetableIds.set(schoolYearData.value, [
              batchRequestResultSchoolYear.data[schoolYearIndex].body.id,
            ]);
          }
        } catch {
          return { result: loadingStateEnum.failed };
        }
      } else {
        return { result: loadingStateEnum.failed };
      }
    } else {
      return { result: loadingStateEnum.failed };
    }
  }

  // Get timetables
  const batchRequestResultTimetable = await batchRequest(undefined, {
    firstUrl: `/sites/${store.getState().paulyList.siteId}/lists/${
      store.getState().paulyList.timetablesListId
    }/items?expand=fields($select=timetableName,timetableId,timetableDataDays,timetableDataSchedules,timetableDefaultScheduleId,timetableDressCodeId)&$filter=fields/timetableId%20eq%20'`,
    secondUrl: `'&$select=id`,
    method: 'GET',
    keys: {
      map: timetableIds,
    },
  });

  if (
    batchRequestResultTimetable.result !== loadingStateEnum.success ||
    batchRequestResultTimetable.data === undefined
  ) {
    return { result: loadingStateEnum.failed };
  }

  const dressCodeIds = new Map<string, number>();
  for (
    let responseIndex = 0;
    responseIndex < batchRequestResultTimetable.data.length;
    responseIndex += 1
  ) {
    if (
      batchRequestResultTimetable.data[responseIndex].status === 200 &&
      batchRequestResultTimetable.data[responseIndex] !== undefined
    ) {
      // TO DO fix status code
      if (
        batchRequestResultTimetable.data[responseIndex].body.value.length === 1
      ) {
        try {
          dressCodeIds.set(
            batchRequestResultTimetable.data[responseIndex].body.value[0].fields
              .timetableDressCodeId,
            0,
          );
        } catch {
          return { result: loadingStateEnum.failed };
        }
      } else {
        return { result: loadingStateEnum.failed };
      }
    } else {
      return { result: loadingStateEnum.failed };
    }
  }

  // Get dress code data
  const batchRequestResultDressCode = await batchRequest(undefined, {
    firstUrl: `/sites/${store.getState().paulyList.siteId}/lists/${
      store.getState().paulyList.dressCodeListId
    }/items?expand=fields($select=dressCodeData,dressCodeIncentivesData,dressCodeName,dressCodeId)&$select=id&$filter=fields/dressCodeId%20eq%20'`,
    secondUrl: `'&$top=1`,
    method: 'GET',
    keys: {
      map: dressCodeIds,
    },
  });

  if (batchRequestResultDressCode.result !== loadingStateEnum.success) {
    return { result: loadingStateEnum.failed };
  }

  const dressCodes = new Map<string, dressCodeType>();
  for (
    let dressCodeIndex = 0;
    dressCodeIndex < batchRequestResultDressCode.data.length;
    dressCodeIndex += 1
  ) {
    if (
      batchRequestResultDressCode.data[dressCodeIndex].status === 200 &&
      batchRequestResultDressCode.data[dressCodeIndex].body !== undefined
    ) {
      batchRequestResultDressCode.data[dressCodeIndex].body;
      if (
        batchRequestResultDressCode.data[dressCodeIndex].body?.value.length ===
        1
      ) {
        try {
          dressCodes.set(
            batchRequestResultDressCode.data[dressCodeIndex].body?.value[0]
              .fields.dressCodeId,
            {
              name: batchRequestResultDressCode.data[dressCodeIndex].body
                .value[0].fields.dressCodeName,
              id: batchRequestResultDressCode.data[dressCodeIndex].body.value[0]
                .fields.dressCodeId,
              dressCodeData: JSON.parse(
                batchRequestResultDressCode.data[dressCodeIndex].body.value[0]
                  .fields.dressCodeData,
              ),
              dressCodeIncentives:
                batchRequestResultDressCode.data[dressCodeIndex].body.value[0]
                  .fields.dressCodeIncentivesData,
              itemId: '',
            },
          );
        } catch {
          return { result: loadingStateEnum.failed };
        }
      } else {
        return { result: loadingStateEnum.failed };
      }
    } else {
      return { result: loadingStateEnum.failed };
    }
  }

  const timetables = new Map<string, timetableType>();
  for (
    let timetableIndex = 0;
    timetableIndex < batchRequestResultTimetable.data.length;
    timetableIndex += 1
  ) {
    const resultTimetableData =
      batchRequestResultTimetable.data[timetableIndex].body;
    if (
      batchRequestResultTimetable.data[timetableIndex].status === 200 &&
      resultTimetableData !== undefined
    ) {
      if (resultTimetableData.value.length === 1) {
        const timetableData = resultTimetableData.value[0].fields;
        const dressCode = dressCodes.get(timetableData.timetableDressCodeId);
        const timetableSchedules: scheduleType[] = [];
        const scheduleIds: string[] = JSON.parse(
          timetableData.timetableDataSchedules,
        );

        for (
          let scheduleIndex = 0;
          scheduleIndex < scheduleIds.length;
          scheduleIndex += 1
        ) {
          const newSchedule = schedules.get(scheduleIds[scheduleIndex]);
          if (newSchedule !== undefined) {
            timetableSchedules.push(newSchedule);
          }
        }
        if (dressCode !== undefined) {
          timetables.set(timetableData.timetableId, {
            name: timetableData.timetableName,
            id: timetableData.timetableId,
            schedules: timetableSchedules,
            days: JSON.parse(timetableData.timetableDataDays),
            dressCode,
          });
        }
      }
    } else {
      return { result: loadingStateEnum.failed };
    }
  }

  const outputTimetables = new Map<string, timetableType>();
  timetables.forEach((value, key) => {
    const timetablesArray = timetableIds.get(key);
    if (timetablesArray) {
      timetablesArray.forEach(item => {
        outputTimetables.set(item, value);
      });
    }
  });

  return { result: loadingStateEnum.success, data: outputTimetables };
}

export function getMonthData(selectedDate: Date) {
  // Check if this month
  const lastDay = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth() + 1,
    0,
  );
  const firstDayWeek = findFirstDayinMonth(selectedDate);
  const monthDataResult: monthDataType[] = [];
  const { currentEvents } = store.getState();
  for (let index = 0; index < 42; index += 1) {
    if (index >= firstDayWeek && index - firstDayWeek < lastDay.getDate()) {
      // In the current month
      const events: eventType[] = []; // The result events of that day

      for (
        let indexEvent = 0;
        indexEvent < currentEvents.length;
        indexEvent += 1
      ) {
        const event: eventType = currentEvents[indexEvent]; // Event to be checked
        if (
          isEventDuringInterval(
            selectedDate,
            event,
            index - firstDayWeek + 1,
            index - firstDayWeek + 2,
          ) && (event.paulyEventType !== 'schoolYear' || store.getState().isGovernmentMode)
        ) {
          events.push(event);
        }
      }
      monthDataResult.push({
        showing: true,
        dayData: index - firstDayWeek + 1,
        id: createUUID(),
        events,
      });
    } else {
      monthDataResult.push({
        showing: false,
        dayData: 0,
        id: createUUID(),
        events: [],
      });
    }
  }
  const chunckedMonthData = [];
  while(monthDataResult.length) chunckedMonthData.push(monthDataResult.splice(0,7));
  store.dispatch(monthDataSlice.actions.setMonthData(chunckedMonthData));
}

async function getSchoolDayData(data: schoolDayDataCompressedType): Promise<{result: loadingStateEnum.failed} | {result: loadingStateEnum.success, data: schoolDayDataType}> {
  const schoolYearResult = await callMsGraph(`https://graph.microsoft.com/v1.0/groups/${process.env.EXPO_PUBLIC_ORGWIDEGROUPID}/calendar/events/${data.schoolYearEventId}?$expand=singleValueExtendedProperties($filter=id%20eq%20'${
    store.getState().paulyList.eventTypeExtensionId
  }'%20or%20id%20eq%20'${store.getState().paulyList.eventDataExtensionId}')`)
  if (!schoolYearResult.ok) {
    return {result: loadingStateEnum.failed}
  }
  const schoolYearData = await schoolYearResult.json()
  const singleValue = getSingleValueProperties(schoolYearData)
  if (singleValue == undefined) {
    return {result: loadingStateEnum.failed}
  }
  const timetableResult = await getTimetable(singleValue.eventData)
  if (timetableResult.result !== loadingStateEnum.success) {
    return {result: loadingStateEnum.failed}
  }
  const schoolDay = timetableResult.timetable.days.find((e) => {return e.id === data.schoolDayId})
  const schedule = timetableResult.timetable.schedules.find((e) => {return e.id === data.scheduleId})
  const dressCode = timetableResult.timetable.dressCode.dressCodeData.find((e) => {return e.id === data.dressCodeId})
  if (schoolDay === undefined || schedule === undefined || dressCode === undefined) {
    return {result: loadingStateEnum.failed}
  }
  return {result: loadingStateEnum.success, data: {
    schoolDay: schoolDay,
    schedule: schedule,
    dressCode: dressCode,
    semester: data.semester,
    schoolYearEventId: data.schoolYearEventId
  }}
  //TO DO dress code insentive
}