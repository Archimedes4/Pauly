import { loadingStateEnum } from '../../types';
import create_UUID from '../Ultility/createUUID';
import callMsGraph from '../Ultility/microsoftAssets';
import {
  paulyListData,
  commissionsData,
  paulyClassExtensionData,
  paulyDataData,
  scheduleData,
  sportsApprovedSubmissionsData,
  sportsData,
  sportsSubmissionsData,
  timetablesData,
  resourceData,
  dressCodeData,
  addDataArray,
} from './initializePaulyData';

export async function initializePaulyPartOne(
  secondUserId: string,
): Promise<{ result: loadingStateEnum; groupId?: string }> {
  const currentUsersIdResult = await callMsGraph(
    'https://graph.microsoft.com/v1.0/me',
    'GET',
  );
  if (currentUsersIdResult.ok) {
    const currentUsersIdResultData = await currentUsersIdResult.json();
    const createGroupData = {
      description: "Pauly's Team Containing all it's data",
      displayName: 'Pauly',
      groupTypes: [
        'Unified',
        // , "DynamicMembership"
      ],
      mailEnabled: true,
      mailNickname: 'pauly',
      visibility: 'HiddenMembership',
      // "membershipRule": "(user.accountEnabled -eq true)",
      // "membershipRuleProcessingState": "on",
      'owners@odata.bind': [
        `https://graph.microsoft.com/v1.0/users/${currentUsersIdResultData.id}`,
        `https://graph.microsoft.com/v1.0/users/${secondUserId}`,
      ],
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
  const createTeamResultData = await createTeamResult.json();
  console.log('This Failed', createTeamResultData);
  return loadingStateEnum.failed;
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
    console.log('second run failed');
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
    }
  }

  // TO DO think about 409 if only half  of list where created and then interuption
  for (let index = 0; index < addDataArray.length; index += 1) {
    const callData = addDataArray[index];
    if (getPaulyListResultData.fields !== undefined) {
      if (getPaulyListResultData.fields[callData.id] !== undefined) {
        paulyListNewData.fields[callData.id] =
          getPaulyListResultData.fields[callData.id];
      }
    }
    if (
      paulyListNewData.fields[callData.id] === undefined ||
      update?.includes(callData.id)
    ) {
      const result = await callMsGraph(
        callData.urlTwo !== undefined
          ? callData.urlOne + getRootSiteIdResultData.id + callData.urlTwo
          : callData.urlOne,
        'POST',
        JSON.stringify(callData.data),
      );
      if (!result.ok) {
        return loadingStateEnum.failed;
      }
      const data = await result.json();
      paulyListNewData.fields[callData.id] = data.id;
    }
  }
  if (getPaulyListResultData.fields !== undefined) {
    if (getPaulyListResultData.fields.eventTypeExtensionId !== undefined) {
      paulyListNewData.fields.eventTypeExtensionId =
        getPaulyListResultData.fields.eventTypeExtensionId;
    } else {
      paulyListNewData.fields.eventTypeExtensionId = `String {${create_UUID()}} Name eventType`;
    }
  } else {
    paulyListNewData.fields.eventTypeExtensionId = `String {${create_UUID()}} Name eventType`;
  }

  if (getPaulyListResultData.fields !== undefined) {
    if (getPaulyListResultData.fields.eventDataExtensionId !== undefined) {
      paulyListNewData.fields.eventDataExtensionId =
        getPaulyListResultData.fields.eventDataExtensionId;
    } else {
      paulyListNewData.fields.eventDataExtensionId = `String {${create_UUID()}} Name eventData`;
    }
    if (getPaulyListResultData.fields.resourceExtensionId !== undefined) {
      paulyListNewData.fields.resourceExtensionId =
        getPaulyListResultData.fields.resourceExtensionId;
    } else {
      paulyListNewData.fields.resourceExtensionId = `String {${create_UUID()}} Name resourceData`;
    }
  } else {
    paulyListNewData.fields.eventDataExtensionId = `String {${create_UUID()}} Name eventData`;
    paulyListNewData.fields.resourceExtensionId = `String {${create_UUID()}} Name resourceData`;
  }

  if (paulyListNewData.fields.paulyDataListId === undefined) {
    const paulyDataResult = await callMsGraph(
      `https://graph.microsoft.com/v1.0/sites/${getRootSiteIdResultData.id}/lists`,
      'POST',
      JSON.stringify(paulyDataData),
    );
    if (!paulyDataResult.ok) {
      return loadingStateEnum.failed;
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
    const paulyListResult = await callMsGraph(
      `https://graph.microsoft.com/v1.0/sites/${getRootSiteIdResultData.id}/lists`,
      'POST',
      JSON.stringify(paulyListData),
    );
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
      'PATCH',
      JSON.stringify(paulyListNewData),
    );
    const ourData = await addPaulyListResult.json();
    if (!addPaulyListResult.ok) {
      return loadingStateEnum.failed;
    }
  }
  return loadingStateEnum.success;
}
