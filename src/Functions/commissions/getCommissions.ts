import store from "../../Redux/store"
import { loadingStateEnum } from "../../types"
import callMsGraph from "../Ultility/microsoftAssets"

export default async function getCommissions(): Promise<{result: loadingStateEnum, data?: commissionType[], nextLink?: string}>{
  const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + store.getState().paulyList.siteId + "/lists/" + store.getState().paulyList.commissionListId + "/items?expand=fields")
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