import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { loadingStateEnum } from '@constants';
import { getValueFromRedux } from '@utils/ultility/utils';
import store from '../store';
import getLeaderboardApi from '@utils/commissions/getLeaderboardApi';

const initalState: {state: loadingStateEnum; leaderboard: leaderboardUserType[]} = {state: loadingStateEnum.notStarted, leaderboard: []}

const getLeaderboardThunk = createAsyncThunk(
  'leaderboard/getLeaderboard',
  async (commissionId: string | undefined, {rejectWithValue}) => {
    const leaderboardResult = await getLeaderboardApi(commissionId)
    if (leaderboardResult.result === loadingStateEnum.success) {
      return leaderboardResult.data
    } else {
      return rejectWithValue(null)
    }
})

export const getLeaderboard = (commissionId?: string | undefined) => getValueFromRedux<leaderboardUserType[]>(getLeaderboardThunk(commissionId), () => {
  if (store.getState().leaderboard.state === loadingStateEnum.success) {
    return store.getState().leaderboard.leaderboard
  }
  return undefined
}, () => {
  return store.getState().leaderboard.state === loadingStateEnum.loading
})

export const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState: initalState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getLeaderboardThunk.pending, (state, payload) => {
      state.state = loadingStateEnum.loading
    }),
    builder.addCase(getLeaderboardThunk.fulfilled, (state, payload) => {
      state.state = loadingStateEnum.success
      state.leaderboard = payload.payload
    }),
    builder.addCase(getLeaderboardThunk.rejected,(state, payload) => {
      state.state = loadingStateEnum.failed
    })
  },
});

export default leaderboardSlice.reducer;
