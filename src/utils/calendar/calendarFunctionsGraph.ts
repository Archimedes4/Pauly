import { scheduleData } from './../ﻩgovernment/initializePauly/initializePaulyData';
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
import { getTimetable } from '@redux/reducers/timetableReducer';
import callMsGraph from '../ultility/microsoftAssests';
import batchRequest from '../ultility/batchRequest';
import createUUID from '../ultility/createUUID';
import {
  decodeSchoolDayData,
  decodeSchoolYearData,
  findFirstDayinMonth,
  isEventDuringInterval,
} from './calendarFunctions';

function isEventSchoolDay(data: any): boolean {
  const singleValueResult = getSingleValueProperties(data);
  if (singleValueResult == undefined) {
    return false
  }
  if (singleValueResult.eventType === 'schoolDay') {
    return true
  }
  return false
}

export function getSingleValueProperties(data: any):
  | undefined
  | {
      eventType: paulyEventTypes;
      eventData: string;
    } {
  // list constansts
  const { paulyList } = store.getState();
  const eventTypeExtensionID = paulyList.eventTypeExtensionId;
  const eventDataExtensionID = paulyList.eventDataExtensionId;
  // event data
  try {
    const { singleValueExtendedProperties } = data;
    if (singleValueExtendedProperties !== undefined) {
      const eventType = singleValueExtendedProperties.find(
        (e: { id: string; value: string }) => {
          return e.id === eventTypeExtensionID;
        },
      )?.value;
      const eventData = singleValueExtendedProperties.find(
        (e: { id: string; value: string }) => {
          return e.id === eventDataExtensionID;
        },
      )?.value;
      if (
        eventType === undefined ||
        eventData == undefined ||
        ![
          'personal',
          'regular',
          'schoolDay',
          'schoolYear',
          'studentCouncil',
        ].includes(eventType)
      ) {
      } else {
        return {
          eventType,
          eventData,
        };
      }
    }
  } catch (e) {}
}


async function parseEventJSON(data: any, events?: eventType[]): Promise<{result: loadingStateEnum.failed} | {result: loadingStateEnum.success, data: eventType}> {
  const singleValueResult = getSingleValueProperties(data);
  if (
    singleValueResult !== undefined &&
    singleValueResult.eventType === 'schoolDay'
  ) {
    const schoolDayEventData = decodeSchoolDayData(
      singleValueResult.eventData,
    );
    if (schoolDayEventData === 'failed') {
      return { result: loadingStateEnum.failed };
    }
    const schoolDayResult = await getSchoolDayData(schoolDayEventData, events);
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
        schoolDayData: schoolDayResult.data,
      };
      return { result: loadingStateEnum.success, data: event };
    }
    return { result: loadingStateEnum.failed };
  }
  if (
    singleValueResult !== undefined &&
    singleValueResult.eventType === 'schoolYear'
  ) {
    const schoolYearData = decodeSchoolYearData(
      singleValueResult.eventData,
    );
    if (schoolYearData === 'failed') {
      return { result: loadingStateEnum.failed };
    }
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
      timetableId: schoolYearData.timetableId,
      paulyId: schoolYearData.paulyId
    };
    return { result: loadingStateEnum.success, data: event };
  }
  if (
    singleValueResult !== undefined &&
    singleValueResult.eventType !== 'schoolYear' &&
    singleValueResult.eventType !== 'schoolDay'
  ) {
    const event: eventType = {
      id: data.id,
      name: data.subject,
      startTime: data.start.dateTime,
      endTime: data.end.dateTime,
      allDay: data.isAllDay,
      eventColor: Colors.white,
      microsoftEvent: true,
      microsoftReference: `https://graph.microsoft.com/v1.0/groups/${process.env.EXPO_PUBLIC_ORGWIDEGROUPID}/calendar/events/${data.id}`,
      paulyEventType: singleValueResult.eventType,
    };
    return { result: loadingStateEnum.success, data: event };
  }
  const event: eventType = {
    id: data.id,
    name: data.subject,
    startTime: data.start.dateTime,
    endTime: data.end.dateTime,
    allDay: data.isAllDay,
    eventColor: Colors.white,
    microsoftEvent: true,
    microsoftReference: `https://graph.microsoft.com/v1.0/groups/${process.env.EXPO_PUBLIC_ORGWIDEGROUPID}/calendar/events/${data.id}`,
    paulyEventType: 'regular',
  };
  return { result: loadingStateEnum.success, data: event }
}

