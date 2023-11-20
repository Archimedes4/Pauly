/*
  Pauly
  Andrew Mainella
  November 9 2023
  getCurrentPaulyData.ts
*/
import store from '../../Redux/store';
import callMsGraph from '../ultility/microsoftAssets';
import { loadingStateEnum } from '../../types';
import { paulyDataSlice } from '../../Redux/reducers/paulyDataReducer';

export default async function getCurrentPaulyData() {
  const result = await callMsGraph(
    `https://graph.microsoft.com/v1.0/sites/${
      store.getState().paulyList.siteId
    }/lists/${store.getState().paulyList.paulyDataListId}/items/1/fields`,
  );
  if (result.ok) {
    const data = await result.json();
    if (
      data.animationSpeed !== undefined &&
      data.message !== undefined &&
      data.powerpointId !== undefined
    ) {
      const fileResult = await callMsGraph(
        `https://graph.microsoft.com/v1.0/shares/${data.powerpointId}/driveItem/content?format=pdf`,
        'GET',
        undefined,
        [{ key: 'Prefer', value: 'redeemSharingLink' }],
      ); // `https://graph.microsoft.com/v1.0/shares/${data["powerpointId"]}/root?$select=@microsoft.graph.downloadUrl`
      if (fileResult.ok) {
        const dataBlob = await fileResult.blob();
        const urlOut = URL.createObjectURL(dataBlob);
        const outputResult = {
          powerpointBlob: urlOut,
          powerpointShare: data.powerpointId,
          message: data.message,
          animationSpeed: data.animationSpeed,
          paulyDataState: loadingStateEnum.success,
        };
        store.dispatch(paulyDataSlice.actions.setPaulyData(outputResult));
      } else {
        store.dispatch(
          paulyDataSlice.actions.setPaulyDataState(loadingStateEnum.failed),
        );
      }
    } else {
      store.dispatch(
        paulyDataSlice.actions.setPaulyDataState(loadingStateEnum.failed),
      );
    }
  } else {
    store.dispatch(
      paulyDataSlice.actions.setPaulyDataState(loadingStateEnum.failed),
    );
  }
}
