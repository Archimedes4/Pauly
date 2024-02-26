import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { loadingStateEnum } from '@constants';

const initalState: { uri: string; displayName: string; id: string, state: loadingStateEnum } = {
  uri: '',
  displayName: '',
  id: '',
  state: loadingStateEnum.notStarted
};

export const microsoftProfileDataSlice = createSlice({
  name: 'microsoftProfileData',
  initialState: initalState,
  reducers: {
    setMicrosoftProfileState: (
      state,
      action: PayloadAction<loadingStateEnum>,
    ) => {
      return {
        uri: state.uri,
        displayName: state.displayName,
        id: state.id,
        state: action.payload
      };
    },
    setMicrosftProfileUrl: (state, action: PayloadAction<string>) => {
      return {
        uri: action.payload,
        displayName: state.displayName,
        id: state.id,
        state: state.state
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
        state: state.state
      };
    },
  },
});

export default microsoftProfileDataSlice.reducer;