// Defaults to org wide events
export async function getGraphEvents(
  url?: string,
  referenceUrl?: string,
  events?: eventType[]
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
    url !== undefined ? url : defaultUrl,
    'GET',
    undefined,
    [
      {
        // America/Winnipeg
        key: 'Prefer',
        value: 'outlook.timezone="UTC"',
      },
    ],
  );
  if (result.ok) {
    const data = await result.json();
    let newEvents: eventType[] = [];
    let ongoingRequests: Promise<{
      result: loadingStateEnum.failed;
    } | {
      result: loadingStateEnum.success;
      data: eventType;
    }>[] = []
    let schoolDayRequests: any[] = []
    for (let index = 0; index < data.value.length; index += 1) {
      if (isEventSchoolDay(data.value[index])) {
        schoolDayRequests.push(data.value[index])
      } else {
        ongoingRequests.push(parseEventJSON(data.value[index]))
      }
    }
    const resultRequests = await Promise.all(ongoingRequests)
    for (let index = 0; index < resultRequests.length; index += 1) {
      const resultRequest = resultRequests[index]
      if (resultRequest.result === loadingStateEnum.success) {
        newEvents = [...newEvents, resultRequest.data]
      } else {
        return {
          result: loadingStateEnum.failed
        }
      }
    }

    let ongoingSchoolDayRequests: Promise<{
      result: loadingStateEnum.failed;
    } | {
      result: loadingStateEnum.success;
      data: eventType;
    }>[] = []
    for (let index = 0; index < schoolDayRequests.length; index += 1) {
      ongoingSchoolDayRequests.push(parseEventJSON(schoolDayRequests[index], (events !== undefined) ? [...events, ...newEvents]:[...newEvents]))
    }
    const resultSchoolDayRequests = await Promise.all(ongoingSchoolDayRequests)
    for (let index = 0; index < resultSchoolDayRequests.length; index += 1) {
      const resultRequest = resultSchoolDayRequests[index]
      if (resultRequest.result === loadingStateEnum.success) {
        newEvents = [...newEvents, resultRequest.data]
      } else {
        console.log("Failure")
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
): Promise<
  | { result: loadingStateEnum.success; data: eventType }
  | { result: loadingStateEnum.failed }
> {
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
    return parseEventJSON(data)
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

export async function getSchoolDay(
  selectedDate: Date,
): Promise<
  | { result: loadingStateEnum.success; event: eventType }
  | { result: loadingStateEnum.failed }
> {
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
      if (
        singleValueResult !== undefined &&
        singleValueResult.eventType === 'schoolDay'
      ) {
        const schoolDayDataResult = await getSchoolDayData(
          JSON.parse(
            singleValueResult.eventData,
          ) as schoolDayDataCompressedType,
        );
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
          schoolDayData: schoolDayDataResult.data,
        };
        return { result: loadingStateEnum.success, event };
      }
    }
    return { result: loadingStateEnum.failed };
  }
  return { result: loadingStateEnum.failed };
}

export async function getSchoolDays(date: Date): Promise<
  | {
      result: loadingStateEnum.success;
      data: eventType[];
    }
  | {
      result: loadingStateEnum.failed;
    }
