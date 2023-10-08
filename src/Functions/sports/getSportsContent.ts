import store from "../../Redux/store"
import { loadingStateEnum } from "../../types"
import getFileWithShareID from "../Ultility/getFileWithShareID"
import callMsGraph from "../Ultility/microsoftAssets"

export default async function getSportsContent(): Promise<{result: loadingStateEnum, sports?: sportPost[]}> {
    const result = await callMsGraph(`https://graph.microsoft.com/v1.0/sites/${store.getState().paulyList.siteId}/lists/${store.getState().paulyList.sportsApprovedSubmissionsListId}/items?expand=fields`)
    if (result.ok){
      const dataResult = await result.json()
      if (dataResult["value"].length !== undefined){
        var newSportsPosts: sportPost[] = []
        for (let index = 0; index < dataResult["value"].length; index++){
          const shareResult = await getFileWithShareID(dataResult["value"][index]["fields"]["fileId"])
          if (shareResult.result === loadingStateEnum.success && shareResult.contentType !== undefined && shareResult.url !== undefined) {
            newSportsPosts.push({
              caption: dataResult["value"][index]["fields"]["caption"],
              fileID: shareResult.url,
              fileType: shareResult.contentType
            })
          } else {
            return {result: loadingStateEnum.failed}
          }
        }
        return {result: loadingStateEnum.success, sports: newSportsPosts}
      } else {
        return {result: loadingStateEnum.failed}
      }
    } else {
        return {result: loadingStateEnum.failed}
    }
  }