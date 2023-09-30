import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initalState: {inject: string, images: string} = {inject: "window.ReactNativeWebView.postMessage('failed1')", images: ""}

export const pdfDataSlice = createSlice({
  name: "pdfData",
  initialState: initalState,
  reducers: {
    setInject: (state, action: PayloadAction<string>) => {
      state.inject = action.payload
    },
    setImages: (state, action: PayloadAction<string>) => {
      state.images = action.payload
    }
  }
})

export default pdfDataSlice.reducer