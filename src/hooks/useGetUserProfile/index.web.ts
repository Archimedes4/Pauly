import store from '@redux/store';
import callMsGraph from '@utils/ultility/microsoftAssests';
import { useMsal } from '@azure/msal-react';
import { microsoftProfileDataSlice } from '@redux/reducers/microsoftProfileDataReducer';
import { loadingStateEnum } from '@constants';
import getUserImage from './getUserImage';

export default function getUserProfile() {
  const { instance } = useMsal();
  async function main() {
    if (
      store.getState().microsoftProfileData.state !==
      loadingStateEnum.notStarted
    ) {
      return;
    }
    store.dispatch(
      microsoftProfileDataSlice.actions.setMicrosoftProfileState(
        loadingStateEnum.loading,
      ),
    );
    getUserImage();
    const account = instance.getActiveAccount();
    if (
      account !== null &&
      account.name !== undefined &&
      account.localAccountId
    ) {
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
      // No need to fail they will have no name. If something like this where to fail they would most likly be redirected for having some other problem.
    }
  }
  return main;
}
