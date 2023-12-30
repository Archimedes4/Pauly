import store from '@redux/store';
import { microsoftProfileDataSlice } from '@redux/reducers/microsoftProfileDataReducer';
import callMsGraph from '@utils/ultility/microsoftAssets';

export default async function getUserImage() {
  const result = await callMsGraph(
    'https://graph.microsoft.com/v1.0/me/photo/$value',
    'GET',
  );
  // Checking if success
  if (result.ok) {
    const dataBlob = await result.blob();
    const urlOut = URL.createObjectURL(dataBlob);
    store.dispatch(
      microsoftProfileDataSlice.actions.setMicrosftProfileUrl(urlOut),
    );
  }
  // No need to fail user just get default icon.
}
