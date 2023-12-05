/*
  Pauly
  Andrew Mainella
  November 9 2023
  sportsFunctions.ts
*/
import store from '@Redux/store';
import {
  dataContentTypeOptions,
  loadingStateEnum,
  postType,
} from '@src/types';
import batchRequest from '@Functions/ultility/batchRequest';
import getFileWithShareID from '@Functions/ultility/getFileWithShareID';
import callMsGraph from '@Functions/ultility/microsoftAssets';

export async function getSports(): Promise<{
  result: loadingStateEnum;
  data?: sportType[];
}> {
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${
      store.getState().paulyList.siteId
    }/lists/${
      store.getState().paulyList.sportsListId
    }/items?expand=fields($select=sportName,sportId,sportSvg)&$select=id`,
  );
  if (result.ok) {
    const data = await result.json();
    if (data.value !== null && data.value !== undefined) {
      const resultData: sportType[] = [];
      for (let index = 0; index < data.value.length; index += 1) {
        resultData.push({
          name: data.value[index].fields.sportName,
          id: data.value[index].fields.sportId,
          svgData: data.value[index].fields.sportSvg,
        });
      }
      return { result: loadingStateEnum.success, data: resultData };
    }
    return { result: loadingStateEnum.failed };
  }
  return { result: loadingStateEnum.failed };
}

export async function getSportsTeams(
  sportId: string,
): Promise<{ result: loadingStateEnum; data?: sportTeamType[] }> {
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${
      store.getState().paulyList.siteId
    }/lists/${sportId}/items?expand=fields`,
  );
  if (result.ok) {
    const data = await result.json();
    if (data.value !== null && data.value !== undefined) {
      const resultData: sportTeamType[] = [];
      for (let index = 0; index < data.value.length; index += 1) {
        resultData.push({
          teamName: data.value[index].fields.teamName,
          season: data.value[index].fields.season,
          teamId: data.value[index].fields.teamId,
        });
      }
      return { result: loadingStateEnum.success, data: resultData };
    }
    return { result: loadingStateEnum.failed };
  }
  return { result: loadingStateEnum.failed };
}

export async function getSport(
  id: string,
): Promise<{ result: loadingStateEnum; data?: sportType; listId?: string }> {
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${
      store.getState().paulyList.siteId
    }/lists/${
      store.getState().paulyList.sportsListId
    }/items?$expand=fields&$filter=fields/sportId%20eq%20'${id}'`,
  );
  if (result.ok) {
    const data = await result.json();
    if (data.value.length === 1) {
      return {
        result: loadingStateEnum.success,
        data: {
          name: data.value[0].fields.sportName,
          id: data.value[0].fields.sportId,
          svgData: data.value[0].fields.sportSvg,
        },
        listId: data.value[0].fields.id,
      };
    }
    return { result: loadingStateEnum.failed };
  }
  return { result: loadingStateEnum.failed };
}

// Andrew Mainella
// October 7 2023
// Pauly get submissions for sports
export default async function getSubmissions(): Promise<{
  result: loadingStateEnum;
  data?: mediaSubmissionType[];
}> {
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${
      store.getState().paulyList.siteId
    }/lists/${
      store.getState().paulyList.sportsSubmissionsListId
    }/items?expand=fields`,
  );
  if (result.ok) {
    const data = await result.json();
    const newMediaSubmissions: mediaSubmissionType[] = [];
    if (data.value !== undefined) {
      for (let index = 0; index < data.value.length; index += 1) {
        newMediaSubmissions.push({
          Title: data.value[index].fields.Title,
          user: data.value[index].fields.User,
          submissionId: data.value[index].fields.submissionId,
          accepted: data.value[index].fields.accepted,
          fileId: data.value[index].fields.fileId,
          itemID: data.value[index].id,
          selectedSportId: data.value[index].fields.selectedSportId,
          selectedTeamId: data.value[index].fields.selectedTeamId,
          reviewed: data.value[index].fields.reviewed,
          fileType: data.value[index].fields.fileType,
        });
      }
      return { result: loadingStateEnum.success, data: newMediaSubmissions };
    }
    return { result: loadingStateEnum.failed };
  }
  return { result: loadingStateEnum.failed };
}

