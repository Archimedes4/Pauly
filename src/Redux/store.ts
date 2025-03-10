/*
  Pauly
  Andrew Mainella
  10 February 2023
  store.ts
  Redux store https://redux.js.org/
*/
import { configureStore } from '@reduxjs/toolkit';
import isOverrideReducer from './reducers/isOverrideReducer';
import monthDataReducer from './reducers/monthDataReducer';
import safeAreaColorsReducer from './reducers/safeAreaColorsReducer';
import microsoftProfileDataReducer from './reducers/microsoftProfileDataReducer';
import currentEventsReducer from './reducers/currentEventReducer';
import selectedDateReducer from './reducers/selectedDateReducer';
import paulyListReducer from './reducers/paulyListReducer';
import authenticationTokenReducer from './reducers/authenticationTokenReducer';
import authenticationRefreshTokenReducer from './reducers/authenticationRefreshTokenReducer';
import dimensionsReducer from './reducers/dimensionsReducer';
import authenticationApiTokenReducer from './reducers/authenticationApiToken';
import paulyDataReducer from './reducers/paulyDataReducer';
import addEventReducer from './reducers/addEventReducer';
import homepageDataReducer from './reducers/homepageDataReducer';
import expandedModeReducer from './reducers/expandedModeReducer';
import isShowingProfileBlockReducer from './reducers/isShowingProfileBlockReducer';
import isGovernmentModeReducer from './reducers/isGovernmentModeReducer';
import commissionsReducer from './reducers/commissionsReducer';
import pdfDataReducer from './reducers/pdfDataReducer';
import authenticationCallReducer from './reducers/authenticationCallReducer';
import studentSearchReducer from './reducers/studentSearchReducer';
import authLoadingReducer from './reducers/authLoadingReducer';
import paulyLoadingReducer from './reducers/paulyLoadingReducer';
import authActiveReducer from './reducers/authActiveReducer';
import lastCalledSelectedDateReducer from './reducers/lastCalledSelectedDateReducer';
import classesReducer from './reducers/classesReducer';
import timetableReducer from './reducers/timetableReducer';
import leaderboardReducer from './reducers/leaderboardReducer';
import monthViewReducer from './reducers/monthViewReducer';
import paulySettingsReducer from './reducers/paulySettingsReducer';

const store = configureStore({
  reducer: {
    addEvent: addEventReducer,
    authenticationToken: authenticationTokenReducer,
    authenticationApiToken: authenticationApiTokenReducer,
    authenticationRefreshToken: authenticationRefreshTokenReducer,
    authenticationCall: authenticationCallReducer,
    classes: classesReducer,
    commissions: commissionsReducer,
    currentEvents: currentEventsReducer,
    dimensions: dimensionsReducer,
    expandedMode: expandedModeReducer,
    homepageData: homepageDataReducer,
    isGovernmentMode: isGovernmentModeReducer,
    isShowingProfileBlock: isShowingProfileBlockReducer,
    lastCalledSelectedDate: lastCalledSelectedDateReducer,
    leaderboard: leaderboardReducer,
    microsoftProfileData: microsoftProfileDataReducer,
    monthData: monthDataReducer,
    monthView: monthViewReducer,
    paulyData: paulyDataReducer,
    paulyList: paulyListReducer,
    paulySettings: paulySettingsReducer,
    pdfData: pdfDataReducer,
    safeAreaColors: safeAreaColorsReducer,
    selectedDate: selectedDateReducer,
    studentSearch: studentSearchReducer,
    authLoading: authLoadingReducer,
    authActive: authActiveReducer,
    isOverride: isOverrideReducer,
    paulyLoading: paulyLoadingReducer,
    timetables: timetableReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      immutableCheck: false,
    }),
});

export default store;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export type StoreType = typeof store;
