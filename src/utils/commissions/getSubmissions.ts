/*
  Pauly
  Andrew Mainella
  November 9 2023
  getSubmissions.ts
*/
import store from '@redux/store';
import { loadingStateEnum, submissionTypeEnum } from '@constants';
import callMsGraph from '../ultility/microsoftAssests';

/**
 * Converts a submissionTypeEnum to a filter to be used in an ms graph query.
 * @param submissionType The submission to convert.
 * @returns The filter.
 */
function convertSubmissionTypeToFilter(
  submissionType: submissionTypeEnum,
): string {
  if (submissionType === submissionTypeEnum.approved) {
    return '%20and%20fields/submissionApproved%20ne%20false';
  }
  if (submissionType === submissionTypeEnum.unApproved) {
    return '%20and%20fields/submissionApproved%20eq%20false';
  }
  if (submissionType === submissionTypeEnum.unReviewed) {
    return '%20and%20fields/submissionReviewed%20eq%20false';
  }
  return '';
}

/**
 * Given paramerters get submissios.
 * @param input Data on how to get the submissions
 * @returns Result, if successful returns submissions.
 */
export default async function getSubmissions(
  input: getSubmissionsInput,
): Promise<
  | {
      result: loadingStateEnum.failed;
    }
  | {
      result: loadingStateEnum.success;
      data: submissionType[];
      nextLink?: string;
      count: number;
    }
> {
  let url = '';
  if ('url' in input) {
    url = input.url;
  } else {
    const filter: string = convertSubmissionTypeToFilter(input.submissionType);
    url = `https://graph.microsoft.com/v1.0/sites/${
      store.getState().paulyList.siteId
    }/lists/${
      store.getState().paulyList.commissionSubmissionsListId
    }/items?expand=fields&$select=id&$filter=fields/commissionId%20eq%20'${input.commissionId}'${filter}`;
  }
  const result = await callMsGraph(url, 'GET');
  if (result.ok) {
    const data = await result.json();

    // Get Users
    const batchRequests: { id: string; method: string; url: string }[][] = [];
    const users: any = {};
    for (let index = 0; index < data.value.length; index += 1) {
      if (index % 20 === 0) {
        batchRequests.push([]);
      }
      batchRequests[Math.floor(index / 20)].push({
        id: (index + 1).toString(),
        method: 'GET',
        url: `/users/${data.value[index].fields.userId}?$select=id,displayName`,
      });
    }
    for (let index = 0; index < batchRequests.length; index += 1) {
      const batchData = {
        requests: batchRequests[index],
      };
      const batchHeaders = new Headers();
      batchHeaders.append('Accept', 'application/json');
      const batchResult = await callMsGraph(
        'https://graph.microsoft.com/v1.0/$batch',
        'POST',
        JSON.stringify(batchData),
      );
      if (result.ok) {
        const batchResultData = await batchResult.json();
        for (
          let batchIndex = 0;
          batchIndex < batchResultData.responses.length;
          batchIndex += 1
        ) {
          if (batchResultData.responses[batchIndex].status === 200) {
            Object.defineProperty(
              users,
              batchResultData.responses[batchIndex].body.id,
              {
                value: batchResultData.responses[batchIndex].body.displayName,
              },
            );
          } else {
            return { result: loadingStateEnum.failed };
          }
        }
      } else {
        return { result: loadingStateEnum.failed };
      }
    }

    // Return Output
    const output: submissionType[] = [];
    for (let index = 0; index < data.value.length; index += 1) {
      const name = users[data.value[index].fields.userId];
      if (name !== undefined) {
        output.push({
          userName: name,
          submissionTime: data.value[index].fields.submittedTime,
          id: data.value[index].fields.submissionId,
          itemId: data.value[index].id,
          approved: data.value[index].fields.submissionApproved,
          reviewed: data.value[index].fields.submissionReviewed,
          submissionImage:
            data.value[index].fields.submissionData !== undefined
              ? JSON.parse(data.value[index].fields.submissionData).imageShare
              : undefined,
        });
      } else {
        return { result: loadingStateEnum.failed };
      }
    }
    return {
      result: loadingStateEnum.success,
      data: output,
      nextLink: data['@odata.nextLink'],
      count: data.value.length,
    };
  }
  return { result: loadingStateEnum.failed };
}
