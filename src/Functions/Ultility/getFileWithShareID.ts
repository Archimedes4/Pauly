import { loadingStateEnum } from './../../types';
import { dataContentTypeOptions } from "../../types";
import callMsGraph from "./microsoftAssets"

export default async function getFileWithShareID(shareID: string): Promise<{result: loadingStateEnum, url?: string; contentType?: dataContentTypeOptions }> {
  const result = await callMsGraph("https://graph.microsoft.com/v1.0/shares/" + shareID + "/driveItem")
  if (result.ok){
    const data = await result.json()
    if (data["@microsoft.graph.downloadUrl"] !== undefined && data["@microsoft.graph.downloadUrl"] !== null){
      if (data["file"]["mimeType"] === "image/gif") {
        return {result: loadingStateEnum.success, url: data["@microsoft.graph.downloadUrl"], contentType: dataContentTypeOptions.image}
      } else if (data["file"]["mimeType"] === "video/mp4") {
        return {result: loadingStateEnum.success, url: data["@microsoft.graph.downloadUrl"], contentType: dataContentTypeOptions.video}
      } else if (data["file"]["mimeType"] === "application/vnd.openxmlformats-officedocument.presentationml.presentation"){
        return {result: loadingStateEnum.success, url: data["@microsoft.graph.downloadUrl"], contentType: dataContentTypeOptions.pdf}
      } else {
        console.log("Failed Here")
        return {result: loadingStateEnum.failed}
      }
    } else {
      return {result: loadingStateEnum.failed}
    }
  } else {
    return {result: loadingStateEnum.failed}
  }
}