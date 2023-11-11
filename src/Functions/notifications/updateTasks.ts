import { ListRenderItemInfo } from 'react-native';
import { homepageDataSlice } from '../../Redux/reducers/homepageDataReducer';
import store from '../../Redux/store';
import {
  loadingStateEnum,
  taskImportanceEnum,
  taskStatusEnum,
} from '../../types';
import callMsGraph from '../ultility/microsoftAssets';

export async function updateTaskStatus(
  status: taskStatusEnum,
  task: ListRenderItemInfo<taskType>,
) {
  store.dispatch(
    homepageDataSlice.actions.updateUserTask({
      index: task.index,
      task: { ...task.item, state: loadingStateEnum.loading },
    }),
  );
  const data = {
    status: taskStatusEnum[status],
  };
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/me/todo/lists/Tasks/tasks/${task.item.id}`,
    'PATCH',
    JSON.stringify(data),
  );
  if (result.ok) {
    store.dispatch(
      homepageDataSlice.actions.updateUserTask({
        index: task.index,
        task: { ...task.item, state: loadingStateEnum.success, status },
      }),
    );
  } else {
    store.dispatch(
      homepageDataSlice.actions.updateUserTask({
        index: task.index,
        task: { ...task.item, state: loadingStateEnum.failed },
      }),
    );
  }
}

export async function updateTaskText(task: ListRenderItemInfo<taskType>) {
  store.dispatch(
    homepageDataSlice.actions.updateUserTask({
      index: task.index,
      task: { ...task.item, state: loadingStateEnum.loading },
    }),
  );
  const data = {
    title: task.item.name,
  };
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/me/todo/lists/Tasks/tasks/${task.item.id}`,
    task.item.excess ? 'POST' : 'PATCH',
    JSON.stringify(data),
  );
  if (result.ok) {
    if (task.item.excess) {
      const newTaskData = await result.json();
      store.dispatch(
        homepageDataSlice.actions.updateUserTask({
          task: {
            name: task.item.name,
            id: newTaskData.id,
            importance:
              taskImportanceEnum[
                newTaskData.importance as keyof typeof taskImportanceEnum
              ],
            status:
              taskStatusEnum[newTaskData.status as keyof typeof taskStatusEnum],
            excess: false,
            state: loadingStateEnum.success,
          },
          index: task.index,
        }),
      );
      store.dispatch(
        homepageDataSlice.actions.unshiftUserTask({
          name: '',
          importance: taskImportanceEnum.normal,
          id: '',
          status: taskStatusEnum.notStarted,
          excess: true,
          state: loadingStateEnum.notStarted,
        }),
      );
    } else {
      store.dispatch(
        homepageDataSlice.actions.updateUserTask({
          task: { ...task.item, state: loadingStateEnum.success },
          index: task.index,
        }),
      );
    }
  } else {
    store.dispatch(
      homepageDataSlice.actions.updateUserTask({
        task: { ...task.item, state: loadingStateEnum.failed },
        index: task.index,
      }),
    );
  }
}

export async function deleteTask(task: ListRenderItemInfo<taskType>) {
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/me/todo/lists/Tasks/tasks/${task.item.id}`,
    'DELETE',
  );
  if (result.ok) {
    const index = store
      .getState()
      .homepageData.userTasks.findIndex(e => e.id === task.item.id);
    if (index !== -1) {
      store.dispatch(homepageDataSlice.actions.popUserTask(index));
    }
  }
}
