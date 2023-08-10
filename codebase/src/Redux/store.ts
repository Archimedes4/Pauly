// import { configureStore } from '@reduxjs/toolkit'
// import {calendarEventsReducer} from './Reducers';

// export default configureStore({reducer: {calendarEventsReducer, }, })

import { configureStore } from '@reduxjs/toolkit';
import currentEventsReducer from './reducers/calendarEventReducer';
import currentEventsSchoolYear from './reducers/calendarEventSchoolYearReducer'

const store = configureStore({
  reducer: {
    calendarEvents: currentEventsReducer,
    calendarEventsSchoolYear: currentEventsSchoolYear
  }
});

export default store
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch