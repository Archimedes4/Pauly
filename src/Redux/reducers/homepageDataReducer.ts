import { loadingStateEnum } from './../../types';
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
  userTasks: [],
  schoolDayData: undefined
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
    setSchoolDayData: (state, action: PayloadAction<schoolDayDataType>) => {
      return {...state, schoolDayData: action.payload}
    }
  }
})

export default homepageDataSlice.reducer