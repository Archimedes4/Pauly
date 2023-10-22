import { createSlice } from '@reduxjs/toolkit';

const initalState: string = '';

export const authenticationRefreshTokenSlice = createSlice({
  name: 'authenticationRefreshToken',
  initialState: initalState,
  reducers: {
    setAuthenticationRefreshToken: (state, action) => {
      return action.payload;
    },
  },
});

export default authenticationRefreshTokenSlice.reducer;
