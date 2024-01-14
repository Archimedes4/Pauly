import { useEffect, useState } from 'react';

export default function useIsShowingLogout() {
  const [isShowingLogout, setIsShowingLogout] = useState<boolean>(false);
  useEffect(() => {
    setTimeout(() => {
      setIsShowingLogout(true);
    }, 10000);
  }, []);
  return isShowingLogout;
}
