import store from '@redux/store';
import { homepageDataSlice } from '@redux/reducers/homepageDataReducer';
import { Colors, loadingStateEnum, semesters } from '@constants';
import callMsGraph from '@utils/ultility/microsoftAssets';
import {
  getEvent,
  getSchoolDay,
  getTimetable,
  getSchedule,
} from './calendar/calendarFunctionsGraph';
import { classesSlice } from '@src/redux/reducers/classesReducer';

export async function getRooms(
  nextLink?: string,
  search?: string,
): Promise<
  | { result: loadingStateEnum.success; data: roomType[]; nextLink?: string }
  | {
      result: loadingStateEnum.failed;
    }
> {
  const searchFilter = search
    ? `&$filter=fields/roomName%20eq%20${search}`
    : ''; // TODO deal with search filter
  const result = await callMsGraph(
    nextLink ||
      `https://graph.microsoft.com/v1.0/sites/${
        store.getState().paulyList.siteId
      }/lists/${
        store.getState().paulyList.roomListId
      }/items?expand=fields${searchFilter}`,
  );
  if (result.ok) {
    const data = await result.json();
    const resultArray: roomType[] = [];
    for (let index = 0; index < data.value.length; index += 1) {
      resultArray.push({
        name: data.value[index].fields.roomName,
        id: data.value[index].fields.roomId,
      });
    }
    return {
      result: loadingStateEnum.success,
      data: resultArray,
      nextLink: data['@odata.nextLink'],
    };
  }
  return { result: loadingStateEnum.failed };
}

export async function getRoom(
  roomId: string,
): Promise<{ result: loadingStateEnum.success; data: roomType } | {
  result: loadingStateEnum.failed
}> {
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${
      store.getState().paulyList.siteId
    }/lists/${
      store.getState().paulyList.roomListId
    }/items?expand=fields&$filter=fields/roomId%20eq%20'${roomId}'`,
  );
  if (result.ok) {
    const data = await result.json();
    if (data.value.length === 1) {
      return {
        result: loadingStateEnum.success,
        data: {
          name: data.value[0].fields.roomName,
          id: data.value[0].fields.roomId,
        },
      };
    }
    return { result: loadingStateEnum.failed };
  }
  return { result: loadingStateEnum.failed };
}

export async function getClasses(): Promise<
  | {
      result: loadingStateEnum.success;
      data: classType[];
    }
  | {
      result: loadingStateEnum.failed;
    }
> {
  let classQuery: string = `https://graph.microsoft.com/v1.0/me/joinedTeams?$select=id`;
  const batchDataRequests: batchRequest[][] = [[]];
  while (classQuery !== undefined) {
    const classResult = await callMsGraph(classQuery);
    if (classResult.ok) {
      const classData = await classResult.json();
      classQuery = classData['@odata.nextLink'];

      // Batch Request perfroming a get request on each class group

      // Format Data
      for (let index = 0; index < classData.value.length; index += 1) {
        batchDataRequests[Math.floor(index / 20)].push({
          id: (index + 1).toString(),
          method: 'GET',
          url: `/groups/${classData.value[index].id}?$select=displayName,id,${
            store.getState().paulyList.classExtensionId
          }`,
        });
      }
    } else {
      return { result: loadingStateEnum.failed };
    }
  }
  // Run Queries
  const batchHeaders = new Headers();
  batchHeaders.append('Accept', 'application/json');
  const classes: classType[] = [];
  for (let index = 0; index < batchDataRequests.length; index += 1) {
    const batchData = {
      requests: batchDataRequests[index],
    };
    const batchResult = await callMsGraph(
      'https://graph.microsoft.com/v1.0/$batch',
      'POST',
      JSON.stringify(batchData),
    );
    if (batchResult.ok) {
      const batchResultData = await batchResult.json();
      for (
        let batchIndex = 0;
        batchIndex < batchResultData.responses.length;
        batchIndex += 1
      ) {
        if (batchResultData.responses[batchIndex].status === 200) {
          if (
            batchResultData.responses[batchIndex].body[
              store.getState().paulyList.classExtensionId
            ] !== undefined
          ) {
            classes.push({
              name: batchResultData.responses[batchIndex].body.displayName,
              id: batchResultData.responses[batchIndex].body.id,
              periods: JSON.parse(
                batchResultData.responses[batchIndex].body[
                  store.getState().paulyList.classExtensionId
                ].periodData,
              ),
              room: {
                name: '',
                id: '',
              },
              schoolYearId: batchResultData.responses[batchIndex].body[
                store.getState().paulyList.classExtensionId
              ].schoolYearEventId,
              semester: JSON.parse(batchResultData.responses[batchIndex].body[
                store.getState().paulyList.classExtensionId
              ].semesterId),
            });
          }
        } else {
          return { result: loadingStateEnum.failed };
        }
      }
    } else {
      return { result: loadingStateEnum.failed };
    }
  }
  return { result: loadingStateEnum.success, data: classes };
}

