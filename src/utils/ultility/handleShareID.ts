import { loadingStateEnum, dataContentTypeOptions } from '@constants';
import callMsGraph from './microsoftAssets';

export async function getFileWithShareID(
  shareID: string,
  index: number,
): Promise<
  {
    result: loadingStateEnum.failed;
   }
  | {
    result: loadingStateEnum.success;
    index: number;
    url?: string;
    contentType?: dataContentTypeOptions;
  }
> {
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/shares/${shareID}/driveItem`,
    'GET',
    undefined,
    [{ key: 'Prefer', value: 'redeemSharingLink' }],
  );
  if (result.ok) {
    const data = await result.json();
    if (
      data['@microsoft.graph.downloadUrl'] !== undefined &&
      data['@microsoft.graph.downloadUrl'] !== null
    ) {
      if (data.file.mimeType.slice(0, 5) === 'image') {
        return {
          result: loadingStateEnum.success,
          url: data['@microsoft.graph.downloadUrl'],
          contentType: dataContentTypeOptions.image,
          index,
        };
      }
      if (data.file.mimeType === 'video/mp4') {
        return {
          result: loadingStateEnum.success,
          url: data['@microsoft.graph.downloadUrl'],
          contentType: dataContentTypeOptions.video,
          index,
        };
      }
      if (
        data.file.mimeType ===
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ) {
        return {
          result: loadingStateEnum.success,
          url: data['@microsoft.graph.downloadUrl'],
          contentType: dataContentTypeOptions.pdf,
          index,
        };
      }
      return { result: loadingStateEnum.failed };
    }
    return { result: loadingStateEnum.failed };
  }
  return { result: loadingStateEnum.failed };
}

export async function createShareId(
  item: microsoftFileType,
): Promise<string | undefined> {
  const data = {
    type: 'view',
    scope: 'organization',
  };
  const result = await callMsGraph(
    `${item.callPath}/createLink`,
    'POST',
    JSON.stringify(data),
  );
  if (result.ok) {
    const data = await result.json();
    return data.shareId;
  }
  return undefined;
}

export async function getDataWithShareID(id: string): Promise<undefined | microsoftFileType> {
  const result = await callMsGraph(`https://graph.microsoft.com/v1.0/shares/${id}/driveItem`)
  if (result.ok) {
    const data = await result.json();
    return {
      name: data["name"],
      id: data["id"],
      lastModified: data["lastModifiedDateTime"],
      folder: data["folder"] !== undefined,
      parentDriveId: data["parentReference"]["driveId"],
      parentPath: data["parentReference"]["path"],
      itemGraphPath: `https://graph.microsoft.com/v1.0/${data["parentReference"]["path"]}`,
      callPath: "share",
      type: data["folder"] === undefined
      ? data["file"]["mimeType"]
      : 'folder'
    }
  }
}