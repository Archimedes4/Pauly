import { loadingStateEnum } from "@constants";
import callMsGraph from "./ultility/microsoftAssests/noStore";
import { StoreType } from "@redux/store";

export default async function getClassesApi(store: StoreType): Promise<
  {
    result: loadingStateEnum.success;
    data: classType[];
  }
  | {
      result: loadingStateEnum.failed;
    }
> {
  let classQuery: string = `https://graph.microsoft.com/v1.0/me/joinedTeams?$select=id`;
  const batchDataRequests: batchRequest[][] = [[]];
  while (classQuery !== undefined) {
    const classResult = await callMsGraph(classQuery, store);
    if (classResult.ok) {
      const classData = await classResult.json();
      classQuery = classData['@odata.nextLink'];

      // Batch Request perfroming a get request on each class group

      // Format Data
      for (let index = 0; index < classData.value.length; index += 1) {
        batchDataRequests[Math.floor(index / 20)].push({
          id: (index + 1).toString(),
          method: 'GET',
          url: `/groups/${classData.value[index].id}?$select=displayName,id,${
            store.getState().paulyList.classExtensionId
          }`,
        });
      }
    } else {
      return { result: loadingStateEnum.failed };
    }
  }
  // Run Queries
  const batchHeaders = new Headers();
  batchHeaders.append('Accept', 'application/json');
  const classes: classType[] = [];
  for (let index = 0; index < batchDataRequests.length; index += 1) {
    const batchData = {
      requests: batchDataRequests[index],
    };
    const batchResult = await callMsGraph(
      'https://graph.microsoft.com/v1.0/$batch',
      store,
      'POST',
      JSON.stringify(batchData),
    );
    if (batchResult.ok) {
      const batchResultData = await batchResult.json();
      for (
        let batchIndex = 0;
        batchIndex < batchResultData.responses.length;
        batchIndex += 1
      ) {
        if (batchResultData.responses[batchIndex].status === 200) {
          if (
            batchResultData.responses[batchIndex].body[
              store.getState().paulyList.classExtensionId
            ] !== undefined
          ) {
            classes.push({
              name: batchResultData.responses[batchIndex].body.displayName,
              id: batchResultData.responses[batchIndex].body.id,
              periods: JSON.parse(
                batchResultData.responses[batchIndex].body[
                  store.getState().paulyList.classExtensionId
                ].periodData,
              ),
              room: {
                name: '',
                id: '',
              },
              schoolYearId: batchResultData.responses[batchIndex].body[
                store.getState().paulyList.classExtensionId
              ].schoolYearEventId,
              semester: JSON.parse(batchResultData.responses[batchIndex].body[
                store.getState().paulyList.classExtensionId
              ].semesterId),

              // TODO add teamlink
              teamLink: ''
            });
          }
        } else {
          return { result: loadingStateEnum.failed };
        }
      }
    } else {
      return { result: loadingStateEnum.failed };
    }
  }
  return { result: loadingStateEnum.success, data: classes };
}