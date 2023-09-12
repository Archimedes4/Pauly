import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initalResourcesState: string[] = []

export const resourcesSlice = createSlice({
  name: "resources",
  initialState: initalResourcesState,
  reducers: {
    setResources: (state, action: PayloadAction<string[]>) => {
      return [...action.payload]
    },
    pushResource: (state, action: PayloadAction<string>) => {
      return [...state, action.payload]
    }
  }
})


export default resourcesSlice.reducer