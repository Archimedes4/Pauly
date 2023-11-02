import { createSlice } from '@reduxjs/toolkit';

const initalState: string = new Date().toISOString();

export const selectedDateSlice = createSlice({
  name: 'selectedDate',
  initialState: initalState,
  reducers: {
    setSelectedDate: (_state, action) => {
      return action.payload;
    },
  },
});

export default selectedDateSlice.reducer;
