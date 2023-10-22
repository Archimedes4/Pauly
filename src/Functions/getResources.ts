import { loadingStateEnum, resourceMode, resourceResponce } from '../types';
import store from '../Redux/store';
import callMsGraph from './Ultility/microsoftAssets';
import { resourcesSlice } from '../Redux/reducers/resourcesReducer';

async function getResourceFollows() {
  let nextLink = `https://graph.microsoft.com/v1.0/sites/${
    store.getState().paulyList.siteId
  }/lists/${
    store.getState().paulyList.resourceListId
  }/items?expand=fields($select=resourceGroupId,resourceConversationId)&$select=id`;
  while (nextLink !== '') {
    const result = await callMsGraph(nextLink);
    if (result.ok) {
      const data = await result.json();
      if (data['@odata.nextLink'] !== undefined) {
        nextLink = data['@odata.nextLink'];
      } else {
        nextLink = '';
      }
      const output: resourceFollowType[] = [];
      for (let index = 0; index < data.value.length; index += 1) {
        output.push({
          teamId: data.value[index].fields.resourceGroupId,
          channelId: data.value[index].fields.resourceConversationId,
        });
      }
      store.dispatch(resourcesSlice.actions.setResourceFollow(output));
    } else {
      store.dispatch(
        resourcesSlice.actions.setResourcesState(loadingStateEnum.failed),
      );
      return;
    }
  }
  store.dispatch(
    resourcesSlice.actions.setResourcesState(loadingStateEnum.failed),
  );
}

export async function getResources(category?: resourceMode) {
  await getResourceFollows();
  const categoryString =
    category === resourceMode.sports
      ? 'sports'
      : category === resourceMode.advancement
      ? 'advancement'
      : category === resourceMode.schoolEvents
      ? 'schoolEvents'
      : category === resourceMode.annoucments
      ? 'annoucments'
      : category === resourceMode.fitness
      ? 'fitness'
      : 'files';
  const categoryFilter = `?$expand=singleValueExtendedProperties($filter=id%20eq%20'${
    store.getState().paulyList.resourceExtensionId
  }')&$filter=singleValueExtendedProperties/Any(ep:%20ep/id%20eq%20'${
    store.getState().paulyList.resourceExtensionId
  }'%20and%20ep/value%20eq%20'${categoryString}')`;
  const output: resourceDataType[] = [];
  const batchDataRequests: { id: string; method: string; url: string }[][] = [
    [],
  ];
  let batchCount = 0;
  for (
    let index = 0;
    index < store.getState().resources.resourceFollow.length;
    index += 1
  ) {
    // resourceGroupId
    batchDataRequests[batchCount].push({
      id: (index + 1).toString(),
      method: 'GET',
      url: `/teams/${
        store.getState().resources.resourceFollow[index].teamId
      }/channels/${
        store.getState().resources.resourceFollow[index].channelId
      }/messages`,
    });
    if (store.getState().resources.resourceFollow.length % 20 === 0) {
      batchDataRequests.push([]);
      batchCount += 1;
    }
  }
  for (let index = 0; index < batchDataRequests.length; index += 1) {
    const batchData = {
      requests: batchDataRequests[index],
    };
    if (batchDataRequests[index].length !== 0) {
      const resourceRsp = await callMsGraph(
        'https://graph.microsoft.com/v1.0/$batch',
        'POST',
        JSON.stringify(batchData),
        [{ key: 'Accept', value: 'application/json' }],
      );
      if (resourceRsp.ok) {
        const resourceResponceData = await resourceRsp.json();
        for (
          let responceIndex = 0;
          responceIndex < resourceResponceData.responses.length;
          responceIndex += 1
        ) {
          if (resourceResponceData.responses[responceIndex].status === 200) {
            for (
              let dataIndex = 0;
              dataIndex <
              resourceResponceData.responses[responceIndex].body.value.length;
              dataIndex += 1
            ) {
              if (
                resourceResponceData.responses[responceIndex].body.value[
                  dataIndex
                ].body.content !== '<systemEventMessage/>'
              ) {
                const attachments: resourceType[] = [];
                for (
                  let attachmentIndex = 0;
                  attachmentIndex <
                  resourceResponceData.responses[responceIndex].body.value[
                    dataIndex
                  ].attachments.length;
                  attachmentIndex += 1
                ) {
                  if (
                    resourceResponceData.responses[responceIndex].body.value[
                      dataIndex
                    ].attachments[attachmentIndex].contentType === 'reference'
                  ) {
                    const attachmentResult = await callMsGraph(
                      `https://graph.microsoft.com/v1.0/teams/${resourceResponceData.responses[responceIndex].body.value[dataIndex].channelIdentity.teamId}/channels/${resourceResponceData.responses[responceIndex].body.value[dataIndex].channelIdentity.channelId}/filesFolder`,
                    );
                    if (attachmentResult.ok) {
                      const attachmentData = await attachmentResult.json();
                      const attachmentGetResult = await callMsGraph(
                        `https://graph.microsoft.com/v1.0/drives/${attachmentData.parentReference.driveId}/items/${resourceResponceData.responses[responceIndex].body.value[dataIndex].attachments[attachmentIndex].id}`,
                      );
                      if (attachmentGetResult.ok) {
                        const attachmentGetResultData =
                          await attachmentGetResult.json();
                        attachments.push({
                          webUrl: attachmentGetResultData.webUrl,
                          id: attachmentGetResultData.id,
                          title: attachmentGetResultData.name,
                          type: attachmentGetResultData.file.mimeType,
                        });
                      }
                    }
                  }
                }
                const outputData: resourceDataType = {
                  teamId:
                    store.getState().resources.resourceFollow[
                      parseInt(
                        resourceResponceData.responses[responceIndex].id,
                      ) - 1
                    ].teamId,
                  conversationId:
                    store.getState().resources.resourceFollow[
                      parseInt(
                        resourceResponceData.responses[responceIndex].id,
                      ) - 1
                    ].channelId,
                  id: resourceResponceData.responses[responceIndex].body.value[
                    dataIndex
                  ].id,
                  body: resourceResponceData.responses[responceIndex].body
                    .value[dataIndex].body.content,
                  html:
                    resourceResponceData.responses[responceIndex].body.value[
                      dataIndex
                    ].body.contentType === 'html',
                  attachments:
                    attachments.length >= 1 ? attachments : undefined,
                };
                output.push(outputData);
              }
            }
          }
        }
      } else {
        store.dispatch(
          resourcesSlice.actions.setResourcesState(loadingStateEnum.failed),
        );
        return;
      }
    }
  }
  store.dispatch(
    resourcesSlice.actions.setResources({
      resources: output,
      loadingState: loadingStateEnum.success,
    }),
  );
}

