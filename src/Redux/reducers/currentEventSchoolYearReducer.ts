import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initalCalendarState: string[] = [];

export const currentEventsSchoolYearSlice = createSlice({
  name: 'currentEventsSchoolYear',
  initialState: initalCalendarState,
  reducers: {
    setCurrentEventsSchoolYear: (_state, action: PayloadAction<string[]>) => {
      return [...action.payload];
    },
  },
});

export default currentEventsSchoolYearSlice.reducer;
