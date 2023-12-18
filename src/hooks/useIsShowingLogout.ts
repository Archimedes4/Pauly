import { useEffect, useState } from 'react';

export function useIsShowingLogout() {
  const [isShowingLogout, setIsShowingLogout] = useState<boolean>(false);
  useEffect(() => {
    setTimeout(() => {
      setIsShowingLogout(true);
    }, 10000);
  }, []);
  return isShowingLogout;
}
