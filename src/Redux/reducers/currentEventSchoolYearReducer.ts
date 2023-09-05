import { createSlice } from '@reduxjs/toolkit';

const initalCalendarState: string[] = []

export const currentEventsSchoolYearSlice = createSlice({
  name: "currentEventsSchoolYear",
  initialState: initalCalendarState,
  reducers: {
    setCurrentEventsSchoolYear: (state, action) => {
      return [...action.payload]
    }
  }
})

export default currentEventsSchoolYearSlice.reducer