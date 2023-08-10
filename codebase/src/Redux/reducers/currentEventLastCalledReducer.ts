import { createSlice } from '@reduxjs/toolkit';

const initalState: string = ""

export const currentEventsLastCalled = createSlice({
    name: "currentEventsLastCalled",
    initialState: initalState,
    reducers: {
        setCurrentEventsLastCalled: (state, action) => {
            return action.payload
        }
    }
})

export default currentEventsLastCalled.reducer