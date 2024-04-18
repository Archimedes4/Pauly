/*
  Pauly
  Andrew Mainella
  November 9 2023
  getCommissions.ts
*/
import { loadingStateEnum } from '@constants';
import { StoreType } from '@redux/store';
import callMsGraph from '../ultility/microsoftAssests/noStore';

/**
 * 
 * @param startDate 
 * @param endDate 
 * @returns 
 */
function getFilter(
  startDate?: { date: Date; filter: 'ge' | 'le' },
  endDate?: { date: Date; filter: 'ge' | 'le' },
) {
  const startDateString = startDate?.date.toISOString().replace(/.\d+Z$/g, 'Z');
  const endDateString = endDate?.date.toISOString().replace(/.\d+Z$/g, 'Z');
  if (startDate || endDate) {
    let filter = '&$filter=';
    if (startDate) {
      filter += `fields/startDate%20${startDate.filter}%20'${startDateString}'`;
      if (endDate) {
        filter += `&fields/endDate%20le%20'${endDateString}'`;
      }
    } else if (endDate) {
      filter += `fields/endDate%20${endDate.filter}%20'${endDateString}'`;
    }
    return filter;
  }
  return '';
}

/**
 * 
 * @param commissionIds The commission Ids of the submissions to fetch
 * @param store The Redux store
 * @returns 
 */
async function getSubmissions(
  commissionIds: string[],
  store: StoreType,
): Promise<{
  result: loadingStateEnum;
  data?: Map<
    string,
    { claimCount: number; submissionsCount: number; reviewedCount: number }
  >;
}> {
  const outputRequests: { id: string; method: string; url: string }[][] = [[]];
  for (let index = 0; index < commissionIds.length; index += 1) {
    outputRequests[Math.floor(index / 20)].push({
      id: (index + 1).toString(),
      method: 'GET',
      url: `/sites/${store.getState().paulyList.siteId}/lists/${
        store.getState().paulyList.commissionSubmissionsListId
      }/items?expand=fields(select=commissionId,submissions)`,
    });
    if (index % 20 === 0) {
      outputRequests.push([]);
    }
  }
  const outputMap = new Map<
    string,
    { claimCount: number; submissionsCount: number; reviewedCount: number }
  >();
  for (let index = 0; outputRequests.length < index; index += 1) {
    const requestData = {
      requests: outputRequests[index],
    };
    const result = await callMsGraph(
      `https://graph.microsoft.com/v1.0/sites/${
        store.getState().paulyList.siteId
      }/lists/${store.getState().paulyList.commissionListId}/items`,
      store,
      'POST',
      JSON.stringify(requestData),
    );
    if (result.ok) {
      const data = await result.json();
      for (
        let responseIndex = 0;
        responseIndex < data.responses.length;
        responseIndex += 1
      ) {
        if (data.responses[responseIndex].status === 200) {
          for (
            let dataIndex = 0;
            dataIndex < data.respone[index].body.length;
            dataIndex += 1
          ) {
            if (data.respone[index].body['@odata.nextLink'] !== undefined) {
              if (outputRequests[outputRequests.length - 1].length < 20) {
                outputRequests[outputRequests.length - 1].push({
                  id: outputRequests[
                    outputRequests.length - 1
                  ].length.toString(),
                  method: 'GET',
                  url: data.respone[index].body['@odata.nextLink'],
                });
              } else {
                outputRequests.push([]);
                outputRequests[outputRequests.length - 1].push({
                  id: outputRequests[
                    outputRequests.length - 1
                  ].length.toString(),
                  method: 'GET',
                  url: data.respone[index].body['@odata.nextLink'],
                });
              }
            }
            for (
              let valueIndex = 0;
              valueIndex < data.respone[index].body.value.length;
              valueIndex += 1
            ) {
              if (
                outputMap.has(
                  data.respone[index].body.value[valueIndex].commissionId,
                )
              ) {
                const mapData = outputMap.get(
                  data.respone[index].body.value[valueIndex].commissionId,
                );
                if (mapData !== undefined) {
                  const subApproved =
                    data.respone[index].body.value[valueIndex]
                      .submissionApproved;
                  const subReviewed =
                    data.respone[index].body.value[valueIndex]
                      .submissionReviewed;
                  outputMap.set(
                    data.respone[index].body.value[valueIndex].commissionId,
                    {
                      submissionsCount: (mapData.submissionsCount += 1),
                      claimCount: subApproved
                        ? (mapData.claimCount += 1)
                        : mapData.claimCount,
                      reviewedCount: subReviewed
                        ? (mapData.reviewedCount += 1)
                        : mapData.reviewedCount,
                    },
                  );
                } else {
                  const subApproved =
                    data.respone[index].body.value[valueIndex]
                      .submissionApproved;
                  const subReviewed =
                    data.respone[index].body.value[valueIndex]
                      .submissionReviewed;
                  outputMap.set(
                    data.respone[index].body.value[valueIndex].commissionId,
                    {
                      submissionsCount: 1,
                      claimCount: subApproved ? 1 : 0,
                      reviewedCount: subReviewed ? 1 : 0,
                    },
                  );
                }
              } else {
                const subApproved =
                  data.respone[index].body.value[valueIndex].submissionApproved;
                const subReviewed =
                  data.respone[index].body.value[valueIndex].submissionReviewed;
                outputMap.set(
                  data.respone[index].body.value[valueIndex].commissionId,
                  {
                    submissionsCount: 1,
                    claimCount: subApproved ? 1 : 0,
                    reviewedCount: subReviewed ? 1 : 0,
                  },
                );
              }
            }
          }
        } else {
          return { result: loadingStateEnum.failed };
        }
      }
    } else {
      return { result: loadingStateEnum.failed };
    }
  }

  return { result: loadingStateEnum.success, data: outputMap };
}

