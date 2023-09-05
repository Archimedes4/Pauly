import { createSlice } from '@reduxjs/toolkit';

const initalState: string = "#793033"

export const statusBarColorSlice = createSlice({
    name: "statusBarColor",
    initialState: initalState,
    reducers: {
        setStatusBarColor: (state, action) => {
            return action.payload
        }
    }
})

export default statusBarColorSlice.reducer