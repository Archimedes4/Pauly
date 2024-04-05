import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initalState: string = '';

export const authenticationTokenSlice = createSlice({
  name: 'authenticationToken',
  initialState: initalState,
  reducers: {
    setAuthenticationToken: (_state, action: PayloadAction<string>) => {
      return action.payload;
    },
  },
});

export default authenticationTokenSlice.reducer;
