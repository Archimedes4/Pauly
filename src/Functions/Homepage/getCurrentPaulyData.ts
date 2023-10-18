
import store from "../../Redux/store"
import callMsGraph from "../Ultility/microsoftAssets"
import { loadingStateEnum } from "../../types"
import { paulyDataSlice } from "../../Redux/reducers/paulyDataReducer"
import { Buffer } from 'buffer';

export default async function getCurrentPaulyData() {
  const result = await callMsGraph(`https://graph.microsoft.com/v1.0/sites/${store.getState().paulyList.siteId}/lists/${store.getState().paulyList.paulyDataListId}/items/1/fields`)
  if (result.ok){
    const data = await result.json()
    // const sharingUrl = "https://onedrive.live.com/redir?resid=1231244193912!12&authKey=1201919!12921!1";
    // const base64Value: string = Buffer.from(sharingUrl).toString("base64");
    // const encodedUrl = "u!" + base64Value.trimEnd().replace('/','_').replace('+','-');
    // console.log(encodedUrl)
    if (data["animationSpeed"] !== undefined && data["message"] !== undefined && data["powerpointId"] !== undefined) {
      const fileResult = await callMsGraph(`https://graph.microsoft.com/v1.0/shares/${data["powerpointId"]}/driveItem`, "GET", undefined, [{key: "Prefer", value: "redeemSharingLink"}])//`https://graph.microsoft.com/v1.0/shares/${data["powerpointId"]}/root?$select=@microsoft.graph.downloadUrl`
      if (fileResult.ok){
        const fileData = await fileResult.json()
        const fetchFileResult = await callMsGraph(fileData["@microsoft.graph.downloadUrl"])
        if (fetchFileResult.ok) {
          const dataBlob = await fetchFileResult.blob()
          const urlOut = URL.createObjectURL(dataBlob)
          const outputResult = {powerpointBlob: urlOut, powerpointShare: data["powerpointId"], message: data["message"], animationSpeed: data["animationSpeed"], paulyDataState: loadingStateEnum.success}
          store.dispatch(paulyDataSlice.actions.setPaulyData(outputResult))
        } else {
          store.dispatch(paulyDataSlice.actions.setPaulyDataState(loadingStateEnum.failed))
        }
      } else {
        const fileData = await fileResult.json()
        console.log(fileData)
        store.dispatch(paulyDataSlice.actions.setPaulyDataState(loadingStateEnum.failed))
      }
    } else {
      store.dispatch(paulyDataSlice.actions.setPaulyDataState(loadingStateEnum.failed))
    }
  } else {
    store.dispatch(paulyDataSlice.actions.setPaulyDataState(loadingStateEnum.failed))
  }
}