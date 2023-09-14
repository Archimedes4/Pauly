import { createSlice } from '@reduxjs/toolkit';

const initalState: number = 0

export const authenticationCallSlice = createSlice({
  name: "authenticationCall",
  initialState: initalState,
  reducers: {
    setAuthenticationCallIncrement: (state) => {
      return state + 1
    }
  }
})

export default authenticationCallSlice.reducer