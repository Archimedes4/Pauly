import { AsyncThunkAction } from '@reduxjs/toolkit';
import { loadingStateEnum } from '@constants';
import { RootState, StoreType } from '@redux/store';
import createUUID from './createUUID';

// https://stackoverflow.com/questions/3583724/how-do-i-add-a-delay-in-a-javascript-loop
export const timer = (ms: number | undefined) =>
  new Promise(res => setTimeout(res, ms));

export async function getValueFromRedux<ReturnType>(
  dispatch: AsyncThunkAction<any, any, any>,
  cached: (store: RootState) => ReturnType | undefined,
  stateUpdating: (store: RootState) => boolean,
  store: StoreType,
): Promise<
  | { result: loadingStateEnum.failed }
  | { result: loadingStateEnum.success; data: ReturnType }
> {
  const id = createUUID()
  let cachedData: undefined | ReturnType = cached(store.getState());
  if (cachedData === undefined) {
    if (!stateUpdating(store.getState())) {
      const result = await store.dispatch(dispatch);
      if (result.meta.requestStatus === 'fulfilled') {
        const data = cached(store.getState());
        if (data !== undefined) {
          return { result: loadingStateEnum.success, data };
        } else {
          return { result: loadingStateEnum.failed };
        }
      } else {
        return { result: loadingStateEnum.failed };
      }
    } else {
      try {
        const result: ReturnType | undefined = await new Promise( (resolve, reject) => {
          const unsubscribe = store.subscribe(() => {
            if (stateUpdating(store.getState())) {
              const newCachedData = cached(store.getState());
              if (newCachedData !== undefined) {
                resolve(cachedData)
                unsubscribe();
              }
            } else {
              const newCachedData = cached(store.getState());
              if (newCachedData !== undefined) {
                unsubscribe();
                resolve(newCachedData)
              } else {
                unsubscribe();
                reject()
              }
            }
          });
        });
        if (result === undefined) {
          return {result: loadingStateEnum.failed}
        }
        return {result: loadingStateEnum.success, data: result}
      } catch {
        return {result: loadingStateEnum.failed}
      }
    }
  }
  return { result: loadingStateEnum.success, data: cachedData };
}
