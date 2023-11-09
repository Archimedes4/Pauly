// Andrew Mainella
// Pauly

import { orgWideGroupID } from '../../PaulyConfig';
import callMsGraph from '../ultility/microsoftAssets';
import { Colors, loadingStateEnum, semesters } from '../../types';
import store from '../../Redux/store';
import batchRequest from '../ultility/batchRequest';
import createUUID from '../ultility/createUUID';
import getDressCode from '../notifications/getDressCode';
import { findFirstDayinMonth } from './calendarFunctions';
import { monthDataSlice } from '../../Redux/reducers/monthDataReducer';

// Defaults to org wide events
export async function getGraphEvents(
  url?: string,
  referenceUrl?: string,
): Promise<{
  result: loadingStateEnum;
  events?: eventType[];
  nextLink?: string;
}> {
  const result = await callMsGraph(
    url !== undefined
      ? url
      : `https://graph.microsoft.com/v1.0/groups/${orgWideGroupID}/calendar/events?$expand=singleValueExtendedProperties&$select=id,subject,start,end,isAllDay,singleValueExtendedProperties`,
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
      const { singleValueExtendedProperties } = data.value[index];
      const eventType: string | undefined =
        data.value[index].singleValueExtendedProperties !== undefined
          ? singleValueExtendedProperties.find(
              (e: { id: string; value: string }) => {
                return e.id === eventTypeExtensionID;
              },
            )?.value
          : undefined;
      const eventData: string | undefined =
        data.value[index].singleValueExtendedProperties !== undefined
          ? singleValueExtendedProperties.find(
              (e: { id: string; value: string }) => {
                return e.id === eventDataExtensionID;
              },
            )?.value
          : undefined;
      newEvents.push({
        id: data.value[index].id,
        name: data.value[index].subject,
        startTime: data.value[index].start.dateTime,
        endTime: data.value[index].end.dateTime,
        allDay: data.value[index].isAllDay,
        eventColor: Colors.white,
        paulyEventType:
          eventType === 'schoolYear'
            ? 'schoolYear'
            : eventType === 'schoolDay'
            ? 'schoolDay'
            : undefined,
        paulyEventData: eventData,
        microsoftEvent: true,
        microsoftReference:
          referenceUrl !== undefined
            ? referenceUrl + data.value[index].id
            : `https://graph.microsoft.com/v1.0/groups/${orgWideGroupID}/calendar/events/${data.value[index].id}`,
      });
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
): Promise<{ result: loadingStateEnum; data?: eventType }> {
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/groups/${orgWideGroupID}/calendar/events/${id}?$expand=singleValueExtendedProperties($filter=id%20eq%20'${
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
    const event: eventType = {
      id: data.id,
      name: data.subject,
      startTime: data.start.dateTime,
      endTime: data.end.dateTime,
      allDay: data.isAllDay,
      eventColor: Colors.white,
      microsoftEvent: true,
      microsoftReference: `https://graph.microsoft.com/v1.0/groups/${orgWideGroupID}/calendar/events/${data.id}`,
    };
    if (data.singleValueExtendedProperties !== undefined) {
      const eventData: { id: string; value: string }[] =
        data.singleValueExtendedProperties;
      const eventType = eventData.find(e => {
        return e.id === store.getState().paulyList.eventTypeExtensionId;
      })?.value;
      event.paulyEventType =
        eventType === 'schoolDay'
          ? 'schoolDay'
          : eventType === 'schoolYear'
          ? 'schoolYear'
          : undefined;
      event.paulyEventData = eventData.find(e => {
        return e.id === store.getState().paulyList.eventDataExtensionId;
      })?.value;
    }
    return { result: loadingStateEnum.success, data: event };
  }
  return { result: loadingStateEnum.failed };
}

export async function getSchedule(id: string): Promise<{
  result: loadingStateEnum;
  schedule?: scheduleType;
  listItemId?: string;
}> {
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
      return { result: loadingStateEnum.failed, schedule: undefined };
    }
    return { result: loadingStateEnum.failed, schedule: undefined };
  }
  return { result: loadingStateEnum.failed, schedule: undefined };
}

