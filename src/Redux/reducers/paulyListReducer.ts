import { PayloadAction, createSlice } from '@reduxjs/toolkit';

declare global {
    type paulyListType =  {
        siteId: string, 
        commissionListId: string,
        paulyDataListId: string,
        scheduleListId: string,
        sportsListId: string,
        sportsApprovedSubmissionsListId: string,
        sportsSubmissionsListId: string,
        timetablesListId: string,
        resourceListId: string,
        eventExtensionId: string,
        classExtensionId: string,
        resourceExtensionId: string
    }
}

const initalState: paulyListType = {siteId: "", commissionListId: "", paulyDataListId: "", scheduleListId: "", sportsListId: "", sportsApprovedSubmissionsListId: "", sportsSubmissionsListId: "", timetablesListId: "", resourceListId: "", eventExtensionId: "", classExtensionId: "", resourceExtensionId: ""}

export const paulyListSlice = createSlice({
    name: "paulyList",
    initialState: initalState,
    reducers: {
        setPaulyList: (state, action: PayloadAction<paulyListType>) => {
            return action.payload
        }
    }
})

export default paulyListSlice.reducer