/*
  Pauly
  Andrew Mainella
  8 February 2024
  getResources.ts
  Functions for resources page
*/
import { loadingStateEnum, resourceMode, resourceResponce } from '@constants';
import store from '@redux/store';
import callMsGraph from '@utils/ultility/microsoftAssests';
import { resourcesSlice } from '@redux/reducers/resourcesReducer';
import createUUID from './ultility/createUUID';

export function convertResourceModeString(convert?: resourceMode): string {
  if (convert === resourceMode.sports) {
    return 'sports';
  }
  if (convert === resourceMode.schoolEvents) {
    return 'schoolEvents';
  }
  if (convert === resourceMode.annoucments) {
    return 'annoucments';
  }
  if (convert === resourceMode.fitness) {
    return 'fitness';
  }
  return 'files';
}

async function getResourceFollows() {
  let nextLink = `https://graph.microsoft.com/v1.0/sites/${
    store.getState().paulyList.siteId
  }/lists/${
    store.getState().paulyList.resourceListId
  }/items?expand=fields($select=resourceGroupId,resourceConversationId)&$select=id`;
  while (nextLink !== '') {
    // eslint-disable-next-line no-await-in-loop
    const result = await callMsGraph(nextLink);
    if (result.ok) {
      // eslint-disable-next-line no-await-in-loop
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
}

async function getAttachment(
  teamId: string,
  channelId: string,
  attachmentId: string,
): Promise<undefined | attachment> {
  const attachmentResult = await callMsGraph(
    `https://graph.microsoft.com/v1.0/teams/${teamId}/channels/${channelId}/filesFolder`,
  );
  if (attachmentResult.ok) {
    const attachmentData = await attachmentResult.json();
    const attachmentGetResult = await callMsGraph(
      `https://graph.microsoft.com/v1.0/drives/${attachmentData.parentReference.driveId}/items/${attachmentId}`,
    );
    if (attachmentGetResult.ok) {
      const attachmentGetResultData = await attachmentGetResult.json();
      return {
        webUrl: attachmentGetResultData.webUrl,
        id: attachmentGetResultData.id,
        title: attachmentGetResultData.name,
        type: attachmentGetResultData.file.mimeType,
      };
    }
  }
}

async function getAttachments(
  teamId: string,
  channelId: string,
  attachments: any[],
): Promise<attachment[]> {
  const attachmentsOut: attachment[] = [];
  const requests = [];
  for (
    let attachmentIndex = 0;
    attachmentIndex < attachments.length;
    attachmentIndex += 1
  ) {
    if (attachments[attachmentIndex].contentType === 'reference') {
      requests.push(
        getAttachment(teamId, channelId, attachments[attachmentIndex].id),
      );
    }
  }
  const results = await Promise.all(requests);
  results.forEach(e => {
    if (e) {
      attachmentsOut.push(e);
    }
  });
  return attachmentsOut;
}

export async function getCategoryResources(category: resourceMode) {
  store.dispatch(
    resourcesSlice.actions.setResourcesState(loadingStateEnum.loading),
  );
  const output: resourceDataType[] = [];
  const { paulyList } = store.getState();
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${paulyList.siteId}/lists/${paulyList.tagedResourceId}/items?$expand=fields&$filter=fields/category%20eq%20'${category}'&$select=fields,id`,
  );
  if (!result.ok) {
    store.dispatch(
      resourcesSlice.actions.setResourcesState(loadingStateEnum.failed),
    );
    return;
  }
  const data = await result.json();
  const batchDataRequests: batchRequest[][] = [[]];
  let batchCount = 0;
  for (let index = 0; index < data.value.length; index += 1) {
    // adding data to get resource messages of the resources that are in the category.
    batchDataRequests[batchCount].push({
      id: (index + 1).toString(),
      method: 'GET',
      url: `/teams/${data.value[index].fields.teamId}/channels/${data.value[index].fields.channelId}/messages/${data.value[index].fields.postId}`,
    });
    if (store.getState().resources.resourceFollow.length % 20 === 0) {
      batchDataRequests.push([]);
      batchCount += 1;
    }
  }
  // performing batch requests to get the resources
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
            const resourceResponceDataBody =
              resourceResponceData.responses[responceIndex].body;
            if (
              resourceResponceData.responses[responceIndex].body.content !==
              '<systemEventMessage/>'
            ) {
              const attachments = await getAttachments(
                resourceResponceDataBody.channelIdentity.teamId,
                resourceResponceDataBody.channelIdentity.channelId,
                resourceResponceDataBody.attachments,
              );
              const outputData: resourceDataType = {
                teamId:
                  store.getState().resources.resourceFollow[
                    parseInt(
                      resourceResponceData.responses[responceIndex].id,
                      10,
                    ) - 1
                  ].teamId,
                conversationId:
                  store.getState().resources.resourceFollow[
                    parseInt(
                      resourceResponceData.responses[responceIndex].id,
                      10,
                    ) - 1
                  ].channelId,
                id: resourceResponceData.responses[responceIndex].body.id,
                body: resourceResponceData.responses[responceIndex].body.body
                  .content,
                html:
                  resourceResponceData.responses[responceIndex].body
                    .contentType === 'html',
                attachments: attachments.length >= 1 ? attachments : undefined,
              };
              output.push(outputData);
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

export async function getResources() {
  store.dispatch(
    resourcesSlice.actions.setResourcesState(loadingStateEnum.loading),
  );
  await getResourceFollows();
  const output: resourceDataType[] = [];
  const batchDataRequests: batchRequest[][] = [[]];
  let batchCount = 0;
  for (
    let index = 0;
    index < store.getState().resources.resourceFollow.length;
    index += 1
  ) {
    // adding data to get resource messages of the resources that are followed.
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
  // performing batch requests to get the resources
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
            const resourceResponceDataBody =
              resourceResponceData.responses[responceIndex].body;
            for (
              let dataIndex = 0;
              dataIndex < resourceResponceDataBody.value.length;
              dataIndex += 1
            ) {
              if (
                resourceResponceData.responses[responceIndex].body.value[
                  dataIndex
                ].body.content !== '<systemEventMessage/>'
              ) {
                const attachments = await getAttachments(
                  resourceResponceDataBody.value[dataIndex].channelIdentity
                    .teamId,
                  resourceResponceDataBody.value[dataIndex].channelIdentity
                    .channelId,
                  resourceResponceDataBody.value[dataIndex].attachments,
                );
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
                        10,
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

export async function getScholarships(): Promise<
  | { result: loadingStateEnum.failed }
  | { result: loadingStateEnum.success; data: scholarship[] }
> {
  // https://developer.raindrop.io/v1/authentication/token
  // https://developer.raindrop.io/v1/raindrops/multiple
  const raindropToken = process.env.EXPO_PUBLIC_RAINDROPTOKEN;
  const result = await fetch(
    'https://api.raindrop.io/rest/v1/raindrops/37695900',
    {
      headers: {
        Authorization: `Bearer ${raindropToken}`,
      },
    },
  );
  if (result.ok) {
    const data = await result.json();
    const scholarships: scholarship[] = [];
    for (let index = 0; index < data.items.length; index += 1) {
      if (data.items[index].cover !== undefined) {
        scholarships.push({
          title: data.items[index].title,
          note: data.items[index].note,
          link: data.items[index].link,
          cover: data.items[index].cover,
          id: createUUID(),
        });
      }
    }
    return { result: loadingStateEnum.success, data: scholarships };
  }
  return { result: loadingStateEnum.failed };
}

export async function getNewsPosts(nextLink?: string | undefined): Promise<
  | { result: loadingStateEnum.failed }
  | {
      result: loadingStateEnum.success;
      data: newsPost[];
      nextLink?: string | undefined;
    }
> {
  const result = await fetch(
    `https://public-api.wordpress.com/rest/v1.1/sites/thecrusadernews.ca/posts${
      nextLink !== undefined ? `?${nextLink}` : ''
    }`,
  );
  if (result.ok) {
    const data = await result.json();
    const outputPosts: newsPost[] = [];
    for (let index = 0; index < data.posts.length; index += 1) {
      outputPosts.push({
        title: data.posts[index].title,
        excerpt: data.posts[index].excerpt,
        content: data.posts[index].content,
        id: data.posts[index].id,
        url: data.posts[index].URL,
      });
    }
    return {
      result: loadingStateEnum.success,
      data: outputPosts,
      nextLink: data.meta.next_page,
    };
  }
  return { result: loadingStateEnum.failed };
}

export async function getTaggedResource(
  teamId: string,
  channelId: string,
  postId: string,
): Promise<
  | {
      result: loadingStateEnum.success;
      data: taggedResource;
    }
  | {
      result: loadingStateEnum.notFound;
    }
  | {
      result: loadingStateEnum.failed;
    }
> {
  const { paulyList } = store.getState();
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${paulyList.siteId}/lists/${paulyList.tagedResourceId}/items?$expand=fields&$filter=fields/teamId%20eq%20'${teamId}'%20and%20fields/channelId%20eq%20'${channelId}'%20and%20fields/postId%20eq%20'${postId}'`,
  );
  if (result.ok) {
    const data = await result.json();
    if (data.value.length === 1) {
      return {
        result: loadingStateEnum.success,
        data: {
          importance: data.value[0].fields.importance,
          category: parseInt(data.value[0].fields.category, 10) as resourceMode,
          tagId: data.value[0].fields.id,
        },
      };
    }
    return { result: loadingStateEnum.notFound };
  }
  return { result: loadingStateEnum.failed };
}

export async function tagResource(
  teamId: string,
  channelId: string,
  postId: string,
  category: resourceMode,
  tagId?: string,
): Promise<loadingStateEnum> {
  const { paulyList } = store.getState();
  if (tagId === undefined) {
    const data = {
      fields: {
        category: category.toString(),
        importance: 0,
        teamId,
        channelId,
        postId,
      },
    };
    const result = await callMsGraph(
      `https://graph.microsoft.com/v1.0/sites/${paulyList.siteId}/lists/${paulyList.tagedResourceId}/items`,
      'POST',
      JSON.stringify(data),
    );
    if (result.ok) {
      return loadingStateEnum.success;
    }
    return loadingStateEnum.failed;
  }
  const data = {
    fields: {
      category: category.toString(),
      importance: 0,
    },
  };
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${paulyList.siteId}/lists/${paulyList.tagedResourceId}/${tagId}`,
    'PATCH',
    JSON.stringify(data),
  );
  if (result.ok) {
    return loadingStateEnum.success;
  }
  return loadingStateEnum.failed;
}
