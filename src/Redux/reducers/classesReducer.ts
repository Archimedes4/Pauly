import { createSlice } from '@reduxjs/toolkit';

const initalState: string[] = [];

export const classesSlice = createSlice({
  name: 'classes',
  initialState: initalState,
  reducers: {
    setClasses: (state, action) => {
      return action.payload;
    },
  },
});

export default classesSlice.reducer;
