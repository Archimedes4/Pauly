/*
  Pauly
  Andrew Mainella
  November 9 2023
  updateTasks.ts
*/
import { ListRenderItemInfo } from 'react-native';
import { homepageDataSlice } from '@redux/reducers/homepageDataReducer';
import store from '@redux/store';
import {
  loadingStateEnum,
  taskImportanceEnum,
} from '@constants';
import callMsGraph from '../ultility/microsoftAssets';

export async function updateTaskStatus(
  task: taskType,
  index: number,
  abortController: AbortController
) {
  store.dispatch(
    homepageDataSlice.actions.updateUserTask({
      index: index,
      task: { ...task, state: loadingStateEnum.loading },
    }),
  );
  const data = {
    status
  };
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/me/todo/lists/Tasks/tasks/${task.id}`,
    'PATCH',
    JSON.stringify(data),
    undefined,
    undefined,
    abortController
  );
  if (result.ok) {
    store.dispatch(
      homepageDataSlice.actions.updateUserTask({
        index: index,
        task: { ...task, state: loadingStateEnum.success, status: task.status },
      }),
    );
  } else {
    store.dispatch(
      homepageDataSlice.actions.updateUserTask({
        index: index,
        task: { ...task, state: loadingStateEnum.failed },
      }),
    );
  }
}

export async function updateTaskText(task: taskType, index: number, abortController: AbortController) {
  store.dispatch(
    homepageDataSlice.actions.updateUserTask({
      index,
      task: { ...task, state: loadingStateEnum.loading },
    }),
  );
  const data = {
    title: task.name,
    status: task.status
  };
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/me/todo/lists/Tasks/tasks/${task.id}`,
    task.excess ? 'POST' : 'PATCH',
    JSON.stringify(data),
    undefined,
    undefined,
    abortController
  );
  if (result.ok) {
    if (task.excess) {
      const newTaskData = await result.json();
      store.dispatch(
        homepageDataSlice.actions.updateUserTask({
          task: {
            name: task.name,
            id: newTaskData.id,
            importance:
              taskImportanceEnum[
                newTaskData.importance as keyof typeof taskImportanceEnum
              ],
            status: newTaskData.status,
            excess: false,
            state: loadingStateEnum.success,
          },
          index,
        }),
      );
      store.dispatch(
        homepageDataSlice.actions.unshiftUserTask({
          name: '',
          importance: taskImportanceEnum.normal,
          id: '',
          status: "notStarted",
          excess: true,
          state: loadingStateEnum.notStarted,
        }),
      );
    } else {
      store.dispatch(
        homepageDataSlice.actions.updateUserTask({
          task: { ...task, state: loadingStateEnum.success },
          index,
        }),
      );
    }
  } else {
    store.dispatch(
      homepageDataSlice.actions.updateUserTask({
        task: { ...task, state: loadingStateEnum.failed },
        index,
      }),
    );
  }
}

export async function deleteTask(task: taskType) {
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/me/todo/lists/Tasks/tasks/${task.id}`,
    'DELETE',
  );
  if (result.ok) {
    const index = store
      .getState()
      .homepageData.userTasks.findIndex(e => e.id === task.id);
    if (index !== -1) {
      store.dispatch(homepageDataSlice.actions.popUserTask(index));
    }
  }
}