export async function getResourcesSearch(search: string) {
  store.dispatch(
    resourcesSlice.actions.setResourcesState(loadingStateEnum.loading),
  );
  const searchPayload = {
    requests: [
      {
        entityTypes: ['chatMessage'],
        query: {
          queryString: search,
        },
        from: 0,
        size: 15,
        enableTopResults: true,
      },
    ],
  };
  const searchResult = await callMsGraph(
    'https://graph.microsoft.com/v1.0/search/query',
    'POST',
    JSON.stringify(searchPayload),
  );
  if (searchResult.ok) {
    const searchData = await searchResult.json();
    const batchDataRequests: { id: string; method: string; url: string }[] = [];
    if (searchData.value.length === 1) {
      if (searchData.value[0].hitsContainers.length === 1) {
        for (
          let index = 0;
          index < searchData.value[0].hitsContainers[0].hits.length;
          index += 1
        ) {
          if (
            searchData.value[0].hitsContainers[0].hits[index].resource
              .channelIdentity !== undefined
          ) {
            const resourceIndex = store
              .getState()
              .resources.resourceFollow.findIndex(e => {
                return (
                  e.channelId ===
                  searchData.value[0].hitsContainers[0].hits[index].resource
                    .channelIdentity.channelId
                );
              });
            if (resourceIndex !== -1) {
              batchDataRequests.push({
                id: batchDataRequests.length.toString() + 1,
                method: 'GET',
                url: `/teams/${searchData.value[0].hitsContainers[0].hits[index].resource.channelIdentity.teamId}/channels/${searchData.value[0].hitsContainers[0].hits[index].resource.channelIdentity.channelId}/messages/${searchData.value[0].hitsContainers[0].hits[index].resource.id}`,
              });
            } else {
              store.dispatch(
                resourcesSlice.actions.setResourcesState(
                  loadingStateEnum.failed,
                ),
              );
              return;
            }
          }
        }
      } else {
        store.dispatch(
          resourcesSlice.actions.setResourcesState(loadingStateEnum.failed),
        );
        return;
      }

      const batchData = {
        requests: batchDataRequests,
      };
      const batchResult = await callMsGraph(
        'https://graph.microsoft.com/v1.0/$batch',
        'POST',
        JSON.stringify(batchData),
        [{ key: 'Accept', value: 'application/json' }],
      );
      if (batchResult.ok) {
        const batchResultData = await batchResult.json();
        const outputData: resourceDataType[] = [];
        for (
          let batchIndex = 0;
          batchIndex < batchResultData.responses.length;
          batchIndex += 1
        ) {
          if (batchResultData.responses[batchIndex].status === 200) {
            // TO DO fix ok code
            console.log(batchResultData.responses[batchIndex].body);
            outputData.push({
              teamId:
                batchResultData.responses[batchIndex].body.channelIdentity
                  .teamId,
              conversationId:
                batchResultData.responses[batchIndex].body.channelIdentity
                  .channelId,
              id: batchResultData.responses[batchIndex].body.id,
              body: batchResultData.responses[batchIndex].body.body.content,
              html:
                batchResultData.responses[batchIndex].body.body.contentType ===
                'html',
            });
          } else {
            store.dispatch(
              resourcesSlice.actions.setResourcesState(loadingStateEnum.failed),
            );
            return;
          }
        }
        store.dispatch(
          resourcesSlice.actions.setResources({
            resources: outputData,
            loadingState: loadingStateEnum.success,
          }),
        );
      } else {
        store.dispatch(
          resourcesSlice.actions.setResourcesState(loadingStateEnum.failed),
        );
      }
    } else {
      store.dispatch(
        resourcesSlice.actions.setResourcesState(loadingStateEnum.failed),
      );
    }
  } else {
    store.dispatch(
      resourcesSlice.actions.setResourcesState(loadingStateEnum.failed),
    );
  }
}

export default async function getResource(
  groupId: string,
  conversationId: string,
): Promise<{ result: resourceResponce; itemId?: string }> {
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${
      store.getState().paulyList.siteId
    }/lists/${
      store.getState().paulyList.resourceListId
    }/items?expand=fields&$filter=fields/resourceGroupId%20eq%20'${groupId}'%20and%20fields/resourceConversationId%20eq%20'${conversationId}'`,
  );
  if (!result.ok) {
    return { result: resourceResponce.failed };
  }
  const data = await result.json();
  if (data.value.length === 1) {
    return { result: resourceResponce.found, itemId: data.value[0].id };
  }
  if (data.value.length === 0) {
    return { result: resourceResponce.notFound };
  }
  return { result: resourceResponce.failed };
}
