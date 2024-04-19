/*
  Pauly
  Andrew Mainella
  November 10 2023
  getCommission.ts
*/
import { StoreType } from '@redux/store';
import { loadingStateEnum } from '@constants';
import callMsGraph from '../ultility/microsoftAssests/noStore';

/**
 * Gets the commission with the supplied commission Id
 * @param commissionId The id of the commission
 * @param store The redux store
 * @returns
 */
export default async function getCommissionApi(
  commissionId: string,
  store: StoreType,
): Promise<
  | { result: loadingStateEnum.success; data: commissionType }
  | {
      result: loadingStateEnum.failed;
    }
> {
  try {
    const result = await callMsGraph(
      `https://graph.microsoft.com/v1.0/sites/${
        store.getState().paulyList.siteId
      }/lists/${
        store.getState().paulyList.commissionListId
      }/items?expand=fields($select=Title,timed,points,hidden,maxNumberOfClaims,allowMultipleSubmissions,commissionId,value,postTeamId,postChannelId,postId,id)&$filter=fields/commissionId%20eq%20'${commissionId}'&$select=fields,id`,
      store,
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
        commissionId: data.value[0].fields.commissionId,
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
        value: data.value[0].fields.value,
        submissionsCount: 0,
        claimCount: 0,
        reviewedCount: 0,
        competitionType: data.value[0].fields.homeValue,
      };
      return { result: loadingStateEnum.success, data: dataResult };
    }
    return { result: loadingStateEnum.failed };
  } catch {
    return { result: loadingStateEnum.failed };
  }
}
