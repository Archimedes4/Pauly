import { createSlice } from '@reduxjs/toolkit';

const initalState: {commissionListId: string, paulyDataListId: string, scheduleListId: string, sportsListId: string, sportsApprovedSubmissionsListId: string, sportsSubmissionsListId: string, timetablesListId: string} = {commissionListId: "", paulyDataListId: "", scheduleListId: "", sportsListId: "", sportsApprovedSubmissionsListId: "", sportsSubmissionsListId: "", timetablesListId: ""}

export const paulyListSlice = createSlice({
    name: "paulyList",
    initialState: initalState,
    reducers: {
        setPaulyList: (state, action) => {
            return action.payload
        }
    }
})

export default paulyListSlice.reducer