> {
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
  let url = `https://graph.microsoft.com/v1.0/groups/${
    process.env.EXPO_PUBLIC_ORGWIDEGROUPID
  }/calendarView?startDateTime=${firstDay}&endDateTime=${lastDay}&$expand=singleValueExtendedProperties($filter=id%20eq%20'${
    store.getState().paulyList.eventTypeExtensionId
  }'%20or%20id%20eq%20'${
    store.getState().paulyList.eventDataExtensionId
  }')&$filter=singleValueExtendedProperties/Any(ep:%20ep/id%20eq%20'${
    store.getState().paulyList.eventTypeExtensionId
  }'%20and%20ep/value%20ne%20null)&$select=id,singleValueExtendedProperties,start,end,isAllDay`
  let data: any[] = []
  while (url !== undefined) {
    const result = await callMsGraph(url,
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
      const outData = await result.json();
      data = [...outData.value, ...data]
      url = outData["@odata.nextLink"]
    } else {
      return {result: loadingStateEnum.failed }
    }
  }
  const scheduleIds = new Map<string, number>();
  const schoolYearIds = new Map<string, string>();
  for (let index = 0; index < data.length; index += 1) {
    const singleValue = getSingleValueProperties(data[index])
    if (singleValue == undefined) {
      return { result: loadingStateEnum.failed };
    }
    if (singleValue.eventType === 'schoolYear') {
      const decodedSchoolYear = decodeSchoolYearData(singleValue.eventData)
      if (decodedSchoolYear === 'failed') {
        return { result: loadingStateEnum.failed };
      }
      schoolYearIds.set(decodedSchoolYear.paulyId, decodedSchoolYear.timetableId);
      continue
    }
    const schoolDayDecoded = decodeSchoolDayData(singleValue.eventData)
    if (schoolDayDecoded === 'failed') {
      return { result: loadingStateEnum.failed };
    }
    scheduleIds.set(schoolDayDecoded.sId, 0);
  }
  // Get batch data
  const batchRequestResultSchedule = await batchRequest(
    {
      firstUrl: `/sites/${store.getState().paulyList.siteId}/lists/${
        store.getState().paulyList.scheduleListId
      }/items?expand=fields($select=scheduleProperName,scheduleDescriptiveName,scheduleColor,scheduleData,scheduleId)&$filter=fields/scheduleId%20eq%20'`,
      secondUrl: `'&$select=id`,
      method: 'GET',
      map: scheduleIds,
    },
    store,
  );

  if (batchRequestResultSchedule.result !== loadingStateEnum.success) {
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

  const schoolDaysResult: eventType[] = [];
  for (let index = 0; index < data.length; index += 1) {
    const singleValue = getSingleValueProperties(data[index])
    if (singleValue == undefined) {
      return { result: loadingStateEnum.failed };
    }
    if (singleValue.eventType !== 'schoolDay') {
      continue
    }
    const schoolDayDecoded = decodeSchoolDayData(singleValue.eventData)
    if (schoolDayDecoded === 'failed') {
      return { result: loadingStateEnum.failed };
    }
    const schedule = schedules.get(schoolDayDecoded.sId);
    const timetableId = schoolYearIds.get(schoolDayDecoded.syeId)
    if (timetableId === undefined) {
      return { result: loadingStateEnum.failed };
    }
    const timetable = await getTimetable(timetableId, store);
    if (timetable.result !== loadingStateEnum.success) {
      return { result: loadingStateEnum.failed };
    }
    const dressCode = timetable.data.dressCode.dressCodeData.find(e => {
      return e.id === schoolDayDecoded.dcId;
    });
    const schoolDay = timetable.data.days.find(e => {
      return e.id === schoolDayDecoded.sdId;
    });
    if (
      schedule !== undefined &&
      timetable !== undefined &&
      dressCode !== undefined &&
      schoolDay !== undefined
    ) {
      schoolDaysResult.push({
        id: data[index].id,
        name: data[index].subject,
        startTime: data[index].start.dateTime,
        endTime: data[index].end.dateTime,
        eventColor: schedule.color,
        microsoftEvent: true,
        allDay: data[index].isAllDay,
        paulyEventType: 'schoolDay',
        schoolDayData: {
          schoolDay,
          schedule,
          dressCode,
          semester: schoolDayDecoded.sem,
          dressCodeIncentive: undefined,
          schoolYearEventId: schoolDayDecoded.syeId, //TO Do make sure this event works
        },
      });
    } else {
      return { result: loadingStateEnum.failed };
    }
  }
  return {
    result: loadingStateEnum.success,
    data: schoolDaysResult
  };
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
          isEventDuringInterval({
            selectedDate,
            event,
            checkDayStart: index - firstDayWeek + 1,
            checkDayEnd: index - firstDayWeek + 2,
          }) &&
          (event.paulyEventType !== 'schoolYear' ||
            store.getState().isGovernmentMode)
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
  while (monthDataResult.length)
    chunckedMonthData.push(monthDataResult.splice(0, 7));
  store.dispatch(monthDataSlice.actions.setMonthData(chunckedMonthData));
}

async function getSchoolDayData(
  data: schoolDayDataCompressedType,
  events?: eventType[]
): Promise<
  | { result: loadingStateEnum.failed }
  | { result: loadingStateEnum.success; data: schoolDayDataType }
> {
  // TODO if a getEvent request is made and is out of range of current events.
  let schoolYearEvent: undefined | eventType = undefined
  if (store.getState().currentEvents.length !== 0 && events == undefined) {
    schoolYearEvent = store.getState().currentEvents.find((e) => {return e.paulyEventType === "schoolYear" && e.paulyId === data.syeId})
  }
  
  if (events !== undefined) {
    schoolYearEvent = events.find((e) => {return e.paulyEventType === "schoolYear" && e.paulyId === data.syeId})
  }

  if (schoolYearEvent === undefined || schoolYearEvent.paulyEventType !== 'schoolYear') {
    return { result: loadingStateEnum.failed };
  }

  const timetable = await getTimetable(schoolYearEvent.timetableId, store);
  if (timetable.result !== loadingStateEnum.success) {
    return { result: loadingStateEnum.failed };
  }
  const schoolDay = timetable.data.days.find(e => {
    return e.id === data.sdId;
  });
  const schedule = timetable.data.schedules.find(e => {
    return e.id === data.sId;
  });
  const dressCode = timetable.data.dressCode.dressCodeData.find(e => {
    return e.id === data.dcId;
  });
  if (
    schoolDay === undefined ||
    schedule === undefined ||
    dressCode === undefined
  ) {
    return { result: loadingStateEnum.failed };
  }
  return {
    result: loadingStateEnum.success,
    data: {
      schoolDay,
      schedule,
      dressCode,
      semester: data.sem,
      schoolYearEventId: data.syeId,
    },
  };
  // TO DO dress code insentive
}
