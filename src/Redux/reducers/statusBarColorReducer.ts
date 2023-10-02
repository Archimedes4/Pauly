import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initalState: string = "#793033"

export const statusBarColorSlice = createSlice({
  name: "statusBarColor",
  initialState: initalState,
  reducers: {
    setStatusBarColor: (_state, action: PayloadAction<string>) => {
      return action.payload
    }
  }
})

export default statusBarColorSlice.reducer