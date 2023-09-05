import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initalStateTaskDeltaLink: string = JSON.stringify(new Date())

export const taskDeltaLinkSlice = createSlice({
    name: "taskDeltaLink",
    initialState: initalStateTaskDeltaLink,
    reducers: {
      setTaskDeltaLink: (_state, action: PayloadAction<string>) => {
        return action.payload
      }
    }
})

export const tasksDeltaReducer = taskDeltaLinkSlice.reducer

const initalTasksState: string[] = []

export const tasksSlice = createSlice({
  name: "tasks",
  initialState: initalTasksState,
  reducers: {
    setCurrentEvents: (state, action: PayloadAction<string[]>) => {
      return [...action.payload]
    },
    pushEvent: (state, action: PayloadAction<string>) => {
      return [...state, action.payload]
    }
  }
})


export const tasksReducer = tasksSlice.reducer