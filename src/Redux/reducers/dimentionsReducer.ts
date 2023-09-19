import { PayloadAction, createSlice } from '@reduxjs/toolkit';

// xSmall,	 <576px  ->0
// small,    ≥576px  ->1
// medium,   ≥768px  ->2
// large,    ≥992px  ->3
// xLarge    ≥1200px ->4

const initalState: {width: number, height: number, currentBreakPoint: number} = {width: 0, height: 0, currentBreakPoint: 0}

export const dimentionsSlice = createSlice({
  name: "dimentions",
  initialState: initalState,
  reducers: {
    setDimentionsWidth: (state, action: PayloadAction<number>) => {
      return {width: action.payload, height: state.height, currentBreakPoint: state.currentBreakPoint}
    },
    setDimentionsWidthCurrentBreakPoint: (state, action: PayloadAction<{width: number, currentBreakPoint: number}>) => {
      return {width: action.payload.width, height: state.height, currentBreakPoint: action.payload.currentBreakPoint}
    },
    setDimentionsHeight: (state, action: PayloadAction<number>) => {
      return {width: state.width, height: action.payload, currentBreakPoint: state.currentBreakPoint}
    }
  }
})

export default dimentionsSlice.reducer