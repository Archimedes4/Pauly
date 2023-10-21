import store from "../../Redux/store"
import { loadingStateEnum } from "../../types"
import callMsGraph from "../Ultility/microsoftAssets"

export default async function getDressCodeData(): Promise<{result: loadingStateEnum, data?: dressCodeType[]}> {
  const result = await callMsGraph(`https://graph.microsoft.com/v1.0/sites/${store.getState().paulyList.siteId}/lists/${store.getState().paulyList.dressCodeListId}/items?expand=fields`)
  if (result.ok) {
    const data = await result.json()
    let newDressCodes: dressCodeType[] = []
    for (let index = 0; index < data["value"].length; index++) {
      try{
        newDressCodes.push({
          name: data["value"][index]["fields"]["dressCodeName"],
          id: data["value"][index]["fields"]["dressCodeId"],
          dressCodeData: JSON.parse(data["value"][index]["fields"]["dressCodeData"]),
          dressCodeIncentives: []
        })
      } catch {}
    }
    return {result: loadingStateEnum.success, data: newDressCodes}
  } else {
    return {result: loadingStateEnum.failed}
  }
}