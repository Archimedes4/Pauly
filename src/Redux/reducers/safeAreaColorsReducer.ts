import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Colors } from '../../types';

const initalState: safeAreaType = {
  top: Colors.maroon,
  bottom: Colors.maroon,
  isTopTransparent: false,
  isBottomTransparent: false
};

export const safeAreaColorsSlice = createSlice({
  name: 'safeAreaColors',
  initialState: initalState,
  reducers: {
    setSafeAreaColors: (
      state,
      action: PayloadAction<{ top: string; bottom: string }>,
    ) => {
      return {
        isTopTransparent: state.isTopTransparent,
        isBottomTransparent: state.isBottomTransparent,
        top: action.payload.top,
        bottom: action.payload.bottom
      }
    },
    setSafeAreaColorTop: (state, action: PayloadAction<string>) => {
      return { ...state, top: action.payload };
    },
    setSafeAreaColorBottom: (state, action: PayloadAction<string>) => {
      return { ...state, bottom: action.payload };
    },
    setSafeArea: (_state, action: PayloadAction<safeAreaType>) => {
      return action.payload
    }
  },
});

export default safeAreaColorsSlice.reducer;
