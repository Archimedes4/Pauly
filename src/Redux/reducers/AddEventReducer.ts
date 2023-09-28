import { paulyEventType, recurringType, semesters } from '../../types';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { loadingStateEnum } from '../../types';

type addEventStatesType = {
  eventName: string
  createEventState: loadingStateEnum
  isPickingStartDate: boolean
  isPickingEndDate: boolean
  allDay: boolean
  isGovernmentEvent: boolean
  selectedTimetable: timetableStringType
  selectedSchoolDayData: schoolDayDataType
  selectedSchoolYear: eventType
  selectedEventType: paulyEventType
  recurringEvent: boolean
  selectedRecurringType: recurringType
  startDate: string
  endDate: string
}

const initalState: addEventStatesType = {
  eventName: '',
  createEventState: loadingStateEnum.notStarted,
  isPickingStartDate: false,
  isPickingEndDate: false,
  allDay: false,
  isGovernmentEvent: false,
  selectedTimetable: {
    name: '',
    id: ''
  },
  selectedSchoolDayData: {
    schoolDay: {
      name: '',
      shorthand: '',
      id: '',
      order: 0
    },
    schedule: {
      properName: '',
      descriptiveName: '',
      periods: [],
      id: '',
      color: ''
    },
    semester: semesters.semesterOne,
    dressCode: {
      name: '',
      description: '',
      id: ''
    }
  },
  selectedSchoolYear: {
    id: '',
    name: '',
    startTime: undefined,
    endTime: undefined,
    eventColor: '',
    microsoftEvent: false
  },
  selectedEventType: paulyEventType.personal,
  recurringEvent: false,
  selectedRecurringType: recurringType.daily,
  startDate: new Date().toISOString(),
  endDate: new Date().toISOString()
}

export const addEventSlice = createSlice({
  name: "addEvent",
  initialState: initalState,
  reducers: {
    setEventName: (state, action: PayloadAction<string>) => {
      return {...state, eventName: action.payload}
    },
    setCreateEventState: (state, action: PayloadAction<loadingStateEnum>) => {
      return {...state, createEventState: action.payload}
    },
    setIsPickingStartDate: (state, action: PayloadAction<boolean>) => {
      state.isPickingStartDate = action.payload
    },
    setIsPickingEndDate: (state, action: PayloadAction<boolean>) => {
      state.isPickingEndDate = action.payload
    },
    setAllDay: (state, action: PayloadAction<boolean>) => {
      return {...state, allDay: action.payload}
    },
    setIsGovernmentEvent: (state, action: PayloadAction<boolean>) => {
      return {...state, isGovernmentEvent: action.payload}
    },
    setSelectedTimetable: (state, action: PayloadAction<timetableStringType>) => {
      return {...state, selectedTimetable: action.payload}
    },
    setSelectedSchoolDayData: (state, action: PayloadAction<schoolDayDataType>) => {
      return {...state, selectedSchoolDayData: action.payload}
    },
    setSelectedSchoolYear: (state, action: PayloadAction<eventType>) => {
      return {...state, selectedSchoolYear: action.payload}
    },
    setSelectedEventType: (state, action: PayloadAction<number>) => {
      return {...state, selectedEventType: action.payload}
    },
    setRecurringEvent: (state, action: PayloadAction<boolean>) => {
      return {...state, recurringEvent: action.payload}
    },
    setSelectedRecurringType: (state, action: PayloadAction<recurringType>) => {
      return {...state, selectedRecurringType: action.payload}
    },
    setStartDate: (state, action: PayloadAction<string | Date>) => {
      if (typeof action.payload === "string") {
        return {...state, startDate: action.payload}
      } else {
        return {...state, startDate: action.payload.toISOString()}
      }
    },
    setEndDate: (state, action: PayloadAction<string | Date>) => {
      if (typeof action.payload === "string") {
        return {...state, endDate: action.payload}
      } else {
        return {...state, endDate: action.payload.toISOString()}
      }
    }
  }
})

export default addEventSlice.reducer