import store from "../../Redux/store"
import { loadingStateEnum } from "../../types"
import callMsGraph from "../Ultility/microsoftAssets"

export default async function getCommission(commissionId: string): Promise<{result: loadingStateEnum, data?: commissionType}> {
  const result = await callMsGraph(`https://graph.microsoft.com/v1.0/sites/${store.getState().paulyList.siteId}/lists/${store.getState().paulyList.commissionListId}/items?expand=fields&$filter=fields/commissionID%20eq%20'${commissionId}'`)
  if (result.ok) {
    const data = await result.json()
    if (data["value"].length !== 1){
      //Not found
      return {result: loadingStateEnum.failed}
    }
    const dataResult: commissionType = {
      itemId: data["value"][0]["id"],
      title: data["value"][0]["fields"]["Title"],
      startDate: new Date(data["value"][0]["fields"]["startDate"]),
      endDate: new Date(data["value"][0]["fields"]["endDate"]),
      points: data["value"][0]["fields"]["points"],
      hidden: data["value"][0]["fields"]["hidden"],
      commissionId: data["value"][0]["fields"]["commissionID"],
      proximity: data["value"][0]["fields"]["proximity"],
      coordinateLat: data["value"][0]["fields"]["coordinateLat"],
      coordinateLng: data["value"][0]["fields"]["coordinateLng"],
      postData: {
        teamId: data["value"][0]["fields"]["postTeamId"],
        channelId: data["value"][0]["fields"]["postChannelId"],
        postId: data["value"][0]["fields"]["postId"]
      },
      timed: false,
      maxNumberOfClaims: 0,
      allowMultipleSubmissions: false,
      value: data["value"][0]["fields"]["value"] - 1
    }
    return {result: loadingStateEnum.success, data: dataResult}
  } else {
    return {result: loadingStateEnum.failed}
  }
}