import store from "../Redux/store"
import { resourceResponce } from "../types"
import callMsGraph from "./microsoftAssets"

export default async function getResource(groupId: string, conversationId: string): Promise<{result: resourceResponce, itemId?: string}> {
    const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + store.getState().paulyList.siteId + "/lists/" + store.getState().paulyList.resourceListId + "/items?expand=fields&$filter=fields/resourceGroupId%20eq%20'"+ groupId +"'%20and%20fields/resourceConversationId%20eq%20'" + conversationId + "'")
    console.log(result)
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