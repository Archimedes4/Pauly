/*
  Pauly
  Andrew Mainella
  2 December 2023
  safeAreaHooks.ts
*/
import { safeAreaColorsSlice } from '@redux/reducers/safeAreaColorsReducer';
import { RootState } from '@redux/store';
import { Colors, loadingStateEnum } from '@constants';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export function useStudentSafeArea() {
  const { currentBreakPoint } = useSelector(
    (state: RootState) => state.dimentions,
  );
  const { usersState } = useSelector((state: RootState) => state.studentSearch);

  const dispatch = useDispatch();
  const updateOutColors = useCallback(() => {
    if (usersState === loadingStateEnum.loading) {
      dispatch(
        safeAreaColorsSlice.actions.setSafeAreaColors({
          top: Colors.maroon,
          bottom: Colors.maroon,
        }),
      );
    } else {
      dispatch(
        safeAreaColorsSlice.actions.setSafeAreaColors({
          top: Colors.darkGray,
          bottom: currentBreakPoint === 0 ? Colors.maroon : Colors.white,
        }),
      );
    }
  }, [currentBreakPoint, usersState]);

  useEffect(() => {
    updateOutColors();
  }, [updateOutColors, usersState]);
  return null;
}
