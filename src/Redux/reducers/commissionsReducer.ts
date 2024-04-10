import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { loadingStateEnum } from '@constants';
import getCommissionsApi from '@utils/commissions/getCommissionsApi';
import { getValueFromRedux } from '@utils/ultility/utils';
import getCommissionApi from '@utils/commissions/getCommissionApi';
import { StoreType } from '../store';
import getPointsApi from '@src/utils/commissions/getPointsApi';

type commissionsStateType = {
  commissionsState: loadingStateEnum;
  pointsState: loadingStateEnum;
  points: number;
  currentCommissions: commissionType[];
  selectedCommission: string;
  commissionNextLink: string | undefined;
};

const initalState: commissionsStateType = {
  commissionsState: loadingStateEnum.notStarted,
  pointsState: loadingStateEnum.notStarted,
  points: 0,
  currentCommissions: [],
  selectedCommission: '',
  commissionNextLink: undefined,
};

const getCommissionsThunk = createAsyncThunk(
  'commissions/getCommissions',
  async (params: commissionApiParams, { rejectWithValue }) => {
    const commissionsResult = await getCommissionsApi(params);
    if (commissionsResult.result === loadingStateEnum.success) {
      return {
        data: commissionsResult.data,
        nextLink: commissionsResult.nextLink,
      };
    }
    return rejectWithValue(null);
  },
);

const getCommissionThunk = createAsyncThunk(
  'commissions/getCommission',
  async (
    input: {
      commissionId: string;
      store: StoreType;
    },
    { rejectWithValue },
  ) => {
    const commissionsResult = await getCommissionApi(
      input.commissionId,
      input.store,
    );
    if (commissionsResult.result === loadingStateEnum.success) {
      return commissionsResult.data;
    }
    return rejectWithValue(null);
  },
);

const getPointsThunk = createAsyncThunk(
  'commissions/getPoints',
  async (
    store: StoreType,
    {
      rejectWithValue
    }
  ) => {
    const pointsResult = await getPointsApi(store)
    if (pointsResult.result === loadingStateEnum.success) {
      return pointsResult.data
    }
    return rejectWithValue(null)
  }
)

/**
 * A function that gets multiple commissions based on filters
 * @param params 
 * @returns If successful returns Commissions and a next link
 */
export const getCommissions = (params: commissionApiParams) =>
  getValueFromRedux<commissionType[]>(
    getCommissionsThunk(params),
    () => {
      return undefined;
    },
    store => {
      return store.commissions.commissionsState === loadingStateEnum.loading;
    },
    params.store,
  );

/**
 * A function that gets a commission with a commissionId
 * @param commissionId The commission Id of the commission to get
 * @param store The redux store
 * @returns 
 */
export const getCommission = (commissionId: string, store: StoreType) =>
  getValueFromRedux<commissionType>(
    getCommissionThunk({
      commissionId,
      store,
    }),
    store => {
      return store.commissions.currentCommissions.find(e => {
        return e.commissionId === commissionId;
      });
    },
    store => {
      return store.commissions.commissionsState === loadingStateEnum.loading;
    },
    store,
  );

export const getPoints = (store: StoreType) =>
  getValueFromRedux<number>(
    getPointsThunk(store),
    store => {
      if (store.commissions.pointsState === loadingStateEnum.success) {
        return store.commissions.points
      }
      return undefined
    },
    store => {
      return store.commissions.pointsState === loadingStateEnum.loading;
    },
    store,
  )

export const commissionsSlice = createSlice({
  name: 'commissions',
  initialState: initalState,
  reducers: {
    setCommissionsState: (state, action: PayloadAction<loadingStateEnum>) => {
      return { ...state, commissionsState: action.payload };
    },
    setPoints: (state, action: PayloadAction<number>) => {
      return { ...state, points: action.payload };
    },
    setCurrentCommissions: (state, action: PayloadAction<commissionType[]>) => {
      return { ...state, currentCommissions: action.payload };
    },
    setSelectedCommission: (state, action: PayloadAction<string>) => {
      return { ...state, selectedCommission: action.payload };
    },
    setCommissionNextLink: (
      state,
      action: PayloadAction<string | undefined>,
    ) => {
      return { ...state, commissionNextLink: action.payload };
    },
  },
  extraReducers: builder => {
    builder.addCase(getCommissionsThunk.pending, state => {
      state.commissionsState = loadingStateEnum.loading;
    }),
    builder.addCase(getCommissionsThunk.fulfilled, (state, payload) => {
      state.commissionsState = loadingStateEnum.success;
      state.currentCommissions = payload.payload.data;
      state.commissionNextLink = payload.payload.nextLink;
    }),
    builder.addCase(getCommissionsThunk.rejected, state => {
      state.commissionsState = loadingStateEnum.failed;
    }),
    builder.addCase(getCommissionThunk.pending, state => {
      state.commissionsState = loadingStateEnum.loading;
    }),
    builder.addCase(getCommissionThunk.fulfilled, (state, payload) => {
      state.commissionsState = loadingStateEnum.success;
      state.currentCommissions = [
        ...state.currentCommissions,
        payload.payload,
      ];
    }),
    builder.addCase(getCommissionThunk.rejected, state => {
      state.commissionsState = loadingStateEnum.failed;
    });
    builder.addCase(getPointsThunk.pending, state => {
      state.pointsState = loadingStateEnum.loading;
    }),
    builder.addCase(getPointsThunk.fulfilled, (state, payload) => {
      state.pointsState = loadingStateEnum.success;
      state.points = payload.payload
    }),
    builder.addCase(getPointsThunk.rejected, state => {
      state.pointsState = loadingStateEnum.failed;
      state.commissionsState = loadingStateEnum.failed;
    });
  },
});

export default commissionsSlice.reducer;
