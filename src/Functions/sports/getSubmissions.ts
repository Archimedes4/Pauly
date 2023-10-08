//Andrew Mainella
//October 7 2023
//Pauly get submissions for sports

import store from "../../Redux/store"
import { loadingStateEnum } from "../../types"
import callMsGraph from "../Ultility/microsoftAssets"

export default async function getSubmissions(): Promise<{result: loadingStateEnum, data?: mediaSubmissionType[]}> {
  const result = await callMsGraph(`https://graph.microsoft.com/v1.0/sites/${store.getState().paulyList.siteId}/lists/${store.getState().paulyList.sportsSubmissionsListId}/items?expand=fields`)
  if (result.ok){
    const data = await result.json()
    var newMediaSubmissions: mediaSubmissionType[] = []
    if (data["value"] !== undefined){
      for(let index = 0; index < data["value"].length; index++){
        newMediaSubmissions.push({
          Title: data["value"][index]["fields"]["Title"],
          user: data["value"][index]["fields"]["User"],
          submissionId: data["value"][index]["fields"]["submissionId"],
          accepted: data["value"][index]["fields"]["accepted"],
          fileId: data["value"][index]["fields"]["fileId"],
          itemID:  data["value"][index]["id"],
          selectedSportId: data["value"][index]["fields"]["selectedSportId"],
          selectedTeamId: data["value"][index]["fields"]["selectedTeamId"],
          reviewed: data["value"][index]["fields"]["reviewed"]
        })
      }
      return {result: loadingStateEnum.success, data: newMediaSubmissions}
    } else {
      return {result: loadingStateEnum.failed}
    }
  } else {
    return {result: loadingStateEnum.failed}
  }
}