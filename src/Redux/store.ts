import resourcesLastCallReducer, { resourcesLastCalled } from './reducers/resourcesLastCallReducer';
import statusBarColorReducer from './reducers/statusBarColorReducer';
import microsoftProfileDataReducer from './reducers/microsoftProfileDataReducer';
import { configureStore } from '@reduxjs/toolkit';
import currentEventsReducer from './reducers/currentEventReducer';
import currentEventsLastCalledReducer from './reducers/currentEventLastCalledReducer';
import selectedDateReducer from './reducers/selectedDateReducer';
import paulyListReducer from './reducers/paulyListReducer';
import authenticationTokenReducer from './reducers/authenticationTokenReducer';
import authenticationRefreshTokenReducer from './reducers/authenticationRefreshTokenReducer';
import dimentionsReducer from './reducers/dimentionsReducer';
import authenticationApiTokenReducer from './reducers/authenticationApiToken';
import { tasksDeltaReducer, tasksReducer } from './reducers/tasksReducers';
import paulyDataReducer from './reducers/paulyDataReducer';
import resourcesReducer from './reducers/resourcesReducer';
import AddEventReducer from './reducers/AddEventReducer';

const store = configureStore({
  reducer: {
    currentEvents: currentEventsReducer,
    currentEventsLastCalled: currentEventsLastCalledReducer,
    selectedDate: selectedDateReducer,
    paulyList: paulyListReducer,
    authenticationToken: authenticationTokenReducer,
    authenticationRefreshToken: authenticationRefreshTokenReducer,
    dimentions: dimentionsReducer,
    microsoftProfileData: microsoftProfileDataReducer,
    authenticationApiToken: authenticationApiTokenReducer,
    statusBarColor: statusBarColorReducer,
    tasksDeltaLink: tasksDeltaReducer,
    tasks: tasksReducer,
    paulyData: paulyDataReducer,
    resourcesLastCalled: resourcesLastCallReducer,
    resources: resourcesReducer,
    addEvent: AddEventReducer
  }
});

export default store
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch