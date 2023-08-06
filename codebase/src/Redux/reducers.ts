

import { createSlice } from '@reduxjs/toolkit';


// function calendarReducer(state: eventState=initialState, action: setCurrentEventsSchoolYearType | setCurrentEventsType): eventState {
//     switch (action.type) {
//         case SET_CURRENT_EVENTS: {
//             return {...state, currentEvents: action.payload}
//         }
//         case SET_CURRENT_EVENTS_SCHOOL_YEAR: {
//             return {...state, currentEventsSchoolYear: action.payload}
//         }
//         default:
//             return state
//     }
// }

const initalCalendarState: string[] = []

export const calendarEventsSlice = createSlice({
    name: "currentEvents",
    initialState: initalCalendarState,
    reducers: {
        setCurrentEvents: (state, action) => {
            return [...action.payload]
        }
    }
})

export default calendarEventsSlice.reducer


// import { createSlice } from '@reduxjs/toolkit'

// export const counterSlice = createSlice({
//   name: 'counter',
//   initialState: {
//     value: 0,
//   },
//   reducers: {
//     increment: (state) => {
//       // Redux Toolkit allows us to write "mutating" logic in reducers. It
//       // doesn't actually mutate the state because it uses the immer library,
//       // which detects changes to a "draft state" and produces a brand new
//       // immutable state based off those changes
//       state.value += 1
//     },
//     decrement: (state) => {
//       state.value -= 1
//     },
//     incrementByAmount: (state, action) => {
//       state.value += action.payload
//     },
//   },
// })

// export const { increment, decrement, incrementByAmount } = counterSlice.actions

// // The function below is called a thunk and allows us to perform async logic. It
// // can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// // will call the thunk with the `dispatch` function as the first argument. Async
// // code can then be executed and other actions can be dispatched
// export const incrementAsync = (amount) => (dispatch) => {
//   setTimeout(() => {
//     dispatch(incrementByAmount(amount))
//   }, 1000)
// }

// // The function below is called a selector and allows us to select a value from
// // the state. Selectors can also be defined inline where they're used instead of
// // in the slice file. For example: `useSelector((state) => state.counter.value)`
// export const selectCount = (state) => state.counter.value

// export default counterSlice.reducer

// import { createSlice } from '@reduxjs/toolkit'

// // Slice
// const slice = createSlice({
//     name: 'todos',
//     initialState: {
//         todos: null,
//     },
//     reducers: {
//         addEditDeleteTodoSuccess: (state, action) => {
//             state.todos = action.payload;
//         }
//     },
// });
// export default slice.reducer

// // Action
// const { addEditDeleteTodoSuccess } = slice.actions
// export const addEditDeleteTodo = (todos) => async dispatch => {
//     try {
//         dispatch(addEditDeleteTodoSuccess(todos));
//     } catch (e) {
//         return console.error(e.message);
//     }
// }
