import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initalState: string = '';

export const lastCalledSelectedDateSlice = createSlice({
  name: 'lastCalledSelectedDate',
  initialState: initalState,
  reducers: {
    setLastCalledSelectedDate: (_state, action: PayloadAction<string>) => {
      return action.payload;
    },
  },
});

export default lastCalledSelectedDateSlice.reducer;
