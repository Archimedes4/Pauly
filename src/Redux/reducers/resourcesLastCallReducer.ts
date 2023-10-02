import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initalState: string = ""

export const resourcesLastCalled = createSlice({
  name: "resourcesLastCalled",
  initialState: initalState,
  reducers: {
    setResourcesLastCalled: (_state, action: PayloadAction<string>) => {
      return action.payload
    }
  }
})

export default resourcesLastCalled.reducer