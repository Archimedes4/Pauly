import microsoftProfileDataReducer from './reducers/microsoftProfileDataReducer';
import { configureStore } from '@reduxjs/toolkit';
import currentEventsReducer from './reducers/currentEventReducer';
import currentEventsLastCalledReducer from './reducers/currentEventLastCalledReducer';
import selectedDateReducer from './reducers/selectedDateReducer';
import paulyListReducer from './reducers/paulyListReducer';
import authenticationTokenReducer from './reducers/authenticationTokenReducer';
import authenticationCallReducer from './reducers/authenticationCallReducer';
import dimentionsReducer from './reducers/dimentionsReducer';
import authenticationApiTokenReducer from './reducers/authenticationApiToken';

const store = configureStore({
  reducer: {
    currentEvents: currentEventsReducer,
    currentEventsLastCalled: currentEventsLastCalledReducer,
    selectedDate: selectedDateReducer,
    paulyList: paulyListReducer,
    authenticationToken: authenticationTokenReducer,
    authenticationCall: authenticationCallReducer,
    dimentions: dimentionsReducer,
    microsoftProfileData: microsoftProfileDataReducer,
    authenticationApiToken: authenticationApiTokenReducer
  }
});

export default store
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch