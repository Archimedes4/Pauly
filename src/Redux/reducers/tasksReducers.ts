import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initalStateTaskDeltaLink: string = '';

export const taskDeltaSlice = createSlice({
  name: 'taskDeltaLink',
  initialState: initalStateTaskDeltaLink,
  reducers: {
    setTaskDeltaLink: (_state, action: PayloadAction<string>) => {
      return action.payload;
    },
  },
});

export const tasksDeltaReducer = taskDeltaSlice.reducer;