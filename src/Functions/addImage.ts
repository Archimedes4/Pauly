import store from '../Redux/store';
import { loadingStateEnum } from '../types';
import callMsGraph from './ultility/microsoftAssets';

// https://stackoverflow.com/questions/3583724/how-do-i-add-a-delay-in-a-javascript-loop
const timer = (ms: number | undefined) =>
  new Promise(res => setTimeout(res, ms));

export default async function addImage(
  userId: string,
  selectedFile: microsoftFileType,
): Promise<loadingStateEnum> {
  // Get Site Root Dirve
  const siteResult = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${
      store.getState().paulyList.siteId
    }/drive/root`,
  );
  if (siteResult.ok) {
    const siteData = await siteResult.json();
    //Copy current file to drive
    const copyPayload = {
      parentReference: {
        driveId: siteData.parentReference.driveId,
        id: siteData.id,
      },
    };
    const copyResult = await callMsGraph(
      `${selectedFile.callPath}/copy?@microsoft.graph.conflictBehavior=rename`,
      'POST',
      JSON.stringify(copyPayload),
    );
    if (copyResult.ok) {
      const copyData = await copyResult.headers.get('Location');
      let notComplete = true;
      let resourceId = '';

      while (notComplete) {
        if (copyData !== null) {
          const copyFetch = await fetch(copyData);
          if (copyFetch.ok) {
            const copyFetchData = await copyFetch.json();
            if (copyFetchData.status === 'completed') {
              resourceId = copyFetchData.resourceId;
              notComplete = false;
              break;
            }
          } else {
            return loadingStateEnum.failed;
          }
        } else {
          return loadingStateEnum.failed;
        }
        await timer(3000);
      }

      const getItemResult = await callMsGraph(
        `https://graph.microsoft.com/v1.0/sites/${
          store.getState().paulyList.siteId
        }/drive/items/${resourceId}`,
      );
      if (getItemResult.ok) {
        const getItemData = await getItemResult.json();
        const studentData = {
          fields: {
            createdTime: new Date().toISOString(),
            itemId: getItemData.id,
            userId,
            selected: false,
          },
        };
        const studentListResult = await callMsGraph(
          `https://graph.microsoft.com/v1.0/sites/${
            store.getState().paulyList.siteId
          }/lists/${store.getState().paulyList.studentFilesListId}/items`,
          'POST',
          JSON.stringify(studentData),
        );
        if (studentListResult.ok) {
          return loadingStateEnum.success;
        } else {
          return loadingStateEnum.failed;
        }
      }
      return loadingStateEnum.failed;
    }
    return loadingStateEnum.failed;
  }
  return loadingStateEnum.failed;
}
