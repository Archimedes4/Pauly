/*
  Pauly
  Andrew Mainella
  Main authentication method hold logic calling platform based login methods.
*/
import getPaulyLists from '@utils/ultility/getPaulyLists';
import useGetUserProfile from '@hooks/useGetUserProfile';
import useWebSession from '@hooks/useWebSession';
import store from '@redux/store';
import {
  getWantGovernment,
  validateGovernmentMode,
} from '@utils/handleGovernmentLogin';
import { useEffect, useState } from 'react';
import { useSilentLogin } from './authentication';

export default function useAuthentication() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const silentLogin = useSilentLogin();
  const webSession = useWebSession();
  const getUserProfile = useGetUserProfile();
  // main function
  async function loadContent() {
    await silentLogin();
    if (store.getState().authenticationToken !== '') {
      const webResult = webSession();
      if (!webResult) {
        await getPaulyLists();
      }
      await getUserProfile();
      if (await getWantGovernment()) {
        await validateGovernmentMode();
      }
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadContent();
  }, []);

  return isLoading;
}
