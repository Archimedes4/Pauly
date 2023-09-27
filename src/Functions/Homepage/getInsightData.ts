import { loadingStateEnum } from "../../types";
import callMsGraph from "../Ultility/microsoftAssets";

declare global {
  type resourceType = {
    webUrl: string,
    id: string,
    title: string,
    type: string
  }
  type insightResult = {
    userState: loadingStateEnum,
    trendingState: loadingStateEnum,
    userData: resourceType[],
    trendingData: resourceType[]
  }
}

export default async function getInsightData(): Promise<insightResult> {
  const usedResult = await callMsGraph("https://graph.microsoft.com/v1.0/me/insights/used")
  var userOutData: resourceType[] = []
  var userState: loadingStateEnum = loadingStateEnum.loading
  if (usedResult.ok) {
    const userData = await usedResult.json()
    for (var index = 0; index < userData["value"].length; index++){
      userOutData.push({
        webUrl: userData["value"][index]["resourceReference"]["webUrl"],
        id: userData["value"][index]["resourceReference"]["id"],
        title: userData["value"][index]["resourceVisualization"]["title"],
        type: userData["value"][index]["resourceVisualization"]["type"]
      })
    }
    userState = loadingStateEnum.success
  } else {
    userState = loadingStateEnum.failed
  }
  const trendingResult = await callMsGraph("https://graph.microsoft.com/v1.0/me/insights/trending")
  const trendingOutData: resourceType[] = []
  var trendingState = loadingStateEnum.loading
  if (trendingResult.ok) {
    const trendingData = await trendingResult.json()
    for (var index = 0; index < trendingData["value"].length; index++){
      trendingOutData.push({
        webUrl: trendingData["value"][index]["resourceReference"]["webUrl"],
        id: trendingData["value"][index]["resourceReference"]["id"],
        title: trendingData["value"][index]["resourceVisualization"]["title"],
        type: trendingData["value"][index]["resourceVisualization"]["title"]
      })
    }
    trendingState = loadingStateEnum.success
  } else {
    trendingState = loadingStateEnum.failed
  }
  return {
    userState: userState,
    trendingState: trendingState,
    userData: userOutData,
    trendingData: trendingOutData
  }
}