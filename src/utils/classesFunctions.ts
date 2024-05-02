import store from '@redux/store';
import { homepageDataSlice } from '@redux/reducers/homepageDataReducer';
import { Colors, loadingStateEnum, semesters } from '@constants';
import callMsGraph from '@utils/ultility/microsoftAssests';
import { getClasses } from '@redux/reducers/classesReducer';

/**
 * Get rooms from Pauly api.
 * @param nextLink Get more room
 * @param search Search for room name. Does nothing if next link doesn;t exist
 * @returns 
 */
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

/**
 * A function to get a room with a roomId
 * @param roomId The id of the room to get data
 * @returns Return a roomType if successful
 */
export async function getRoom(roomId: string): Promise<
  | { result: loadingStateEnum.success; data: roomType }
  | {
      result: loadingStateEnum.failed;
    }
> {
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

async function getClassEvents(
  schedule: scheduleType,
  semester: semesters,
  schoolYearEventId: string,
  schoolDay: schoolDayType,
  date: Date,
): Promise<
  | { result: loadingStateEnum.success; data: eventType[] }
  | { result: loadingStateEnum.failed }
> {
  const classResult = await getClasses(store);
  if (classResult.result !== loadingStateEnum.success) {
    return { result: loadingStateEnum.failed };
  }

  let outputEvents: eventType[] = [];
  for (let index = 0; index < classResult.data.length; index += 1) {
    if (
      classResult.data[index].schoolYearId === schoolYearEventId &&
      classResult.data[index].semester.includes(semester)
    ) {
      // This check should never fail
      if (classResult.data[index].periods.length > schoolDay.order) {
        // Find Time
        const period: number = classResult.data[index].periods[schoolDay.order];
        if (period !== 0) {
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
            id: classResult.data[index].id,
            name: classResult.data[index].name,
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString(),
            eventColor: Colors.white,
            microsoftEvent: false,
            allDay: false,
            paulyEventType: 'studentSchedule',
          });
        }
      }
    }
  }
  outputEvents = outputEvents.sort((a, b) => {
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });
  return { result: loadingStateEnum.success, data: outputEvents };
}

// This function is heavily mocked in Pauly-Functions getWidgetInfo. If core changes to this is made please check that Pauly-Functions still does work.
export async function getClassEventsFromDay(
  date?: Date,
): Promise<
  | { result: loadingStateEnum.success; data: eventType[] }
  | { result: loadingStateEnum.failed }
  | { result: loadingStateEnum.notFound }
> {
  const defindedDate = date !== undefined ? date : new Date();
  let resultEvent: eventType | undefined;
  const startTime = `${new Date(
    Date.UTC(
      defindedDate.getFullYear(),
      defindedDate.getMonth(),
      defindedDate.getDate(),
      0,
      defindedDate.getTimezoneOffset()
    ),
  )
    .toISOString()}`;
  const foundEvent = store.getState().currentEvents.find(e => {
    return e.paulyEventType === 'schoolDay' && e.startTime === startTime;
  });
  if (foundEvent === undefined) {
    return { result: loadingStateEnum.notFound };
  }
  resultEvent = foundEvent;

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
  if (classResult.result === loadingStateEnum.success) {
    if (classResult.data.length >= 1) {
      const startTimeDate = new Date(classResult.data[0].startTime);
      const hourTime = startTimeDate.getHours().toString().padStart(2, '0');
      const minuteTime = startTimeDate.getMinutes().toString().padStart(2, '0');
      store.dispatch(
        homepageDataSlice.actions.setStartTime(`${hourTime}:${minuteTime}`),
      );
    }
    return {
      result: loadingStateEnum.success,
      data: classResult.data,
    };
  }

  return { result: loadingStateEnum.failed };
}
