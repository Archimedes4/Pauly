/*
  Pauly
  Andrew Mainella
  1 December 2023
  batchRequest.ts
*/
import { loadingStateEnum } from '@constants';
import callMsGraph from '@utils/ultility/microsoftAssets';

export default async function largeBatch(
  defaultBatchData?: { id: string; method: 'GET' | 'POST'; url: string }[][],
  createData?: {
    firstUrl: string;
    secondUrl: string;
    keys: { array?: string[]; map?: Map<string, unknown> };
    method: 'GET' | 'POST';
  },
): Promise<{ result: loadingStateEnum; data?: batchResponseType[] }> {
  let data: { id: string; method: 'GET' | 'POST'; url: string }[][] = [];
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
        if (createDataIndex % 19 === 0) {
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

  const output: batchResponseType[] = [];
  for (let index = 0; index < data.length; index += 1) {
    const batchData = {
      requests: data[index],
    };
    const result = await callMsGraph(
      'https://graph.microsoft.com/v1.0/$batch',
      'POST',
      JSON.stringify(batchData),
      [{ key: 'Accept', value: 'application/json' }],
    );
    if (result.ok) {
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
    } else {
      return { result: loadingStateEnum.failed };
    }
  }
  return { result: loadingStateEnum.success, data: output };
}
