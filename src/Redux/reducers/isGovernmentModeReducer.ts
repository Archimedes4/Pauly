import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initalState: boolean = false

export const isGovernmentModeSlice = createSlice({
  name: "isGovernmentMode",
  initialState: initalState,
  reducers: {
    setIsGovernmentMode: (_state, action: PayloadAction<boolean>) => {
      return action.payload
    }
  }
})

export default isGovernmentModeSlice.reducer