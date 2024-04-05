/*
  Pauly
  Andrew Mainella
  November 9 2023
  updateCommission.ts
*/
import store from '@redux/store';
import { commissionTypeEnum, loadingStateEnum } from '@constants';
import callMsGraph from '../ultility/microsoftAssests';
import createUUID from '../ultility/createUUID';

export async function updateCommission(
  isCreating: boolean,
  commissionsData: commissionType,
): Promise<loadingStateEnum> {
  const data: any = {
    fields: {
      // All Commissions
      Title: commissionsData.title,
      timed: commissionsData.timed,
      points: commissionsData.points,
      hidden: commissionsData.hidden,
      maxNumberOfClaims: commissionsData.maxNumberOfClaims,
      allowMultipleSubmissions: commissionsData.allowMultipleSubmissions,
      commissionID: commissionsData.commissionId,
      value: commissionsData.value,
      homeValue: commissionsData.competitionType,
    },
  };
  if (commissionsData.postData !== undefined) {
    data.fields.postTeamId = commissionsData.postData.teamId;
    data.fields.postChannelId = commissionsData.postData.channelId;
    data.fields.postId = commissionsData.postData.postId;
  }
  if (commissionsData.timed) {
    data.fields.startDate = commissionsData.startDate;
    data.fields.endDate = commissionsData.endDate;
  }
  if (
    commissionsData.value === commissionTypeEnum.Location ||
    commissionsData.value === commissionTypeEnum.ImageLocation
  ) {
    data.fields.proximity = commissionsData.proximity;
    data.fields.coordinateLat = commissionsData.coordinateLat;
    data.fields.coordinateLng = commissionsData.coordinateLng;
  }
  if (commissionsData.value === commissionTypeEnum.QRCode) {
    data.fields.qrCodeData = '[]';
  }

  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${
      store.getState().paulyList.siteId
    }/lists/${store.getState().paulyList.commissionListId}/items${
      !isCreating ? `/${commissionsData.itemId}` : ''
    }`,
    isCreating ? 'POST' : 'PATCH',
    JSON.stringify(data),
  );
  if (result.ok) {
    return loadingStateEnum.success;
  }
  return loadingStateEnum.failed;
}

export async function createCommissionSubmission(
  userId: string,
  commissionId: string,
  submissionApproved: boolean,
  submissionReviewed: boolean,
): Promise<loadingStateEnum.success | loadingStateEnum.failed> {
  const submissionId = createUUID();
  const submissionData = {
    Title: submissionId,
    submittedTime: new Date().toISOString(),
    userId,
    submissionId,
    submissionApproved,
    submissionReviewed,
    commissionId,
    submissionData: JSON.stringify({}),
  };
  const submitResult = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${
      store.getState().paulyList.siteId
    }/lists/${store.getState().paulyList.commissionSubmissionsListId}/items`,
    'POST',
    JSON.stringify(submissionData),
  );
  if (submitResult.ok) {
    return loadingStateEnum.success;
  }
  return loadingStateEnum.failed;
}
