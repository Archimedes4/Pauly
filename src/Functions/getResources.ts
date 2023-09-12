import { loadingStateEnum, resourceResponce } from './../types';
import store from "../Redux/store"
import callMsGraph from "./Ultility/microsoftAssets"
import { resourcesSlice } from '../Redux/reducers/resourcesReducer';

declare global {
  type resourceDataType = {
    id: string,
    body: string
  }
}

export async function getResources(): Promise<loadingStateEnum> {
  var nextLink = "https://graph.microsoft.com/v1.0/sites/" + store.getState().paulyList.siteId + "/lists/" + store.getState().paulyList.resourceListId + "/items?expand=fields"
  var output: string[] = []
  while (nextLink !== "") {
    const result = await callMsGraph(nextLink)
    if (result.ok) {
      const data = await result.json()
      if (data["@odata.nextLink"] !== undefined) {
        nextLink = data["@odata.nextLink"]
      } else {
        nextLink = ""
      }

      var batchDataRequests: {id: string;method: string;url: string}[][] = [[]]
      var batchCount = 0
      for (var index = 0; index < data["value"].length; index++) {
        //resourceGroupId
        batchDataRequests[batchCount].push({
          "id": (index + 1).toString(),
          "method": "GET",
          "url": `/teams/${data["value"][index]["fields"]["resourceGroupId"]}/channels/${data["value"][index]["fields"]["resourceConversationId"]}/messages`
        })
        if ((data["value"].length%20) === 0) {
          batchDataRequests.push([])
          batchCount++
        }
      }
      var resourceHeader = new Headers()
      resourceHeader.append("Accept", "application/json")
      for (var index = 0; index < batchDataRequests.length; index++) {
        const batchData = {
          "requests":batchDataRequests[index]
        }
        if (batchDataRequests[index].length !== 0){
          const resourceRsp = await callMsGraph("https://graph.microsoft.com/v1.0/$batch", "POST", false, JSON.stringify(batchData), undefined, undefined, resourceHeader)
          if (resourceRsp.ok){
            const resourceResponceData = await resourceRsp.json()
            for (var responceIndex = 0; responceIndex < resourceResponceData["responses"].length; responceIndex++) {
              if (resourceResponceData["responses"][responceIndex]["status"] === 200) {
                for (var dataIndex = 0; dataIndex < resourceResponceData["responses"][responceIndex]["body"]["value"].length; dataIndex++) {
                  const outputData: resourceDataType = {
                    id: resourceResponceData["responses"][responceIndex]["body"]["value"][dataIndex]["id"],
                    body: resourceResponceData["responses"][responceIndex]["body"]["value"][dataIndex]["body"]["content"]
                  }
                  console.log(outputData)
                  output.push(JSON.stringify(outputData))
                }
              } else {
                return loadingStateEnum.failed
              }
            }
          } else {
            return loadingStateEnum.failed
          }
        }
      }
      console.log(output)
      store.dispatch(resourcesSlice.actions.setResources(output))
      return loadingStateEnum.success
    } else {
      return loadingStateEnum.failed
    }
  }
}

export function getResourceFromJson(JSONIn: string): resourceDataType {
  try {
    const result: resourceDataType = JSON.parse(JSONIn)
    return result
  } catch {
    return undefined
  }
}

export default async function getResource(groupId: string, conversationId: string): Promise<{result: resourceResponce, itemId?: string}> {
  const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + store.getState().paulyList.siteId + "/lists/" + store.getState().paulyList.resourceListId + "/items?expand=fields&$filter=fields/resourceGroupId%20eq%20'"+ groupId +"'%20and%20fields/resourceConversationId%20eq%20'" + conversationId + "'")
  if (!result.ok) {return {result: resourceResponce.failed}}
  const data = await result.json()
  if (data["value"].length === 1) {
    return {result: resourceResponce.found, itemId: data["value"][0]["id"]}
  } else if (data["value"].length === 0) {
    return {result: resourceResponce.notFound}
  } else {
    return {result: resourceResponce.failed}
  }
}