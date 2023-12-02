import store from "@src/Redux/store";
import callMsGraph from "../../Functions/ultility/microsoftAssets";
import { microsoftProfileDataSlice } from "@src/Redux/reducers/microsoftProfileDataReducer";

export default async function getUserImage() {
  const result = await callMsGraph(
    'https://graph.microsoft.com/v1.0/me/photo/$value',
    'GET',
  );
  //Checking if success
  if (result.ok) {
    const dataBlob = await result.blob();
    const urlOut = URL.createObjectURL(dataBlob);
    store.dispatch(
      microsoftProfileDataSlice.actions.setMicrosftProfileUrl(urlOut)
    );
  }
  //No need to fail user just get default icon.
}