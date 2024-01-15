import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initalState: boolean = true;

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
