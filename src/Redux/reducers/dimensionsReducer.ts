import { PayloadAction, createSlice } from '@reduxjs/toolkit';

// xSmall,	 <576px  ->0
// small,    ≥576px  ->1
// medium,   ≥768px  ->2
// large,    ≥992px  ->3
// xLarge    ≥1200px ->4

const initalState: {
  width: number;
  totalWidth: number; // the width of entire screen
  height: number;
  totalHeight: number; // the heigth of the whole screen including not safe area
  currentBreakPoint: number;
  zeroFooterHeight: number;
} = {
  width: 0,
  totalWidth: 0,
  height: 0,
  totalHeight: 0,
  currentBreakPoint: 0,
  zeroFooterHeight: 0,
};

export const dimensionsSlice = createSlice({
  name: 'dimensions',
  initialState: initalState,
  reducers: {
    setDimentionsWidth: (
      state,
      action: PayloadAction<{ width: number; totalWidth: number }>,
    ) => {
      return {
        width: action.payload.width,
        totalWidth: action.payload.totalWidth,
        height: state.height,
        totalHeight: state.totalHeight,
        currentBreakPoint: state.currentBreakPoint,
        zeroFooterHeight: state.zeroFooterHeight,
      };
    },
    setDimentionsWidthCurrentBreakPoint: (
      state,
      action: PayloadAction<{
        width: number;
        totalWidth: number;
        currentBreakPoint: number;
      }>,
    ) => {
      return {
        width: action.payload.width,
        totalWidth: action.payload.totalWidth,
        height: state.height,
        totalHeight: state.totalHeight,
        currentBreakPoint: action.payload.currentBreakPoint,
        zeroFooterHeight: state.zeroFooterHeight,
      };
    },
    setDimentionsHeight: (
      state,
      action: PayloadAction<{ height: number; totalHeight: number }>,
    ) => {
      return {
        width: state.width,
        totalWidth: state.totalWidth,
        height: action.payload.height,
        totalHeight: action.payload.totalHeight,
        currentBreakPoint: state.currentBreakPoint,
        zeroFooterHeight: state.zeroFooterHeight,
      };
    },
    setZeroFooterHeight: (state, action: PayloadAction<number>) => {
      return {
        width: state.width,
        totalWidth: state.totalWidth,
        height: state.height,
        totalHeight: state.totalHeight,
        currentBreakPoint: state.currentBreakPoint,
        zeroFooterHeight: action.payload,
      };
    },
  },
});

export default dimensionsSlice.reducer;
