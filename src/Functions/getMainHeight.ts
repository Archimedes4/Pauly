export default function getMainHeight(full: number, top: number, bottom: number, isTop: boolean, isBottom: boolean) {
  let result = full
  if (!isTop) {
    result -= top
  }
  if (!isBottom) {
    result -= bottom
  }
  return result
}