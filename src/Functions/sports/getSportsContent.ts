import store from '../../Redux/store';
import { dataContentTypeOptions, loadingStateEnum } from '../../types';
import getFileWithShareID from '../Ultility/getFileWithShareID';
import callMsGraph from '../Ultility/microsoftAssets';

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
        result: loadingStateEnum;
        url?: string | undefined;
        contentType?: dataContentTypeOptions | undefined;
      }>[] = [];
      for (let index = 0; index < dataResult.value.length; index += 1) {
        shareResultsPromise.push(
          getFileWithShareID(dataResult.value[index].fields.fileId),
        );
      }
      const shareResults: {
        result: loadingStateEnum;
        url?: string | undefined;
        contentType?: dataContentTypeOptions | undefined;
      }[] = await Promise.all(shareResultsPromise);
      for (let index = 0; index < shareResults.length; index += 1) {
        const { url } = shareResults[index];
        const fileType = shareResults[index].contentType;
        if (
          shareResults[index].result === loadingStateEnum.success &&
          fileType !== undefined &&
          url !== undefined
        ) {
          newSportsPosts.push({
            caption: dataResult.value[index].fields.caption,
            fileID: url,
            fileType,
          });
        } else {
          return { result: loadingStateEnum.failed };
        }
      }
      return { result: loadingStateEnum.success, sports: newSportsPosts };
    }
    return { result: loadingStateEnum.failed };
  }
  const data = await result.json();
  return { result: loadingStateEnum.failed };
}
