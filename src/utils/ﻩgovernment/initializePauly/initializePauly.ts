import { loadingStateEnum } from '@constants';
import createUUID from '@utils/ultility/createUUID';
import callMsGraph from '@utils/ultility/microsoftAssests';
import store from '@redux/store';
import {
  paulyListData,
  paulyDataData,
  addDataArray,
  url,
} from './initializePaulyData';

export async function initializePaulyPartOne(
  owners: string[],
): Promise<{ result: loadingStateEnum; groupId?: string }> {
  const currentUsersIdResult = await callMsGraph(
    'https://graph.microsoft.com/v1.0/me',
    'GET',
  );
  if (currentUsersIdResult.ok) {
    const currentUsersIdResultData = await currentUsersIdResult.json();
    const bindedOwners: string[] = [];
    bindedOwners.push(
      `https://graph.microsoft.com/v1.0/users/${currentUsersIdResultData.id}`,
    );
    for (let index = 0; index < owners.length; index += 1) {
      bindedOwners.push(
        `https://graph.microsoft.com/v1.0/users/${owners[index]}`,
      );
    }
    const createGroupData = {
      description: "Pauly's Team Containing all it's data",
      displayName: 'Pauly',
      groupTypes: [
        'Unified', // 'DynamicMembership'
      ],
      mailEnabled: true,
      mailNickname: 'pauly',
      visibility: 'HiddenMembership',
      // membershipRule: '(user.accountEnabled -eq true)',
      // membershipRuleProcessingState: 'on',
      'owners@odata.bind': bindedOwners,
      securityEnabled: false,
    };
    const createGroupResult = await callMsGraph(
      'https://graph.microsoft.com/v1.0/groups',
      'POST',
      JSON.stringify(createGroupData),
    );
    if (createGroupResult.ok) {
      const createGroupResultData = await createGroupResult.json();
      return {
        result: loadingStateEnum.success,
        groupId: createGroupResultData.id,
      };
    }
    return { result: loadingStateEnum.failed };
  }
  return { result: loadingStateEnum.failed };
}

export async function initializePaulyPartTwo(
  groupId: string,
): Promise<loadingStateEnum> {
  const teamsData = {
    'template@odata.bind':
      "https://graph.microsoft.com/v1.0/teamsTemplates('standard')",
    'group@odata.bind': `https://graph.microsoft.com/v1.0/groups('${groupId}')`,
  };
  const createTeamResult = await callMsGraph(
    'https://graph.microsoft.com/v1.0/teams',
    'POST',
    JSON.stringify(teamsData),
  );
  if (createTeamResult.ok) {
    return loadingStateEnum.success;
  }
  return loadingStateEnum.failed;
}

async function createData(
  callData: addDataType,
  rootSiteId: string,
): Promise<
  | { result: loadingStateEnum.notFound; callData: addDataType } // For a 409
  | { result: loadingStateEnum.failed }
  | { result: loadingStateEnum.success; id: string; callId: string }
> {
  const result = await callMsGraph(
    callData.urlTwo !== undefined
      ? callData.urlOne + rootSiteId + callData.urlTwo
      : callData.urlOne,
    'POST',
    JSON.stringify(callData.data),
  );
  if (!result.ok) {
    if (result.status === 409) {
      console.log('409 returned', callData);
      return { result: loadingStateEnum.notFound, callData };
    }
    return { result: loadingStateEnum.failed };
  }
  const data = await result.json();
  return {
    result: loadingStateEnum.success,
    id: data.id as string,
    callId: callData.id,
  };
}

async function getData(
  callData: addDataType,
  rootSiteId: string,
): Promise<
  | { result: loadingStateEnum.failed }
  | { result: loadingStateEnum.success; id: string; callId: string }
> {
  if ('displayName' in callData.data) {
    const result = await callMsGraph(
      callData.urlTwo !== undefined
        ? `${callData.urlOne + rootSiteId + callData.urlTwo}?$filter=displayName%20eq%20'${callData.data.displayName}'`
        : `${callData.urlOne}?$filter=displayName%20eq%20'${callData.data.displayName}'`,
    );
    if (!result.ok) {
      return { result: loadingStateEnum.failed };
    }
    const data = await result.json();
    if (data.value.length < 1) {
      return { result: loadingStateEnum.failed };
    }
    if (data.value[0].id === undefined) {
      return { result: loadingStateEnum.failed };
    }
    return {
      result: loadingStateEnum.success,
      id: data.value[0].id as string,
      callId: callData.id,
    };
  }
  return { result: loadingStateEnum.failed };
}

