import { authenticationCallSlice } from '@redux/reducers/authenticationCallReducer';
import { StoreType } from '@redux/store';
import { Platform } from 'react-native';

/**
 * A function fetch a url with auth for ms graph. This needs the store, this is needed in some thunks.
 * @param url The url of the endpoint being called
 * @param store The redux store which is used to get the access token
 * @param method The method of the request
 * @param body The body as a String or Bold of the request
 * @param headersIn The headers in the form of key with value
 * @param secondAuth This is for recursion and is not to be used
 * @param abort Abort controller to be passed to abort the function
 * @returns
 */
export default async function callMsGraph(
  url: string,
  store: StoreType,
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT',
  body?: string | Blob,
  headersIn?: { key: string; value: string }[],
  secondAuth?: boolean,
  abort?: AbortController,
): Promise<Response> {
  const headers: Headers = new Headers();
  const bearer = `Bearer ${store.getState().authenticationToken}`;

  headers.append('Authorization', bearer);
  headers.append('Content-Type', 'application/json');

  if (headersIn !== undefined) {
    for (
      let headerIndex = 0;
      headerIndex < headersIn.length;
      headerIndex += 1
    ) {
      headers.append(headersIn[headerIndex].key, headersIn[headerIndex].value);
    }
  }

  const options: RequestInit = {
    method: method || 'GET',
    headers,
    body,
    signal: abort?.signal,
  };

  let outUrl = url;

  if (Platform.OS !== 'web') {
    const urlArray = url.split('%20');
    outUrl = '';
    for (let index = 0; index < urlArray.length; index += 1) {
      if (index !== 0) {
        outUrl += ` ${urlArray[index]}`;
      } else {
        outUrl += urlArray[index];
      }
    }
  }

  const response = await fetch(outUrl, options);
  if (response.status === 401) {
    if (secondAuth === undefined) {
      store.dispatch(
        authenticationCallSlice.actions.setAuthenticationCallIncrement(),
      );
      const previousValue: string = store.getState().authenticationToken;
      return new Promise(resolve => {
        const unsubscribe = store.subscribe(async () => {
          const newValue = store.getState().authenticationToken;
          if (newValue !== previousValue) {
            const result = await callMsGraph(
              url,
              store,
              method,
              body,
              headersIn,
              true,
            );
            resolve(result);
            unsubscribe(); // Unsubscribe after getting the new result
          }
        });
      });
    }
    return response;
  }
  return response;
}
