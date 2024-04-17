/*
  Pauly
  Andrew Mainella
  useIsShowingLogout.ts
  A timeout of 10 seconds in the loading page.
  After 10 seconds allows the user to logout in case there is an issue casing infinate loop.
*/
import { useEffect, useState } from 'react';

/**
 * A function that determines weather 10 seconds has past and the logout button should be shown.
 * @returns Boolean
 */
export default function useIsShowingLogout() {
  const [isShowingLogout, setIsShowingLogout] = useState<boolean>(false);
  useEffect(() => {
    setTimeout(() => {
      setIsShowingLogout(true);
    }, 10000);
  }, []);
  return isShowingLogout;
}
