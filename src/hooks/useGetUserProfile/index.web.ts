import { microsoftProfileDataSlice } from '../../Redux/reducers/microsoftProfileDataReducer';
import store from '@Redux/store';
import callMsGraph from '@Functions/ultility/microsoftAssets';
import { useMsal } from '@azure/msal-react';

export default function getUserProfile() {
  const { instance } = useMsal();
  async function main() {
    const account = instance.getActiveAccount()
    if (account !== null && account.name !== undefined && account.localAccountId) {
      store.dispatch(
        microsoftProfileDataSlice.actions.setMicrosoftProfileInformation({
          displayName: account.name,
          id: account.localAccountId,
        }),
      );
    } else {
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
      //No need to fail they will have no name. If something like this where to fail they would most likly be redirected for having some other problem.
    }
  }
  return main
}
