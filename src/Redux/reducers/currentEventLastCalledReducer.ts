import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initalState: string = ""

export const currentEventsLastCalled = createSlice({
  name: "currentEventsLastCalled",
  initialState: initalState,
  reducers: {
    setCurrentEventsLastCalled: (_state, action: PayloadAction<string>) => {
      return action.payload
    }
  }
})

export default currentEventsLastCalled.reducer