/*
  Pauly
  Andrew Mainella
  November 9 2023
  getPoints.ts
*/
import { StoreType } from '@redux/store';
import { loadingStateEnum } from '@constants';
import callMsGraph from '../ultility/microsoftAssests/noStore';

/**
 * A function that given commissionId calculates the points
 * @param commissions An array with commissionIds to get the points of
 * @param store A redux store
 * @returns The total of all the points
 */
async function getPointsBatch(
  commissions: string[],
  store: StoreType,
): Promise<{ result: loadingStateEnum; points: number }> {
  const outputRequests: { id: string; method: string; url: string }[] = [];
  for (let index = 0; index < commissions.length; index += 1) {
    outputRequests.push({
      id: (index + 1).toString(),
      method: 'GET',
      url: `/sites/${store.getState().paulyList.siteId}/lists/${
        store.getState().paulyList.commissionListId
      }/items?$expand=fields&$filter=fields/commissionId%20eq%20'${
        commissions[index]
      }' `,
    });
  }
  const batchData = {
    requests: outputRequests,
  };

  const result = await callMsGraph(
    'https://graph.microsoft.com/v1.0/$batch',
    store,
    'POST',
    JSON.stringify(batchData),
    [{ key: 'Accept', value: 'application/json' }],
  );
  if (result.ok) {
    const data = await result.json();
    let pointsResult = 0;
    for (
      let requestIndex = 0;
      requestIndex < data.responses.length;
      requestIndex += 1
    ) {
      if (data.responses[requestIndex].status === 200) {
        for (
          let index = 0;
          index < data.responses[requestIndex].body.value.length;
          index += 1
        ) {
          pointsResult +=
            data.responses[requestIndex].body.value[index].fields.points;
        }
      } else {
        return { result: loadingStateEnum.failed, points: 0 };
      }
    }
    return { result: loadingStateEnum.success, points: pointsResult };
  }
  return { result: loadingStateEnum.failed, points: 0 };
}

/**
 * Gets all the points of the current user.
 * @param store A redux store
 * @returns If succesful returns the points
 */
export default async function getPointsApi(store: StoreType): Promise<
  | {
      result: loadingStateEnum.success;
      data: number;
    }
  | {
      result: loadingStateEnum.failed;
    }
> {
  let nextUrl = `https://graph.microsoft.com/v1.0/sites/${
    store.getState().paulyList.siteId
  }/lists/${
    store.getState().paulyList.commissionSubmissionsListId
  }/items?expand=fields&$filter=fields/userId%20eq%20'${
    store.getState().microsoftProfileData.id
  }'%20and%20fields/submissionApproved%20ne%20false`;
  let points: number = 0;
  let commissions: string[] = [];
  while (nextUrl !== '') {
    const submissionResultClaimed = await callMsGraph(nextUrl, store);
    if (!submissionResultClaimed.ok) {
      return { result: loadingStateEnum.failed };
    }
    const submissionResultClaimedData = await submissionResultClaimed.json();
    for (
      let index = 0;
      index < submissionResultClaimedData.value.length;
      index += 1
    ) {
      if (
        submissionResultClaimedData.value[0].fields.submissionApproved === true
      ) {
        commissions.push(
          submissionResultClaimedData.value[0].fields.commissionId,
        );
        if (commissions.length >= 20) {
          const batchResult = await getPointsBatch(commissions, store);
          if (batchResult.result !== loadingStateEnum.success) {
            return { result: loadingStateEnum.failed };
          }
          points += batchResult.points;
          commissions = [];
        }
      }
    }
    if (submissionResultClaimedData['@odata.nextLink'] !== undefined) {
      nextUrl = submissionResultClaimedData['@odata.nextLink'];
    } else {
      nextUrl = '';
      if (commissions.length !== 0) {
        const batchResult = await getPointsBatch(commissions, store);
        if (batchResult.result !== loadingStateEnum.success) {
          return { result: loadingStateEnum.failed };
        }
        points += batchResult.points;
      }
    }
  }
  return { result: loadingStateEnum.success, data: points };
}
