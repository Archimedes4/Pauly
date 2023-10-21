import store from "../../Redux/store";
import { loadingStateEnum } from "../../types";
import batchRequest from "../Ultility/batchRequest";
import callMsGraph from "../Ultility/microsoftAssets";

export default async function getRoster(teamId: string): Promise<{result: loadingStateEnum, data?: rosterType[]}> {
  const result = await callMsGraph(`https://graph.microsoft.com/v1.0/sites/${store.getState().paulyList.siteId}/lists/${teamId}/items?$expand=fields($select=playerId,position,playerNumber,posts,imageShareId)&$select=id`)
  if (result.ok) {
    const data = await result.json()
    const batchData: {id: string, method: "GET" | "POST", url: string}[][] = []
    let batchIndex = -1
    for (let index = 0; index < data["value"].length; index++) {
      if ((index % 20) === 0) {
        batchIndex++
        batchData.push([])
      }
      batchData[batchIndex].push({
        id: (index + 1 - (20 * batchIndex)).toString(),
        method: "GET",
        url: `/users/${data["value"][index]["fields"]["playerId"]}`
      })
    }
    const batchResult = await batchRequest(batchData)
    if (batchResult.result === loadingStateEnum.success && batchResult.data !== undefined) {
      const outUsers: microsoftUserType[] = []
      for (let index = 0; index < batchResult.data.length; index++) {
        if (batchResult.data[index].status === 200) { //TO DO check okay response code
          outUsers.push({
            id: batchResult.data[index].body["id"],
            displayName: batchResult.data[index].body["displayName"],
          })
        } else {
          return {result: loadingStateEnum.failed}
        }
      }
      let outputRosters: rosterType[] = []
      for (let index = 0; index < data["value"].length; index++) {
        const userData = outUsers.find((e) => {return e.id === data["value"][index]["fields"]["playerId"]})
        if (userData !== undefined) {
          outputRosters.push({
            name: userData.displayName,
            id: data["value"][index]["fields"]["playerId"],
            imageShareId: data["value"][index]["fields"]["imageShareId"],
            position: data["value"][index]["fields"]["position"],
            playerNumber: data["value"][index]["fields"]["playerNumber"],
            posts: (data["value"][index]["fields"]["posts"] !== undefined) ? JSON.parse(data["value"][index]["fields"]["posts"]):undefined
          })
        } else {
          return {result: loadingStateEnum.failed}
        }
      }
      return {result: loadingStateEnum.success, data: outputRosters}
    } else {
      return {result: loadingStateEnum.failed}
    }
  } else {
    return {result: loadingStateEnum.failed}
  }
}