export async function getClassEvents(
  schedule: scheduleType,
  semester: semesters,
  schoolYearEventId: string,
  schoolDay: schoolDayType,
  date: Date,
): Promise<{ result: loadingStateEnum.success; data: eventType[] } | { result: loadingStateEnum.failed }> {
  let classData: classType[] = []
  if (store.getState().classes.lastCalled === "" || new Date(store.getState().classes.lastCalled).getTime() >= (new Date().getTime() - 7200000)) {
    const classResult = await getClasses();
    if (classResult.result !== loadingStateEnum.success) {
      return {result: loadingStateEnum.failed}
    }
    classData = classResult.data
    store.dispatch(classesSlice.actions.setClasses({
      classes: classResult.data,
      lastCalled: new Date().toISOString()
    }))
  } else {
    classData = store.getState().classes.classes
  }
  let outputEvents: eventType[] = [];
  for (let index = 0; index < classData.length; index += 1) {
    if (
      classData[index].schoolYearId === schoolYearEventId &&
      classData[index].semester.includes(semester)
    ) {
      // This check should never fail
      if (classData[index].periods.length > schoolDay.order) {
        // Find Time
        const period: number =
          classData[index].periods[schoolDay.order];
        const periodData = schedule.periods[period - 1];
        const startDate: Date = new Date(date.toISOString());
        startDate.setHours(periodData.startHour);
        startDate.setMinutes(periodData.startMinute);
        startDate.setSeconds(0);
        const endDate: Date = date;
        endDate.setHours(periodData.endHour);
        endDate.setMinutes(periodData.endMinute);
        endDate.setSeconds(0);
        outputEvents.push({
          id: classData[index].id,
          name: classData[index].name,
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
          eventColor: Colors.white,
          microsoftEvent: false,
          allDay: false,
          paulyEventType: 'studentSchedule'
        });
      }
    }
  }
  outputEvents = outputEvents.sort((a, b) => {
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });
  return { result: loadingStateEnum.success, data: outputEvents };
}

export async function getClassEventsFromDay(
  date?: Date,
): Promise<
  | { result: loadingStateEnum.success; data: eventType[] }
  | { result: loadingStateEnum.failed }
> {
  const defindedDate = (date !== undefined) ? date:new Date()
  let resultEvent: eventType | undefined = undefined
  if (defindedDate.getMonth() === new Date(store.getState().lastCalledSelectedDate).getMonth() && defindedDate.getFullYear() === new Date(store.getState().lastCalledSelectedDate).getFullYear()) {
    const startTime = `${new Date(
      Date.UTC(
        defindedDate.getFullYear(),
        defindedDate.getMonth(),
        defindedDate.getDate(),
        0,
      ),
    )
      .toISOString()
      .slice(0, -1)}0000`
    const foundEvent = store.getState().currentEvents.find((e) => {
      e.paulyEventType === 'schoolDay' && e.startTime === startTime
    })
    if (foundEvent === undefined) {
      const result = await getSchoolDay(defindedDate);
      if (result.result !== loadingStateEnum.success) {
        return { result: loadingStateEnum.failed };
      }
      resultEvent = result.event;
    } else {
      resultEvent = foundEvent;
    }
  } else {
    const result = await getSchoolDay(defindedDate);
    if (result.result !== loadingStateEnum.success) {
      return { result: loadingStateEnum.failed };
    }
    resultEvent = result.event;
  }
  
  if (resultEvent === undefined || resultEvent.paulyEventType !== 'schoolDay') {
    return { result: loadingStateEnum.failed };
  }

  store.dispatch(
    homepageDataSlice.actions.setSchoolDayData(resultEvent.schoolDayData),
  );
  const classResult = await getClassEvents(
    resultEvent.schoolDayData.schedule,
    resultEvent.schoolDayData.semester,
    resultEvent.schoolDayData.schoolYearEventId,
    resultEvent.schoolDayData.schoolDay,
    new Date(resultEvent.startTime),
  );
  if (
    classResult.result === loadingStateEnum.success
  ) {
    if (classResult.data.length >= 1) {
      const startTimeDate = new Date(classResult.data[0].startTime);
      const hourTime =
        (startTimeDate.getHours() % 12) + 1 <= 9
          ? `0${(startTimeDate.getHours() % 12) + 1}`
          : (startTimeDate.getHours() % 12) + 1;
      const monthTime =
        startTimeDate.getMinutes() <= 9
          ? `0${startTimeDate.getMinutes()}`
          : startTimeDate.getMinutes().toString();
      store.dispatch(
        homepageDataSlice.actions.setStartTime(
          `${hourTime}:${monthTime}`,
        ),
      );
    }
    return {
      result: loadingStateEnum.success,
      data: classResult.data,
    };
  }
        
  return { result: loadingStateEnum.failed };
}
