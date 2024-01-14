import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { loadingStateEnum } from '@constants';

const initalState: paulyDataType = {
  message: '',
  animationSpeed: 0,
  powerpointBlob: '',
  powerpointShare: '',
  paulyDataState: loadingStateEnum.loading,
};

export const paulyDataSlice = createSlice({
  name: 'paulyData',
  initialState: initalState,
  reducers: {
    setPaulyData: (_state, action: PayloadAction<paulyDataType>) => {
      return action.payload;
    },
    setPaulyDataState: (state, action: PayloadAction<loadingStateEnum>) => {
      return { ...state, paulyDataState: action.payload };
    },
  },
});

export default paulyDataSlice.reducer;
