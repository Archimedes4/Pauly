import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Colors } from '../../types';

const initalState: {top: string, bottom: string} = {top: Colors.maroon, bottom: Colors.maroon}

export const safeAreaColorsSlice = createSlice({
  name: "safeAreaColors",
  initialState: initalState,
  reducers: {
    setSafeAreaColors: (_state, action: PayloadAction<{top: string, bottom: string}>) => {
      return action.payload
    },
    setSafeAreaColorTop: (state, action: PayloadAction<string>) => {
      return {...state, top: action.payload}
    },
    setSafeAreaColorBottom: (state, action: PayloadAction<string>) => {
      return {...state, bottom: action.payload}
    }
  }
})

export default safeAreaColorsSlice.reducer