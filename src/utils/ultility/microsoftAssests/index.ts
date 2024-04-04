import store from '@redux/store';
import callMsGraph from './noStore';

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
