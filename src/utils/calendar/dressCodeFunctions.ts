import store from "@redux/store";
import callMsGraph from "../ultility/microsoftAssests";
import { loadingStateEnum } from "@constants";
import createUUID from "../ultility/createUUID";

export async function deleteDressCode(dressCodeItemId: string) {
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${
      store.getState().paulyList.siteId
    }/lists/${
      store.getState().paulyList.dressCodeListId
    }/items/${dressCodeItemId}`,
    'DELETE',
  );
  if (result.ok) {
    return loadingStateEnum.success
  }
  return loadingStateEnum.failed
}

export default async function getDressCodes(): Promise<
  | {
      result: loadingStateEnum.success;
      data: dressCodeType[];
    }
  | {
      result: loadingStateEnum.failed;
    }
> {
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
          itemId: data.value[index].id,
          dressCodeData: JSON.parse(data.value[index].fields.dressCodeData),
          dressCodeIncentives: [],
        });
      } catch {
        // continue on ignoring error
      }
    }
    return { result: loadingStateEnum.success, data: newDressCodes };
  }
  return { result: loadingStateEnum.failed };
}

export async function createDressCode(
  dressCode: dressCodeType,
): Promise<loadingStateEnum> {
  const dressCodeId = createUUID();
  const data = {
    fields: {
      Title: dressCodeId,
      dressCodeId,
      dressCodeName: dressCode.name,
      dressCodeData: JSON.stringify(dressCode.dressCodeData),
      dressCodeIncentivesData: '[]',
    },
  };
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${
      store.getState().paulyList.siteId
    }/lists/${store.getState().paulyList.dressCodeListId}/items`,
    'POST',
    JSON.stringify(data),
  );
  if (result.ok) {
    return loadingStateEnum.success;
  }
  return loadingStateEnum.failed;
}

export async function updateDressCode(
  dressCode: dressCodeType
): Promise<loadingStateEnum> {
  const data = {
    fields: {
      dressCodeName: dressCode.name,
      dressCodeData: JSON.stringify(dressCode.dressCodeData),
      dressCodeIncentivesData: '[]',
    },
  };
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${
      store.getState().paulyList.siteId
    }/lists/${store.getState().paulyList.dressCodeListId}/items/${dressCode.itemId}`,
    'PATCH',
    JSON.stringify(data),
  );
  if (result.ok) {
    return loadingStateEnum.success;
  }
  return loadingStateEnum.failed;
}