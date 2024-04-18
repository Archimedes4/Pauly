import { StoreType } from '@redux/store';
import { loadingStateEnum } from '@constants';
import callMsGraph from '../ultility/microsoftAssests/noStore';
import largeBatch from '../ultility/batchRequest';

/**
 * Get a single leaderboard with a commission Id.
 * @param store The Redux store
 * @param commissionId The commission Id of the leaderboard
 * @returns The state, if successful an array of users and the amount of points. The points can be used to make a leaderboard.
 */
export default async function getLeaderboardApi(
  store: StoreType,
  commissionId?: string,
): Promise<
  | { result: loadingStateEnum.failed }
  | { result: loadingStateEnum.success; data: leaderboardUserType[] }
> {
  let commissionFilter = '';
  if (commissionId !== undefined) {
    commissionFilter = `&fields/commissionId%20eq%20'${commissionId}'`;
  }
  let nextUrl: string | undefined =
    `https://graph.microsoft.com/v1.0/sites/${store.getState().paulyList.siteId}/lists/${store.getState().paulyList.commissionSubmissionsListId}/items?$orderby=fields/userId&$expand=fields($select=userId,submissionApproved,commissionId)&$select=id,fields&$filter=fields/submissionApproved%20eq%201${commissionFilter}`;
  const commissions: Map<string, number> = new Map();
  const users: Map<
    string,
    {
      name: string;
      points: number;
    }
  > = new Map();
  const userAndCommision: { user: string; commission: string }[] = [];
  while (nextUrl !== undefined) {
    const result = await callMsGraph(nextUrl, store);
    if (result.ok) {
      const data = await result.json();
      for (let index = 0; index < data.value.length; index += 1) {
        commissions.set(data.value[index].fields.commissionId, 0);
        users.set(data.value[index].fields.userId, {
          name: 'loading',
          points: 0,
        });
        userAndCommision.push({
          user: data.value[index].fields.userId,
          commission: data.value[index].fields.commissionId,
        });
      }
      nextUrl = data['@odata.nextLink'];
    } else {
      return { result: loadingStateEnum.failed };
    }
  }
  const commissionBatchResult = await largeBatch(
    {
      firstUrl: `/sites/${store.getState().paulyList.siteId}/lists/${store.getState().paulyList.commissionListId}/items?$expand=fields($select=points,commissionId)&$select=id,fields&$filter=fields/commissionId%20eq%20'`,
      secondUrl: "'",
      map: commissions,
      method: 'GET',
    },
    store,
  );
  if (commissionBatchResult.result !== loadingStateEnum.success) {
    return { result: loadingStateEnum.failed };
  }
  for (let index = 0; index < commissionBatchResult.data.length; index += 1) {
    if (commissionBatchResult.data[index].status !== 200) {
      // Failed
    } else {
      commissions.set(
        commissionBatchResult.data[index].body.value[0].fields.commissionId,
        commissionBatchResult.data[index].body.value[0].fields.points,
      );
    }
  }

  const userBatchResult = await largeBatch(
    {
      firstUrl: `/users/`,
      secondUrl: '?$select=displayName,id',
      map: users,
      method: 'GET',
    },
    store,
  );
  if (userBatchResult.result !== loadingStateEnum.success) {
    return { result: loadingStateEnum.failed };
  }
  for (let index = 0; index < userBatchResult.data.length; index += 1) {
    if (userBatchResult.data[index].status !== 200) {
      // Failed
    } else {
      users.set(userBatchResult.data[index].body.id, {
        name: userBatchResult.data[index].body.displayName,
        points: 0,
      });
    }
  }

  let currentUser = '';
  let currentPoints = 0;
  for (let index = 0; index < userAndCommision.length; index += 1) {
    const points = commissions.get(userAndCommision[index].commission);
    if (points == undefined) {
      // An error has occured
      return { result: loadingStateEnum.failed };
    }
    if (currentUser === '') {
      currentUser = userAndCommision[index].user;
      currentPoints += points;
    } else if (currentUser === userAndCommision[index].user) {
      currentPoints += points;
    } else {
      const oldUser = users.get(currentUser);
      if (oldUser === undefined) {
        // Error
        return { result: loadingStateEnum.failed };
      }
      users.set(currentUser, {
        name: oldUser.name,
        points: oldUser.points + currentPoints,
      });
      currentUser = userAndCommision[index].user;
      currentPoints = 0;
      currentPoints += points;
    }
    if (index === userAndCommision.length - 1) {
      const oldUser = users.get(currentUser);
      if (oldUser === undefined) {
        // Error
        return { result: loadingStateEnum.failed };
      }
      users.set(currentUser, {
        name: oldUser.name,
        points: oldUser.points + currentPoints,
      });
    }
  }
  const leaderboardResult: leaderboardUserType[] = [];
  users.forEach(
    (
      user: {
        name: string;
        points: number;
      },
      key,
    ) => {
      leaderboardResult.push({
        name: user.name,
        points: user.points,
        id: key,
      });
    },
  );
  return {
    result: loadingStateEnum.success,
    data: leaderboardResult,
  };
}
