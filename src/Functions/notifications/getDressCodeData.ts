import store from '../../Redux/store';
import { loadingStateEnum } from '../../types';
import callMsGraph from '../ultility/microsoftAssets';

export default async function getDressCodeData(): Promise<{
  result: loadingStateEnum;
  data?: dressCodeType[];
}> {
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${
      store.getState().paulyList.siteId
    }/lists/${
      store.getState().paulyList.dressCodeListId
    }/items?expand=fields($select=dressCodeName,dressCodeId,dressCodeData)&$select=id`,
  );
  if (result.ok) {
    const data = await result.json();
    const newDressCodes: dressCodeType[] = [];
    for (let index = 0; index < data.value.length; index += 1) {
      try {
        newDressCodes.push({
          name: data.value[index].fields.dressCodeName,
          id: data.value[index].fields.dressCodeId,
          listId: data.value[index].id,
          dressCodeData: JSON.parse(data.value[index].fields.dressCodeData),
          dressCodeIncentives: [],
        });
      } catch {
        continue;
      }
    }
    return { result: loadingStateEnum.success, data: newDressCodes };
  }
  return { result: loadingStateEnum.failed };
}
