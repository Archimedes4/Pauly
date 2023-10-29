import store from '../../Redux/store';
import { dataContentTypeOptions, loadingStateEnum, postType } from '../../types';
import getFileWithShareID from '../ultility/getFileWithShareID';
import callMsGraph from '../ultility/microsoftAssets';

export default async function getSportsContent(
  team?: string,
): Promise<{ result: loadingStateEnum; sports?: sportPost[] }> {
  const filter = team ? `&$filter=fields/selectedTeamId%20eq%20'${team}'` : '';
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${
      store.getState().paulyList.siteId
    }/lists/${
      store.getState().paulyList.sportsApprovedSubmissionsListId
    }/items?expand=fields($select=fileId,caption,selectedSportId,selectedTeamId)${filter}&$select=id`,
  );
  if (result.ok) {
    const dataResult = await result.json();
    if (dataResult.value.length !== undefined) {
      const newSportsPosts: sportPost[] = [];
      const shareResultsPromise: Promise<{
        result: loadingStateEnum.success;
        index: number;
        url?: string | undefined;
        contentType?: dataContentTypeOptions | undefined;
      } | {result: loadingStateEnum.failed}>[] = [];
      for (let index = 0; index < dataResult.value.length; index += 1) {
        if (dataResult.value[index].fields.fileType === postType.microsoftFile) {
          shareResultsPromise.push(
            getFileWithShareID(dataResult.value[index].fields.fileId, index),
          );
        }
      }
      const shareResults: ({
        result: loadingStateEnum.success;
        index: number;
        url?: string | undefined;
        contentType?: dataContentTypeOptions | undefined;
      }|{result: loadingStateEnum.failed})[] = await Promise.all(shareResultsPromise);

      for (let index = 0; index < dataResult.value.length; index += 1) {
        const item = shareResults.find((e) => {if (e.result === loadingStateEnum.success) {
          return e.index === index
        } else {return false}});
        if (item !== undefined) {
          if (item.result === loadingStateEnum.success) {
            const fileType = item.contentType;
            if (
              shareResults[index].result === loadingStateEnum.success &&
              fileType !== undefined &&
              item.url !== undefined
            ) {
              newSportsPosts.push({
                caption: dataResult.value[index].fields.caption,
                data: {
                  fileId: item.url,
                  fileType: fileType,
                  postType: postType.microsoftFile
                }
              });
            } else {
              return { result: loadingStateEnum.failed };
            }
          }
        } else if (dataResult.value[index].fields.fileType ===  postType.youtubeVideo) {
          newSportsPosts.push({
            caption: dataResult.value[index].fields.caption,
            data: {
              fileId: dataResult.value[index].fields.fileId,
              postType: postType.youtubeVideo
            }
          });
        }
      }
      return { result: loadingStateEnum.success, sports: newSportsPosts };
    }
    return { result: loadingStateEnum.failed };
  }
  const data = await result.json();
  return { result: loadingStateEnum.failed };
}
