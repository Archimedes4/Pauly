import { taskDeltaSlice } from '../../Redux/reducers/tasksReducers';
import store from '../../Redux/store';
import {
  loadingStateEnum,
  taskImportanceEnum,
  taskStatusEnum,
} from '../../types';
import callMsGraph from '../Ultility/microsoftAssets';

function convertStringToTaskStatus(status: string): taskStatusEnum {
  if (status === 'notStarted') {
    return taskStatusEnum.notStarted;
  }
  if (status === 'inProgress') {
    return taskStatusEnum.inProgress;
  }
  if (status === 'completed') {
    return taskStatusEnum.completed;
  }
  if (status === 'waitingOnOthers') {
    return taskStatusEnum.waitingOnOthers;
  }
  return taskStatusEnum.deferred;
}

function convertStringToImportance(importance: string): taskImportanceEnum {
  if (importance === 'high') {
    return taskImportanceEnum.high;
  }
  if (importance === 'low') {
    return taskImportanceEnum.low;
  }
  return taskImportanceEnum.normal;
}

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
        importance: convertStringToImportance(taskData.value[index].importance),
        status: convertStringToTaskStatus(taskData.value[index].status),
        excess: false,
      });
    }
    resultTasks.unshift({
      name: '',
      importance: taskImportanceEnum.normal,
      id: '',
      status: taskStatusEnum.notStarted,
      excess: true,
    });
    return { result: loadingStateEnum.success, data: resultTasks };
  }
  if (deltaMode) {
    const secondAttempt = await getUsersTasks(true);
    return secondAttempt;
  }
  return { result: loadingStateEnum.failed };
}
