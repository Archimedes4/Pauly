import { loadingStateEnum } from './../../types';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initalState: {searchText: string, users: schoolUserType[], usersState: loadingStateEnum, nextLink: string | undefined} = {searchText: "", users: [], usersState: loadingStateEnum.loading, nextLink: undefined}

export const studentSearchSlice = createSlice({
  name: "studentSearch",
  initialState: initalState,
  reducers: {
    setStudentSearch: (state, action: PayloadAction<string>) => {
      state.searchText = action.payload
    },
    setStudentUsers: (state, action: PayloadAction<schoolUserType[]>) => {
      state.users = action.payload
    },
    setUsersState: (state, action: PayloadAction<loadingStateEnum>) => {
      state.usersState = action.payload
    },
    setNextLink: (state, action: PayloadAction<string | undefined>) => {
      state.nextLink = action.payload
    },
  }
})

export default studentSearchSlice.reducer