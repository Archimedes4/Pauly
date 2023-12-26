/*
  Pauly
  Andrew Mainella
  November 10 2023
  getCommission.ts
*/
import store from '../../redux/store';
import { loadingStateEnum } from '../../constants';
import callMsGraph from '../ultility/microsoftAssets';

export default async function getCommission(
  commissionId: string,
): Promise<{ result: loadingStateEnum; data?: commissionType }> {
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${
      store.getState().paulyList.siteId
    }/lists/${
      store.getState().paulyList.commissionListId
    }/items?expand=fields&$filter=fields/commissionID%20eq%20'${commissionId}'`,
  );
  if (result.ok) {
    const data = await result.json();
    if (data.value.length !== 1) {
      // Not found
      return { result: loadingStateEnum.failed };
    }
    const dataResult: commissionType = {
      itemId: data.value[0].id,
      title: data.value[0].fields.Title,
      startDate: data.value[0].fields.startDate,
      endDate: data.value[0].fields.endDate,
      points: data.value[0].fields.points,
      hidden: data.value[0].fields.hidden,
      commissionId: data.value[0].fields.commissionID,
      proximity: data.value[0].fields.proximity,
      coordinateLat: data.value[0].fields.coordinateLat,
      coordinateLng: data.value[0].fields.coordinateLng,
      postData: {
        teamId: data.value[0].fields.postTeamId,
        channelId: data.value[0].fields.postChannelId,
        postId: data.value[0].fields.postId,
      },
      timed: false,
      maxNumberOfClaims: 0,
      allowMultipleSubmissions: false,
      value: data.value[0].fields.value - 1,
      submissionsCount: 0,
      claimCount: 0,
      reviewedCount: 0,
    };
    return { result: loadingStateEnum.success, data: dataResult };
  }
  return { result: loadingStateEnum.failed };
}
