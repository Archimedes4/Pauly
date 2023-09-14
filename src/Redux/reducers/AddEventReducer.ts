import { paulyEventType, recurringType } from './../../types';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { loadingStateEnum } from '../../types';

type addEventStatesType = {
  eventName: string
  createEventState: loadingStateEnum
  isPickingStartDate: boolean
  isPickingEndDate: boolean
  allDay: boolean
  isGovernmentEvent: boolean
  selectedTimetable: timetableType
  selectedSchoolDayData: schoolDayDataType
  selectedSchoolYear: eventType
  selectedEventType: paulyEventType
  recurringEvent: boolean
  selectedRecurringType: recurringType

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
    id: '',
    schedules: [],
    days: [],
    dressCode: {
      name: '',
      id: '',
      dressCodeData: [],
      dressCodeIncentives: []
    }
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
      id: ''
    },
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
  selectedEventType: 0,
  recurringEvent: false,
  selectedRecurringType: recurringType.daily
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
      return {...state, isPickingStateDate: action.payload}
    },
    setIsPickingEndDate: (state, action: PayloadAction<boolean>) => {
      return {...state, isPickingEndDate: action.payload}
    },
    setAllDay: (state, action: PayloadAction<boolean>) => {
      return {...state, allDay: action.payload}
    },
    setIsGovernmentEvent: (state, action: PayloadAction<boolean>) => {
      return {...state, isGovernmentEvent: action.payload}
    },
    setSelectedTimetable: (state, action: PayloadAction<timetableType>) => {
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
    }
  }
})

export default addEventSlice.reducer