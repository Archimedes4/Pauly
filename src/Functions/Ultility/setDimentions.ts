import { EdgeInsets } from "react-native-safe-area-context";
import { dimentionsSlice } from "../../Redux/reducers/dimentionsReducer";
import store from "../../Redux/store";
import { breakPointMode } from "../../types";

export default function setDimentions(dimWidth: number, dimHeight: number, insets: EdgeInsets) {
  const oldWidth = store.getState().dimentions.width;
  const { height } = store.getState().dimentions;
  const newWidth = dimWidth - insets.left - insets.right;
  const newHeight = dimHeight - insets.bottom - insets.top;
  if (oldWidth !== newWidth) {
    const oldCurrentBreakPointMode: breakPointMode =
      store.getState().dimentions.currentBreakPoint;
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
            dimentionsSlice.actions.setDimentionsWidthCurrentBreakPoint({
              width: newWidth * 0.75,
              totalWidth: dimWidth,
              currentBreakPoint,
            }),
          );
        } else {
          store.dispatch(
            dimentionsSlice.actions.setDimentionsWidthCurrentBreakPoint({
              width: newWidth * 0.9,
              totalWidth: dimWidth,
              currentBreakPoint,
            }),
          );
        }
      } else {
        store.dispatch(
          dimentionsSlice.actions.setDimentionsWidthCurrentBreakPoint({
            width: newWidth,
            totalWidth: dimWidth,
            currentBreakPoint,
          }),
        );
      }
    } else if (newWidth >= 576) {
      if (store.getState().expandedMode) {
        store.dispatch(
          dimentionsSlice.actions.setDimentionsWidth({width: newWidth * 0.75, totalWidth: dimWidth}),
        );
      } else {
        store.dispatch(
          dimentionsSlice.actions.setDimentionsWidth({width: newWidth * 0.9, totalWidth: dimWidth}),
        );
      }
    } else {
      store.dispatch(dimentionsSlice.actions.setDimentionsWidth({width: newWidth, totalWidth: dimWidth}));
    }
  } else {
    if (newWidth >= 576) {
      if (store.getState().expandedMode) {
        store.dispatch(
          dimentionsSlice.actions.setDimentionsWidth({width: newWidth * 0.75, totalWidth: dimWidth}),
        );
      } else {
        store.dispatch(dimentionsSlice.actions.setDimentionsWidth({width: newWidth * 0.9, totalWidth: dimWidth}));
      }
    }
  }
  if (height !== newHeight) {
    store.dispatch(dimentionsSlice.actions.setDimentionsHeight(newHeight));
  }
}