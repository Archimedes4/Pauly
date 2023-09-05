import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initalCalendarState: string[] = []

export const currentEventsSlice = createSlice({
  name: "currentEvents",
  initialState: initalCalendarState,
  reducers: {
    setCurrentEvents: (state, action) => {
      return [...action.payload]
    },
    pushEvent: (state, action: PayloadAction<string>) => {
      return [...state, action.payload]
    }
  }
})


export default currentEventsSlice.reducer