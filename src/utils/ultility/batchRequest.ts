/*
  Pauly
  Andrew Mainella
  1 December 2023
  batchRequest.ts
*/
import { loadingStateEnum } from '@constants';
import callMsGraph from '@utils/ultility/microsoftAssets';

async function makeBatch(
  data: batchRequest[],
): Promise<
  | { result: loadingStateEnum.success; output: batchResponseType[] }
  | { result: loadingStateEnum.failed }
> {
  const batchData = {
    requests: data,
  };
  const result = await callMsGraph(
    'https://graph.microsoft.com/v1.0/$batch',
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
  defaultBatchData?: batchRequest[][],
  createData?: {
    firstUrl: string;
    secondUrl: string;
    keys: { array?: string[]; map?: Map<string, unknown> };
    method: 'GET' | 'POST';
  },
): Promise<
  | { result: loadingStateEnum.success; data: batchResponseType[] }
  | {
      result: loadingStateEnum.failed;
    }
> {
  let data: batchRequest[][] = [];
  if (defaultBatchData) {
    data = defaultBatchData;
  } else if (createData) {
    let batchIndex = 0;
    if (createData.keys.array !== undefined) {
      for (
        let createDataIndex = 0;
        createDataIndex < createData.keys.array.length;
        createDataIndex += 1
      ) {
        if (batchIndex >= data.length) {
          data.push([]);
        }
        data[batchIndex].push({
          id: (createDataIndex + 1).toString(),
          method: createData.method,
          url: `${createData.firstUrl}${createData.keys.array[createDataIndex]}${createData.secondUrl}`,
        });
        if (createDataIndex % 19 === 0 && createDataIndex !== 0) {
          batchIndex += 1;
        }
      }
    } else if (createData.keys.map !== undefined) {
      const createDataIndexMap = 0;
      createData.keys.map.forEach((value, key) => {
        if (batchIndex >= data.length) {
          data.push([]);
        }
        data[batchIndex].push({
          id: (createDataIndexMap + 1).toString(),
          method: createData.method,
          url: `${createData.firstUrl}${key}${createData.secondUrl}`,
        });
        if (createDataIndexMap % 19 === 0) {
          batchIndex += 1;
        }
      });
    } else {
      return { result: loadingStateEnum.failed };
    }
  } else {
    return { result: loadingStateEnum.failed };
  }

  let output: batchResponseType[] = [];
  const ongoingRequests = [];
  for (let index = 0; index < data.length; index += 1) {
    ongoingRequests.push(makeBatch(data[index]));
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
