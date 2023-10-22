import store from '../../Redux/store';
import { loadingStateEnum } from '../../types';
import callMsGraph from '../Ultility/microsoftAssets';

export async function getSports(): Promise<{
  result: loadingStateEnum;
  data?: sportType[];
}> {
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${
      store.getState().paulyList.siteId
    }/lists/${
      store.getState().paulyList.sportsListId
    }/items?expand=fields($select=sportName,sportId,sportSvg)&$select=id`,
  );
  if (result.ok) {
    const data = await result.json();
    if (data.value !== null && data.value !== undefined) {
      const resultData: sportType[] = [];
      for (let index = 0; index < data.value.length; index += 1) {
        resultData.push({
          name: data.value[index].fields.sportName,
          id: data.value[index].fields.sportId,
          svgData: data.value[index].fields.sportSvg,
        });
      }
      return { result: loadingStateEnum.success, data: resultData };
    }
    return { result: loadingStateEnum.failed };
  }
  return { result: loadingStateEnum.failed };
}

export async function getSportsTeams(
  sportId: string,
): Promise<{ result: loadingStateEnum; data?: sportTeamType[] }> {
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${
      store.getState().paulyList.siteId
    }/lists/${sportId}/items?expand=fields`,
  );
  if (result.ok) {
    const data = await result.json();
    if (data.value !== null && data.value !== undefined) {
      const resultData: sportTeamType[] = [];
      for (let index = 0; index < data.value.length; index += 1) {
        resultData.push({
          teamName: data.value[index].fields.teamName,
          season: data.value[index].fields.season,
          teamId: data.value[index].fields.teamId,
        });
      }
      return { result: loadingStateEnum.success, data: resultData };
    }
    return { result: loadingStateEnum.failed };
  }
  return { result: loadingStateEnum.failed };
}
