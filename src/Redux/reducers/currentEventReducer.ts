import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initalCalendarState: eventType[] = [];

export const currentEventsSlice = createSlice({
  name: 'currentEvents',
  initialState: initalCalendarState,
  reducers: {
    setCurrentEvents: (_state, action: PayloadAction<eventType[]>) => {
      return [...action.payload];
    },
    pushEvent: (state, action: PayloadAction<eventType>) => {
      return [...state, action.payload];
    },
    addCurrentEvents: (state, action: PayloadAction<eventType[]>) => {
      return [...state, ...action.payload];
    },
    removeCurrentEvent: (state, action: PayloadAction<number>) => {
      state.slice(action.payload, 1);
    },
    removeClassEvents: (state, action?: PayloadAction<undefined>) => {
      return [
        ...state.filter(e => {
          return e.paulyEventType !== 'studentSchedule';
        }),
      ];
    },
    clearEvents: (_state, _action: PayloadAction<void>) => {
      return [];
    },
  },
});

export default currentEventsSlice.reducer;
