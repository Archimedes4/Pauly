import { createSlice } from '@reduxjs/toolkit';

const initalState: {uri: string, displayName: string} = {uri: "", displayName: ""}

export const microsoftProfileDataSlice = createSlice({
    name: "microsoftProfileData",
    initialState: initalState,
    reducers: {
        setMicrosoftProfileData: (state, action) => {
            return action.payload
        }
    }
})

export default microsoftProfileDataSlice.reducer