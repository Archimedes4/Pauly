import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initalState: boolean = false;

export const expandedModeSlice = createSlice({
  name: 'expandedMode',
  initialState: initalState,
  reducers: {
    setExpandedMode: (_state, action: PayloadAction<boolean>) => {
      return action.payload;
    },
  },
});

export default expandedModeSlice.reducer;
