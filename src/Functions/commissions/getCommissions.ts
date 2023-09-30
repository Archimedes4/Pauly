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

async function getSubmissions(commissionIds: string[]): Promise<{result: loadingStateEnum, data?: {claimedCount: number, submissionsCount: number, reviewedCount: number, commissionId: string}[]}> {
  var outputRequests: {id: string, method: string, url: string}[][] = [[]]
  for (var index = 0; index < commissionIds.length; index++) {
    outputRequests[Math.floor(index/20)].push({
      id: (index + 1).toString(),
      method: "GET",
      url: `/sites/${store.getState().paulyList.siteId}/lists/${store.getState().paulyList.commissionSubmissionsListId}/items?expand=fields(select=commissionId,submissions)`
    })
    if ((index%20) === 0 ) {
      outputRequests.push([])
    }
  }
  var outputMap = new Map<string, {claimCount: number, submissionsCount: number, reviewedCount: number}>()
  for (var index = 0; outputRequests.length < index; index++) {
    const requestData = {
      "requests":outputRequests[index]
    }
    const result = await callMsGraph(`https://graph.microsoft.com/v1.0/sites/${store.getState().paulyList.siteId}/lists/${store.getState().paulyList.commissionListId}/items`, "POST", undefined, JSON.stringify(requestData))
    if (result.ok) {
      const data = await result.json()
      for (var responseIndex = 0; responseIndex < data["responses"].length; responseIndex++) {
        if (data["responses"][responseIndex]["status"] === 200) {
          for (var dataIndex = 0; dataIndex < data["respone"][index]["body"].length; dataIndex++) {
            if (data["respone"][index]["body"]["@odata.nextLink"] !== undefined) {
              if (outputRequests[outputRequests.length - 1].length < 20) {
                outputRequests[outputRequests.length - 1].push({
                  id: outputRequests[outputRequests.length - 1].length.toString(),
                  method: "GET",
                  url: data["respone"][index]["body"]["@odata.nextLink"]
                })
              } else {
                outputRequests.push([])
                outputRequests[outputRequests.length - 1].push({
                  id: outputRequests[outputRequests.length - 1].length.toString(),
                  method: "GET",
                  url: data["respone"][index]["body"]["@odata.nextLink"]
                })
              }
            }
            for (var valueIndex = 0; valueIndex < data["respone"][index]["body"]["value"].length; valueIndex++) {
              if (outputMap.has(data["respone"][index]["body"]["value"][valueIndex]["commissionId"])) {
                outputMap.get(data["respone"][index]["body"]["value"][valueIndex]["commissionId"])
              } else {
                const subApproved = data["respone"][index]["body"]["value"][valueIndex]["submissionApproved"]
                const subReviewed = data["respone"][index]["body"]["value"][valueIndex]["submissionReviewed"]
                outputMap.set(data["respone"][index]["body"]["value"][valueIndex]["commissionId"], {})
              }
            }
          }
        } else {
          return {result: loadingStateEnum.failed}
        }
      }
    } else {
      return {result: loadingStateEnum.failed}
    }
  }
}

