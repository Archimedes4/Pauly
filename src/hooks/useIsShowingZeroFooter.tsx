import { RootState } from '@redux/store';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { usePathname } from 'expo-router';


export default function useIsShowingZeroFooter() {
  const [isShowingFooter, setIsShowingFooter] = useState<boolean>(false);
  const pathname = usePathname();
  const { currentBreakPoint } = useSelector(
    (state: RootState) => state.dimensions,
  );
  useEffect(() => {
    if (currentBreakPoint !== 0) {
      setIsShowingFooter(false);
      return;
    }
    if (
      pathname === '/' ||
      pathname === '/settings' ||
      pathname === '/commissions' ||
      pathname === '' ||
      pathname === '/calendar'
    ) {
      setIsShowingFooter(true);
      return;
    }
    setIsShowingFooter(false);
  }, [currentBreakPoint, pathname]);
  return isShowingFooter;
}
