export default function calculateFontSize(srcWidth: number, srcHeight: number, text: string, widthFactor?: number) {
  if (srcWidth/text.length < srcHeight) {
    //width limiting factor
    const widthPerChar = srcWidth/text.length
    return widthPerChar * (widthFactor || 1.7)
  } else {
    // height limiting factor
    return srcHeight
  }
}