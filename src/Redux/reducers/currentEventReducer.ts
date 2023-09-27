import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initalCalendarState: eventType[] = []

export const currentEventsSlice = createSlice({
  name: "currentEvents",
  initialState: initalCalendarState,
  reducers: {
    setCurrentEvents: (state, action) => {
      return [...action.payload]
    },
    pushEvent: (state, action: PayloadAction<eventType>) => {
      return [...state, action.payload]
    }
  }
})


export default currentEventsSlice.reducer