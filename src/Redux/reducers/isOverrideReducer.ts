import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initalState: boolean = false;

export const isOverrideSlice = createSlice({
  name: 'isOverride',
  initialState: initalState,
  reducers: {
    setIsOverride: (_state, action: PayloadAction<boolean>) => {
      return action.payload;
    },
  },
});

export default isOverrideSlice.reducer;
