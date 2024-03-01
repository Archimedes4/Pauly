import store from '@redux/store';
import callMsGraph from '@src/utils/ultility/microsoftAssests';
import { microsoftProfileDataSlice } from '@redux/reducers/microsoftProfileDataReducer';
import getUserImage from './getUserImage';
import { loadingStateEnum } from '@src/constants';

export default function getUserProfile() {
  async function main() {
    if (store.getState().microsoftProfileData.state !== loadingStateEnum.notStarted) {
      return
    }
    store.dispatch(microsoftProfileDataSlice.actions.setMicrosoftProfileState(loadingStateEnum.loading))
    getUserImage();
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
    // It is not worth shuting down app.
  }
  return main;
}
