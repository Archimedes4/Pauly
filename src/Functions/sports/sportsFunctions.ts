import store from "../../Redux/store"
import { loadingStateEnum } from "../../types"
import callMsGraph from "../Ultility/microsoftAssets"

export async function getSports(): Promise<{result: loadingStateEnum, data?: sportType[]}> {
  const result = await callMsGraph(`https://graph.microsoft.com/v1.0/sites/${store.getState().paulyList.siteId}/lists/${store.getState().paulyList.sportsListId}/items?expand=fields($select=sportName,sportId)&$select=id`)
  if (result.ok) {
    const data = await result.json()
    if (data["value"] !== null && data["value"] !== undefined){
      var resultData: sportType[] = []
      for (let index = 0; index < data["value"].length; index++) {
        resultData.push({
          name: data["value"][index]["fields"]["sportName"],
          id: data["value"][index]["fields"]["sportId"]
        })
      }
      return {result: loadingStateEnum.success, data: resultData}
    } else {
      return {result: loadingStateEnum.failed}
    }
  } else {
    return {result: loadingStateEnum.failed}
  }
}

export async function getSportsTeams(sportId: string): Promise<{result: loadingStateEnum, data?: sportTeamType[]}> {
  const result = await callMsGraph(`https://graph.microsoft.com/v1.0/sites/${store.getState().paulyList.siteId}/lists/${sportId}/items?expand=fields`)
  if (result.ok) {
    const data = await result.json()
    if (data["value"] !== null && data["value"] !== undefined){
      var resultData: sportTeamType[] = []
      for (let index = 0; index < data["value"].length; index++) {
        resultData.push({
          teamName: data["value"][index]["fields"]["TeamName"],
          season: data["value"][index]["fields"]["Season"],
          teamID: data["value"][index]["fields"]["teamID"]
        })
      }
      return {result: loadingStateEnum.success, data: resultData}
    } else {
      return {result: loadingStateEnum.failed}
    }
  } else {
    return {result: loadingStateEnum.failed}
  }
}