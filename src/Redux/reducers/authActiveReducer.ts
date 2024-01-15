
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initalState: boolean = false;

export const authActiveSlice = createSlice({
  name: 'authActive',
  initialState: initalState,
  reducers: {
    setAuthActive: (_state, action: PayloadAction<boolean>) => {
      return action.payload;
    },
  },
});

export default authActiveSlice.reducer;
