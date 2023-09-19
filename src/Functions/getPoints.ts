import store from "../Redux/store";
import { loadingStateEnum } from "../types";
import callMsGraph from "./Ultility/microsoftAssets";

export default async function getPoints(): Promise<{result: loadingStateEnum, data?: number}> {
  var nextUrl =  `https://graph.microsoft.com/v1.0/sites/${store.getState().paulyList.siteId}/lists/${store.getState().paulyList.commissionSubmissionsListId}/items?expand=fields&$filter=fields/userId%20eq%20'${store.getState().microsoftProfileData.id}'%20and%20fields/submissionApproved%20eq%20true`
  var points: number = 0
  while (nextUrl !== "") {
    const submissionResultClaimed = await callMsGraph(nextUrl)
    if (!submissionResultClaimed.ok) {return {result: loadingStateEnum.failed}}
    const submissionResultClaimedData = await submissionResultClaimed.json()
    for (var index = 0; index < submissionResultClaimedData["value"]; index++){
      if (submissionResultClaimedData["value"][0]["fields"]["submissionApproved"] === true){
        points += submissionResultClaimedData["value"][0]["fields"]["points"]
      }
    }
    if (submissionResultClaimedData["@odata.nextLink"] !== undefined) {
      nextUrl = submissionResultClaimedData["@odata.nextLink"]
    } else {
      nextUrl = ""
    }
  }
  return {result: loadingStateEnum.success, data: points}
}