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
    dressCodeListId: string,
    eventExtensionId: string,
    classExtensionId: string,
    resourceExtensionId: string,
    roomListId: string
  }
}

const initalState: paulyListType = {siteId: "", commissionListId: "", paulyDataListId: "", scheduleListId: "", sportsListId: "", sportsApprovedSubmissionsListId: "", sportsSubmissionsListId: "", timetablesListId: "", resourceListId: "", eventExtensionId: "", classExtensionId: "", resourceExtensionId: "", dressCodeListId: "", roomListId: ""}

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