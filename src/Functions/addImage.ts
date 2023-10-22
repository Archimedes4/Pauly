import store from '../Redux/store';
import { loadingStateEnum } from '../types';
import callMsGraph from './Ultility/microsoftAssets';

// https://stackoverflow.com/questions/3583724/how-do-i-add-a-delay-in-a-javascript-loop
const timer = (ms: number | undefined) =>
  new Promise(res => setTimeout(res, ms));

export default async function addImage(
  userId: string,
  selectedFile: microsoftFileType,
): Promise<loadingStateEnum> {
  // Get Site Root Dirve
  // b!SovCQ5jf4Ui7t--wIofkuw46Zg0l6rlIr721G-0tZtCdr1HAMwtmTJEU9ay20bf2
  const siteResult = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${
      store.getState().paulyList.siteId
    }/drive/root`,
  );
  if (siteResult.ok) {
    const siteData = await siteResult.json();
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
        }
        const data = await studentListResult.json();
        return loadingStateEnum.failed;
      }
      return loadingStateEnum.failed;
    }
    return loadingStateEnum.failed;
  }
  return loadingStateEnum.failed;

  // let userExtensionData: any = {}
  // userExtensionData[store.getState().paulyList.userExtensionId] = {
  //   "imageId":""
  // }
  // const data = {
  //   "requests": [
  //     {
  //       "id":"1",
  //       "method":"POST",
  //       "url":`/sites/${store.getState().paulyList.siteId}/lists/${store.getState().paulyList.studentFilesListId}/items`,
  //       "body":JSON.stringify({
  //         "fields": {
  //           "createdTime":new Date().toISOString(),
  //           "":""
  //         }
  //       }),
  //       "headers":{
  //         "Content-Type": "application/json"
  //       }
  //     },
  //     {
  //       "id":"2",
  //       "method":"POST",
  //       "url":`/sites/${store.getState().paulyList.siteId}/drive/root`,
  //       "dependsOn":["1"],
  //       "body":"",
  //       "headers":{
  //         "Content-Type": "application/json"
  //       }
  //     }
  //   ]
  // }
  // const result = await callMsGraph("https://graph.microsoft.com/v1.0/$batch", "POST", undefined, JSON.stringify(data))
  // if (result.ok) {
  //   const data = await result.json()
  // } else {

  // }
  // {
  //   "id":"3",
  //   "method":"PATCH",
  //   "url":`/users/${userId}`,
  //   "headers":{
  //     "Content-Type": "application/json"
  //   },
  //   "dependsOn":["1","2"],
  //   "body":JSON.stringify({}),
  // }
}