export async function getSchedules(): Promise<{
  result: loadingStateEnum;
  data?: scheduleType[];
  nextLink?: string;
}> {
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${
      store.getState().paulyList.siteId
    }/lists/${store.getState().paulyList.scheduleListId}/items?expand=fields`,
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
): Promise<{ result: loadingStateEnum; timetable?: timetableType }> {
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
            dressCodeResult.result === loadingStateEnum.success &&
            dressCodeResult.data !== undefined
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
): Promise<{ result: loadingStateEnum; event?: eventType }> {
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
    `https://graph.microsoft.com/v1.0/groups/${orgWideGroupID}/calendar/events?$expand=singleValueExtendedProperties($filter=id%20eq%20'${
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
      const eventTypeExtensionID =
        store.getState().paulyList.eventTypeExtensionId;
      const eventDataExtensionID =
        store.getState().paulyList.eventDataExtensionId;
      if (data.value[index].singleValueExtendedProperties !== undefined) {
        const eventData: { id: string; value: string }[] =
          data.value[index].singleValueExtendedProperties;
        if (eventData !== undefined) {
          if (
            eventData.find(e => {
              return e.id === eventTypeExtensionID;
            })?.value === 'schoolDay'
          ) {
            const event: eventType = {
              id: data.value[index].id,
              name: data.value[index].subject,
              startTime: data.value[index].start.dateTime,
              endTime: data.value[index].end.dateTime,
              allDay: data.value[index].isAllDay,
              eventColor: Colors.white,
              microsoftEvent: true,
              microsoftReference: `https://graph.microsoft.com/v1.0/groups/${orgWideGroupID}/calendar/events/${data.value[index].id}`,
              paulyEventType:
                eventData.find(e => {
                  return e.id === eventTypeExtensionID;
                })?.value === 'schoolDay'
                  ? 'schoolDay'
                  : undefined,
              paulyEventData: eventData.find(e => {
                return e.id === eventDataExtensionID;
              })?.value,
            };
            return { result: loadingStateEnum.success, event };
          }
        }
        return { result: loadingStateEnum.failed };
      }
      return { result: loadingStateEnum.failed };
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
    `https://graph.microsoft.com/v1.0/groups/${orgWideGroupID}/calendarView?startDateTime=${firstDay}&endDateTime=${lastDay}&$expand=singleValueExtendedProperties($filter=id%20eq%20'${
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
      batchRequestResultSchedule.result !== loadingStateEnum.success ||
      batchRequestResultSchedule.data === undefined
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
          schoolDayData: {
            schoolDayData: schoolDay,
            schedule,
            dressCode,
            semester: outputIds.semester,
            dressCodeIncentiveId: outputIds.dressCodeIncentiveId,
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
    firstUrl: `/groups/${orgWideGroupID}/calendar/events/`,
    secondUrl: `?$expand=singleValueExtendedProperties($filter=id%20eq%20'${
      store.getState().paulyList.eventTypeExtensionId
    }'%20or%20id%20eq%20'${store.getState().paulyList.eventDataExtensionId}')`,
    method: 'GET',
    keys: {
      map: schoolYearIds,
    },
  });

  if (
    batchRequestResultSchoolYear.data === undefined ||
    batchRequestResultSchoolYear.result !== loadingStateEnum.success
  ) {
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

  if (
    batchRequestResultDressCode.data === undefined ||
    batchRequestResultDressCode.result !== loadingStateEnum.success
  ) {
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

export async function createDressCode(
  dressCodeName: string,
  dressCodeData: dressCodeDataType[],
): Promise<loadingStateEnum> {
  const dressCodeId = createUUID();
  const data = {
    fields: {
      Title: dressCodeId,
      dressCodeId,
      dressCodeName,
      dressCodeData: JSON.stringify(dressCodeData),
      dressCodeIncentivesData: '[]',
    },
  };
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${
      store.getState().paulyList.siteId
    }/lists/${store.getState().paulyList.dressCodeListId}/items`,
    'POST',
    JSON.stringify(data),
  );
  if (result.ok) {
    return loadingStateEnum.success;
  }
  return loadingStateEnum.failed;
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
  for (let index = 0; index < 42; index += 1) {
    if (index >= firstDayWeek && index - firstDayWeek < lastDay.getDate()) {
      // In the current month
      const events: eventType[] = []; // The result events of that day

      // Check is the current date
      const checkStart: Date = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        index - firstDayWeek + 1,
        0,
        0,
      );
      const checkEnd: Date = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        index - firstDayWeek + 2,
        0,
        0,
      );
      for (
        let indexEvent = 0;
        indexEvent < store.getState().currentEvents.length;
        indexEvent += 1
      ) {
        const event: eventType = store.getState().currentEvents[indexEvent]; // Event to be checked

        const startTimeDate = new Date(event.startTime); // String to date
        const endTimeDate = new Date(event.endTime); // String to date

        // First check if starts before date and ends after or on day
        if (startTimeDate <= checkStart && endTimeDate > checkStart) {
          events.push(event);
        } else if (startTimeDate > checkStart && startTimeDate < checkEnd) {
          // Second check if starts on day
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
  store.dispatch(monthDataSlice.actions.setMonthData(monthDataResult));
}
