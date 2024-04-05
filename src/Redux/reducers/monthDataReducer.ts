import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initalState: monthRowType[] = [];

export const monthDataSlice = createSlice({
  name: 'monthData',
  initialState: initalState,
  reducers: {
    setMonthData: (_state, action: PayloadAction<monthRowType[]>) => {
      return action.payload;
    },
    setEventHeight: (
      state,
      action: PayloadAction<{
        rowIndex: number;
        eventIndex: number;
        height: number;
      }>,
    ) => {
      const oldEvent =
        state[action.payload.rowIndex].events[action.payload.eventIndex];
      state[action.payload.rowIndex].events[action.payload.eventIndex] = {
        ...oldEvent,
        height: action.payload.height,
      };
    },
    // 0 is the first row
    setRowHeight: (
      state,
      action: PayloadAction<{ rowIndex: number; height: number }>,
    ) => {
      state[action.payload.rowIndex].height = action.payload.height;
    },
  },
});

export default monthDataSlice.reducer;
