import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { loadingStateEnum } from '@constants';
import { getValueFromRedux } from '@utils/ultility/utils';
import getLeaderboardApi from '@utils/commissions/getLeaderboardApi';
import { StoreType } from '../store';

const initalState: {
  state: loadingStateEnum;
  leaderboard: leaderboardUserType[];
} = { state: loadingStateEnum.notStarted, leaderboard: [] };

const getLeaderboardThunk = createAsyncThunk(
  'leaderboard/getLeaderboard',
  async (
    input: { commissionId: string | undefined; store: StoreType },
    { rejectWithValue },
  ) => {
    const leaderboardResult = await getLeaderboardApi(
      input.store,
      input.commissionId,
    );
    if (leaderboardResult.result === loadingStateEnum.success) {
      return leaderboardResult.data;
    }
    return rejectWithValue(null);
  },
);

export const getLeaderboard = (
  store: StoreType,
  commissionId?: string | undefined,
) =>
  getValueFromRedux<leaderboardUserType[]>(
    getLeaderboardThunk({
      commissionId,
      store,
    }),
    store => {
      if (store.leaderboard.state === loadingStateEnum.success) {
        return store.leaderboard.leaderboard;
      }
      return undefined;
    },
    store => {
      return store.leaderboard.state === loadingStateEnum.loading;
    },
    store,
  );

export const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState: initalState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getLeaderboardThunk.pending, state => {
      state.state = loadingStateEnum.loading;
    }),
      builder.addCase(getLeaderboardThunk.fulfilled, (state, payload) => {
        state.state = loadingStateEnum.success;
        state.leaderboard = payload.payload;
      }),
      builder.addCase(getLeaderboardThunk.rejected, state => {
        state.state = loadingStateEnum.failed;
      });
  },
});

export default leaderboardSlice.reducer;
