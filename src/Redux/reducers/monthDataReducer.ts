import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initalState: monthDataType[][] = [];

export const monthDataSlice = createSlice({
  name: 'monthData',
  initialState: initalState,
  reducers: {
    setMonthData: (_state, action: PayloadAction<monthDataType[][]>) => {
      return action.payload;
    },
    setEvent: (state, action: PayloadAction<{firstIndex: number, id: string, height: number}>) => {
      let result = state[action.payload.firstIndex]
      for (let index = 0; index < result.length; index += 1) {
        for (let eventIndex = 0; eventIndex < result[index].events.length; eventIndex += 1) {
          if (result[index].events[eventIndex].id == action.payload.id) {
            result[index].events[eventIndex] = {
              ...result[index].events[eventIndex],
              height: action.payload.height
            }
          }
        }
      }
      state[action.payload.firstIndex] = result
    }
  },
});

export default monthDataSlice.reducer;
