/*
  Pauly
  Andrew Mainella
  10 February 2023
  addEventReducer.ts
*/
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import {
  calendarMode,
  recurringType,
  loadingStateEnum,
  Colors,
} from '@constants';

type addEventStatesType = {
  //eventName: string;
  createEventState: loadingStateEnum;
  isPickingStartDate: boolean;
  isPickingEndDate: boolean;
  //allDay: boolean;
  isGovernmentEvent: boolean;
  selectedTimetable: timetableStringType;
  //selectedSchoolDayData: schoolDayDataType | undefined;
  selectedSchoolYear: eventType | undefined;
  //selectedEventType: paulyEventType;
  recurringEvent: boolean;
  selectedRecurringType: recurringType;
  //startDate: string;
  //endDate: string;
  isShowingAddDate: boolean;
  //isEditing: boolean;
  selectedCalendarMode: calendarMode;
  selectedEvent: eventType //| undefined;
};

const initalState: addEventStatesType = {
  //eventName: '',
  createEventState: loadingStateEnum.notStarted,
  isPickingStartDate: false,
  isPickingEndDate: false,
  //allDay: false,
  isGovernmentEvent: false,
  selectedTimetable: {
   name: '',
   id: '',
  },
  //selectedSchoolDayData: undefined,
  selectedSchoolYear: undefined,
 // selectedEventType: paulyEventType.personal,
  recurringEvent: false,
  selectedRecurringType: recurringType.daily,
  //startDate: new Date().toISOString(),
 // endDate: new Date().toISOString(),
  isShowingAddDate: false,
  //isEditing: false,
  selectedCalendarMode: calendarMode.month,
  selectedEvent: {
    id: 'create',
    name: '',
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    eventColor: Colors.white,
    microsoftEvent: true,
    allDay: false,
    paulyEventType: 'personal'
  },
};

export const addEventSlice = createSlice({
  name: 'addEvent',
  initialState: initalState,
  reducers: {
    setEventName: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        selectedEvent: {
          ...state.selectedEvent,
          name: action.payload
        }
      }
    },
    setCreateEventState: (state, action: PayloadAction<loadingStateEnum>) => {
      return { ...state, createEventState: action.payload };
    },
    setIsPickingStartDate: (state, action: PayloadAction<boolean>) => {
      state.isPickingStartDate = action.payload;
    },
    setIsPickingEndDate: (state, action: PayloadAction<boolean>) => {
      state.isPickingEndDate = action.payload;
    },
    setAllDay: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        selectedEvent: {
          ...state.selectedEvent,
          allDay: action.payload
        }
      }
    },
    setIsGovernmentEvent: (state, action: PayloadAction<boolean>) => {
      return { ...state, isGovernmentEvent: action.payload };
    },
    setSelectedTimetable: (
      state,
      action: PayloadAction<timetableStringType>,
    ) => {
      return { ...state, selectedTimetable: action.payload };
    },
    setSelectedSchoolDayData: (
      state,
      action: PayloadAction<schoolDayDataType | undefined>,
    ) => {
      return { ...state, selectedSchoolDayData: action.payload };
    },
    setSelectedSchoolYear: (state, action: PayloadAction<eventType>) => {
      return { ...state, selectedSchoolYear: action.payload };
    },
    setRecurringEvent: (state, action: PayloadAction<boolean>) => {
      return { ...state, recurringEvent: action.payload };
    },
    setSelectedRecurringType: (state, action: PayloadAction<recurringType>) => {
      return { ...state, selectedRecurringType: action.payload };
    },
    setStartDate: (state, action: PayloadAction<string | Date>) => {
      if (typeof action.payload === 'string') {
        return { ...state, selectedEvent: {
          ...state.selectedEvent,
          startTime: action.payload
        }};
      }
      return { ...state, selectedEvent: {
        ...state.selectedEvent,
        startTime: action.payload.toISOString()
      }};
    },
    setEndDate: (state, action: PayloadAction<string | Date>) => {
      if (typeof action.payload === 'string') {
        return { ...state, selectedEvent: {
          ...state.selectedEvent,
          endTime: action.payload
        }};
      }
      return { ...state, selectedEvent: {
        ...state.selectedEvent,
        endTime: action.payload.toISOString()
      }};
    },
    setIsShowingAddDate: (state, action: PayloadAction<boolean>) => {
      state.isShowingAddDate = action.payload;
    },
    // setIsEditing: (state, action: PayloadAction<boolean>) => {
    //   state.isEditing = action.payload;
    // },
    setSelectedCalendarMode: (state, action: PayloadAction<calendarMode>) => {
      state.selectedCalendarMode = action.payload;
    },
    setSelectedEvent: (state, action: PayloadAction<eventType>) => {
      state.selectedEvent = action.payload;
    },
  },
});

export default addEventSlice.reducer;
