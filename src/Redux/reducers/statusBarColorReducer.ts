import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Colors } from '../../constants';

const initalState: string = Colors.maroon;

export const statusBarColorSlice = createSlice({
  name: 'statusBarColor',
  initialState: initalState,
  reducers: {
    setStatusBarColor: (_state, action: PayloadAction<string>) => {
      return action.payload;
    },
  },
});

export default statusBarColorSlice.reducer;
