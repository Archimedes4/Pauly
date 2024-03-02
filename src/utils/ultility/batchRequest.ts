/*
  Pauly
  Andrew Mainella
  1 December 2023
  batchRequest.ts
*/
import { loadingStateEnum } from '@constants';
import { StoreType } from '@src/redux/store';
import callMsGraph from '@utils/ultility/microsoftAssests/noStore';

async function makeBatch(
  data: batchRequest[],
  store: StoreType,
): Promise<
  | { result: loadingStateEnum.success; output: batchResponseType[] }
  | { result: loadingStateEnum.failed }
> {
  const batchData = {
    requests: data,
  };
  const result = await callMsGraph(
    'https://graph.microsoft.com/v1.0/$batch',
    store,
    'POST',
    JSON.stringify(batchData),
    [{ key: 'Accept', value: 'application/json' }],
  );
  if (result.ok) {
    const output: batchResponseType[] = [];
    const batchResultData = await result.json();
    for (
      let batchIndex = 0;
      batchIndex < batchResultData.responses.length;
      batchIndex += 1
    ) {
      output.push({
        method: 'GET',
        id: batchResultData.responses[batchIndex].id,
        headers: batchResultData.responses[batchIndex].headers,
        body: batchResultData.responses[batchIndex].body,
        status: batchResultData.responses[batchIndex].status,
      });
    }
    return {
      result: loadingStateEnum.success,
      output,
    };
  }
  return { result: loadingStateEnum.failed };
}

export default async function largeBatch(
  input: largeBatchInput,
  store: StoreType,
): Promise<
  | { result: loadingStateEnum.success; data: batchResponseType[] }
  | {
      result: loadingStateEnum.failed;
    }
> {
  let data: batchRequest[][] = [];
  if (Array.isArray(input)) {
    data = input;
  } else {
    let batchIndex = 0;
    if ('array' in input) {
      for (
        let createDataIndex = 0;
        createDataIndex < input.array.length;
        createDataIndex += 1
      ) {
        if (batchIndex >= data.length) {
          data.push([]);
        }
        data[batchIndex].push({
          id: (createDataIndex + 1).toString(),
          method: input.method,
          url: `${input.firstUrl}${input.array[createDataIndex]}${input.secondUrl}`,
        });
        if (createDataIndex % 19 === 0 && createDataIndex !== 0) {
          batchIndex += 1;
        }
      }
    } else if (input.map !== undefined) {
      const createDataIndexMap = 0;
      input.map.forEach((_value, key) => {
        if (batchIndex >= data.length) {
          data.push([]);
        }
        data[batchIndex].push({
          id: (createDataIndexMap + 1).toString(),
          method: input.method,
          url: `${input.firstUrl}${key}${input.secondUrl}`,
        });
        if (createDataIndexMap % 19 === 0) {
          batchIndex += 1;
        }
      });
    } else {
      return { result: loadingStateEnum.failed };
    }
  }

  let output: batchResponseType[] = [];
  const ongoingRequests = [];
  for (let index = 0; index < data.length; index += 1) {
    ongoingRequests.push(makeBatch(data[index], store));
  }
  const finalRequests = await Promise.all(ongoingRequests);
  for (let index = 0; index < data.length; index += 1) {
    const finalRequest = finalRequests[index];
    if (finalRequest.result === loadingStateEnum.success) {
      output = [...output, ...finalRequest.output];
    }
  }
  return { result: loadingStateEnum.success, data: output };
}
