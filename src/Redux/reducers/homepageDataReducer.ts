import { loadingStateEnum, taskImportanceEnum, taskStatusEnum } from './../../types';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

type homepageStatesType = {
  taskState: loadingStateEnum
  userState: loadingStateEnum
  trendingState: loadingStateEnum
  userData: resourceType[]
  trendingData: resourceType[]
  userTasks: taskType[]
  schoolDayData: undefined | schoolDayDataType
}

const initalState: homepageStatesType = {
  taskState: loadingStateEnum.loading,
  userState: loadingStateEnum.loading,
  trendingState: loadingStateEnum.loading,
  userData: [],
  trendingData: [],
  userTasks: [{
    name: "",
    importance: taskImportanceEnum.normal,
    id: "",
    status: taskStatusEnum.notStarted,
    excess: true
  }],
  schoolDayData: undefined,
}

export const homepageDataSlice = createSlice({
  name: "homepage",
  initialState: initalState,
  reducers: {
    setTaskState: (state, action: PayloadAction<loadingStateEnum>) => {
      return {...state, taskState: action.payload}
    },
    setUserState: (state, action: PayloadAction<loadingStateEnum>) => {
      return {...state, userState: action.payload}
    },
    setTrendingState: (state, action: PayloadAction<loadingStateEnum>) => {
      return {...state, trendingState: action.payload}
    },
    setUserData: (state, action: PayloadAction<resourceType[]>) => {
      return {...state, userData: action.payload}
    },
    setTrendingData: (state, action: PayloadAction<resourceType[]>) => {
      return {...state, trendingData: action.payload}
    },
    setUserTasks: (state, action: PayloadAction<taskType[]>) => {
      return {...state, userTasks: action.payload}
    },
    updateUserTask: (state, action: PayloadAction<{task: taskType, index: number}>) => {
      if (action.payload.index <  state.userTasks.length) {
        state.userTasks[action.payload.index] = action.payload.task
      } else {
        return state
      }
    },
    unshiftUserTask: (state, action: PayloadAction<taskType>) => {
      state.userTasks.unshift(action.payload)
    },
    popUserTask: (state, action: PayloadAction<number>) => {
      state.userTasks.splice(action.payload, 1)
    },
    setSchoolDayData: (state, action: PayloadAction<schoolDayDataType>) => {
      return {...state, schoolDayData: action.payload}
    }
  }
})

export default homepageDataSlice.reducer