export async function initializePaulyPartThree(
  groupId: string,
  update?: string[],
): Promise<loadingStateEnum> {
  const getTeam = await callMsGraph(
    `https://graph.microsoft.com/v1.0/teams/${groupId}`,
  );
  if (!getTeam.ok) {
    return loadingStateEnum.failed;
  }
  const getTeamData = await getTeam.json();

  const getRootSiteIdResult = await callMsGraph(
    `https://graph.microsoft.com/v1.0/groups/${getTeamData.id}/sites/root`,
  );
  if (!getRootSiteIdResult.ok) {
    return loadingStateEnum.failed;
  }
  const getRootSiteIdResultData = await getRootSiteIdResult.json();

  const paulyListNewData: { fields: any } = { fields: { Title: 'Main' } };

  // Check if already data
  let secondRun: boolean = false;
  const getPaulyListResult = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${getRootSiteIdResultData.id}/lists/PaulyList/items/1?expand=fields`,
  );
  if (!getPaulyListResult.ok && getPaulyListResult.status !== 404) {
    return loadingStateEnum.failed;
  }
  const getPaulyListResultData = await getPaulyListResult.json();
  if (getPaulyListResult.status !== 404) {
    if (getPaulyListResultData.fields !== undefined) {
      secondRun = true;
      if (getPaulyListResultData.fields !== undefined) {
        if (getPaulyListResultData.fields.paulyDataListId !== undefined) {
          paulyListNewData.fields.paulyDataListId =
            getPaulyListResultData.fields.paulyDataListId;
        }
      }
      // Checking if to clear data
      if (update?.includes('paulyList')) {
        // delete old list
        const deleteResult = await callMsGraph(
          `https://graph.microsoft.com/v1.0/sites/${getRootSiteIdResultData.id}/lists/PaulyList/items/1`,
          'DELETE',
        );
        if (!deleteResult.ok) {
          return loadingStateEnum.failed;
        }
        // create the new list
        const paulyListResult = await callMsGraph(
          `https://graph.microsoft.com/v1.0/sites/${getRootSiteIdResultData.id}/lists`,
          'POST',
          JSON.stringify(paulyListData),
        );
        if (!paulyListResult.ok) {
          return loadingStateEnum.failed;
        }
      }
    }
  }

  if (!secondRun) {
    // Add Team photo
    const imageFetch = await fetch(url);
    if (!imageFetch.ok) {
      return loadingStateEnum.failed;
    }
    const imageBlob = await imageFetch.blob();
    const result = await fetch(
      `https://graph.microsoft.com/v1.0/teams/${groupId}/photo/$value`,
      {
        method: 'PUT',
        body: imageBlob,
        headers: {
          'Content-type': 'image/jpeg',
          Authorization: `Bearer ${store.getState().authenticationToken}`,
        },
      },
    );
    if (!result.ok) {
      return loadingStateEnum.failed;
    }
  }

  // TO DO think about 409 if only half  of list where created and then interuption
  const ongoingRequests: Promise<
    | { result: loadingStateEnum.notFound; callData: addDataType }
    | { result: loadingStateEnum.failed }
    | { result: loadingStateEnum.success; id: string; callId: string }
  >[] = [];
  for (let index = 0; index < addDataArray.length; index += 1) {
    const callData = addDataArray[index];
    if (
      getPaulyListResultData.fields !== undefined &&
      getPaulyListResultData.fields[callData.id] !== undefined
    ) {
      paulyListNewData.fields[callData.id] =
        getPaulyListResultData.fields[callData.id];
    }
    if (
      paulyListNewData.fields[callData.id] === undefined ||
      update?.includes(callData.id)
    ) {
      ongoingRequests.push(createData(callData, getRootSiteIdResultData.id));
    }
  }
  const finalRequests = await Promise.all(ongoingRequests);
  for (let index = 0; index < finalRequests.length; index += 1) {
    const finalRequest = finalRequests[index];
    if (finalRequest.result === loadingStateEnum.success) {
      paulyListNewData.fields[finalRequest.callId] = finalRequest.id;
    } else if (finalRequest.result === loadingStateEnum.notFound) {
      const getDataResult = await getData(
        finalRequest.callData,
        getRootSiteIdResultData.id,
      );
      if (getDataResult.result !== loadingStateEnum.success) {
        return loadingStateEnum.failed;
      }
      paulyListNewData.fields[getDataResult.callId] = getDataResult.id;
    } else {
      return loadingStateEnum.failed;
    }
  }

  if (getPaulyListResultData.fields !== undefined) {
    if (getPaulyListResultData.fields.eventDataExtensionId !== undefined) {
      paulyListNewData.fields.eventDataExtensionId =
        getPaulyListResultData.fields.eventDataExtensionId;
    } else {
      paulyListNewData.fields.eventDataExtensionId = `String {${createUUID()}} Name eventData`;
    }
    if (getPaulyListResultData.fields.eventTypeExtensionId !== undefined) {
      paulyListNewData.fields.eventTypeExtensionId =
        getPaulyListResultData.fields.eventTypeExtensionId;
    } else {
      paulyListNewData.fields.eventTypeExtensionId = `String {${createUUID()}} Name eventType`;
    }
    if (getPaulyListResultData.fields.eventSyncIdExtensionId !== undefined) {
      paulyListNewData.fields.eventSyncIdExtensionId =
        getPaulyListResultData.fields.eventSyncIdExtensionId;
    } else {
      paulyListNewData.fields.eventSyncIdExtensionId = `String {${createUUID()}} Name eventSyncId`;
    }
    if (getPaulyListResultData.fields.eventSyncModeExtensionId !== undefined) {
      paulyListNewData.fields.eventSyncModeExtensionId =
        getPaulyListResultData.fields.eventSyncModeExtensionId;
    } else {
      paulyListNewData.fields.eventSyncIdExtensionId = `String {${createUUID()}} Name eventSyncMode`;
    }
  } else {
    paulyListNewData.fields.eventDataExtensionId = `String {${createUUID()}} Name eventData`;
    paulyListNewData.fields.eventTypeExtensionId = `String {${createUUID()}} Name eventType`;
    paulyListNewData.fields.eventSyncIdExtensionId = `String {${createUUID()}} Name eventSyncId`;
    paulyListNewData.fields.eventSyncModeExtensionId = `String {${createUUID()}} Name eventSyncMode`;
  }

  if (paulyListNewData.fields.paulyDataListId === undefined) {
    let paulyDataResult = await callMsGraph(
      `https://graph.microsoft.com/v1.0/sites/${getRootSiteIdResultData.id}/lists`,
      'POST',
      JSON.stringify(paulyDataData),
    );
    if (!paulyDataResult.ok || paulyDataResult.status === 409) {
      if (paulyDataResult.status === 409) {
        const paulyDataFourResult = await callMsGraph(
          `https://graph.microsoft.com/v1.0/sites/${getRootSiteIdResultData.id}/lists/PaulyData?$select=id`,
        );
        if (!paulyDataFourResult.ok) {
          return loadingStateEnum.failed;
        }
        paulyDataResult = paulyDataFourResult;
      } else {
        return loadingStateEnum.failed;
      }
    }
    const paulyDataResultData = await paulyDataResult.json();
    const paulyDataNewData = {
      fields: {
        Title: 'Main',
        animationSpeed: 10,
        message: 'Pauly',
        powerpointId: 'unset',
      },
    };
    const setPaulyDataNewDataResult = await callMsGraph(
      `https://graph.microsoft.com/v1.0/sites/${getRootSiteIdResultData.id}/lists/${paulyDataResultData.id}/items`,
      'POST',
      JSON.stringify(paulyDataNewData),
    );
    if (!setPaulyDataNewDataResult.ok) {
      return loadingStateEnum.failed;
    }
    paulyListNewData.fields.paulyDataListId = paulyDataResultData.id;
  }
  if (secondRun === false) {
    let paulyListResult = await callMsGraph(
      `https://graph.microsoft.com/v1.0/sites/${getRootSiteIdResultData.id}/lists`,
      'POST',
      JSON.stringify(paulyListData),
    );
    if (paulyListResult.status === 409) {
      const paulyListFourResult = await callMsGraph(
        `https://graph.microsoft.com/v1.0/sites/${getRootSiteIdResultData.id}/lists/PaulyList?$select=id`,
      );
      paulyListResult = paulyListFourResult;
    }
    if (!paulyListResult.ok) {
      return loadingStateEnum.failed;
    }
    const addPaulyListResult = await callMsGraph(
      `https://graph.microsoft.com/v1.0/sites/${getRootSiteIdResultData.id}/lists/PaulyList/items`,
      'POST',
      JSON.stringify(paulyListNewData),
    );
    if (!addPaulyListResult.ok) {
      return loadingStateEnum.failed;
    }
  } else {
    const addPaulyListResult = await callMsGraph(
      `https://graph.microsoft.com/v1.0/sites/${getRootSiteIdResultData.id}/lists/PaulyList/items/1`,
      update?.includes('paulyList') ? 'POST' : 'PATCH',
      JSON.stringify(paulyListNewData),
    );
    if (!addPaulyListResult.ok) {
      return loadingStateEnum.failed;
    }
  }
  return loadingStateEnum.success;
}
