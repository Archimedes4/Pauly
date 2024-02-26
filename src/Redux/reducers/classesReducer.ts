import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { loadingStateEnum } from '@constants';
import getClassesApi from '@utils/getClassesApi';

const initalState: {
  classes: classType[],
  lastCalled: string,
  loadingState: loadingStateEnum
} = {
  classes: [],
  lastCalled: "",
  loadingState: loadingStateEnum.notStarted
}

export const getClasses = createAsyncThunk(
  'classes/getClasses',
  async (_thunkAPI, {rejectWithValue, getState}) => {
    const classResult = await getClassesApi()
    if (classResult.result === loadingStateEnum.success) {
      return classResult.data
    } else {
      return rejectWithValue(null)
    }
})

export const classesSlice = createSlice({
  name: 'classes',
  initialState: initalState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getClasses.pending, (state) => {
      state.loadingState = loadingStateEnum.loading
    }),
    builder.addCase(getClasses.fulfilled, (state, payload) => {
      state.loadingState = loadingStateEnum.success
      state.classes = payload.payload
      state.lastCalled = new Date().toISOString()
    }),
    builder.addCase(getClasses.rejected,(state) => {
      state.loadingState = loadingStateEnum.failed
    })
  },
});

export default classesSlice.reducer;
