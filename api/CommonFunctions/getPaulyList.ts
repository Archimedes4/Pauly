import { HttpResponseInit } from '@azure/functions';
import callMsGraph from './callMsGraph';
import { orgWideGroupID } from './constants';

declare global {
  type listResponce = {
    siteId: string;
    commissionListId: string;
    userExtensionId: string;
    commissionSubmissionsListId: string;
    eventSyncIdExtensionId: string;
  };
}

export default async function getPaulyList(
  accessToken: string,
): Promise<listResponce | HttpResponseInit> {
  // Get Site Data

  const getRootSiteIdResult = await callMsGraph(
    accessToken,
    `https://graph.microsoft.com/v1.0/groups/${orgWideGroupID}/sites/root`,
  );
  if (!getRootSiteIdResult.ok) {
    return { status: 500, body: 'Internal Error: Unable To Get Site' };
  }
  const getRootSiteIdResultData = await getRootSiteIdResult.json();

  if (getRootSiteIdResultData.id === undefined) {
    return { status: 500, body: 'Internal Error: Unable To Get Site' };
    return;
  }
  const paulyListResult = await callMsGraph(
    accessToken,
    `https://graph.microsoft.com/v1.0/sites/${getRootSiteIdResultData.id}/lists/PaulyList/items?expand=fields`,
  );
  const paulyListResultData = await paulyListResult.json();
  if (!paulyListResult.ok) {
    return { status: 500, body: 'Internal Error: Unable To Get Ids' };
  }
  try {
    if (paulyListResultData.value.length !== 1) {
      return { status: 500, body: 'Internal Error: Unable To Get Ids' };
    }
  } catch {
    return { status: 500, body: 'Internal Error: Unable To Get Ids' };
  }

  return {
    siteId: getRootSiteIdResultData.id,
    commissionListId: paulyListResultData.value[0].fields.commissionListId,
    userExtensionId: paulyListResultData.value[0].fields.userExtensionId,
    commissionSubmissionsListId:
      paulyListResultData.value[0].fields.commissionSubmissionsListId,
    eventSyncIdExtensionId:
      paulyListResultData.value[0].fields.eventSyncIdExtensionId,
  };
}
