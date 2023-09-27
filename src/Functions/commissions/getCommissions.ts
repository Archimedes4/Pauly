import store from "../../Redux/store"
import { loadingStateEnum } from "../../types"
import callMsGraph from "../Ultility/microsoftAssets"

function getFilter(startDate?: {date: Date, filter: "ge"|"le"}, endDate?: {date: Date, filter: "ge"|"le"}) {
  const startDateString = startDate?.date.toISOString().replace(/.\d+Z$/g, "Z")
  const endDateString = endDate?.date.toISOString().replace(/.\d+Z$/g, "Z")
  if (startDate || endDate) {
    var filter = "&$filter="
    if (startDate) {
      filter += `fields/startDate%20${startDate.filter}%20${startDateString}`
    }
    if (endDate) {
      filter += (startDate) ? `&fields/endDate%20le%20${endDateString}`:`fields/endDate%20${endDate.filter}%20${endDateString}`
    }
  } else {
    return ""
  }
}

export default async function getCommissions(startDate?: {date: Date, filter: "ge"|"le"}, endDate?: {date: Date, filter: "ge"|"le"}, claimed?: boolean): Promise<{result: loadingStateEnum, data?: commissionType[], nextLink?: string}>{
  if (claimed === true) {
    const result = await getUnclaimedCommissions()
    return {result: result.result, data: result.data}
  } else {
    const filter = getFilter(startDate, endDate)
    const result = await callMsGraph(`https://graph.microsoft.com/v1.0/sites/${store.getState().paulyList.siteId}/lists/${store.getState().paulyList.commissionListId}/items?expand=fields${filter}`)
    if (result.ok) {
      const data = await result.json()
      if (data["value"] !== null && data["value"] !== undefined){
        var resultCommissions: commissionType[] = []
        for (let index = 0; index < data["value"].length; index++) {
          resultCommissions.push({
            itemId: data["value"][index]["id"],
            title: data["value"][index]["fields"]["Title"],
            startDate: new Date(data["value"][index]["fields"]["startDate"]),
            endDate: new Date(data["value"][index]["fields"]["endDate"]),
            points: data["value"][index]["fields"]["points"] as number,
            proximity: data["value"][index]["fields"]["proximity"] as number,
            commissionId: data["value"][index]["fields"]["commissionID"] as string,
            hidden: data["value"][index]["fields"]["hidden"],
            timed:  data["value"][index]["fields"]["timed"],
            maxNumberOfClaims:  data["value"][index]["fields"]["maxNumberOfClaims"],
            allowMultipleSubmissions:  data["value"][index]["fields"]["allowMultipleSubmissions"],
            value:  data["value"][index]["fields"]["hidden"] - 1
          })
        }
        return {result: loadingStateEnum.success, data: resultCommissions, nextLink: data["@odata.nextLink"]}
      } else {
        return {result: loadingStateEnum.failed}
      }
    } else {
      return {result: loadingStateEnum.failed}
    }
  }
}


//Get Claimed Commmissions

//Gets points when given an array of commission ids
async function getCommissionsBatch(commissions: string[]): Promise<{result: loadingStateEnum, data?: commissionType[]}> {
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
    var commissionsResult: commissionType[] = []
    for (var requestIndex = 0; requestIndex < data["responses"].length; requestIndex++) {
      if (data["responses"][requestIndex].status === 200) {
        for (var index = 0; index < data["responses"][requestIndex]["body"]["value"].length; index++) {
          commissionsResult.push({
            itemId: data["value"][index]["id"],
            title: data["value"][index]["fields"]["Title"],
            startDate: new Date(data["value"][index]["fields"]["startDate"]),
            endDate: new Date(data["value"][index]["fields"]["endDate"]),
            points: data["value"][index]["fields"]["points"] as number,
            proximity: data["value"][index]["fields"]["proximity"] as number,
            commissionId: data["value"][index]["fields"]["commissionID"] as string,
            hidden: data["value"][index]["fields"]["hidden"],
            timed:  data["value"][index]["fields"]["timed"],
            maxNumberOfClaims:  data["value"][index]["fields"]["maxNumberOfClaims"],
            allowMultipleSubmissions:  data["value"][index]["fields"]["allowMultipleSubmissions"],
            value:  data["value"][index]["fields"]["hidden"] - 1
          })
        }
      } else {
        return {result: loadingStateEnum.failed, data: commissionsResult}
      }
    }
    return {result: loadingStateEnum.success, data: commissionsResult}
  } else {
    return {result: loadingStateEnum.failed}
  }
}

export async function getUnclaimedCommissions(): Promise<{result: loadingStateEnum, data?: commissionType[]}> {
  var nextUrl =  `https://graph.microsoft.com/v1.0/sites/${store.getState().paulyList.siteId}/lists/${store.getState().paulyList.commissionSubmissionsListId}/items?expand=fields&$filter=fields/userId%20eq%20'${store.getState().microsoftProfileData.id}'%20and%20fields/submissionApproved%20ne%20false`
  var commissions: string[] = []
  var outCommissions: commissionType[] = []
  while (nextUrl !== "") {
    const submissionResultClaimed = await callMsGraph(nextUrl)
    if (!submissionResultClaimed.ok) {return {result: loadingStateEnum.failed}}
    const submissionResultClaimedData = await submissionResultClaimed.json()
    for (var index = 0; index < submissionResultClaimedData["value"].length; index++){
      if (submissionResultClaimedData["value"][0]["fields"]["submissionApproved"] === true){
        commissions.push(submissionResultClaimedData["value"][0]["fields"]["commissionId"])
        if (commissions.length >= 20) {
          const batchResult = await getCommissionsBatch(commissions)
          if (batchResult.result !== loadingStateEnum.success || batchResult.data === undefined) {
            return {result: loadingStateEnum.failed}
          } else {
            outCommissions = [...outCommissions, ...batchResult.data]
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
        const batchResult = await getCommissionsBatch(commissions)
          if (batchResult.result !== loadingStateEnum.success || batchResult.data === undefined) {
            return {result: loadingStateEnum.failed}
          } else {
            outCommissions = [...outCommissions, ...batchResult.data]
          }
      }
    }
  }
  return {result: loadingStateEnum.success, data: outCommissions}
}