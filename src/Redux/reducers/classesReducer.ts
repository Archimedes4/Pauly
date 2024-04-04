import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { loadingStateEnum } from '@constants';
import getClassesApi from '@utils/getClassesApi';
import { getValueFromRedux } from '@utils/ultility/utils';
import { StoreType } from '../store';

const initalState: {
  classes: classType[];
  lastCalled: string;
  loadingState: loadingStateEnum;
} = {
  classes: [],
  lastCalled: '',
  loadingState: loadingStateEnum.notStarted,
};

const getClassesThunk = createAsyncThunk(
  'classes/getClasses',
  async (store: StoreType, { rejectWithValue }) => {
    const classResult = await getClassesApi(store);
    if (classResult.result === loadingStateEnum.success) {
      return classResult.data;
    }
    return rejectWithValue(null);
  },
);

export const getClasses = (store: StoreType) =>
  getValueFromRedux<classType[]>(
    getClassesThunk(store),
    store => {
      // Check if the last called was over an hour ago or the current classes don't have a succesful state.
      if (
        new Date(store.classes.lastCalled).getTime() - new Date().getTime() >=
          3600000 ||
        store.classes.loadingState !== loadingStateEnum.success
      ) {
        return undefined;
      }
      return store.classes.classes;
    },
    store => {
      return store.classes.loadingState === loadingStateEnum.loading;
    },
    store,
  );

export const classesSlice = createSlice({
  name: 'classes',
  initialState: initalState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getClassesThunk.pending, state => {
      state.loadingState = loadingStateEnum.loading;
    }),
      builder.addCase(getClassesThunk.fulfilled, (state, payload) => {
        state.loadingState = loadingStateEnum.success;
        state.classes = payload.payload;
        state.lastCalled = new Date().toISOString();
      }),
      builder.addCase(getClassesThunk.rejected, state => {
        state.loadingState = loadingStateEnum.failed;
      });
  },
});

export default classesSlice.reducer;
