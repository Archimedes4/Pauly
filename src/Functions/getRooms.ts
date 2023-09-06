import store from "../Redux/store"
import { loadingStateEnum } from "../types"
import callMsGraph from "./Ultility/microsoftAssets"

export async function getRooms(nextLink?: string, search?: string): Promise<{result: loadingStateEnum, data?: roomType[], nextLink?: string}> {
  const searchFilter = (search) ? `&$filter=fields/roomName%20eq%20${search}`:""
  const result = await callMsGraph(nextLink ? nextLink:"https://graph.microsoft.com/v1.0/sites/" + store.getState().paulyList.siteId + "/lists/" + store.getState().paulyList.roomListId +"/items?expand=fields" +  search)
  if (result.ok){
    const data = await result.json()
    var resultArray: roomType[] = []
    for (var index = 0; index < data["value"].length; index++){
      resultArray.push({
        name: data["value"][index]["fields"]["roomName"],
        id: data["value"][index]["fields"]["roomId"]
      })
    }
    return {result: loadingStateEnum.success, data: resultArray, nextLink: data["@odata.nextLink"]}
  } else {
    return {result: loadingStateEnum.failed}
  }
}