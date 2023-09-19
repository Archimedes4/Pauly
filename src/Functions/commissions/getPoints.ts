import store from "../../Redux/store";
import { loadingStateEnum } from "../../types";
import callMsGraph from "../Ultility/microsoftAssets";

//Gets points when given an array of commission ids
async function getPointsBatch(commissions: string[]): Promise<{result: loadingStateEnum, points: number}> {
  console.log(commissions)
  var outputRequests: {id: string, method: string, url: string}[] = []
  for (var index = 0; index < commissions.length; index++) {
    outputRequests.push({
      id: (index + 1).toString(),
      method: "GET",
      url: `/sites/${store.getState().paulyList.siteId}/lists/${store.getState().paulyList.commissionListId}/items?$expand=fields&$filter=fields/commissionID%20eq%20'${commissions[index]}' `
      //?$expand=fields&$filter=fields/commissionID%20eq%20'${commissions[index]}' 
    })
  }
  const batchData = {
    "requests":outputRequests
  }
  var resourceHeader = new Headers()
  resourceHeader.append("Accept", "application/json")
  const result = await callMsGraph("https://graph.microsoft.com/v1.0/$batch", "POST", undefined, JSON.stringify(batchData), undefined, undefined, resourceHeader)
  if (result.ok) {
    const data = await result.json()
    var pointsResult = 0
    for (var requestIndex = 0; requestIndex < data["responses"].length; requestIndex++) {
      if (data["responses"][requestIndex].status === 200) {
        for (var index = 0; index < data["responses"][requestIndex]["body"]["value"].length; index++) {
          pointsResult += data["responses"][requestIndex]["body"]["value"][index]["fields"]["points"]
        }
      } else {
        return {result: loadingStateEnum.failed, points: 0}
      }
    }
    return {result: loadingStateEnum.success, points: pointsResult}
  } else {
    return {result: loadingStateEnum.failed, points: 0}
  }
}

export default async function getPoints(): Promise<{result: loadingStateEnum, data?: number}> {
  var nextUrl =  `https://graph.microsoft.com/v1.0/sites/${store.getState().paulyList.siteId}/lists/${store.getState().paulyList.commissionSubmissionsListId}/items?expand=fields&$filter=fields/userId%20eq%20'${store.getState().microsoftProfileData.id}'%20and%20fields/submissionApproved%20ne%20false`
  var points: number = 0
  var commissions: string[] = []
  while (nextUrl !== "") {
    const submissionResultClaimed = await callMsGraph(nextUrl)
    if (!submissionResultClaimed.ok) {return {result: loadingStateEnum.failed}}
    const submissionResultClaimedData = await submissionResultClaimed.json()
    for (var index = 0; index < submissionResultClaimedData["value"].length; index++){
      if (submissionResultClaimedData["value"][0]["fields"]["submissionApproved"] === true){
        commissions.push(submissionResultClaimedData["value"][0]["fields"]["commissionId"])
        if (commissions.length >= 20) {
          const batchResult = await getPointsBatch(commissions)
          if (batchResult.result !== loadingStateEnum.success) {
            return {result: loadingStateEnum.failed}
          } else {
            points += batchResult.points
          }
          commissions = []
        }
      }
    }
    if (submissionResultClaimedData["@odata.nextLink"] !== undefined) {
      nextUrl = submissionResultClaimedData["@odata.nextLink"]
    } else {
      nextUrl = ""
      if (commissions.length !== 0) {
        const batchResult = await getPointsBatch(commissions)
          if (batchResult.result !== loadingStateEnum.success) {
            return {result: loadingStateEnum.failed}
          } else {
            points += batchResult.points
          }
      }
    }
  }
  return {result: loadingStateEnum.success, data: points}
}