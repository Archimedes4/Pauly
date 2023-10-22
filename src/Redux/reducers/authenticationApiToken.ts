import { createSlice } from '@reduxjs/toolkit';

const initalState: string = '';

export const authenticationApiTokenSlice = createSlice({
  name: 'authenticationApiToken',
  initialState: initalState,
  reducers: {
    setAuthenticationApiToken: (_state, action) => {
      return action.payload;
    },
  },
});

export default authenticationApiTokenSlice.reducer;
