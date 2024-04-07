import { EdgeInsets } from 'react-native-safe-area-context';
import { dimensionsSlice } from '@redux/reducers/dimensionsReducer';
import store from '@redux/store';
import { breakPointMode } from '@constants';
import getMainHeight from '../getMainHeight';

/**
 * 
 * @param dimWidth The width of the entire screen
 * @param dimHeight The height of the entire screen
 * @param insets The dimentions of the areas that are not safe
 * @param isTop If the top is hidden
 * @param isBottom If the bottom is hidden
 * @param isShowingZeroFooter If the footer is being shown
 */
export default function setDimentions(
  dimWidth: number,
  dimHeight: number,
  insets: EdgeInsets,
  isTop: boolean,
  isBottom: boolean,
  isShowingZeroFooter: boolean,
) {
  const oldWidth = store.getState().dimensions.width;
  const { height, totalHeight } = store.getState().dimensions;
  const newWidth = dimWidth - insets.left - insets.right;
  const newHeight = getMainHeight(
    dimHeight,
    insets.top,
    insets.bottom,
    isTop,
    isBottom,
    isShowingZeroFooter
  );
  if (oldWidth !== newWidth) {
    const oldCurrentBreakPointMode: breakPointMode =
      store.getState().dimensions.currentBreakPoint;
    let currentBreakPoint: breakPointMode = breakPointMode.xSmall;
    if (newWidth >= 1200) {
      // extraLarge ≥1200px
      currentBreakPoint = breakPointMode.xLarge;
    } else if (newWidth >= 992) {
      // large, ≥992px
      currentBreakPoint = breakPointMode.large;
    } else if (newWidth >= 768) {
      // medium, ≥768px
      currentBreakPoint = breakPointMode.medium;
    } else if (newWidth >= 576) {
      // small, ≥576px
      currentBreakPoint = breakPointMode.small;
    } else if (newWidth < 576) {
      // xSmall,	<576px
      currentBreakPoint = breakPointMode.xSmall;
    }
    if (oldCurrentBreakPointMode !== currentBreakPoint) {
      if (newWidth >= 576) {
        if (store.getState().expandedMode) {
          store.dispatch(
            dimensionsSlice.actions.setDimentionsWidthCurrentBreakPoint({
              width: newWidth * 0.75,
              totalWidth: dimWidth,
              currentBreakPoint,
            }),
          );
        } else {
          store.dispatch(
            dimensionsSlice.actions.setDimentionsWidthCurrentBreakPoint({
              width: newWidth * 0.9,
              totalWidth: dimWidth,
              currentBreakPoint,
            }),
          );
        }
      } else {
        store.dispatch(
          dimensionsSlice.actions.setDimentionsWidthCurrentBreakPoint({
            width: newWidth,
            totalWidth: dimWidth,
            currentBreakPoint,
          }),
        );
      }
    } else if (newWidth >= 576) {
      if (store.getState().expandedMode) {
        store.dispatch(
          dimensionsSlice.actions.setDimentionsWidth({
            width: newWidth * 0.75,
            totalWidth: dimWidth,
          }),
        );
      } else {
        store.dispatch(
          dimensionsSlice.actions.setDimentionsWidth({
            width: newWidth * 0.9,
            totalWidth: dimWidth,
          }),
        );
      }
    } else {
      store.dispatch(
        dimensionsSlice.actions.setDimentionsWidth({
          width: newWidth,
          totalWidth: dimWidth,
        }),
      );
    }
  } else if (newWidth >= 576) {
    if (store.getState().expandedMode) {
      store.dispatch(
        dimensionsSlice.actions.setDimentionsWidth({
          width: newWidth * 0.75,
          totalWidth: dimWidth,
        }),
      );
    } else {
      store.dispatch(
        dimensionsSlice.actions.setDimentionsWidth({
          width: newWidth * 0.9,
          totalWidth: dimWidth,
        }),
      );
    }
  }
  if (height !== newHeight || totalHeight !== dimHeight) {
    store.dispatch(dimensionsSlice.actions.setDimentionsHeight({
      totalHeight: dimHeight,
      height: newHeight
    }));
  }
}
