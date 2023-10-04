import { loadingStateEnum } from "../../types";
import callMsGraph from "./microsoftAssets";

export default async function largeBatch(defaultBatchData?: {id: string, method: "GET" | "POST", url: string}[][], createData?: {firstUrl: string, secondUrl: string, keys: {array?: string[], map?: Map<string, any>}, method: "GET" | "POST"}): Promise<{result: loadingStateEnum, data?: batchResponseType[]}> {
  var data: {id: string, method: "GET" | "POST", url: string}[][] = []
  if (defaultBatchData) {
    data = defaultBatchData
  } else if (createData) {
    var batchIndex = 0
    if (createData.keys.array !== undefined){
      for (var createDataIndex = 0; createDataIndex < createData.keys.array.length; createDataIndex++) {
        if (batchIndex >= data.length) {
          data.push([])
        }
        data[batchIndex].push({
          id: (createDataIndex + 1).toString(),
          method: createData.method,
          url: `${createData.firstUrl}${createData.keys.array[createDataIndex]}${createData.secondUrl}`
        })
        if ((createDataIndex % 19) === 0) {
          batchIndex++
        }
      }
    } else if (createData.keys.map !== undefined) {
      var createDataIndexMap = 0
      createData.keys.map.forEach((value, key) => {
        if (batchIndex >= data.length) {
          data.push([])
        }
        data[batchIndex].push({
          id: (createDataIndexMap + 1).toString(),
          method: createData.method,
          url: `${createData.firstUrl}${key}${createData.secondUrl}`
        })
        if ((createDataIndexMap% 19) === 0) {
          batchIndex++
        }
      })
    } else {

    }
  } else {
    return {result: loadingStateEnum.failed}
  }
  var resourceHeader = new Headers()
  resourceHeader.append("Accept", "application/json")
  var output: batchResponseType[] = []
  for (var index = 0; index < data.length; index++) {
    const batchData = {
      "requests":data[index]
    }
    const result = await callMsGraph("https://graph.microsoft.com/v1.0/$batch", "POST", undefined, JSON.stringify(batchData), undefined, undefined, resourceHeader)
    if (result.ok) {
      const batchResultData = await result.json()
      for (var batchIndex = 0; batchIndex < batchResultData["responses"].length; batchIndex++) {
        output.push({
          method: "GET",
          id: batchResultData["responses"][batchIndex]["id"],
          headers: batchResultData["responses"][batchIndex]["headers"],
          body: batchResultData["responses"][batchIndex]["body"],
          status:  batchResultData["responses"][batchIndex]["status"]
        })
      }
    } else {
      return {result: loadingStateEnum.failed}
    }
  }
  return {result: loadingStateEnum.success, data: output}
}