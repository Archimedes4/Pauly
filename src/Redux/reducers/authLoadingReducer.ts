import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initalState: boolean = false;

export const authLoadingSlice = createSlice({
  name: 'authLoading',
  initialState: initalState,
  reducers: {
    setAuthLoading: (_state, action: PayloadAction<boolean>) => {
      return action.payload;
    },
  },
});

export default authLoadingSlice.reducer;
