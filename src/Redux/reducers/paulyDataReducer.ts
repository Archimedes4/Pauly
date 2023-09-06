import { createSlice } from '@reduxjs/toolkit';

const initalState: {message: string, animationSpeed: number, powerpointBlob: string} = {message: "", animationSpeed: 0, powerpointBlob: ""}

export const paulyDataSlice = createSlice({
  name: "paulyData",
  initialState: initalState,
  reducers: {
    setPaulyData: (state, action) => {
      return action.payload
    }
  }
})

export default paulyDataSlice.reducer