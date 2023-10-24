import store from '../../Redux/store';
import { loadingStateEnum } from '../../types';
import callMsGraph from '../ultility/microsoftAssets';

export default async function getSport(
  id: string,
): Promise<{ result: loadingStateEnum; data?: sportType; listId?: string }> {
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${
      store.getState().paulyList.siteId
    }/lists/${
      store.getState().paulyList.sportsListId
    }/items?$expand=fields&$filter=fields/sportId%20eq%20'${id}'`,
  );
  if (result.ok) {
    const data = await result.json();
    if (data.value.length === 1) {
      return {
        result: loadingStateEnum.success,
        data: {
          name: data.value[0].fields.sportName,
          id: data.value[0].fields.sportId,
          svgData: data.value[0].fields.sportSvg,
        },
        listId: data.value[0].fields.id,
      };
    }
    return { result: loadingStateEnum.failed };
  }
  return { result: loadingStateEnum.failed };
}
