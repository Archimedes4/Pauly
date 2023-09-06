import store from "../../Redux/store"
import callMsGraph from "../Ultility/microsoftAssets"
import { loadingStateEnum } from "../../types"
import { paulyDataSlice } from "../../Redux/reducers/paulyDataReducer"

export default async function getCurrentPaulyData(siteId: string): Promise<loadingStateEnum> {
  const result = await callMsGraph("https://graph.microsoft.com/v1.0/sites/" + siteId + "/lists/" + store.getState().paulyList.paulyDataListId + "/items/1/fields")
  if (result.ok){
    const data = await result.json()
    if (data["animationSpeed"] !== undefined && data["message"] !== undefined && data["powerpointId"] !== undefined) {
      const fileResult = await callMsGraph("https://graph.microsoft.com/v1.0/shares/" + data["powerpointId"] + "/driveItem/content?format=pdf")
      if (fileResult.ok){
        const dataBlob = await fileResult.blob()
        const urlOut = URL.createObjectURL(dataBlob)
        store.dispatch(paulyDataSlice.actions.setPaulyData({powerpointId: urlOut, message: data["message"], animationSpeed: data["animationSpeed"]}))
        return loadingStateEnum.success
      } else {
        return loadingStateEnum.failed
      }
    } else {
      return loadingStateEnum.failed
    }
  } else {
    return loadingStateEnum.failed
  }
}