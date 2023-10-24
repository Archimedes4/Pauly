import { orgWideGroupID, paulyDomain } from '../../PaulyConfig';
import { loadingStateEnum } from '../../types';
import create_UUID from '../ultility/createUUID';
import callMsGraph from '../ultility/microsoftAssets';

async function b64toBlob(
  b64Data: string,
  contentType = '',
  sliceSize = 512,
): Promise<Blob | undefined> {
  const result = await fetch(b64Data);
  if (result.ok) {
    return await result.blob();
  }
  return undefined;
}

export async function addImage(
  base64: string,
): Promise<{ result: loadingStateEnum; data?: string }> {
  const fileBlob = await b64toBlob(base64);
  if (fileBlob !== undefined) {
    const types: any = {
      'image/bmp': '.bmp',
      'image/gif': '.gif',
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
    };
    if (types[fileBlob.type] !== undefined) {
      const rootIdResult = await callMsGraph(
        'https://graph.microsoft.com/v1.0/me/drive/root?$select=id',
      );
      if (rootIdResult.ok) {
        const rootIdData = await rootIdResult.json();
        const imageUUID = create_UUID();
        const resumableSessionData = {
          item: {
            '@microsoft.graph.conflictBehavior': 'rename',
            name: `Pauly_Image_${imageUUID}_Submission${types[fileBlob.type]}`,
          },
          deferCommit: true,
        };
        const resumableSessionResult = await callMsGraph(
          `https://graph.microsoft.com/v1.0/me/drive/items/${
            rootIdData.id
          }:/Pauly_Image_${imageUUID}_Submission${
            types[fileBlob.type]
          }:/createUploadSession`,
          'POST',
          JSON.stringify(resumableSessionData),
        );
        if (resumableSessionResult.ok) {
          const resumableSessionResultData =
            await resumableSessionResult.json();
          const { uploadUrl } = resumableSessionResultData;
          if (resumableSessionResultData.nextExpectedRanges.length === 1) {
            const nextExpectedRange: string =
              resumableSessionResultData.nextExpectedRanges[0];
            let remaining: number = fileBlob.size;
            let uploaded: number = 0;
            if (nextExpectedRange === `${uploaded}-`) {
              while (remaining > 0) {
                // TO DO Check that this works
                const uploadBlob = fileBlob.slice(
                  uploaded,
                  remaining >= 5242880 ? 5242880 : remaining,
                );
                uploaded += remaining >= 5242880 ? 5242880 : remaining;

                const uploadResult = await fetch(uploadUrl, {
                  headers: {
                    'Content-Length': uploadBlob.size.toString(),
                    'Content-Range': `bytes ${
                      uploaded - (remaining >= 5242880 ? 5242880 : remaining)
                    }-${remaining >= 5242880 ? uploaded : uploaded - 1}/${
                      fileBlob.size
                    }`,
                  },
                  method: 'PUT',
                  body: uploadBlob,
                });
                remaining -= remaining >= 5242880 ? 5242880 : remaining;
                if (uploadResult.ok) {
                } else {
                  return { result: loadingStateEnum.failed };
                }
              }
              const uploadCompleteResult = await fetch(uploadUrl, {
                headers: {
                  'Content-Length': '0',
                },
                method: 'POST',
              });
              if (uploadCompleteResult.ok) {
                const uploadCompleteResultData =
                  await uploadCompleteResult.json();
                const createLinkMainData = {
                  type: 'view',
                  scope: 'organization',
                };
                const createLinkResult = await callMsGraph(
                  `https://graph.microsoft.com/v1.0/me/drive/items/${uploadCompleteResultData.id}/createLink`,
                  'POST',
                  JSON.stringify(createLinkMainData),
                );
                if (createLinkResult.ok) {
                  const createLinkData = await createLinkResult.json();
                  return {
                    result: loadingStateEnum.success,
                    data: createLinkData.shareId,
                  };
                }
                return { result: loadingStateEnum.failed };
              }
              return { result: loadingStateEnum.failed };
            }
            return { result: loadingStateEnum.failed };
          }
          return { result: loadingStateEnum.failed };
        }
        return { result: loadingStateEnum.failed };
      }
      return { result: loadingStateEnum.failed };
    }
    return { result: loadingStateEnum.failed };
  }
  return { result: loadingStateEnum.failed };
}

export async function claimCommissionPost(
  auth: string,
  commissionId: string,
  imageShare?: string,
  location?: locationCoords,
): Promise<loadingStateEnum> {
  let outResult: string = '';
  if (location) {
    outResult += `&latCoordinate=${location.latCoordinate}&lngCoordinate=${location.lngCoordinate}`;
  }
  if (imageShare) {
    outResult += `&imageShare=${imageShare}`;
  }
  const bearer = `Bearer ${auth}`;
  try {
    const result = await fetch(
      `${paulyDomain}/api/SubmitCommission?orgWideGroupId=${orgWideGroupID}&commissionId=${commissionId}${outResult}`,
      {
        headers: {
          Authorization: bearer,
        },
      },
    );
    if (result.ok) {
      return loadingStateEnum.success;
    }
    return loadingStateEnum.failed;
  } catch {
    return loadingStateEnum.failed;
  }
}
