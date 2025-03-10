/*
  Pauly
  Andrew Mainella
  Main authentication method hold logic calling platform based login methods.
*/
import getPaulyLists from '@utils/ultility/getPaulyLists';
import useGetUserProfile from '@hooks/useGetUserProfile';
import useWebSession from '@hooks/useWebSession';
import store, { RootState } from '@redux/store';
import {
  getWantGovernment,
  validateGovernmentMode,
} from '@utils/handleGovernmentLogin';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authLoadingSlice } from '@redux/reducers/authLoadingReducer';
import { isGovernmentModeSlice } from '@redux/reducers/isGovernmentModeReducer';
import { useRefresh, useSilentLogin } from './authentication';
import { getPaulySettings } from '@redux/reducers/paulySettingsReducer';

/**
 * Main hook that runs the startup. Should only be in one view (layout) at once.
 * @returns
 */
export default function useAuthentication() {
  const isLoading = useSelector((state: RootState) => state.authLoading);
  const authToken = useSelector(
    (state: RootState) => state.authenticationToken,
  );
  const authenticationCall = useSelector(
    (state: RootState) => state.authenticationCall,
  );
  const silentLogin = useSilentLogin();
  const webSession = useWebSession();
  const getUserProfile = useGetUserProfile();
  const dispatch = useDispatch();
  const refresh = useRefresh();
  const [mounted, setMounted] = useState(false);
  // main function
  async function loadContent() {
    const wantGovernment = await getWantGovernment()
    await silentLogin(true, wantGovernment);
    if (store.getState().authenticationToken !== '') {
      const webResult = webSession();
      if (!webResult) {
        await getPaulyLists();
      }
      await getUserProfile();
      if (wantGovernment) {
        await validateGovernmentMode();
      } else {
        store.dispatch(
          isGovernmentModeSlice.actions.setIsGovernmentMode(false),
        );
      }
      dispatch(authLoadingSlice.actions.setAuthLoading(false));
      getPaulySettings(store)
    } else {
      store.dispatch(
        isGovernmentModeSlice.actions.setIsGovernmentMode(wantGovernment),
      );
      dispatch(authLoadingSlice.actions.setAuthLoading(false));
    }
  }

  useEffect(() => {
    if (mounted) {
      refresh();
    } else {
      setMounted(true);
    }
  }, [authenticationCall]);

  useEffect(() => {
    loadContent();
  }, [authToken]);

  return isLoading;
}
