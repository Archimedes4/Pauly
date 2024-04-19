import store from '@redux/store';
import callMsGraph from './noStore';

/**
 * A function fetch a url with auth for ms graph. This code doesn;t need the store, but can't be used in a reducer.
 * @param url The url of the endpoint being called
 * @param store The redux store which is used to get the access token
 * @param method The method of the request
 * @param body The body as a String or Bold of the request
 * @param headersIn The headers in the form of key with value
 * @param secondAuth This is for recursion and is not to be used
 * @param abort Abort controller to be passed to abort the function
 * @returns
 */
export default function callMsGraphStore(
  url: string,
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT',
  body?: string | Blob,
  headersIn?: { key: string; value: string }[],
  secondAuth?: boolean,
  abort?: AbortController,
) {
  return callMsGraph(url, store, method, body, headersIn, secondAuth, abort);
}
