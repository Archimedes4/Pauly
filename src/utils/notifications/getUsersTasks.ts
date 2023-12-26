/*
  Pauly
  Andrew Mainella
  November 9 2023
  getUsersTasks.ts
*/
import { taskDeltaSlice } from '../../redux/reducers/tasksReducers';
import store from '../../redux/store';
import {
  loadingStateEnum,
  taskImportanceEnum,
  taskStatusEnum,
} from '../../constants';
import callMsGraph from '../ultility/microsoftAssets';

// deltaRunAgain is send if the delta link has failed or the responce 410 meaning syncronization is needed.
export default async function getUsersTasks(
  deltaRunAgain?: boolean,
): Promise<{ result: loadingStateEnum; data?: taskType[] }> {
  let deltaMode = false;
  if (store.getState().tasksDeltaLink !== '' && deltaRunAgain !== true) {
    deltaMode = true;
  }
  const url = deltaMode
    ? store.getState().tasksDeltaLink
    : 'https://graph.microsoft.com/v1.0/me/todo/lists/Tasks/tasks/delta';
  const tasksResult = await callMsGraph(url);
  if (tasksResult.ok) {
    const taskData = await tasksResult.json();
    if (taskData['@odata.deltaLink'] !== undefined) {
      store.dispatch(
        taskDeltaSlice.actions.setTaskDeltaLink(taskData['@odata.deltaLink']),
      );
    }
    const resultTasks: taskType[] = [];
    for (let index = 0; index < taskData.value.length; index += 1) {
      resultTasks.push({
        name: taskData.value[index].title,
        id: taskData.value[index].id,
        importance:
          taskImportanceEnum[
            taskData.value[index].importance as keyof typeof taskImportanceEnum
          ],
        status:
          taskStatusEnum[
            taskData.value[index].status as keyof typeof taskStatusEnum
          ],
        excess: false,
        state: loadingStateEnum.notStarted,
      });
    }
    resultTasks.unshift({
      name: '',
      importance: taskImportanceEnum.normal,
      id: '',
      status: taskStatusEnum.notStarted,
      excess: true,
      state: loadingStateEnum.notStarted,
    });
    return { result: loadingStateEnum.success, data: resultTasks };
  }
  if (deltaMode) {
    const secondAttempt = await getUsersTasks(true);
    return secondAttempt;
  }
  return { result: loadingStateEnum.failed };
}
