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
      return { ...state, resources: action.payload };
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
      return {
        ...state,
        loadingState: action.payload.loadingState,
        resources: action.payload.resources,
      };
    },
    setResourcesState: (state, action: PayloadAction<loadingStateEnum>) => {
      return { ...state, loadingState: action.payload };
    },
    setSearchValue: (state, action: PayloadAction<string>) => {
      return { ...state, searchValue: action.payload };
    },
    setResourceFollow: (state, action: PayloadAction<resourceFollowType[]>) => {
      return { ...state, resourceFollow: action.payload };
    },
    setSelectedResourceMode: (state, action: PayloadAction<resourceMode>) => {
      return { ...state, selectedResourceMode: action.payload };
    },
  },
});

export default resourcesSlice.reducer;
