import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import {
  loadingStateEnum,
  taskImportanceEnum,
  taskStatusEnum,
} from '../../types';

type homepageStatesType = {
  taskState: loadingStateEnum;
  userState: loadingStateEnum;
  trendingState: loadingStateEnum;
  userData: attachment[];
  trendingData: attachment[];
  userTasks: taskType[];
  schoolDayData: undefined | schoolDayDataType;
  startTime: string;
  isShowingCompleteTasks: boolean;
};

const initalState: homepageStatesType = {
  taskState: loadingStateEnum.loading,
  userState: loadingStateEnum.loading,
  trendingState: loadingStateEnum.loading,
  userData: [],
  trendingData: [],
  userTasks: [
    {
      name: '',
      importance: taskImportanceEnum.normal,
      id: '',
      status: taskStatusEnum.notStarted,
      excess: true,
    },
  ],
  schoolDayData: undefined,
  startTime: '',
  isShowingCompleteTasks: false,
};

export const homepageDataSlice = createSlice({
  name: 'homepage',
  initialState: initalState,
  reducers: {
    setTaskState: (state, action: PayloadAction<loadingStateEnum>) => {
      return { ...state, taskState: action.payload };
    },
    setUserState: (state, action: PayloadAction<loadingStateEnum>) => {
      return { ...state, userState: action.payload };
    },
    setTrendingState: (state, action: PayloadAction<loadingStateEnum>) => {
      return { ...state, trendingState: action.payload };
    },
    setUserData: (state, action: PayloadAction<attachment[]>) => {
      return { ...state, userData: action.payload };
    },
    setTrendingData: (state, action: PayloadAction<attachment[]>) => {
      return { ...state, trendingData: action.payload };
    },
    setUserTasks: (state, action: PayloadAction<taskType[]>) => {
      return { ...state, userTasks: action.payload };
    },
    updateUserTask: (
      state,
      action: PayloadAction<{ task: taskType; index: number }>,
    ) => {
      if (action.payload.index < state.userTasks.length) {
        state.userTasks[action.payload.index] = action.payload.task;
      } else {
        return state;
      }
    },
    unshiftUserTask: (state, action: PayloadAction<taskType>) => {
      state.userTasks.unshift(action.payload);
    },
    popUserTask: (state, action: PayloadAction<number>) => {
      state.userTasks.splice(action.payload, 1);
    },
    setSchoolDayData: (state, action: PayloadAction<schoolDayDataType>) => {
      return { ...state, schoolDayData: action.payload };
    },
    setStartTime: (state, action: PayloadAction<string>) => {
      return { ...state, startTime: action.payload };
    },
    setIsShowingCompletedTasks: (state, action: PayloadAction<boolean>) => {
      return { ...state, isShowingCompleteTasks: action.payload };
    },
  },
});

export default homepageDataSlice.reducer;
