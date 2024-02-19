import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initalState: monthDataType[][] = [];

export const monthDataSlice = createSlice({
  name: 'monthData',
  initialState: initalState,
  reducers: {
    setMonthData: (_state, action: PayloadAction<monthDataType[][]>) => {
      return action.payload;
    },
  },
});

export default monthDataSlice.reducer;
