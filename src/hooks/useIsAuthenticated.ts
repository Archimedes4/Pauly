/*
  Pauly
  Andrew Mainella
  useIsAuthenticated.ts
  This is a hook that checks weather the use is or isn't authenticated.
  The hook just checks weather the user has a token.
*/
import { RootState } from '@redux/store';
import { getWantGovernment } from '@utils/handleGovernmentLogin';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export default function useIsAuthenticated() {
  const [isAuthenticated, setIsAuthenticated] = useState<{
    loading: boolean;
    authenticated: boolean;
  }>({
    loading: true,
    authenticated: false,
  });
  const { siteId } = useSelector((state: RootState) => state.paulyList);
  const authenticationToken = useSelector(
    (state: RootState) => state.authenticationToken,
  );
  const isOveride = useSelector((state: RootState) => state.isOverride);
  const isLoading = useSelector((state: RootState) => state.authLoading);
  async function checkAuthentication() {
    const wantGovernment = await getWantGovernment();
    if (wantGovernment) {
      if ((siteId !== '' || isOveride) && authenticationToken !== '') {
        setIsAuthenticated({
          loading: isLoading,
          authenticated: true,
        });
      } else if (authenticationToken !== '') {
        setIsAuthenticated({
          loading: isLoading,
          authenticated: true,
        });
      } else {
        setIsAuthenticated({
          loading: isLoading,
          authenticated: false,
        });
      }
    } else if ((siteId !== '' || isOveride) && authenticationToken !== '') {
      setIsAuthenticated({
        loading: isLoading,
        authenticated: true,
      });
    } else {
      setIsAuthenticated({
        loading: isLoading,
        authenticated: false,
      });
    }
  }
  useEffect(() => {
    checkAuthentication();
  }, [siteId, authenticationToken, isOveride, isLoading]);
  return isAuthenticated;
}