export default async function getCommissionsApi(
  params: commissionApiParams,
): Promise<
  | {
      result: loadingStateEnum.success;
      data: commissionType[];
      nextLink?: string;
    }
  | {
      result: loadingStateEnum.failed;
    }
> {
  try {
    const { nextLink, claimed, startDate, endDate } = params || {};
    if (claimed === true) {
      const result = await getUnclaimedCommissions(params.store);
      if (result.result === loadingStateEnum.success) {
        return { result: result.result, data: result.data };
      }
      return { result: loadingStateEnum.failed };
    }
    const filter = getFilter(startDate, endDate);
    const result = await callMsGraph(
      nextLink ||
        `https://graph.microsoft.com/v1.0/sites/${
          params.store.getState().paulyList.siteId
        }/lists/${
          params.store.getState().paulyList.commissionListId
        }/items?expand=fields${filter}&$select=id,fields`,
      params.store,
    );
    if (result.ok) {
      const data = await result.json();
      if (data.value !== null && data.value !== undefined) {
        const commissionsIds: string[] = [];
        for (let index = 0; index < data.value.length; index += 1) {
          commissionsIds.push(data.value[index].fields.commissionId);
        }
        const submissions = await getSubmissions(commissionsIds, params.store);
        if (
          submissions.result === loadingStateEnum.success &&
          submissions.data !== undefined
        ) {
          const resultCommissions: commissionType[] = [];
          for (let index = 0; index < data.value.length; index += 1) {
            const submissionData = submissions.data.get(
              data.value[index].fields.commissionId as string,
            );
            resultCommissions.push({
              itemId: data.value[index].id,
              title: data.value[index].fields.Title,
              startDate: data.value[index].fields.startDate,
              endDate: data.value[index].fields.endDate,
              claimCount: submissionData ? submissionData.claimCount : 0,
              submissionsCount: submissionData
                ? submissionData.submissionsCount
                : 0,
              reviewedCount: submissionData ? submissionData.reviewedCount : 0,
              points: data.value[index].fields.points as number,
              proximity: data.value[index].fields.proximity as number,
              commissionId: data.value[index].fields.commissionId as string,
              hidden: data.value[index].fields.hidden,
              timed: data.value[index].fields.timed,
              maxNumberOfClaims: data.value[index].fields.maxNumberOfClaims,
              allowMultipleSubmissions:
                data.value[index].fields.allowMultipleSubmissions,
              value: data.value[index].fields.value,
              competitionType: data.value[index].fields.homeValue,
            });
          }
          return {
            result: loadingStateEnum.success,
            data: resultCommissions,
            nextLink: data['@odata.nextLink'],
          };
        }
        return { result: loadingStateEnum.failed };
      }
      return { result: loadingStateEnum.failed };
    }
    return { result: loadingStateEnum.failed };
  } catch {
    return { result: loadingStateEnum.failed };
  }
}

type unclaimedCommissionSubmissionType = {
  commissionId: string;
  submissions: number;
};

// Get Claimed Commmissions

