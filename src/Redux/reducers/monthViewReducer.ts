import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initalState: eventType[] = []

export const monthViewSlice = createSlice({
  name: "monthView",
  initialState: initalState,
  reducers: {
    setMonthViewData: (_state, action: PayloadAction<eventType[]>) => {
      return action.payload
    }
  }
})

export default monthViewSlice.reducer