import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initalState: paulyListType = {siteId: "", commissionListId: "", commissionSubmissionsListId: "", paulyDataListId: "", scheduleListId: "", sportsListId: "", sportsApprovedSubmissionsListId: "", sportsSubmissionsListId: "", timetablesListId: "", resourceListId: "", eventTypeExtensionId: "", eventDataExtensionId: "", classExtensionId: "", resourceExtensionId: "", dressCodeListId: "", roomListId: ""}

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