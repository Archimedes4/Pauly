import { loadingStateEnum, resourceResponce } from "../types";
import getResource from "./getResources";
import callMsGraph from "./ultility/microsoftAssets";

//Id group id
export async function getChannels(id: string): Promise<{result: loadingStateEnum.success, data: channelType[]}|{result: loadingStateEnum.failed}> {
  const getResult = await callMsGraph(
    `https://graph.microsoft.com/v1.0/teams/${id}/allChannels`,
  );
  const channelResult: channelType[] = [];
  if (getResult.ok) {
    const getResultData = await getResult.json();
    let channelGetResultsAwait: Promise<{
      result: resourceResponce;
      itemId?: string | undefined;
    }>[] = []
    for (
      let indexResult = 0;
      indexResult < getResultData.value.length;
      indexResult += 1
    ) {
      channelGetResultsAwait.push(getResource(
        id,
        getResultData.value[indexResult].id,
      ));
    }
    const channelGetResults: {
      result: resourceResponce;
      itemId?: string | undefined;
    }[] = await Promise.all(channelGetResultsAwait);
    for (let index = 0; index < channelGetResults.length; index += 1) {
      channelResult.push({
        id: getResultData.value[index].id,
        selected: channelGetResults[index].result === resourceResponce.found,
        loading: false,
        displayName: getResultData.value[index].displayName,
        error: channelGetResults[index].result === resourceResponce.failed,
      });
    }
    return {result: loadingStateEnum.success, data: channelResult};
  } else {
    return {result: loadingStateEnum.failed};
  }
}