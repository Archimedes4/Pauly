import { loadingStateEnum } from './../../types';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
const initalResourcesState: {resources: resourceDataType[], loadingState: loadingStateEnum} = {resources: [], loadingState: loadingStateEnum.loading}

export const resourcesSlice = createSlice({
  name: "resources",
  initialState: initalResourcesState,
  reducers: {
    setResourceData: (state, action: PayloadAction<resourceDataType[]>) => {
      return {resources: [...action.payload], loadingState: state.loadingState}
    },
    pushResource: (state, action: PayloadAction<resourceDataType>) => {
      return {resources: [...state.resources, action.payload], loadingState: state.loadingState}
    },
    setResources: (_state, action: PayloadAction<{resources: resourceDataType[], loadingState: loadingStateEnum}>) => {
      return action.payload
    },
    setResourcesState: (state, action: PayloadAction<loadingStateEnum>) => {
      return {resources: state.resources, loadingState: action.payload}
    }
  }
})


export default resourcesSlice.reducer