import store from "../Redux/store";
import { loadingStateEnum } from "../types";
import callMsGraph from "./microsoftAssets";

export default async function getDressCode(dressCodeId: string): Promise<{result: loadingStateEnum, data?: dressCodeType}> {
  const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + store.getState().paulyList.siteId + "/lists/" + store.getState().paulyList.dressCodeListId + `/items?expand=fields&$filter=fields/dressCodeId%20eq%20'${dressCodeId}'`)
  if (result.ok) {
    const data = await result.json()
    if (data["value"].length !== 1){ 
      return {result: loadingStateEnum.failed}
    }

    try {
      const dressCodeData: dressCodeDataType[] = JSON.parse(data["value"][0]["fields"]["dressCodeData"])
      const dressCodeIncentivesData: dressCodeIncentiveType[] = JSON.parse(data["value"][0]["fields"]["dressCodeIncentivesData"])
      return {result: loadingStateEnum.success, data: {
        name: data["value"][0]["fields"]["dressCodeName"],
        id: data["value"][0]["fields"]["dressCodeId"],
        dressCodeData: dressCodeData,
        dressCodeIncentives: dressCodeIncentivesData
      }}
    } catch {
      return {result: loadingStateEnum.failed}
    }
  } else {
    return {result: loadingStateEnum.failed}
  }
}