export async function getSportsContent(
  team?: string,
): Promise<{ result: loadingStateEnum; sports?: sportPost[] }> {
  const filter = team ? `&$filter=fields/selectedTeamId%20eq%20'${team}'` : '';
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${
      store.getState().paulyList.siteId
    }/lists/${
      store.getState().paulyList.sportsApprovedSubmissionsListId
    }/items?expand=fields($select=fileId,caption,selectedSportId,selectedTeamId,fileType)${filter}&$select=id`,
  );
  if (result.ok) {
    const dataResult = await result.json();
    if (dataResult.value.length !== undefined) {
      const newSportsPosts: sportPost[] = [];
      const shareResultsPromise: Promise<
        | {
            result: loadingStateEnum.success;
            index: number;
            url?: string | undefined;
            contentType?: dataContentTypeOptions | undefined;
          }
        | { result: loadingStateEnum.failed }
      >[] = [];
      for (let index = 0; index < dataResult.value.length; index += 1) {
        if (
          dataResult.value[index].fields.fileType === postType.microsoftFile
        ) {
          shareResultsPromise.push(
            getFileWithShareID(dataResult.value[index].fields.fileId, index),
          );
        }
      }
      const shareResults: (
        | {
            result: loadingStateEnum.success;
            index: number;
            url?: string | undefined;
            contentType?: dataContentTypeOptions | undefined;
          }
        | { result: loadingStateEnum.failed }
      )[] = await Promise.all(shareResultsPromise);

      for (let index = 0; index < dataResult.value.length; index += 1) {
        const item = shareResults.find(e => {
          if (e.result === loadingStateEnum.success) {
            return e.index === index;
          }
          return false;
        });
        if (item !== undefined) {
          if (item.result === loadingStateEnum.success) {
            const fileType = item.contentType;
            if (
              item.result === loadingStateEnum.success &&
              fileType !== undefined &&
              item.url !== undefined
            ) {
              newSportsPosts.push({
                caption: dataResult.value[index].fields.caption,
                data: {
                  fileId: item.url,
                  fileType,
                  postType: postType.microsoftFile,
                },
              });
            } else {
              return { result: loadingStateEnum.failed };
            }
          }
        } else if (
          dataResult.value[index].fields.fileType === postType.youtubeVideo
        ) {
          newSportsPosts.push({
            caption: dataResult.value[index].fields.caption,
            data: {
              fileId: dataResult.value[index].fields.fileId,
              postType: postType.youtubeVideo,
            },
          });
        }
      }
      return { result: loadingStateEnum.success, sports: newSportsPosts };
    }
    return { result: loadingStateEnum.failed };
  }
  return { result: loadingStateEnum.failed };
}

export async function getRoster(
  teamId: string,
): Promise<{ result: loadingStateEnum; data?: rosterType[] }> {
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${
      store.getState().paulyList.siteId
    }/lists/${teamId}/items?$expand=fields($select=playerId,position,playerNumber,posts,imageShareId)&$select=id`,
  );
  if (result.ok) {
    const data = await result.json();
    const batchData: { id: string; method: 'GET' | 'POST'; url: string }[][] =
      [];
    let batchIndex = -1;
    for (let index = 0; index < data.value.length; index += 1) {
      if (index % 20 === 0) {
        batchIndex += 1;
        batchData.push([]);
      }
      batchData[batchIndex].push({
        id: (index + 1 - 20 * batchIndex).toString(),
        method: 'GET',
        url: `/users/${data.value[index].fields.playerId}`,
      });
    }
    const batchResult = await batchRequest(batchData);
    if (
      batchResult.result === loadingStateEnum.success &&
      batchResult.data !== undefined
    ) {
      const outUsers: microsoftUserType[] = [];
      for (let index = 0; index < batchResult.data.length; index += 1) {
        if (batchResult.data[index].status === 200) {
          // TO DO check okay response code
          outUsers.push({
            id: batchResult.data[index].body?.id,
            displayName: batchResult.data[index].body?.displayName,
          });
        } else {
          return { result: loadingStateEnum.failed };
        }
      }
      const outputRosters: rosterType[] = [];
      for (let index = 0; index < data.value.length; index += 1) {
        const userData = outUsers.find(e => {
          return e.id === data.value[index].fields.playerId;
        });
        if (userData !== undefined) {
          outputRosters.push({
            name: userData.displayName,
            id: data.value[index].fields.playerId,
            imageShareId: data.value[index].fields.imageShareId,
            position: data.value[index].fields.position,
            playerNumber: data.value[index].fields.playerNumber,
            posts:
              data.value[index].fields.posts !== undefined
                ? JSON.parse(data.value[index].fields.posts)
                : undefined,
          });
        } else {
          return { result: loadingStateEnum.failed };
        }
      }
      return { result: loadingStateEnum.success, data: outputRosters };
    }
    return { result: loadingStateEnum.failed };
  }
  return { result: loadingStateEnum.failed };
}
