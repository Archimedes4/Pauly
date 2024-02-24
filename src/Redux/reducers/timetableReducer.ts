import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { loadingStateEnum } from '@constants';
import { getTimetableApi } from '@src/utils/calendar/calendarFunctionsGraph';
import { getValueFromRedux } from '@src/utils/ultility/utils';
import store from '../store';

const initalState: {timetables: timetableType[], timetablesFetching: string[]} = {
  timetables: [], //cache timetables
  timetablesFetching: [] // timetables that the api is currently fetching
}

const getTimetableThunk = createAsyncThunk(
  'timetables/getTimetable',
  async (timetableId: string, {rejectWithValue}) => {
    const timetableResult = await getTimetableApi(timetableId)
    if (timetableResult.result === loadingStateEnum.success) {
      return timetableResult.timetable
    } else {
      return rejectWithValue(null)
    }
})

export const getTimetable = (timetableId: string) => getValueFromRedux<timetableType>(getTimetableThunk(timetableId), () => {
  return store.getState().timetables.timetables.find((e) => {return e.id === timetableId})
}, () => {
  return store.getState().timetables.timetablesFetching.includes(timetableId)
})

export const timetableSlice = createSlice({
  name: 'timetables',
  initialState: initalState,
  reducers: {
    addTimetable: (state, action: PayloadAction<timetableType>) => {
      state.timetables.push(action.payload)
    }
  },
  extraReducers: (builder) => {
    builder.addCase(getTimetableThunk.pending, (state, payload) => {
      state.timetablesFetching.push(payload.meta.arg)
    }),
    builder.addCase(getTimetableThunk.fulfilled, (state, payload) => {
      state.timetables.push(payload.payload)
      state.timetablesFetching = state.timetablesFetching.filter((e) => {e !== payload.meta.arg})
    }),
    builder.addCase(getTimetableThunk.rejected,(state, payload) => {
      state.timetablesFetching = state.timetablesFetching.filter((e) => {e !== payload.meta.arg})
    })
  },
});

export default timetableSlice.reducer;
