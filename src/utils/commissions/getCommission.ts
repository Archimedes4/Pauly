/*
  Pauly
  Andrew Mainella
  November 10 2023
  getCommission.ts
*/
import store from '@redux/store';
import { loadingStateEnum } from '@constants';
import callMsGraph from '../ultility/microsoftAssets';

export default async function getCommission(commissionId: string): Promise<
  | { result: loadingStateEnum.success; data: commissionType }
  | {
      result: loadingStateEnum.failed;
    }
> {
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${
      store.getState().paulyList.siteId
    }/lists/${
      store.getState().paulyList.commissionListId
    }/items?expand=fields($select=Title,timed,points,hidden,maxNumberOfClaims,allowMultipleSubmissions,commissionID,value,postTeamId,postChannelId,postId,id)&$filter=fields/commissionID%20eq%20'${commissionId}'&$select=fields,id`,
  );
  if (result.ok) {
    const data = await result.json();
    if (data.value.length !== 1) {
      // Not found or error. Error shouldn't be possible as it would involve having duplicate ids.
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
      timed: data.value[0].fields.timed,
      maxNumberOfClaims: data.value[0].fields.maxNumberOfClaims,
      allowMultipleSubmissions: data.value[0].fields.allowMultipleSubmissions,
      value: data.value[0].fields.value - 1,
      submissionsCount: 0,
      claimCount: 0,
      reviewedCount: 0,
    };
    return { result: loadingStateEnum.success, data: dataResult };
  }
  return { result: loadingStateEnum.failed };
}
