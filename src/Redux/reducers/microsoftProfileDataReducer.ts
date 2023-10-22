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
  },
});

export default microsoftProfileDataSlice.reducer;
