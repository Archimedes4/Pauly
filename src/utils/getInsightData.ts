/*
  Andrew Mainella
  20 October 2023
  Pauly
  getInsightData.ts

  used to get insight files that are used on the notification page.
*/
import { loadingStateEnum } from '@constants';
import callMsGraph from './ultility/microsoftAssets';

export default async function getInsightData(): Promise<insightResult> {
  // Get used https://learn.microsoft.com/en-us/graph/api/insights-list-used?view=graph-rest-1.0&tabs=http
  const usedResult = await callMsGraph(
    'https://graph.microsoft.com/v1.0/me/insights/used?$select=resourceReference,resourceVisualization',
  );
  const userOutData: attachment[] = [];
  let userState: loadingStateEnum = loadingStateEnum.loading; // State of getting users data
  if (usedResult.ok) {
    // Check if result success
    const userData = await usedResult.json();
    for (let index = 0; index < userData.value.length; index += 1) {
      userOutData.push({
        webUrl: userData.value[index].resourceReference.webUrl,
        id: userData.value[index].resourceReference.id,
        title: userData.value[index].resourceVisualization.title,
        type: userData.value[index].resourceVisualization.type,
      });
    }
    userState = loadingStateEnum.success;
  } else {
    userState = loadingStateEnum.failed;
  }

  // Get trending https://learn.microsoft.com/en-us/graph/api/insights-list-trending?view=graph-rest-1.0&tabs=http
  const trendingResult = await callMsGraph(
    'https://graph.microsoft.com/v1.0/me/insights/trending?$select=resourceReference,resourceVisualization',
  );
  const trendingOutData: attachment[] = [];
  let trendingState = loadingStateEnum.loading; // state of getting trendings data
  if (trendingResult.ok) {
    const trendingData = await trendingResult.json();
    for (let index = 0; index < trendingData.value.length; index += 1) {
      trendingOutData.push({
        webUrl: trendingData.value[index].resourceReference.webUrl,
        id: trendingData.value[index].resourceReference.id,
        title: trendingData.value[index].resourceVisualization.title,
        type: trendingData.value[index].resourceVisualization.type,
      });
    }
    trendingState = loadingStateEnum.success;
  } else {
    trendingState = loadingStateEnum.failed;
  }
  return {
    userState,
    trendingState,
    userData: userOutData,
    trendingData: trendingOutData,
  };
}
