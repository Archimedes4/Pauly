import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initalState: boolean = false

export const isShowingProfileBlockSlice = createSlice({
  name: "isShowingProfileBlock",
  initialState: initalState,
  reducers: {
    setIsShowingProfileBlock: (_state, action: PayloadAction<boolean>) => {
      return action.payload
    }
  }
})

export default isShowingProfileBlockSlice.reducer