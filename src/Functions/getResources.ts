import { loadingStateEnum, resourceResponce } from './../types';
import store from "../Redux/store"
import callMsGraph from "./Ultility/microsoftAssets"
import { resourcesSlice } from '../Redux/reducers/resourcesReducer';

async function getResourceFollows() {
  var nextLink = `https://graph.microsoft.com/v1.0/sites/${store.getState().paulyList.siteId}/lists/${store.getState().paulyList.resourceListId}/items?expand=fields`
  while (nextLink !== "") {
    const result = await callMsGraph(nextLink)
    if (result.ok) {
      const data = await result.json()
      if (data["@odata.nextLink"] !== undefined) {
        nextLink = data["@odata.nextLink"]
      } else {
        nextLink = ""
      }
      var output: resourceFollowType[] = []
      for (var index = 0; index < data["value"].length; index++) {
        output.push({
          teamId: data["value"][index]["fields"]["resourceGroupId"],
          channelId: data["value"][index]["fields"]["resourceConversationId"]
        })
      } 
      store.dispatch(resourcesSlice.actions.setResourceFollow(output))
    } else {
      store.dispatch(resourcesSlice.actions.setResourcesState(loadingStateEnum.failed))
      return
    }
  }
  store.dispatch(resourcesSlice.actions.setResourcesState(loadingStateEnum.failed))
  return
}

export async function getResources(category? ) {
  await getResourceFollows()
  const categoryFilter = (category === resourceMode.sports) ? "sports":(selectedCategory === resourceMode.advancement) ? "advancement":(selectedCategory === resourceMode.schoolEvents) ? "schoolEvents":(selectedCategory === resourceMode.annoucments) ? "annoucments":(selectedCategory === resourceMode.fitness) ? "fitness":"files"
  var output: resourceDataType[] = []
  var batchDataRequests: {id:string; method:string; url:string}[][] = [[]]
  var batchCount = 0
  for (var index = 0; index < store.getState().resources.resourceFollow.length; index++) {
    //resourceGroupId
    batchDataRequests[batchCount].push({
      "id": (index + 1).toString(),
      "method": "GET",
      "url": `/teams/${store.getState().resources.resourceFollow[index].teamId}/channels/${store.getState().resources.resourceFollow[index].channelId}/messages`
    })
    if ((store.getState().resources.resourceFollow.length%20) === 0) {
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
              if (resourceResponceData["responses"][responceIndex]["body"]["value"][dataIndex]["body"]["content"] !== "<systemEventMessage/>") {
                var attachments: resourceType[] = []
                console.log(resourceResponceData["responses"][responceIndex]["body"]["value"][dataIndex]["attachments"])
                for (var attachmentIndex = 0; attachmentIndex < resourceResponceData["responses"][responceIndex]["body"]["value"][dataIndex]["attachments"].length; attachmentIndex++) {
                  console.log("Running through attach")
                  if (resourceResponceData["responses"][responceIndex]["body"]["value"][dataIndex]["attachments"][attachmentIndex]["contentType"] === "reference") {
                    console.log("Called")
                    const attachResult = await callMsGraph(`https://graph.microsoft.com/v1.0/groups/${store.getState().resources.resourceFollow[parseInt(resourceResponceData["responses"][responceIndex]["id"]) - 1].teamId}/threads/${store.getState().resources.resourceFollow[parseInt(resourceResponceData["responses"][responceIndex]["id"]) - 1].channelId}/posts/${resourceResponceData["responses"][responceIndex]["body"]["value"][dataIndex]["id"]}/attachments/${resourceResponceData["responses"][responceIndex]["body"]["value"][dataIndex]["attachments"][attachmentIndex]["id"]}`)
                    const attachData = await attachResult.json()
                    if (attachResult.ok) {
                      attachments.push({
                        webUrl: '',
                        id: '',
                        title: '',
                        type: ''
                      })
                    }
                  }
                }
                const outputData: resourceDataType = {
                  teamId: store.getState().resources.resourceFollow[parseInt(resourceResponceData["responses"][responceIndex]["id"]) - 1].teamId,
                  conversationId: store.getState().resources.resourceFollow[parseInt(resourceResponceData["responses"][responceIndex]["id"]) - 1].channelId,
                  id: resourceResponceData["responses"][responceIndex]["body"]["value"][dataIndex]["id"],
                  body: resourceResponceData["responses"][responceIndex]["body"]["value"][dataIndex]["body"]["content"],
                  html: (resourceResponceData["responses"][responceIndex]["body"]["value"][dataIndex]["body"]["contentType"] === "html") ? true:false,
                  attachments: (attachments.length >= 1) ? attachments:undefined
                }
                output.push(outputData)
              }
            }
          } else {
            console.log("Failed")
            store.dispatch(resourcesSlice.actions.setResourcesState(loadingStateEnum.failed))
            return
          }
        }
      } else {
        store.dispatch(resourcesSlice.actions.setResourcesState(loadingStateEnum.failed))
        return
      }
    }
  }
  store.dispatch(resourcesSlice.actions.setResources({resources: output, loadingState: loadingStateEnum.success}))
  return
}

export async function getResourcesSearch(search: string): Promise<loadingStateEnum> {
  const searchPayload = {
    "requests": [
      {
        "entityTypes": [
          "chatMessage"
        ],
        "query": {
          "queryString":search
        },
        "from": 0,
        "size": 15,
        "enableTopResults": true
      }
    ]
  }
  const searchResult = await callMsGraph("https://graph.microsoft.com/v1.0/search/query", "POST", false, JSON.stringify(searchPayload))
  if (searchResult.ok) {
    const searchData = await searchResult.json()
    console.log(searchData)
  } else {

  }
  return loadingStateEnum.failed
}

export function getResourceFromJson(JSONIn: string): resourceDataType | undefined {
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