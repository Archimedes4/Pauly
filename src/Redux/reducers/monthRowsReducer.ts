import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initalState: {
  rowOne: number;
  rowTwo: number;
  rowThree: number;
  rowFour: number;
  rowFive: number;
  rowSix: number;
  rowSeven: number;
  rowEight: number;
} = {
  rowOne: 0,
  rowTwo: 0,
  rowThree: 0,
  rowFour: 0,
  rowFive: 0,
  rowSix: 0,
  rowSeven: 0,
  rowEight: 0
}

export const monthRowsSlice = createSlice({
  name: 'monthRows',
  initialState: initalState,
  reducers: {
    setRow: (state, action: PayloadAction<{
      row: number, // row one is zero
      height: number
    }>) => {
      if (action.payload.row === 0) {
        state.rowOne = action.payload.height
      } else if (action.payload.row === 1) {
        state.rowTwo = action.payload.height
      } else if (action.payload.row === 2) {
        state.rowThree = action.payload.height
      } else if (action.payload.row === 3) {
        state.rowFour = action.payload.height
      } else if (action.payload.row === 4) {
        state.rowFive = action.payload.height
      } else if (action.payload.row === 5) {
        state.rowSix = action.payload.height
      } else if (action.payload.row === 6) {
        state.rowSeven = action.payload.height
      } else if (action.payload.row === 7) {
        state.rowEight = action.payload.height
      }
      // row doesn't exist ignoring it
    },  
  },
});

export default monthRowsSlice.reducer;
