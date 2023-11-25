import { RootState } from "@/Redux/store";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function useIsAuthenticated() {
  const [isAuthenticated, setIsAuthenticated] = useState<{
    loading: boolean,
    authenticated: boolean
  }>({
    loading: true,
    authenticated: false
  });
  const { siteId } = useSelector((state: RootState) => state.paulyList);
  const authenticationToken = useSelector(
    (state: RootState) => state.authenticationToken,
  );
  const isOveride =  useSelector((state: RootState) => state.isOverride);
  useEffect(() => {
    if (((siteId !== '' || isOveride) && authenticationToken !== '')) {
      setIsAuthenticated({
        loading: false,
        authenticated: true
      })
    } else {
      setIsAuthenticated({
        loading: false,
        authenticated: false
      })
    }
  }, [siteId, authenticationToken, isOveride])
  return isAuthenticated
}