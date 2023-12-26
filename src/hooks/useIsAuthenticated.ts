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
  async function checkAuthentication() {
    const wantGovernment = await getWantGovernment();
    if (wantGovernment) {
      if ((siteId !== '' || isOveride) && authenticationToken !== '') {
        setIsAuthenticated({
          loading: false,
          authenticated: true,
        });
      } else if (authenticationToken !== '') {
        setIsAuthenticated({
          loading: true,
          authenticated: true,
        });
      } else {
        setIsAuthenticated({
          loading: false,
          authenticated: false,
        });
      }
    } else if ((siteId !== '' || isOveride) && authenticationToken !== '') {
      setIsAuthenticated({
        loading: false,
        authenticated: true,
      });
    } else {
      setIsAuthenticated({
        loading: false,
        authenticated: false,
      });
    }
  }
  useEffect(() => {
    checkAuthentication();
  }, [siteId, authenticationToken, isOveride]);
  return isAuthenticated;
}
