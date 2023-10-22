import { createSlice } from '@reduxjs/toolkit';

const initalState: string = '';

export const authenticationTokenSlice = createSlice({
  name: 'authenticationToken',
  initialState: initalState,
  reducers: {
    setAuthenticationToken: (state, action) => {
      return action.payload;
    },
  },
});

export default authenticationTokenSlice.reducer;
