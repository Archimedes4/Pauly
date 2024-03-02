import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { loadingStateEnum } from '@constants';
import { getValueFromRedux } from '@utils/ultility/utils';
import { getTimetableApi } from '@src/utils/calendar/calendarFunctionsGraphNoStore';
import { StoreType } from '../store';

const initalState: {
  timetables: timetableType[];
  timetablesFetching: string[];
} = {
  timetables: [], // cache timetables
  timetablesFetching: [], // timetables that the api is currently fetching
};

const getTimetableThunk = createAsyncThunk(
  'timetables/getTimetable',
  async (
    input: {
      timetableId: string;
      store: StoreType;
    },
    { rejectWithValue },
  ) => {
    const timetableResult = await getTimetableApi(
      input.timetableId,
      input.store,
    );
    if (timetableResult.result === loadingStateEnum.success) {
      return timetableResult.timetable;
    }
    return rejectWithValue(null);
  },
);

export const getTimetable = (timetableId: string, store: StoreType) =>
  getValueFromRedux<timetableType>(
    getTimetableThunk({
      timetableId,
      store,
    }),
    store => {
      return store.timetables.timetables.find(e => {
        return e.id === timetableId;
      });
    },
    store => {
      return store.timetables.timetablesFetching.includes(timetableId);
    },
    store,
  );

export const timetableSlice = createSlice({
  name: 'timetables',
  initialState: initalState,
  reducers: {
    addTimetable: (state, action: PayloadAction<timetableType>) => {
      state.timetables.push(action.payload);
    },
  },
  extraReducers: builder => {
    builder.addCase(getTimetableThunk.pending, (state, payload) => {
      state.timetablesFetching.push(payload.meta.arg.timetableId);
    }),
      builder.addCase(getTimetableThunk.fulfilled, (state, payload) => {
        state.timetables.push(payload.payload);
        state.timetablesFetching = state.timetablesFetching.filter(e => {
          e !== payload.meta.arg.timetableId;
        });
      }),
      builder.addCase(getTimetableThunk.rejected, (state, payload) => {
        state.timetablesFetching = state.timetablesFetching.filter(e => {
          e !== payload.meta.arg.timetableId;
        });
      });
  },
});

export default timetableSlice.reducer;