export default async function getCommissions(startDate?: {date: Date, filter: "ge"|"le"}, endDate?: {date: Date, filter: "ge"|"le"}, claimed?: boolean): Promise<{result: loadingStateEnum, data?: commissionType[], nextLink?: string}> {
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
            startDate: data["value"][index]["fields"]["startDate"],
            endDate: data["value"][index]["fields"]["endDate"],
            claimCount: 0,
            submissionsCount: 0,
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


type unclaimedCommissionSubmissionType = {
  commissionId: string
  submissions: number
}

//Get Claimed Commmissions

//Gets points when given an array of commission ids
async function getCommissionsBatch(commissions: unclaimedCommissionSubmissionType[]): Promise<{result: loadingStateEnum, data?: commissionType[]}> {
  var outputRequests: {id: string, method: string, url: string}[] = []
  for (var index = 0; index < commissions.length; index++) {
    outputRequests.push({
      id: (index + 1).toString(),
      method: "GET",
      url: `/sites/${store.getState().paulyList.siteId}/lists/${store.getState().paulyList.commissionListId}/items?$expand=fields&$filter=fields/commissionID%20eq%20'${commissions[index]}' `
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
            itemId: data["responses"][requestIndex]["body"]["value"][index]["id"],
            title: data["responses"][requestIndex]["body"]["value"][index]["fields"]["Title"],
            startDate: data["responses"][requestIndex]["body"]["value"][index]["fields"]["startDate"],
            endDate: data["responses"][requestIndex]["body"]["value"][index]["fields"]["endDate"],
            submissionsCount: commissions[parseInt(data["responses"][requestIndex]["id"]) - 1].submissions,
            claimCount: 0,
            reviewedCount: 0,//TO DO fix
            points: data["responses"][requestIndex]["body"]["value"][index]["fields"]["points"] as number,
            proximity: data["responses"][requestIndex]["body"]["value"][index]["fields"]["proximity"] as number,
            commissionId: data["responses"][requestIndex]["body"]["value"][index]["fields"]["commissionID"] as string,
            hidden: data["responses"][requestIndex]["body"]["value"][index]["fields"]["hidden"],
            timed:  data["responses"][requestIndex]["body"]["value"][index]["fields"]["timed"],
            maxNumberOfClaims:  data["responses"][requestIndex]["body"]["value"][index]["fields"]["maxNumberOfClaims"],
            allowMultipleSubmissions:  data["responses"][requestIndex]["body"]["value"][index]["fields"]["allowMultipleSubmissions"],
            value:  data["responses"][requestIndex]["body"]["value"][index]["fields"]["hidden"] - 1
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
  //The first value in the map is the commission id and the second is the submissions count b/c all are unclaimed
  var commissionsMap = new Map<string, number>()
  while (nextUrl !== "") {
    const submissionResultClaimed = await callMsGraph(nextUrl)
    if (!submissionResultClaimed.ok) {return {result: loadingStateEnum.failed}}
    const submissionResultClaimedData = await submissionResultClaimed.json()
    for (var index = 0; index < submissionResultClaimedData["value"].length; index++){
      if (submissionResultClaimedData["value"][index]["fields"]["submissionApproved"] === false){
        if (commissionsMap.has(submissionResultClaimedData["value"][index]["fields"]["commissionId"])) {
          const count = commissionsMap.get(submissionResultClaimedData["value"][index]["fields"]["commissionId"])
          if (count !== undefined) {
            commissionsMap.set(submissionResultClaimedData["value"][index]["fields"]["commissionId"], count + 1)
          }
        } else {
          commissionsMap.set(submissionResultClaimedData["value"][index]["fields"]["commissionId"],  1)
        }
      }
    }
    if (submissionResultClaimedData["@odata.nextLink"] !== undefined) {
      nextUrl = submissionResultClaimedData["@odata.nextLink"]
    } else {
      nextUrl = ""
    }
  }
  const commissionsBatchData: unclaimedCommissionSubmissionType[][] = [[]]
  var batchIndex = 0
  commissionsMap.forEach((value, key) => {
    commissionsBatchData[batchIndex].push({
      commissionId: key,
      submissions: value
    })
    if (commissionsBatchData[batchIndex].length >= 20) {
      commissionsBatchData.push([])
      batchIndex++
    }
  })

  var outCommissions: commissionType[] = []
  for (var index = 0; index < commissionsBatchData.length; index++) {
    const result = await getCommissionsBatch(commissionsBatchData[index])
    if (result.result === loadingStateEnum.success && result.data !== undefined) {
      outCommissions = [...outCommissions, ...result.data]
    } else {
      return {result: loadingStateEnum.failed}
    }
  }
  return {result: loadingStateEnum.success, data: outCommissions}
}