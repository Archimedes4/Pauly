import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { loadingStateEnum } from '../../types';

type commissionsStateType = {
  commissionsState: loadingStateEnum
  points: number
  currentCommissions: commissionType[]
  selectedCommission: string
  commissionNextLink: string | undefined
}

const initalState: commissionsStateType = {
  commissionsState: loadingStateEnum.loading,
  points: 0,
  currentCommissions: [],
  selectedCommission: "",
  commissionNextLink: undefined
}

export const commissionsSlice = createSlice({
  name: "commissions",
  initialState: initalState,
  reducers: {
    setCommissionsState: (state, action: PayloadAction<loadingStateEnum>) => {
      state.commissionsState = action.payload
    },
    setPoints: (state, action: PayloadAction<number>) => {
      state.points = action.payload
    },
    setCurrentCommissions: (state, action: PayloadAction<commissionType[]>) => {
      state.currentCommissions = action.payload
    },
    setSelectedCommission: (state, action: PayloadAction<string>) => {
      state.selectedCommission = action.payload
    },
    setCommissionNextLink: (state, action: PayloadAction<string | undefined>) => {
      state.commissionNextLink = action.payload
    }
  }
})

export default commissionsSlice.reducer