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
import { useSilentLogin } from './authentication';
import { useDispatch, useSelector } from 'react-redux';
import { authLoadingSlice } from '@src/redux/reducers/authLoadingReducer';

export default function useAuthentication() {
  const isLoading = useSelector((state: RootState) => state.authLoading);
  const silentLogin = useSilentLogin();
  const webSession = useWebSession();
  const getUserProfile = useGetUserProfile();
  const dispatch = useDispatch()
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
      dispatch(authLoadingSlice.actions.setAuthLoading(false))
    } else {
      dispatch(authLoadingSlice.actions.setAuthLoading(false))
    }
  }

  useEffect(() => {
    loadContent();
  }, []);

  return isLoading;
}
