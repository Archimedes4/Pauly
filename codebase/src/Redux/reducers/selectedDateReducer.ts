import { createSlice } from '@reduxjs/toolkit';

const initalState: string = JSON.stringify(new Date())

export const selectedDateSlice = createSlice({
    name: "selectedDate",
    initialState: initalState,
    reducers: {
        setCurrentEventsLastCalled: (state, action) => {
            return action.payload
        }
    }
})

export default selectedDateSlice.reducer