/*
  Pauly
  Andrew Mainella
  November 9 2023
  microsoftGroupsFunctions.ts
  common function to access microsoft group/teams data
*/
import { loadingStateEnum } from '@constants';
import callMsGraph from '@utils/ultility/microsoftAssests';

export async function getTeams(nextLink?: string): Promise<{
  result: loadingStateEnum;
  data?: groupType[];
  nextLink?: string;
}> {
  const groupResult = await callMsGraph(
    nextLink || 'https://graph.microsoft.com/v1.0/me/joinedTeams',
  );
  if (groupResult.ok) {
    const groupResultData = await groupResult.json();
    if (groupResultData.value !== undefined) {
      const outputData: groupType[] = [];
      for (let index = 0; index < groupResultData.value.length; index += 1) {
        outputData.push({
          name: groupResultData.value[index].displayName,
          id: groupResultData.value[index].id,
        });
      }
      return {
        result: loadingStateEnum.success,
        data: outputData,
        nextLink: groupResultData['@odata.nextLink'],
      };
    }
    return { result: loadingStateEnum.failed };
  }
  return { result: loadingStateEnum.failed };
}

export async function getChannels(
  teamId: string,
  nextLink: string | undefined = undefined,
): Promise<
  | {
      result: loadingStateEnum.failed;
    }
  | {
      result: loadingStateEnum.success;
      data: channelType[];
      nextLink?: string;
    }
> {
  const result = await callMsGraph(
    nextLink || `https://graph.microsoft.com/v1.0/teams/${teamId}/allChannels`,
  );
  if (result.ok) {
    const data = await result.json();
    const output: channelType[] = [];
    for (let index = 0; index < data.value.length; index += 1) {
      output.push({
        id: data.value[index].id,
        displayName: data.value[index].displayName,
        selected: false,
        loading: false,
        error: false,
      });
    }
    return {
      result: loadingStateEnum.success,
      data: output,
      nextLink: data['@odata.nextLink'],
    };
  }
  return { result: loadingStateEnum.failed };
}

export async function getPosts(
  teamId: string,
  channelId: string,
): Promise<{
  result: loadingStateEnum;
  data?: resourceDataType[];
  nextLink?: string;
}> {
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/teams/${teamId}/channels/${channelId}/messages`,
  );
  if (result.ok) {
    const data = await result.json();
    const output: resourceDataType[] = [];
    for (let index = 0; index < data.value.length; index += 1) {
      output.push({
        id: data.value[index].id,
        body: data.value[index].body.content,
        teamId: data.value[index].channelIdentity.teamId,
        conversationId: data.value[index].channelIdentity.channelId,
        html: false,
      });
    }
    return {
      result: loadingStateEnum.success,
      data: output,
      nextLink: data['@odata.nextLink'],
    };
  }
  return { result: loadingStateEnum.failed };
}