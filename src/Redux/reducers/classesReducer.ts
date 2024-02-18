import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initalState: {
  classes: classType[],
  lastCalled: string,
} = {
  classes: [],
  lastCalled: ""
}

export const classesSlice = createSlice({
  name: 'classes',
  initialState: initalState,
  reducers: {
    setClasses: (state, action: PayloadAction<{
      classes: classType[],
      lastCalled: string,
    }>) => {
      return action.payload;
    },
  },
});

export default classesSlice.reducer;
