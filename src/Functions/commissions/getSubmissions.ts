import store from "../../Redux/store";
import { loadingStateEnum, submissionTypeEnum } from "../../types";
import callMsGraph from "../Ultility/microsoftAssets";

export default async function getSubmissions(commissionId: string, submissionType: submissionTypeEnum): Promise<{result: loadingStateEnum, data?: submissionType[], nextLink?: string, count?: number}> {
  const filter: string = (submissionType === submissionTypeEnum.approved) ? "fields/submissionApproved%20ne%20false%20and%20":(submissionType === submissionTypeEnum.unApproved) ? "fields/submissionApproved%20eq%20false%20and%20":(submissionType === submissionTypeEnum.unReviewed) ? "fields/submissionReviewed%20eq%20false%20and%20":""
  const result = await callMsGraph(`https://graph.microsoft.com/v1.0/sites/${store.getState().paulyList.siteId}/lists/${store.getState().paulyList.commissionSubmissionsListId}/items?expand=fields&$filter=${filter}fields/commissionId%20eq%20'${commissionId}'`, "GET")
  if (result.ok) {
    const data = await result.json()

    //Get Users
    var batchRequests: {id: string, method: string, url: string}[][] = [] 
    var users: object = {}
    for (var index = 0; index < data["value"].length; index++) {
      if ((index%20) === 0) {
        batchRequests.push([])
      }
      batchRequests[Math.floor(index/20)].push({
        id: (index + 1).toString(),
        method: "GET",
        url: `/users/${data["value"][index]["fields"]["userId"]}?$select=id,displayName`
      })
    }
    for (var index = 0; index < batchRequests.length; index++) {
      const batchData = {
        "requests":batchRequests[index]
      }
      const batchHeaders = new Headers()
      batchHeaders.append("Accept", "application/json")
      const batchResult = await callMsGraph("https://graph.microsoft.com/v1.0/$batch", "POST", undefined, JSON.stringify(batchData))
      if (result.ok) {
        const batchResultData = await batchResult.json()
        for (var batchIndex = 0; batchIndex < batchResultData["responses"].length; batchIndex++) {
          if (batchResultData["responses"][batchIndex]["status"] === 200) {
            Object.defineProperty(users, batchResultData["responses"][batchIndex]["body"]["id"], {
              value: batchResultData["responses"][batchIndex]["body"]["displayName"]
            })
          } else {
            return {result: loadingStateEnum.failed}
          }
        }
      } else {
        return {result: loadingStateEnum.failed}
      }
    }

    //Return Output
    var output: submissionType[] = []
    for (var index = 0; index < data["value"].length; index++) {
      const name = users[data["value"][index]["fields"]["userId"]]
      if (name !== undefined){
        output.push({
          userName: name,
          submissionTime: new Date(data["value"][index]["fields"]["submittedTime"]),
          id: data["value"][index]["fields"]["submissionId"],
          itemId: data["value"][index]["id"],
          approved: data["value"][index]["fields"]["submissionApproved"],
          reviewed: data["value"][index]["fields"]["submissionReviewed"],
          submissionImage: (data["value"]["fields"]["submissionData"] !== undefined) ? JSON.parse(data["value"]["fields"]["submissionData"])["imageShare"]:undefined
        })
      } else {
        return {result: loadingStateEnum.failed}
      }
    }
    return {result: loadingStateEnum.success, data: output, nextLink: data["@odata.nextLink"], count: data["value"].length}
  } else {
    return {result: loadingStateEnum.failed}
  }
}