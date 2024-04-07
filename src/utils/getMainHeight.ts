/*
  Pauly
  Andrew Mainella
  26 December 2023
  Calculating height of safe area
*/
import store from "@redux/store";

export default function getMainHeight(
  full: number,
  top: number,
  bottom: number,
  isTop: boolean,
  isBottom: boolean,
  isShowingZeroFooter: boolean
) {
  let result = full;
  if (!isTop) {
    result -= top;
  }
  if (!isBottom) {
    result -= bottom;
  }
  if (isShowingZeroFooter) {
    result -= store.getState().dimensions.zeroFooterHeight
  }
  return result;
}
