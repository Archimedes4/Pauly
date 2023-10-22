import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { loadingStateEnum, resourceMode } from '../../types';

type resourceStoreState = {
  resources: resourceDataType[];
  loadingState: loadingStateEnum;
  searchValue: string;
  resourceFollow: resourceFollowType[];
  selectedResourceMode: resourceMode;
};

const initalResourcesState: resourceStoreState = {
  resources: [],
  loadingState: loadingStateEnum.loading,
  searchValue: '',
  resourceFollow: [],
  selectedResourceMode: resourceMode.home,
};

export const resourcesSlice = createSlice({
  name: 'resources',
  initialState: initalResourcesState,
  reducers: {
    setResourceData: (state, action: PayloadAction<resourceDataType[]>) => {
      state.resources = action.payload;
    },
    pushResource: (state, action: PayloadAction<resourceDataType>) => {
      state.resources.push(action.payload);
    },
    setResources: (
      state,
      action: PayloadAction<{
        resources: resourceDataType[];
        loadingState: loadingStateEnum;
      }>,
    ) => {
      state.resources = action.payload.resources;
      state.loadingState = action.payload.loadingState;
    },
    setResourcesState: (state, action: PayloadAction<loadingStateEnum>) => {
      state.loadingState === action.payload;
    },
    setSearchValue: (state, action: PayloadAction<string>) => {
      state.searchValue = action.payload;
    },
    setResourceFollow: (state, action: PayloadAction<resourceFollowType[]>) => {
      state.resourceFollow = action.payload;
    },
    setSelectedResourceMode: (state, action: PayloadAction<resourceMode>) => {
      state.selectedResourceMode = action.payload;
    },
  },
});

export default resourcesSlice.reducer;
