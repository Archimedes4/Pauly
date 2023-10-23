import store from '../../Redux/store';
import { commissionTypeEnum, loadingStateEnum } from '../../types';
import callMsGraph from '../Ultility/microsoftAssets';

export default async function updateCommission(
  isCreating: boolean,
  commissionName: string,
  isTimed: boolean,
  points: number,
  isHidden: boolean,
  maxNumberOfClaims: number,
  allowMultipleSubmissions: boolean,
  selectedCommissionType: number,
  selectedPostId: string,
  selectedTeamId: string,
  selectedChannelId: string,
  startDate: Date,
  endDate: Date,
  commissionId: string,
  proximity: number,
  selectedPositionIn: { lat: number; lng: number },
  commissionItemId: string,
): Promise<loadingStateEnum> {
  const data: any = {
    fields: {
      // All Commissions
      Title: commissionName,
      timed: isTimed,
      points,
      hidden: isHidden,
      maxNumberOfClaims,
      allowMultipleSubmissions,
      commissionID: commissionId,
      value: selectedCommissionType + 1,
    },
  };
  if (selectedPostId !== '') {
    data.fields.postTeamId = selectedTeamId;
    data.fields.postChannelId = selectedChannelId;
    data.fields.postId = selectedPostId;
  }
  if (isTimed) {
    data.fields.startDate = startDate.toISOString().replace(/.\d+Z$/g, 'Z');
    data.fields.endDate = endDate.toISOString().replace(/.\d+Z$/g, 'Z');
  }
  if (
    selectedCommissionType === commissionTypeEnum.Location ||
    selectedCommissionType === commissionTypeEnum.ImageLocation
  ) {
    data.fields.proximity = proximity;
    data.fields.coordinateLat = selectedPositionIn.lat;
    data.fields.coordinateLng = selectedPositionIn.lng;
  }
  if (selectedCommissionType === commissionTypeEnum.QRCode) {
    data.fields.qrCodeData = '[]';
  }

  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${
      store.getState().paulyList.siteId
    }/lists/${store.getState().paulyList.commissionListId}/items${
      !isCreating ? `/${commissionItemId}` : ''
    }`,
    isCreating ? 'POST' : 'PATCH',
    JSON.stringify(data),
  );
  if (result.ok) {
    return loadingStateEnum.success;
  }
  return loadingStateEnum.failed;
}
