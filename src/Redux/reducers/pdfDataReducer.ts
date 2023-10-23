import { PayloadAction, createSlice } from '@reduxjs/toolkit';

// page number is an index meaning first page is 0
const initalState: { inject: string; images: string[]; pageNumber: number } = {
  inject: '',
  images: [],
  pageNumber: 0,
};

export const pdfDataSlice = createSlice({
  name: 'pdfData',
  initialState: initalState,
  reducers: {
    setInject: (state, action: PayloadAction<string>) => {
      state.inject = action.payload;
      return { ...state, commissionsState: action.payload };
    },
    addImage: (state, action: PayloadAction<string>) => {
      state.images.push(action.payload);
    },
    setImages: (state, action: PayloadAction<string[]>) => {
      return { ...state, images: action.payload };
    },
    setPageNumber: (state, action: PayloadAction<number>) => {
      return { ...state, pageNumber: action.payload };
    },
    increasePageNumber: state => {
      state.pageNumber += 1;
    },
    decreasePageNumber: state => {
      state.pageNumber -= 1;
    },
  },
});

export default pdfDataSlice.reducer;
