import store from "@redux/store";
import createUUID from "../ultility/createUUID";
import callMsGraph from "../ultility/microsoftAssets";
import { loadingStateEnum } from "@constants";

export async function createTimetable(selectedDefaultSchedule: scheduleType, selectedSchedules: scheduleType[], selectedDressCode: dressCodeType, schoolDays: schoolDayType[], timetableName: string) {
  // Check to make sure all have the same number of periods
  for (let index = 0; index < selectedSchedules.length; index += 1) {
    if (
      selectedSchedules[index].periods.length !==
      selectedDefaultSchedule.periods.length
    ) {
      return loadingStateEnum.failed;
    }
  }

  // Create Timetable
  const scheduals = [];
  for (let index = 0; index < selectedSchedules.length; index += 1) {
    scheduals.push(selectedSchedules[index].id);
  }
  const data = {
    fields: {
      Title: timetableName,
      timetableName,
      timetableId: createUUID(),
      timetableDataSchedules: JSON.stringify(scheduals),
      timetableDataDays: JSON.stringify(schoolDays),
      timetableDefaultScheduleId: selectedDefaultSchedule.id,
      timetableDressCodeId: selectedDressCode.id,
    },
  };
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${store.getState().paulyList.siteId}/lists/${store.getState().paulyList.timetablesListId}/items`,
    'POST',
    JSON.stringify(data),
  );
  if (result.ok) {
    return loadingStateEnum.success
  } else {
    return loadingStateEnum.failed
  }
}

export async function updateTimetable(selectedDefaultSchedule: scheduleType, selectedSchedules: scheduleType[], selectedDressCode: dressCodeType, schoolDays: schoolDayType[], timetableName: string, timetableListId: string, timetableId: string) {
  // Check to make sure all have the same number of periods
  for (let index = 0; index < selectedSchedules.length; index += 1) {
    if (
      selectedSchedules[index].periods.length !==
      selectedDefaultSchedule.periods.length
    ) {
      return loadingStateEnum.failed;
    }
  }

  // Update Timetable
  const scheduals: string[] = []; //list of ids for the schedules
  for (let index = 0; index < selectedSchedules.length; index += 1) {
    scheduals.push(selectedSchedules[index].id);
  }
  const data = {
    fields: {
      Title: timetableName,
      timetableName,
      timetableId: timetableId,
      timetableDataSchedules: JSON.stringify(scheduals),
      timetableDataDays: JSON.stringify(schoolDays),
      timetableDefaultScheduleId: selectedDefaultSchedule.id,
      timetableDressCodeId: selectedDressCode.id,
    },
  };
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${store.getState().paulyList.siteId}/lists/${store.getState().paulyList.timetablesListId}/items/${timetableListId}`,
    'PATCH',
    JSON.stringify(data),
  );
  if (result.ok) {
    return loadingStateEnum.success
  } else {
    return loadingStateEnum.failed
  }
}