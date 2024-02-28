import { AsyncThunkAction } from "@reduxjs/toolkit";
import { loadingStateEnum } from "@constants";
import store, { RootState } from "@redux/store";

// https://stackoverflow.com/questions/3583724/how-do-i-add-a-delay-in-a-javascript-loop
export const timer = (ms: number | undefined) =>
  new Promise(res => setTimeout(res, ms));


export async function getValueFromRedux<ReturnType>(dispatch: AsyncThunkAction<any, any, any>, cached: (store: RootState) => ReturnType | undefined, stateUpdating: (store: RootState) => boolean): Promise<{ result: loadingStateEnum.failed; } | { result: loadingStateEnum.success; data: ReturnType}> {
  let cachedData: undefined | ReturnType = cached(store.getState())
  if (cachedData === undefined) {
    if (!stateUpdating(store.getState())) {
      const result = await store.dispatch(dispatch)
      if (result.meta.requestStatus == 'fulfilled') {
        cachedData = cached(store.getState())
      } else {
        return {result: loadingStateEnum.failed}
      }
    } else {
      const unsubscribe = store.subscribe(() => {
        if (stateUpdating(store.getState())) {
          const newCachedData = cached(store.getState())
          if (newCachedData !== undefined) {
            cachedData = newCachedData
            unsubscribe()
          } else {
            unsubscribe()
            return { result: loadingStateEnum.failed };
          }
        }
      })
    }
  }
  if (cachedData === undefined) {
    return { result: loadingStateEnum.failed };
  }
  return { result: loadingStateEnum.success, data: cachedData }
}