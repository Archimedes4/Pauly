import { loadingStateEnum } from '@constants';
import { StoreType } from '@redux/store';
import getDressCode from './dressCodeFunctionsNoStore';
import { timer } from '../ultility/utils';
import callMsGraph from '../ultility/microsoftAssests/noStore';

export async function getTimetableApi(
  timetableId: string,
  store: StoreType,
): Promise<
  | { result: loadingStateEnum.success; timetable: timetableType }
  | {
      result: loadingStateEnum.failed;
    }
> {
  const cachedTimetable = store.getState().timetables.timetables.find(e => {
    return e.id === timetableId;
  });
  if (cachedTimetable !== undefined) {
    return { result: loadingStateEnum.success, timetable: cachedTimetable };
  }
  const fetchedTables = store
    .getState()
    .timetables.timetablesFetching.find(e => {
      return e === timetableId;
    });
  if (fetchedTables !== undefined) {
    const timetableResult:
      | {
          result: loadingStateEnum.success;
          data: timetableType;
        }
      | { result: loadingStateEnum.failed } = await new Promise(resolve => {
      const unsubscribe = store.subscribe(async () => {
        const cachedTimetable = store
          .getState()
          .timetables.timetables.find(e => {
            return e.id === timetableId;
          });
        if (cachedTimetable !== undefined) {
          resolve({
            result: loadingStateEnum.success,
            data: cachedTimetable,
          });
          unsubscribe();
        }
      });
      async function killCurrentProccess() {
        await timer(5000);
        resolve({
          result: loadingStateEnum.failed,
        });
        unsubscribe(); // Unsubscribe after getting the new result
      }
      killCurrentProccess();
    });
    if (timetableResult.result === loadingStateEnum.success) {
      return {
        result: loadingStateEnum.success,
        timetable: timetableResult.data,
      };
    }
  } else {
    console.log(`no fetch${timetableId}`);
  }
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${
      store.getState().paulyList.siteId
    }/lists/${
      store.getState().paulyList.timetablesListId
    }/items?expand=fields&$filter=fields/timetableId%20eq%20'${timetableId}'`,
    store,
  );
  if (result.ok) {
    const data = await result.json();
    if (data.value.length !== undefined && data.value.length === 1) {
      try {
        const scheduleData: string[] = JSON.parse(
          data.value[0].fields.timetableDataSchedules,
        );
        const newSchedules: scheduleType[] = [];
        for (let index = 0; index < scheduleData.length; index += 1) {
          const result = await getSchedule(scheduleData[index], store);
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
          store,
        );
        if (dressCodeResult.result === loadingStateEnum.success) {
          try {
            const timetableResult: timetableType = {
              name: data.value[0].fields.timetableName,
              id: data.value[0].fields.timetableId,
              schedules: newSchedules,
              days: JSON.parse(data.value[0].fields.timetableDataDays),
              dressCode: dressCodeResult.data,
            };
            return {
              result: loadingStateEnum.success,
              timetable: timetableResult,
            };
          } catch {
            return { result: loadingStateEnum.failed };
          }
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
}

export async function getSchedule(
  id: string,
  store: StoreType,
): Promise<
  | {
      result: loadingStateEnum.success;
      schedule: scheduleType;
      listItemId: string;
    }
  | {
      result: loadingStateEnum.failed;
    }
> {
  console.log('schedule');
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${
      store.getState().paulyList.siteId
    }/lists/${
      store.getState().paulyList.scheduleListId
    }/items?expand=fields($select=scheduleProperName,scheduleDescriptiveName,scheduleData,scheduleId,scheduleColor)&$filter=fields/scheduleId%20eq%20'${id}'&$select=id`,
    store,
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
