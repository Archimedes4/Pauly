import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initalState: { uri: string; displayName: string; id: string } = {
  uri: '',
  displayName: '',
  id: '',
};

export const microsoftProfileDataSlice = createSlice({
  name: 'microsoftProfileData',
  initialState: initalState,
  reducers: {
    setMicrosoftProfileData: (
      _state,
      action: PayloadAction<{ uri: string; displayName: string; id: string }>,
    ) => {
      return action.payload;
    },
    setMicrosftProfileUrl: (state, action: PayloadAction<string>) => {
      return {
        uri: action.payload,
        displayName: state.displayName,
        id: state.id,
      };
    },
    setMicrosoftProfileInformation: (
      state,
      action: PayloadAction<{ displayName: string; id: string }>,
    ) => {
      return {
        uri: state.uri,
        displayName: action.payload.displayName,
        id: action.payload.id,
      };
    },
  },
});

export default microsoftProfileDataSlice.reducer;
