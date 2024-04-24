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
    const split =  pathname.split("/")
    let first = ""
    if (split.length >= 2) {
      first = split[1]
    } else {
      first = split[0]
    }
    if (
      first === '' ||
      first === 'settings' ||
      first === 'commissions' ||
      first === '' ||
      first === 'calendar'
    ) {
      setIsShowingFooter(true);
      return;
    }
    setIsShowingFooter(false);
  }, [currentBreakPoint, pathname]);
  return isShowingFooter;
}
