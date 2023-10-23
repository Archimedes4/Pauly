import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { loadingStateEnum } from '../../types';

type commissionsStateType = {
  commissionsState: loadingStateEnum;
  points: number;
  currentCommissions: commissionType[];
  selectedCommission: string;
  commissionNextLink: string | undefined;
};

const initalState: commissionsStateType = {
  commissionsState: loadingStateEnum.loading,
  points: 0,
  currentCommissions: [],
  selectedCommission: '',
  commissionNextLink: undefined,
};

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
});

export default commissionsSlice.reducer;
