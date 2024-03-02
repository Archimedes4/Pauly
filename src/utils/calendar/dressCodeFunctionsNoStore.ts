/*
  Pauly
  Andrew Mainella
  November 9 2023
  getDressCode.ts
*/

import { loadingStateEnum } from '@constants';
import { StoreType } from '@redux/store';
import callMsGraph from '../ultility/microsoftAssests/noStore';

export default async function getDressCode(
  dressCodeId: string,
  store: StoreType,
): Promise<
  | { result: loadingStateEnum.success; data: dressCodeType }
  | { result: loadingStateEnum.failed }
> {
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${
      store.getState().paulyList.siteId
    }/lists/${
      store.getState().paulyList.dressCodeListId
    }/items?expand=fields($select=dressCodeData,dressCodeIncentivesData,dressCodeName,dressCodeId)&$select=id&$filter=fields/dressCodeId%20eq%20'${dressCodeId}'`,
    store,
  );
  if (result.ok) {
    const data = await result.json();
    if (data.value.length !== 1) {
      return { result: loadingStateEnum.failed };
    }
    try {
      const dressCodeData: dressCodeDataType[] = JSON.parse(
        data.value[0].fields.dressCodeData,
      );
      const dressCodeIncentivesData: dressCodeIncentiveType[] = JSON.parse(
        data.value[0].fields.dressCodeIncentivesData,
      );
      return {
        result: loadingStateEnum.success,
        data: {
          name: data.value[0].fields.dressCodeName,
          id: data.value[0].fields.dressCodeId,
          itemId: data.value[0].id,
          dressCodeData,
          dressCodeIncentives: dressCodeIncentivesData,
        },
      };
    } catch (e) {
      return { result: loadingStateEnum.failed };
    }
  } else {
    return { result: loadingStateEnum.failed };
  }
}
