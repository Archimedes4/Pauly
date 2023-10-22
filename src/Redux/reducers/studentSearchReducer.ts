import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { loadingStateEnum } from '../../types';

const initalState: {
  searchText: string;
  users: schoolUserType[];
  usersState: loadingStateEnum;
  nextLink: string | undefined;
} = {
  searchText: '',
  users: [],
  usersState: loadingStateEnum.loading,
  nextLink: undefined,
};

export const studentSearchSlice = createSlice({
  name: 'studentSearch',
  initialState: initalState,
  reducers: {
    setStudentSearch: (state, action: PayloadAction<string>) => {
      state.searchText = action.payload;
    },
    setStudentUsers: (state, action: PayloadAction<schoolUserType[]>) => {
      state.users = action.payload;
    },
    setUsersState: (state, action: PayloadAction<loadingStateEnum>) => {
      state.usersState = action.payload;
    },
    setNextLink: (state, action: PayloadAction<string | undefined>) => {
      state.nextLink = action.payload;
    },
    setStudentUserByIndex: (
      state,
      action: PayloadAction<{ index: number; user: schoolUserType }>,
    ) => {
      if (action.payload.index < state.users.length) {
        state.users[action.payload.index] = action.payload.user;
      }
    },
    setStudentUserById: (
      state,
      action: PayloadAction<{ id: string; user: schoolUserType }>,
    ) => {
      const findIndex = state.users.findIndex(e => {
        return e.id === action.payload.id;
      });
      if (findIndex !== -1) {
        state.users[findIndex] = action.payload.user;
      }
    },
  },
});

export default studentSearchSlice.reducer;
