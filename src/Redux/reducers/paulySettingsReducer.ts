import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { calendarViewingMode, loadingStateEnum } from '@constants';
import { getValueFromRedux } from '@utils/ultility/utils';
import { StoreType } from '../store';
import { getPaulySettingsApi } from '@utils/calendar/paulySettingsFunctions';

const initalState: paulySettingsType & { loadingState: loadingStateEnum } = {
  calendarViewingMode: calendarViewingMode.collapsedRemoved,
  loadingState: loadingStateEnum.notStarted
};

const getPaulySettingsThunk = createAsyncThunk(
  'paulySettings/getSettings',
  async (store: StoreType, { rejectWithValue }) => {
    const settingsResult = await getPaulySettingsApi(store);
    if (settingsResult.result === loadingStateEnum.success) {
      return settingsResult.data;
    }
    return rejectWithValue(null);
  },
);

export const getPaulySettings = (store: StoreType) =>
  getValueFromRedux<paulySettingsType>(
    getPaulySettingsThunk(store),
    store => {
      if (store.paulySettings.loadingState === loadingStateEnum.success) {
        return store.paulySettings;
      }
      return undefined;
    },
    store => {
      return store.paulySettings.loadingState === loadingStateEnum.loading;
    },
    store,
  );

export const getCalendarViewingMode = (store: StoreType) =>
  getValueFromRedux<calendarViewingMode>(
    getPaulySettingsThunk(store),
    store => {
      if (store.paulySettings.loadingState === loadingStateEnum.success) {
        return store.paulySettings.calendarViewingMode;
      }
      return undefined;
    },
    store => {
      return store.paulySettings.loadingState === loadingStateEnum.loading;
    },
    store,
  );

export const paulySettingsSlice = createSlice({
  name: 'paulySettings',
  initialState: initalState,
  reducers: {
    setPaulySettings: (state, action: PayloadAction<paulySettingsType>) => {
      return {...action.payload, loadingState: state.loadingState}
    },
    setCalendarViewMode: (state, action: PayloadAction<calendarViewingMode>) => {
      return {
        ...state,
        calendarViewingMode: action.payload
      }
    }

  },
  extraReducers: builder => {
    builder.addCase(getPaulySettingsThunk.pending, state => {
      state.loadingState = loadingStateEnum.loading;
    }),
    builder.addCase(getPaulySettingsThunk.fulfilled, (state, payload) => {
      console.log('Success', payload.payload)
      return {
        ...payload.payload,
        loadingState: loadingStateEnum.success
      }
    }),
    builder.addCase(getPaulySettingsThunk.rejected, state => {
      state.loadingState = loadingStateEnum.failed;
    });
  },
});

export default paulySettingsSlice.reducer;
