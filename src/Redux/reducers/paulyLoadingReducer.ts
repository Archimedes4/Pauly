import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initalState: boolean = true;

export const paulyLoadingSlice = createSlice({
  name: 'paulyLoading',
  initialState: initalState,
  reducers: {
    setPaulyLoading: (_state, action: PayloadAction<boolean>) => {
      return action.payload;
    },
  },
});

export default paulyLoadingSlice.reducer;