// Gets points when given an array of commission ids
async function getCommissionsBatch(
  commissions: unclaimedCommissionSubmissionType[],
  store: StoreType,
): Promise<{ result: loadingStateEnum; data?: commissionType[] }> {
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
  if (outputRequests.length === 0) {
    return { result: loadingStateEnum.success, data: [] };
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
    const commissionsResult: commissionType[] = [];
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
          commissionsResult.push({
            itemId: data.responses[requestIndex].body.value[index].id,
            title: data.responses[requestIndex].body.value[index].fields.Title,
            startDate:
              data.responses[requestIndex].body.value[index].fields.startDate,
            endDate:
              data.responses[requestIndex].body.value[index].fields.endDate,
            submissionsCount:
              commissions[parseInt(data.responses[requestIndex].id, 10) - 1]
                .submissions,
            claimCount: 0,
            reviewedCount: 0, // TO DO fix
            points: data.responses[requestIndex].body.value[index].fields
              .points as number,
            proximity: data.responses[requestIndex].body.value[index].fields
              .proximity as number,
            commissionId: data.responses[requestIndex].body.value[index].fields
              .commissionId as string,
            hidden:
              data.responses[requestIndex].body.value[index].fields.hidden,
            timed: data.responses[requestIndex].body.value[index].fields.timed,
            maxNumberOfClaims:
              data.responses[requestIndex].body.value[index].fields
                .maxNumberOfClaims,
            allowMultipleSubmissions:
              data.responses[requestIndex].body.value[index].fields
                .allowMultipleSubmissions,
            value:
              data.responses[requestIndex].body.value[index].fields.hidden - 1,
            competitionType:
              data.responses[requestIndex].body.value[index].fields.homeValue,
          });
        }
      } else {
        return { result: loadingStateEnum.failed, data: commissionsResult };
      }
    }
    return { result: loadingStateEnum.success, data: commissionsResult };
  }
  return { result: loadingStateEnum.failed };
}

export async function getUnclaimedCommissions(store: StoreType): Promise<
  | {
      result: loadingStateEnum.success;
      data: commissionType[];
    }
  | {
      result: loadingStateEnum.failed;
    }
> {
  let nextUrl = `https://graph.microsoft.com/v1.0/sites/${
    store.getState().paulyList.siteId
  }/lists/${
    store.getState().paulyList.commissionSubmissionsListId
  }/items?expand=fields&$select=id,fields&$filter=fields/userId%20eq%20'${
    store.getState().microsoftProfileData.id
  }'%20and%20fields/submissionApproved%20ne%20false`;
  // The first value in the map is the commission id and the second is the submissions count b/c all are unclaimed
  const commissionsMap = new Map<string, number>();
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
      // check if submission approved
      if (
        submissionResultClaimedData.value[index].fields.submissionApproved ===
        false
      ) {
        if (
          commissionsMap.has(
            submissionResultClaimedData.value[index].fields.commissionId,
          )
        ) {
          const count = commissionsMap.get(
            submissionResultClaimedData.value[index].fields.commissionId,
          );
          if (count !== undefined) {
            commissionsMap.set(
              submissionResultClaimedData.value[index].fields.commissionId,
              count + 1,
            );
          }
        } else {
          commissionsMap.set(
            submissionResultClaimedData.value[index].fields.commissionId,
            1,
          );
        }
      }
    }
    if (submissionResultClaimedData['@odata.nextLink'] !== undefined) {
      nextUrl = submissionResultClaimedData['@odata.nextLink'];
    } else {
      nextUrl = '';
    }
  }
  const commissionsBatchData: unclaimedCommissionSubmissionType[][] = [[]];
  let batchIndex = 0;
  commissionsMap.forEach((value, key) => {
    commissionsBatchData[batchIndex].push({
      commissionId: key,
      submissions: value,
    });
    if (commissionsBatchData[batchIndex].length >= 20) {
      commissionsBatchData.push([]);
      batchIndex += 1;
    }
  });

  let outCommissions: commissionType[] = [];
  for (let index = 0; index < commissionsBatchData.length; index += 1) {
    const result = await getCommissionsBatch(
      commissionsBatchData[index],
      store,
    );
    if (
      result.result === loadingStateEnum.success &&
      result.data !== undefined
    ) {
      outCommissions = [...outCommissions, ...result.data];
    } else {
      return { result: loadingStateEnum.failed };
    }
  }
  return { result: loadingStateEnum.success, data: outCommissions };
}
