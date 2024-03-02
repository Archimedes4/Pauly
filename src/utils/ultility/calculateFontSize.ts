export default function calculateFontSize(
  srcWidth: number,
  srcHeight: number,
  text: string,
  widthFactor?: number,
  numberOfLines?: number,
) {
  if (srcWidth / (numberOfLines ?? 1) / text.length < srcHeight) {
    // width limiting factor
    const widthPerChar = srcWidth / (numberOfLines ?? 1) / text.length;
    return widthPerChar * (widthFactor || 1.7);
  }
  // height limiting factor
  return srcHeight;
}
