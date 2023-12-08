import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initalState: boolean = false;

export const silentAuthLoadingSlice = createSlice({
  name: 'silentAuthLoading',
  initialState: initalState,
  reducers: {
    setSilentAuthLoading: (_state, action: PayloadAction<boolean>) => {
      return action.payload;
    },
  },
});

export default silentAuthLoadingSlice.reducer;
