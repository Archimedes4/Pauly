import { loadingStateEnum, dataContentTypeOptions } from '../../types';
import callMsGraph from './microsoftAssets';

export default async function getFileWithShareID(shareID: string, index: number): Promise<{
  result: loadingStateEnum.failed;
}|{
  result: loadingStateEnum.success;
  index: number;
  url?: string;
  contentType?: dataContentTypeOptions;
}> {
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
          index
        };
      }
      if (data.file.mimeType === 'video/mp4') {
        return {
          result: loadingStateEnum.success,
          url: data['@microsoft.graph.downloadUrl'],
          contentType: dataContentTypeOptions.video,
          index: index
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
          index: index
        };
      }
      return { result: loadingStateEnum.failed };
    }
    return { result: loadingStateEnum.failed };
  }
  return { result: loadingStateEnum.failed };
}
