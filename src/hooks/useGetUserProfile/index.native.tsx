import store from '@redux/store';
import callMsGraph from '@utils/ultility/microsoftAssets';
import { fetchUserInfoAsync, useAutoDiscovery } from 'expo-auth-session';
import { tenantId } from '@src/PaulyConfig';
import { microsoftProfileDataSlice } from '../../redux/reducers/microsoftProfileDataReducer';

export default function getUserProfile() {
  const discovery = useAutoDiscovery(
    `https://login.microsoftonline.com/${tenantId}/v2.0`,
  );
  async function main() {
    if (discovery !== null) {
      const account = await fetchUserInfoAsync(
        {
          accessToken: store.getState().authenticationToken,
        },
        discovery,
      );
      console.log(account);
    }
    // if (account !== null && account.name !== undefined && account.localAccountId) {
    //   store.dispatch(
    //     microsoftProfileDataSlice.actions.setMicrosoftProfileInformation({
    //       displayName: account.name,
    //       id: account.localAccountId,
    //     }),
    //   );
    // } else {
    const profileResult = await callMsGraph(
      'https://graph.microsoft.com/v1.0/me',
      'GET',
    );
    if (profileResult.ok) {
      const profileData = await profileResult.json();
      store.dispatch(
        microsoftProfileDataSlice.actions.setMicrosoftProfileInformation({
          displayName: profileData.displayName,
          id: profileData.id,
        }),
      );
    }
    // No need to fail they will have no name. If something like this where to fail they would most likly be redirected for having some other problem.
    // }
  }
  return main;
}
